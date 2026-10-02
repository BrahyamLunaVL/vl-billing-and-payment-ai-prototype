import { useState } from 'react'
import { Button, FormField, Input, PhoneInput, Select, TextArea, type SelectOption, type FlagCountry } from '../components'
import { COUNTRIES, COUNTRY_NAMES } from '../components/PhoneInput/countries'
import { getVAProfile, createVA, updateVA, type SaveVAInput } from '../services/vaAccount'
import './AdminVAFormScreen.css'

const PAYMENT_METHOD_OPTIONS: SelectOption[] = ['PayPal', 'Payoneer', 'Sigma Remote', 'None', 'Other', 'Veem', 'Wise'].map(
  (value) => ({ value, label: value }),
)

const SAM_OPTIONS: SelectOption[] = ['Javiera Mercado', 'Daniela Lozano', 'Erick Farias'].map((value) => ({
  value,
  label: value,
}))

const COUNTRY_OPTIONS: SelectOption[] = COUNTRIES.map((key) => ({ value: COUNTRY_NAMES[key], label: COUNTRY_NAMES[key] }))

/** The flag shown by the Mobile Phone field's own country picker — independent of the "Country where you live" Select above it. */
function countryNameToFlagCountry(name: string | undefined): FlagCountry {
  return COUNTRIES.find((key) => COUNTRY_NAMES[key] === name) ?? 'mexico'
}

export interface AdminVAFormScreenProps {
  mode: 'create' | 'edit'
  /** The VA being edited — ignored in 'create' mode. */
  vaEmail?: string
  onCancel: () => void
  onSaved: () => void
}

/**
 * Admin's shared Create New VA / Editing VA form (Figma's "VAs - New VA -
 * Edge Cases" and "VAs - Edit VA - Edge Cases" — field-for-field identical,
 * only the title and whether a profile is preloaded differ). "Save" writes
 * straight into the mock VA/user records so the result shows up immediately
 * back on `AdminVAsListScreen`.
 */
