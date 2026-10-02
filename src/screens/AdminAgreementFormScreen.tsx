import { useState } from 'react'
import {
  Alert,
  Button,
  Checkbox,
  DatePickerField,
  FormField,
  Input,
  PopUp,
  Select,
  Switch,
  type AlertType,
  type SelectOption,
  type WeekDayData,
} from '../components'
import { getAllVAs } from '../services/vaAccount'
import {
  getAgreementById,
  getAllClientCompanies,
  createAgreement,
  updateAgreement,
  generateAgreementName,
  type SaveAgreementInput,
} from '../services/clientAccount'
import './AdminAgreementFormScreen.css'

const SAM_OPTIONS: SelectOption[] = ['Javiera Mercado', 'Daniela Lozano', 'Erick Farias'].map((value) => ({
  value,
  label: value,
}))

const FREQUENCY_TYPE_OPTIONS: SelectOption[] = ['Day', 'Week', 'Month', 'Year'].map((value) => ({ value, label: value }))

const FREQUENCY_QTY_OPTIONS: SelectOption[] = Array.from({ length: 12 }, (_, index) => String(index + 1)).map((value) => ({
  value,
  label: value,
}))

interface DayRow {
  key: string
  dayLetter: string
  label: string
}

const DAY_ROWS: DayRow[] = [
  { key: 'mon', dayLetter: 'M', label: 'Monday' },
  { key: 'tue', dayLetter: 'T', label: 'Tuesday' },
  { key: 'wed', dayLetter: 'W', label: 'Wednesday' },
  { key: 'thu', dayLetter: 'T', label: 'Thursday' },
  { key: 'fri', dayLetter: 'F', label: 'Friday' },
  { key: 'sat', dayLetter: 'S', label: 'Saturday' },
  { key: 'sun', dayLetter: 'S', label: 'Sunday' },
]

const WEEKDAY_KEYS = new Set(['mon', 'tue', 'wed', 'thu', 'fri'])

/** Only letters, digits, spaces, and the punctuation already present in an auto-generated agreement name (hyphens, colons, periods, commas). */
const AGREEMENT_NAME_PATTERN = /^[a-zA-Z0-9\s\-:.,]*$/

function parseRate(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const amount = Number(trimmed)
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : ''
}

function isoToday(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function formatISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** The Monday of the current week — the earliest "First Effective Day" can land on, even if that Monday has already passed this week. */
function getCurrentWeekMonday(): string {
  const today = new Date()
  const daysSinceMonday = (today.getDay() + 6) % 7
  const thisMonday = new Date(today)
  thisMonday.setDate(today.getDate() - daysSinceMonday)
  return formatISO(thisMonday)
}

/** How far out "First Effective Day" can be scheduled. */
function getMaxEffectiveDay(): string {
  const date = new Date()
  date.setMonth(date.getMonth() + 6)
  return formatISO(date)
}

function isMonday(iso: string): boolean {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).getDay() === 1
}

/** Bare "4/28/2025" -> "2025-04-28" for pre-filling a native date input. */
function mdyToISO(mdy: string): string {
  const [month, day, year] = mdy.split('/').map(Number)
  if (!month || !day || !year) return ''
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

interface ConfirmPopupProps {
  title: string
  body: string
  confirmText: string
  onCancel: () => void
  onConfirm: () => void
}

/** The shared "Are you sure...?" dialog shape behind all 4 Figma pop-up frames — only the copy and confirm button text differ. */
function ConfirmPopup({ title, body, confirmText, onCancel, onConfirm }: ConfirmPopupProps) {
  return (
    <PopUp>
      <div className="admin-agreement-form-screen__confirm-popup">
        <p className="admin-agreement-form-screen__confirm-title">{title}</p>
        <p className="admin-agreement-form-screen__confirm-body">{body}</p>
        <div className="admin-agreement-form-screen__confirm-actions">
          <Button type="secondary" buttonText="Cancel" onClick={onCancel} style={{ width: '160px' }} />
          <Button buttonText={confirmText} onClick={onConfirm} style={{ width: '200px' }} />
        </div>
      </div>
    </PopUp>
  )
}

export interface AdminAgreementFormScreenProps {
  mode: 'create' | 'edit'
  /** The agreement being edited — ignored in 'create' mode. */
  agreementId?: string
  onCancel: () => void
  onSaved: () => void
}

/**
 * Admin's shared Create New Agreement / Editing Agreement form (Figma's
 * "Agreements - New/Edit Agreement" frame family). VA and Client are fixed
 * once an agreement exists — the Edit form disables both and additionally
 * shows the read-only rate/hours captured at creation time, plus a "FIRST
 * Effective Day of new Work Hours Per Day" field that isn't wired to any
 * schedule-change logic yet. "Save" always validates on click (same pattern
 * as `AdminVAFormScreen`) and, once valid, shows a confirmation pop-up
 * before actually writing to the mock data.
 */
export const AdminAgreementFormScreen = ({ mode, agreementId, onCancel, onSaved }: AdminAgreementFormScreenProps) => {
  const existing = mode === 'edit' && agreementId ? getAgreementById(agreementId) : undefined
  const vaOptions: SelectOption[] = getAllVAs().map((va) => ({ value: va.email, label: va.legalName }))
  const clientCompanies = getAllClientCompanies()
  const clientOptions: SelectOption[] = clientCompanies.map((company) => ({ value: company.clientName, label: company.clientName }))

  const [agreementName, setAgreementName] = useState(existing?.agreementName ?? '')
  const [samContactName, setSamContactName] = useState<string | null>(existing?.samContactName ?? null)
  const [vaEmail, setVaEmail] = useState<string | null>(existing?.vaEmail ?? null)
  const [clientName, setClientName] = useState<string | null>(existing?.clientName ?? null)
  const [startDate, setStartDate] = useState(existing ? mdyToISO(existing.startDate) : '')
  const [endDate, setEndDate] = useState(existing?.endDate ? mdyToISO(existing.endDate) : '')
  const [received, setReceived] = useState(existing?.received ?? false)
  const [active, setActive] = useState(existing ? existing.status === 'active' : false)

  const [clientBillingFrequencyType, setClientBillingFrequencyType] = useState<string | null>(
    existing?.clientBillingFrequencyType ?? null,
  )
  const [clientBillingFrequencyQty, setClientBillingFrequencyQty] = useState<string | null>(
    existing?.clientBillingFrequencyQty ?? null,
  )
  const [vaInvoicingFrequencyType, setVaInvoicingFrequencyType] = useState<string | null>(
    existing?.vaInvoicingFrequencyType ?? null,
  )
  const [vaInvoicingFrequencyQty, setVaInvoicingFrequencyQty] = useState<string | null>(
    existing?.vaInvoicingFrequencyQty ?? null,
  )

  const [client1020, setClient1020] = useState('')
  const [client2130, setClient2130] = useState('')
  const [client3140, setClient3140] = useState('')
  const [va1020, setVa1020] = useState('')
  const [va2130, setVa2130] = useState('')
  const [va3140, setVa3140] = useState('')
  const [clientRate, setClientRate] = useState(existing?.billedRate.replace('$', '') ?? '')
  const [vaRate, setVaRate] = useState(existing?.vaHourlyRate.replace('$', '') ?? '')
  const [weeklyHours, setWeeklyHours] = useState(existing ? String(parseInt(existing.hoursPerWeek, 10) || '') : '')
  const [firstEffectiveDay, setFirstEffectiveDay] = useState(existing?.firstEffectiveDay ?? '')

  const initialDayEnabled: Record<string, boolean> = {}
  const initialDayHours: Record<string, string> = {}
  for (const day of DAY_ROWS) {
    const existingDay = existing?.week?.find((candidate) => candidate.key === day.key)
    if (existingDay) {
      initialDayEnabled[day.key] = !existingDay.disabled
      initialDayHours[day.key] = String(parseFloat(existingDay.value) || 0)
    } else {
      initialDayEnabled[day.key] = WEEKDAY_KEYS.has(day.key)
      initialDayHours[day.key] = WEEKDAY_KEYS.has(day.key) ? '8.0' : '0'
    }
  }
  const [dayEnabled, setDayEnabled] = useState(initialDayEnabled)
  const [dayHours, setDayHours] = useState(initialDayHours)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showCancelPopup, setShowCancelPopup] = useState(false)
  const [showSavePopup, setShowSavePopup] = useState(false)

  const title = mode === 'create' ? 'Create New Agreement' : `Edit Agreement #${agreementId}`

  const handleVAChange = (value: string) => {
    setVaEmail(value)
    const va = vaOptions.find((option) => option.value === value)
    const client = clientOptions.find((option) => option.value === clientName)
    if (va && client) setAgreementName(generateAgreementName(client.label, va.label))
  }

  const handleClientChange = (value: string) => {
    setClientName(value)
    const va = vaOptions.find((option) => option.value === vaEmail)
    if (va) setAgreementName(generateAgreementName(value, va.label))
  }

  const handleToggleDay = (key: string, checked: boolean) => {
    setDayEnabled((prev) => ({ ...prev, [key]: checked }))
    // A day that's turned off doesn't keep whatever hours it had — it reads
    // as 0 until (if ever) it's turned back on.
    if (!checked) setDayHours((prev) => ({ ...prev, [key]: '0' }))
  }

  const handleDayHoursChange = (key: string, value: string) => {
    setDayHours((prev) => ({ ...prev, [key]: value.replace(/-/g, '') }))
  }

  const totalWeeklyHours = DAY_ROWS.reduce((sum, day) => (dayEnabled[day.key] ? sum + (parseFloat(dayHours[day.key]) || 0) : sum), 0)
  const targetWeeklyHours = parseInt(weeklyHours, 10) || 0

  let hoursAlert: { type: AlertType; message: string } | null = null
  if (targetWeeklyHours > 0) {
    if (totalWeeklyHours === targetWeeklyHours) {
      hoursAlert = { type: 'info', message: `${totalWeeklyHours}/${targetWeeklyHours} hours/week` }
    } else if (totalWeeklyHours > targetWeeklyHours) {
      hoursAlert = {
        type: 'error',
        message: `${totalWeeklyHours}/${targetWeeklyHours} hours/week You have added too many hours. Make sure the hours match the weekly hours on your agreement.`,
      }
    } else {
      hoursAlert = {
        type: 'warning',
        message: `${totalWeeklyHours}/${targetWeeklyHours} hours/week You have added too few hours. Make sure the hours match the weekly hours on your agreement.`,
      }
    }
  }

  const validate = (): Record<string, string> => {
    const nextErrors: Record<string, string> = {}

    if (!agreementName.trim()) nextErrors.agreementName = 'The agreement name field is required'
    else if (!AGREEMENT_NAME_PATTERN.test(agreementName)) nextErrors.agreementName = 'The agreement name field cannot include special characters'

    if (!samContactName) nextErrors.samContactName = 'The SAM field is required'
    if (!vaEmail) nextErrors.vaEmail = 'The VA field is required'
    if (!clientName) nextErrors.clientName = 'The Client field is required'
    if (!startDate) nextErrors.startDate = 'The start date field is required'
    if (!clientBillingFrequencyType) nextErrors.clientBillingFrequencyType = 'The client billing frequency type field is required'
    if (!vaInvoicingFrequencyType) nextErrors.vaInvoicingFrequencyType = 'The VA invoicing frequency type field is required'
    if (!clientRate.trim()) nextErrors.clientRate = 'The client rate field is required'
    if (!vaRate.trim()) nextErrors.vaRate = 'The VA rate field is required'

    const clientTriplet = [client1020, client2130, client3140]
    const clientFilledCount = clientTriplet.filter((value) => value.trim()).length
    if (clientFilledCount > 0 && clientFilledCount < 3) {
      nextErrors.client1020 = nextErrors.client2130 = nextErrors.client3140 = 'You must fill all three client rates or none'
    }

    const vaTriplet = [va1020, va2130, va3140]
    const vaFilledCount = vaTriplet.filter((value) => value.trim()).length
    if (vaFilledCount > 0 && vaFilledCount < 3) {
      nextErrors.va1020 = nextErrors.va2130 = nextErrors.va3140 = 'You must fill all three client rates or none'
    }

    return nextErrors
  }

  const handleSaveClick = () => {
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) setShowSavePopup(true)
  }

  const buildClientRateRanges = (): string[] => {
    if (!client1020.trim()) return existing?.clientRateRanges ?? []
    return [
      `10 - 20 hours per week @ ${parseRate(client1020)}/hr`,
      `21 - 30 hours per week @ ${parseRate(client2130)}/hr`,
      `31 - 40 hours per week @ ${parseRate(client3140)}/hr`,
    ]
  }

  const buildVARateRanges = (): string[] => {
    if (!va1020.trim()) return existing?.vaRateRanges ?? []
    return [
      `10 - 20 hours per week @ ${parseRate(va1020)}/hr`,
      `21 - 30 hours per week @ ${parseRate(va2130)}/hr`,
      `31 - 40 hours per week @ ${parseRate(va3140)}/hr`,
    ]
  }

  const handleConfirmSave = () => {
    const week: WeekDayData[] = DAY_ROWS.map((day) => ({
      key: day.key,
      dayLetter: day.dayLetter,
      value: `${dayHours[day.key] || '0'} hrs`,
      disabled: !dayEnabled[day.key],
    }))

    const selectedClient = clientCompanies.find((company) => company.clientName === clientName)

    const input: SaveAgreementInput = {
      agreementName: agreementName.trim(),
      samContactName: samContactName!,
      vaEmail: vaEmail!,
      clientName: clientName!,
      clientEmail: selectedClient?.clientEmail ?? existing?.clientEmail ?? '',
      contactName: selectedClient?.contactName ?? existing?.contactName ?? '',
      contactEmail: selectedClient?.contactEmail ?? existing?.contactEmail ?? '',
      startDateISO: startDate,
      endDateISO: endDate || undefined,
      received,
      status: active ? 'active' : 'inactive',
      billingType: existing?.billingType ?? 'Post Pay',
      clientBillingFrequencyType: clientBillingFrequencyType ?? undefined,
      clientBillingFrequencyQty: clientBillingFrequencyQty ?? undefined,
      vaInvoicingFrequencyType: vaInvoicingFrequencyType ?? undefined,
      vaInvoicingFrequencyQty: vaInvoicingFrequencyQty ?? undefined,
      clientRateRanges: buildClientRateRanges(),
      vaRateRanges: buildVARateRanges(),
      billedRate: parseRate(clientRate) || existing?.billedRate || '$0.00',
      vaHourlyRate: parseRate(vaRate) || existing?.vaHourlyRate || '$0.00',
      hoursPerWeek: weeklyHours ? `${weeklyHours} Hours per week` : undefined,
      week,
      firstEffectiveDay: firstEffectiveDay || undefined,
    }

    if (mode === 'create') createAgreement(input)
    else updateAgreement(agreementId!, input)

    setShowSavePopup(false)
    onSaved()
  }

  return (
    <div className="admin-agreement-form-screen">
      <h1 className="admin-agreement-form-screen__title">{title}</h1>

      <div className="admin-agreement-form-screen__card">
        <p className="admin-agreement-form-screen__section-title">Agreement Details</p>

        <div className="admin-agreement-form-screen__row">
          <FormField label="Agreement Name" errorMessage={errors.agreementName} className="admin-agreement-form-screen__field">
            <Input value={agreementName} onChange={(event) => setAgreementName(event.target.value)} error={!!errors.agreementName} placeholder="Enter agreement name" />
          </FormField>
          <FormField label="SAM" errorMessage={errors.samContactName} className="admin-agreement-form-screen__field">
            <Select options={SAM_OPTIONS} value={samContactName} onChange={setSamContactName} placeholder="Select SAM" error={!!errors.samContactName} />
          </FormField>
        </div>

        <div className="admin-agreement-form-screen__row">
          <FormField label="VA" errorMessage={errors.vaEmail} className="admin-agreement-form-screen__field">
            <Select
              options={vaOptions}
              value={vaEmail}
              onChange={handleVAChange}
              placeholder="Select VA"
              error={!!errors.vaEmail}
              disabled={mode === 'edit'}
            />
          </FormField>
          <FormField label="Client" errorMessage={errors.clientName} className="admin-agreement-form-screen__field">
            <Select
              options={clientOptions}
              value={clientName}
              onChange={handleClientChange}
              placeholder="Select Client"
              error={!!errors.clientName}
              disabled={mode === 'edit'}
            />
          </FormField>
        </div>

        <div className="admin-agreement-form-screen__row">
          <FormField label="Start Date" errorMessage={errors.startDate} className="admin-agreement-form-screen__field">
            <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} error={!!errors.startDate} max={isoToday()} />
          </FormField>
          <FormField label="End Date" badge="(Optional)" className="admin-agreement-form-screen__field">
            <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </FormField>
        </div>

        <div className="admin-agreement-form-screen__checkbox-row">
          <Checkbox label="Received" checked={received} onChange={(event) => setReceived(event.target.checked)} />
          <Checkbox label="Active" checked={active} onChange={(event) => setActive(event.target.checked)} />
        </div>
      </div>

      <div className="admin-agreement-form-screen__card">
        <p className="admin-agreement-form-screen__section-title">Agreement Billing Information</p>

        <div className="admin-agreement-form-screen__row">
          <FormField label="Billing Type" className="admin-agreement-form-screen__field admin-agreement-form-screen__field--full">
            <Select options={[{ value: 'Pre Pay', label: 'Pre Pay' }, { value: 'Post Pay', label: 'Post Pay' }]} value={existing?.billingType ?? 'Post Pay'} onChange={() => {}} disabled placeholder="Select billing type" />
          </FormField>
        </div>

        <div className="admin-agreement-form-screen__row">
          <FormField label="Client Billing Frequency Type" errorMessage={errors.clientBillingFrequencyType} className="admin-agreement-form-screen__field">
            <Select options={FREQUENCY_TYPE_OPTIONS} value={clientBillingFrequencyType} onChange={setClientBillingFrequencyType} placeholder="Select frequency type" error={!!errors.clientBillingFrequencyType} />
          </FormField>
          <FormField label="Client Billing Frequency Qty" badge="(Optional)" className="admin-agreement-form-screen__field">
            <Select options={FREQUENCY_QTY_OPTIONS} value={clientBillingFrequencyQty} onChange={setClientBillingFrequencyQty} placeholder="Select frequency Qty" />
          </FormField>
        </div>

        <div className="admin-agreement-form-screen__row">
          <FormField label="VA Invoicing Frequency Type" errorMessage={errors.vaInvoicingFrequencyType} className="admin-agreement-form-screen__field">
            <Select options={FREQUENCY_TYPE_OPTIONS} value={vaInvoicingFrequencyType} onChange={setVaInvoicingFrequencyType} placeholder="Select frequency type" error={!!errors.vaInvoicingFrequencyType} />
          </FormField>
          <FormField label="VA Invoicing Frequency Qty" badge="(Optional)" className="admin-agreement-form-screen__field">
            <Select options={FREQUENCY_QTY_OPTIONS} value={vaInvoicingFrequencyQty} onChange={setVaInvoicingFrequencyQty} placeholder="Select frequency Qty" />
          </FormField>
        </div>
      </div>

      <div className="admin-agreement-form-screen__card">
        <p className="admin-agreement-form-screen__section-title">Agreement Rate</p>

        <div className="admin-agreement-form-screen__row">
          <FormField label="Client 10-20 base hours rate" badge="(Optional)" errorMessage={errors.client1020} helpText={errors.client1020 ? undefined : 'Enter an amount greater or equal to $1.00, using up to 2 decimal places'} className="admin-agreement-form-screen__field">
            <Input value={client1020} onChange={(event) => setClient1020(event.target.value)} error={!!errors.client1020} leftIcon="dollar-sign" rightText="USD" placeholder="Enter base hours rate" type="number" />
          </FormField>
          <FormField label="Client 21-30 base hours rate" badge="(Optional)" errorMessage={errors.client2130} helpText={errors.client2130 ? undefined : 'Enter an amount greater or equal to $1.00, using up to 2 decimal places'} className="admin-agreement-form-screen__field">
            <Input value={client2130} onChange={(event) => setClient2130(event.target.value)} error={!!errors.client2130} leftIcon="dollar-sign" rightText="USD" placeholder="Enter base hours rate" type="number" />
          </FormField>
          <FormField label="Client 31-40 base hours rate" badge="(Optional)" errorMessage={errors.client3140} helpText={errors.client3140 ? undefined : 'Enter an amount greater or equal to $1.00, using up to 2 decimal places'} className="admin-agreement-form-screen__field">
            <Input value={client3140} onChange={(event) => setClient3140(event.target.value)} error={!!errors.client3140} leftIcon="dollar-sign" rightText="USD" placeholder="Enter base hours rate" type="number" />
          </FormField>
        </div>

        <div className="admin-agreement-form-screen__row">
          <FormField label="VA 10-20 base hours rate" badge="(Optional)" errorMessage={errors.va1020} helpText={errors.va1020 ? undefined : 'Enter an amount greater or equal to $1.00, using up to 2 decimal places'} className="admin-agreement-form-screen__field">
            <Input value={va1020} onChange={(event) => setVa1020(event.target.value)} error={!!errors.va1020} leftIcon="dollar-sign" rightText="USD" placeholder="Enter base hours rate" type="number" />
          </FormField>
          <FormField label="VA 21-30 base hours rate" badge="(Optional)" errorMessage={errors.va2130} helpText={errors.va2130 ? undefined : 'Enter an amount greater or equal to $1.00, using up to 2 decimal places'} className="admin-agreement-form-screen__field">
            <Input value={va2130} onChange={(event) => setVa2130(event.target.value)} error={!!errors.va2130} leftIcon="dollar-sign" rightText="USD" placeholder="Enter base hours rate" type="number" />
          </FormField>
          <FormField label="VA 31-40 base hours rate" badge="(Optional)" errorMessage={errors.va3140} helpText={errors.va3140 ? undefined : 'Enter an amount greater or equal to $1.00, using up to 2 decimal places'} className="admin-agreement-form-screen__field">
            <Input value={va3140} onChange={(event) => setVa3140(event.target.value)} error={!!errors.va3140} leftIcon="dollar-sign" rightText="USD" placeholder="Enter base hours rate" type="number" />
          </FormField>
        </div>

        {mode === 'edit' && existing && (
          <div className="admin-agreement-form-screen__row">
            <FormField label="Client Initial Rate/Hr" className="admin-agreement-form-screen__field">
              <Input value={existing.initialClientRate ?? existing.billedRate} disabled rightText="USD" />
            </FormField>
            <FormField label="VA Initial Pay Rate/Hr" className="admin-agreement-form-screen__field">
              <Input value={existing.initialVARate ?? existing.vaHourlyRate} disabled rightText="USD" />
            </FormField>
            <FormField label="Initial Hours/Week" badge="(Optional)" className="admin-agreement-form-screen__field">
              <Input value={existing.initialWeeklyHours ?? existing.hoursPerWeek} disabled rightText="HRS" />
            </FormField>
          </div>
        )}

        <div className="admin-agreement-form-screen__row">
          <FormField label="Client Rate" errorMessage={errors.clientRate} helpText={errors.clientRate ? undefined : 'Enter an amount greater or equal to $1.00, using up to 2 decimal places'} className="admin-agreement-form-screen__field">
            <Input value={clientRate} onChange={(event) => setClientRate(event.target.value)} error={!!errors.clientRate} rightText="USD" placeholder="Enter client rate" type="number" />
          </FormField>
          <FormField label="VA Rate" errorMessage={errors.vaRate} helpText={errors.vaRate ? undefined : 'Enter an amount greater or equal to $1.00, using up to 2 decimal places'} className="admin-agreement-form-screen__field">
            <Input value={vaRate} onChange={(event) => setVaRate(event.target.value)} error={!!errors.vaRate} rightText="USD" placeholder="Enter VA rate" type="number" />
          </FormField>
          <FormField label="Weekly Hours" badge="(Optional)" helpText="For agreements of 10-20 weekly hours, Client and VA minimum rates increases by $2/hr." className="admin-agreement-form-screen__field">
            <Input value={weeklyHours} onChange={(event) => setWeeklyHours(event.target.value.replace(/-/g, ''))} rightText="Hrs" placeholder="Enter weekly hours" type="number" min={0} />
          </FormField>
        </div>
      </div>

      <div className="admin-agreement-form-screen__card">
        <p className="admin-agreement-form-screen__section-title">VA Work Hours Per Day</p>

        {mode === 'edit' && (
          <FormField
            label="FIRST Effective Day of new Work Hours Per Day"
            description="Only Mondays can be picked as the effective day."
            className="admin-agreement-form-screen__field admin-agreement-form-screen__field--full"
          >
            <DatePickerField
              value={firstEffectiveDay}
              onChange={setFirstEffectiveDay}
              minDate={getCurrentWeekMonday()}
              maxDate={getMaxEffectiveDay()}
              isDayDisabled={(date) => !isMonday(date)}
            />
          </FormField>
        )}

        <div className="admin-agreement-form-screen__note">
          <p className="admin-agreement-form-screen__note-title">Note</p>
          <p className="admin-agreement-form-screen__note-text">Only multiples of 0.25 are allowed into the hours per day fields: e.g: 4.25, 6.5, 7.75, 8</p>
        </div>

        <div className="admin-agreement-form-screen__hours-table">
          <div className="admin-agreement-form-screen__hours-header">
            <span>SELECTED WORK DAY</span>
            <span>HOURS PER DAY</span>
          </div>
          {DAY_ROWS.map((day) => (
            <div key={day.key} className="admin-agreement-form-screen__hours-row">
              <div className="admin-agreement-form-screen__hours-day">
                <Switch checked={dayEnabled[day.key]} onChange={(checked) => handleToggleDay(day.key, checked)} aria-label={`Toggle ${day.label}`} />
                <span>{day.label}</span>
              </div>
              <Input
                value={dayHours[day.key]}
                onChange={(event) => handleDayHoursChange(day.key, event.target.value)}
                disabled={!dayEnabled[day.key]}
                rightText="HRS"
                className="admin-agreement-form-screen__hours-input"
                type="number"
                min={0}
                step={0.25}
              />
            </div>
          ))}
          {hoursAlert && <Alert type={hoursAlert.type} message={hoursAlert.message} />}
        </div>
      </div>

      <div className="admin-agreement-form-screen__actions">
        <Button type="secondary" buttonText="Cancel" onClick={() => setShowCancelPopup(true)} style={{ width: '200px' }} />
        <Button buttonText="Save" onClick={handleSaveClick} style={{ width: '200px' }} />
      </div>

      {showCancelPopup && (
        <ConfirmPopup
          title={
            mode === 'create'
              ? 'Are you sure you want to cancel the agreement creation process and discard the changes?'
              : 'Are you sure you want to finish the agreement edition process and discard the changes?'
          }
          body={
            mode === 'create'
              ? "If you discard the changes, the agreement won't be created and data won't be saved"
              : "If you discard the changes, the agreement won't be updated and data won't be saved"
          }
          confirmText="Discard Changes"
          onCancel={() => setShowCancelPopup(false)}
          onConfirm={onCancel}
        />
      )}

      {showSavePopup && (
        <ConfirmPopup
          title={
            mode === 'create'
              ? 'Are you sure you want to save the changes and create the agreement?'
              : 'Are you sure you want to save the changes and update the agreement?'
          }
          body={
            mode === 'create'
              ? 'If you create the agreement, it will be displayed in the agreements table'
              : 'If you save the changes, the agreement will be updated'
          }
          confirmText={mode === 'create' ? 'Create Agreement' : 'Save Changes'}
          onCancel={() => setShowSavePopup(false)}
          onConfirm={handleConfirmSave}
        />
      )}
    </div>
  )
}