export const AdminVAFormScreen = ({ mode, vaEmail, onCancel, onSaved }: AdminVAFormScreenProps) => {
  const existing = mode === 'edit' && vaEmail ? getVAProfile(vaEmail) : undefined

  const [aka, setAka] = useState(existing?.aka ?? '')
  const [legalName, setLegalName] = useState(existing?.legalName ?? '')
  const [email, setEmail] = useState(existing?.email ?? '')
  const [paymentMethod, setPaymentMethod] = useState<string | null>(existing?.paymentMethod ?? null)
  const [hubspotId, setHubspotId] = useState(existing?.hubspotId ?? '')
  const [firstName, setFirstName] = useState(existing?.firstName ?? '')
  const [lastName, setLastName] = useState(existing?.lastName ?? '')
  const [surName, setSurName] = useState(existing?.surName ?? '')
  const [countryResidence, setCountryResidence] = useState<string | null>(existing?.country ?? null)
  const [countryCitizenship, setCountryCitizenship] = useState<string | null>(existing?.countryCitizenship ?? null)
  const [countryBilling, setCountryBilling] = useState<string | null>(existing?.countryBilling ?? null)
  const [billingAddress, setBillingAddress] = useState(existing?.billingAddress ?? '')
  const [telegramHandle, setTelegramHandle] = useState(existing?.telegramHandle ?? '')
  const [phoneCountry, setPhoneCountry] = useState<FlagCountry>(countryNameToFlagCountry(existing?.country))
  const [phoneNumber, setPhoneNumber] = useState(existing?.phoneNumber?.replace(/\D/g, '') ?? '')
  const [paymentEmail, setPaymentEmail] = useState(existing?.paymentEmail ?? '')
  const [workEmail, setWorkEmail] = useState(existing?.workEmail ?? '')
  const [samContactName, setSamContactName] = useState<string | null>(existing?.samContactName ?? null)
  const [shortIntro, setShortIntro] = useState(existing?.shortIntro ?? '')

  const [errors, setErrors] = useState<{ aka?: string; legalName?: string; email?: string; paymentMethod?: string }>({})

  const title = mode === 'create' ? 'Create New VA' : `Editing VA | ${vaEmail}`

  const handleSave = () => {
    const nextErrors: typeof errors = {}
    if (!aka.trim()) nextErrors.aka = 'The AKA field is required'
    if (!legalName.trim()) nextErrors.legalName = 'The VA Legal Name field is required'
    if (!email.trim()) nextErrors.email = 'The Email Address field is required'
    if (!paymentMethod) nextErrors.paymentMethod = 'The Payment Method field is required'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const input: SaveVAInput = {
      aka: aka.trim(),
      legalName: legalName.trim(),
      email: email.trim(),
      paymentMethod: paymentMethod!,
      hubspotId: hubspotId.trim() || undefined,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      surName: surName.trim() || undefined,
      countryResidence: countryResidence ?? undefined,
      countryCitizenship: countryCitizenship ?? undefined,
      countryBilling: countryBilling ?? undefined,
      billingAddress: billingAddress.trim() || undefined,
      telegramHandle: telegramHandle.trim() || undefined,
      phoneNumber: phoneNumber || undefined,
      paymentEmail: paymentEmail.trim() || undefined,
      workEmail: workEmail.trim() || undefined,
      samContactName: samContactName ?? undefined,
      shortIntro: shortIntro.trim() || undefined,
    }

    if (mode === 'create') createVA(input)
    else updateVA(vaEmail!, input)

    onSaved()
  }

  return (
    <div className="admin-va-form-screen">
      <h1 className="admin-va-form-screen__title">{title}</h1>

      <div className="admin-va-form-screen__row">
        <FormField label="AKA" info="The name shown to clients instead of the VA's legal name." errorMessage={errors.aka} className="admin-va-form-screen__field">
          <Input value={aka} onChange={(event) => setAka(event.target.value)} error={!!errors.aka} placeholder="e.g. Elena R." />
        </FormField>
        <FormField label="VA Legal Name" errorMessage={errors.legalName} className="admin-va-form-screen__field">
          <Input value={legalName} onChange={(event) => setLegalName(event.target.value)} error={!!errors.legalName} />
        </FormField>
        <FormField label="Email Address" errorMessage={errors.email} className="admin-va-form-screen__field">
          <Input value={email} onChange={(event) => setEmail(event.target.value)} error={!!errors.email} type="email" />
        </FormField>
      </div>

      <div className="admin-va-form-screen__row">
        <FormField label="Payment Method" errorMessage={errors.paymentMethod} className="admin-va-form-screen__field">
          <Select
            options={PAYMENT_METHOD_OPTIONS}
            value={paymentMethod}
            onChange={setPaymentMethod}
            placeholder="Select a payment method"
            error={!!errors.paymentMethod}
          />
        </FormField>
        <FormField label="Hubspot CRM Record ID" badge="(Optional)" className="admin-va-form-screen__field">
          <Input value={hubspotId} onChange={(event) => setHubspotId(event.target.value)} />
        </FormField>
      </div>

      <div className="admin-va-form-screen__row">
        <FormField label="First Name" badge="(Optional)" className="admin-va-form-screen__field">
          <Input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
        </FormField>
        <FormField label="Last Name" badge="(Optional)" className="admin-va-form-screen__field">
          <Input value={lastName} onChange={(event) => setLastName(event.target.value)} />
        </FormField>
        <FormField label="Sur Name" badge="(Optional)" className="admin-va-form-screen__field">
          <Input value={surName} onChange={(event) => setSurName(event.target.value)} />
        </FormField>
      </div>

      <div className="admin-va-form-screen__row">
        <FormField label="Country where you live" badge="(Optional)" className="admin-va-form-screen__field">
          <Select options={COUNTRY_OPTIONS} value={countryResidence} onChange={setCountryResidence} placeholder="Select a country" />
        </FormField>
        <FormField label="Country Citizenship" badge="(Optional)" className="admin-va-form-screen__field">
          <Select options={COUNTRY_OPTIONS} value={countryCitizenship} onChange={setCountryCitizenship} placeholder="Select a country" />
        </FormField>
        <FormField label="Country billing" badge="(Optional)" className="admin-va-form-screen__field">
          <Select options={COUNTRY_OPTIONS} value={countryBilling} onChange={setCountryBilling} placeholder="Select a country" />
        </FormField>
      </div>

      <div className="admin-va-form-screen__row">
        <FormField label="Billing Address" badge="(Optional)" className="admin-va-form-screen__field">
          <Input value={billingAddress} onChange={(event) => setBillingAddress(event.target.value)} />
        </FormField>
        <FormField label="Telegram User" badge="(Optional)" className="admin-va-form-screen__field">
          <Input value={telegramHandle} onChange={(event) => setTelegramHandle(event.target.value)} placeholder="@username" />
        </FormField>
        <FormField label="Mobile Phone" badge="(Optional)" className="admin-va-form-screen__field">
          <PhoneInput country={phoneCountry} onCountryChange={setPhoneCountry} value={phoneNumber} onChange={setPhoneNumber} />
        </FormField>
      </div>

      <div className="admin-va-form-screen__row">
        <FormField label="Payment Email" badge="(Optional)" className="admin-va-form-screen__field">
          <Input value={paymentEmail} onChange={(event) => setPaymentEmail(event.target.value)} type="email" />
        </FormField>
        <FormField label="Work Email" badge="(Optional)" className="admin-va-form-screen__field">
          <Input value={workEmail} onChange={(event) => setWorkEmail(event.target.value)} type="email" />
        </FormField>
        <FormField label="Assigned SAM" badge="(Optional)" className="admin-va-form-screen__field">
          <Select options={SAM_OPTIONS} value={samContactName} onChange={setSamContactName} placeholder="Select a SAM" />
        </FormField>
      </div>

      <div className="admin-va-form-screen__row">
        <FormField
          label="Short Intro"
          badge="(Optional)"
          info="A short description about the VA, shown on their profile."
          className="admin-va-form-screen__field admin-va-form-screen__field--full"
        >
          <TextArea
            value={shortIntro}
            onChange={(event) => setShortIntro(event.target.value)}
            placeholder="Write a short description about the VA"
            rows={4}
          />
        </FormField>
      </div>

      <div className="admin-va-form-screen__actions">
        <Button type="secondary" buttonText="Cancel" onClick={onCancel} />
        <Button type="primary" buttonText="Save" onClick={handleSave} />
      </div>
    </div>
  )
}
