import { useEffect, useState } from 'react'
import {
  StepsNavigation,
  Step,
  ProfileCard,
  Chip,
  DatePickerField,
  FormField,
  Input,
  TextArea,
  Calendar,
  Alert,
  Icon,
  Button,
  Radio,
  Select,
  Switch,
  Week,
  type AlertType,
  type WeekDayData,
} from '../components'
import {
  CA_STATUS_LABEL,
  CA_STATUS_TONE,
  getWeekRange,
  buildWeekGroups,
  createExtraHoursCARequest,
  getScheduledHoursForDate,
  getTimeOffRequestedDatesForVA,
  createTimeOffCARequest,
  createChangeBaseHoursCARequest,
  parseHoursValue,
  type CARequest,
} from '../services/vaAccount'
import type { AgreementSettings } from '../services/clientAccount'
import './NewCARequestWizard.css'

type RequestType =
  | 'time-off'
  | 'extra-hours'
  | 'change-base-hours'
  | 'bonus-commission'
  | 'agreement-hours-per-day'

const REQUEST_TYPE_OPTIONS: { value: RequestType; label: string }[] = [
  { value: 'time-off', label: 'Request approval for time off' },
  { value: 'extra-hours', label: 'Request approval for extra hours' },
  { value: 'change-base-hours', label: 'Request approval for changing base hours/week worked' },
  { value: 'bonus-commission', label: 'Request approval for a bonus or commission' },
  { value: 'agreement-hours-per-day', label: 'Request approval for agreement Work Hours Per Day change' },
]

const DAILY_MAX_HOURS = 12
const TOTAL_MAX_HOURS = 60
const RATE_PER_HOUR = 10
/** How far back the calendar lets a VA select dates, regardless of the
 *  agreement's own auto-approval period — see `WeekGroup.isOutsidePeriod`. */
const MAX_LOOKBACK_WEEKS = 16

/** Up to 14 days of time off per Changes & Approvals form (Figma copy). */
const MAX_TIME_OFF_DAYS = 14

const TIME_OFF_PAID_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'non-paid', label: 'Non-Paid' },
  { value: 'paid-replacing-hours', label: 'Paid-Replacing Hours' },
]

/** Only asked when "Paid-Replacing Hours" is picked above. */
const MAKE_UP_HOURS_OPTIONS = [
  'Before I take time off',
  'After I take time off, upon returning',
  'Before and After I take time off',
  "I'm still discussing with the client when I shall make up the missed hours",
  'Not Applicable / Not Assigned',
]

const CLIENT_RESPONSE_OPTIONS = [
  "Client told me they'll approve the request once I complete this form",
  'Client will let me know once they discuss this with Virtual Latinos',
  "Client hasn't approved it yet, but will think about it and get back to me",
  "Client told me they can't approve it (but I need to take time off anyways)",
  'Other',
]

interface DayRow {
  key: string
  dayLetter: string
  label: string
}

/** Monday-first, matching `WeekDayData.key` on every `Agreement.week` entry. */
const DAY_ROWS: DayRow[] = [
  { key: 'mon', dayLetter: 'M', label: 'Monday' },
  { key: 'tue', dayLetter: 'T', label: 'Tuesday' },
  { key: 'wed', dayLetter: 'W', label: 'Wednesday' },
  { key: 'thu', dayLetter: 'T', label: 'Thursday' },
  { key: 'fri', dayLetter: 'F', label: 'Friday' },
  { key: 'sat', dayLetter: 'S', label: 'Saturday' },
  { key: 'sun', dayLetter: 'S', label: 'Sunday' },
]

/** Seeds the "change base hours" day table from the agreement's own current schedule, per day. */
function buildDayStateFromWeek(week: WeekDayData[]): { enabled: Record<string, boolean>; hours: Record<string, string> } {
  const enabled: Record<string, boolean> = {}
  const hours: Record<string, string> = {}
  for (const day of DAY_ROWS) {
    const match = week.find((candidate) => candidate.key === day.key)
    enabled[day.key] = match ? !match.disabled : false
    const parsed = match ? parseHoursValue(match.value) : 0
    hours[day.key] = String(parsed || 0)
  }
  return { enabled, hours }
}

/** Total hours across whichever days are currently switched on — the "change base hours" day table's own running total. */
function sumEnabledDayHours(enabled: Record<string, boolean>, hours: Record<string, string>): number {
  return DAY_ROWS.reduce((sum, day) => (enabled[day.key] ? sum + (parseFloat(hours[day.key]) || 0) : sum), 0)
}

/** Mon-Fri 8hrs / Sat-Sun off — used when an agreement has no `week` schedule of its own. */
const DEFAULT_WORKING_WEEK: WeekDayData[] = [
  { key: 'mon', dayLetter: 'M', value: '8 hrs' },
  { key: 'tue', dayLetter: 'T', value: '8 hrs' },
  { key: 'wed', dayLetter: 'W', value: '8 hrs' },
  { key: 'thu', dayLetter: 'T', value: '8 hrs' },
  { key: 'fri', dayLetter: 'F', value: '8 hrs' },
  { key: 'sat', dayLetter: 'S', value: '0 hrs', disabled: true },
  { key: 'sun', dayLetter: 'S', value: '0 hrs', disabled: true },
]

const DEFAULT_AGREEMENT_SETTINGS: AgreementSettings = {
  autoApproveChanges: false,
  notifyOverThreshold: false,
  overThresholdAmount: 500,
  autoApproveExtraHours: true,
  preApprovedHoursPerWeek: 5,
  reportBackWeeks: 4,
  emailOnPreApprovedExtraHours: false,
}

function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/** The Monday of the current week — the earliest "First Effective Day" can land on, even if that Monday has already passed this week. */
function getCurrentWeekMonday(): string {
  const today = new Date()
  const daysSinceMonday = (today.getDay() + 6) % 7
  return toISODate(addDays(today, -daysSinceMonday))
}

function isMonday(iso: string): boolean {
  return parseISODate(iso).getDay() === 1
}

function formatOrdinal(day: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const remainder = day % 100
  return `${day}${suffixes[(remainder - 20) % 10] ?? suffixes[remainder] ?? suffixes[0]}`
}

function formatFullDate(iso: string): string {
  const date = parseISODate(iso)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  return `${weekday}, ${month} ${formatOrdinal(date.getDate())}, ${date.getFullYear()}`
}

function formatWeekRange(startISO: string, endISO: string): string {
  const start = parseISODate(startISO)
  const end = parseISODate(endISO)
  const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startLabel} – ${endLabel}`
}

/**
 * The small bordered warning box Figma nests inside a flagged week's own
 * card (and reuses, full-width, for the request-level banner below the
 * totals) — visually distinct from the shared `Alert` component (a
 * triangle-exclamation icon and a bordered, lighter-tint background,
 * rather than `Alert`'s borderless fill and check icon).
 */
function InlineWarning({ message }: { message: string }) {
  return (
    <div className="ca-wizard__inline-warning">
      <Icon name="triangle-exclamation" size={20} />
      <span>{message}</span>
    </div>
  )
}

/**
 * A radio option with a two-line label (bold title + muted description) —
 * Figma's "How would your VA like to request time off" question. `Radio`
 * only supports a single-line label, so this is a local, visually-matching
 * variant rather than a change to that shared component.
 */
function RadioOptionWithDescription({
  name,
  value,
  checked,
  onChange,
  title,
  description,
}: {
  name: string
  value: string
  checked: boolean
  onChange: () => void
  title: string
  description: string
}) {
  return (
    <label className="ca-wizard__radio-option">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="ca-wizard__radio-option-input"
      />
      <span className="ca-wizard__radio-option-circle" aria-hidden="true" />
      <span className="ca-wizard__radio-option-text">
        <span className="ca-wizard__radio-option-title">{title}</span>
        <span className="ca-wizard__radio-option-description">{description}</span>
      </span>
    </label>
  )
}

export interface NewCARequestWizardProps {
  /** The VA the request is for — used to look up hours already taken this week against their pre-approved allowance. */
  vaEmail: string
  /** The active agreement this request is submitted under — persisted onto the created request and used to look up its client/pre-approval rules. */
  agreementId?: string
  /** The VA's requests (newest first), shown as a reference list on step 1. */
  recentRequests?: CARequest[]
  /**
   * The client's Agreement Settings for the agreement this request is
   * under — the source of the pre-approved-hours/lookback-window rules
   * below, so a change the client makes on their Agreement screen is
   * reflected here immediately. Falls back to sensible defaults when the
   * VA has no active agreement (shouldn't normally happen).
   */
  agreementSettings?: AgreementSettings
  /** The VA's Monday-first weekly schedule under this agreement (`Agreement.week`) — which days the Time Off calendar allows selecting, and each day's own max-hours cap. Falls back to a Mon-Fri 8hr schedule when omitted. */
  agreementWeek?: WeekDayData[]
  /** Who's submitting this request when `showOnBehalfOf` isn't shown (VA's own screen vs Client's own screen) — drives the created request's `requestedByRole`. Ignored when `showOnBehalfOf` is set, since the wizard's own Client/VA radio decides it instead. */
  requesterRole?: 'va' | 'client'
  /** Shows the Admin-only "Request on behalf of" Client/VA selector on step 1, above the request type list. */
  showOnBehalfOf?: boolean
  /** Label for step 4's primary button — where it goes differs per viewer role (e.g. "Go My Account" for a VA, "Go to C&A Table" for a Client/Admin). */
  finishButtonLabel: string
  /** Called when step 4's primary button is clicked — navigates the viewer to their role's home for this flow. */
  onFinish: () => void
  /** Called whenever the current step changes, so the parent screen can swap its own header (e.g. to "Success" on step 4). */
  onStepChange?: (step: 1 | 2 | 3 | 4) => void
  /** Called when the Time Off form's "See C&A" link is clicked — takes the viewer back to their own Changes & Approvals request list. Hidden (plain text) when omitted. */
  onViewChangesApprovals?: () => void
}

/** The 4-step "New Request for Changes" wizard (Figma's "Changes & Approvals Form" flow). */
export const NewCARequestWizard = ({
  vaEmail,
  agreementId,
  recentRequests,
  agreementSettings = DEFAULT_AGREEMENT_SETTINGS,
  agreementWeek = DEFAULT_WORKING_WEEK,
  requesterRole = 'va',
  showOnBehalfOf = false,
  finishButtonLabel,
  onFinish,
  onStepChange,
  onViewChangesApprovals,
}: NewCARequestWizardProps) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [onBehalfOf, setOnBehalfOf] = useState<'client' | 'va'>('va')
  // TEMP (offline V2 export): "Request approval for extra hours" is
  // disabled for every viewer, so default to Time Off instead.
  const [requestType, setRequestType] = useState<RequestType>('time-off')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [hoursByDate, setHoursByDate] = useState<Record<string, number>>({})
  const [comments, setComments] = useState('')

  // The Time Off and "change base hours" forms' copy talks about "your VA"
  // from the client's point of view (Client's own screen, or Admin filling
  // it out on the client's behalf) vs. "you"/"your" from the VA's own point
  // of view (VA's own screen, or Admin filling it out on the VA's behalf).
  const isClientPerspective = showOnBehalfOf ? onBehalfOf === 'client' : requesterRole === 'client'

  const [timeOffMode, setTimeOffMode] = useState<'consecutive' | 'non-consecutive'>('consecutive')
  const [timeOffPaid, setTimeOffPaid] = useState<'paid' | 'non-paid' | 'paid-replacing-hours'>('paid')
  const [makeUpHoursTiming, setMakeUpHoursTiming] = useState(MAKE_UP_HOURS_OPTIONS[0])
  const [clientResponse, setClientResponse] = useState(CLIENT_RESPONSE_OPTIONS[0])
  const [timeOffDates, setTimeOffDates] = useState<string[]>([])
  const [timeOffHoursByDate, setTimeOffHoursByDate] = useState<Record<string, number>>({})
  const [timeOffRangeAnchor, setTimeOffRangeAnchor] = useState<string | null>(null)

  const initialBaseHoursDayState = buildDayStateFromWeek(agreementWeek)
  // Pre-filled with the agreement's current total so it already matches the
  // day table below — the admin/client only needs to touch it if they
  // actually want a different weekly total, so it never blocks "Next".
  const [newBaseHours, setNewBaseHours] = useState(
    String(sumEnabledDayHours(initialBaseHoursDayState.enabled, initialBaseHoursDayState.hours)),
  )
  const [baseHoursFirstEffectiveDay, setBaseHoursFirstEffectiveDay] = useState('')
  const [baseHoursDayEnabled, setBaseHoursDayEnabled] = useState(initialBaseHoursDayState.enabled)
  const [baseHoursDayHours, setBaseHoursDayHours] = useState(initialBaseHoursDayState.hours)

  useEffect(() => {
    onStepChange?.(step)
  }, [step, onStepChange])

  // Auto-approval off means no pre-approved hours regardless of whatever
  // number is still sitting in `preApprovedHoursPerWeek` — the Agreement
  // Settings screen disables that field when the toggle is off but doesn't
  // clear its value, so it can't be trusted on its own here.
  const preApprovedHours = agreementSettings.autoApproveExtraHours ? agreementSettings.preApprovedHoursPerWeek : 0

  // The current Monday–Sunday week is fully blocked — the VA can only
  // report hours for the MAX_LOOKBACK_WEEKS full weeks before it.
  const currentWeekStart = getWeekRange(toISODate(new Date())).start
  const maxDate = toISODate(addDays(parseISODate(currentWeekStart), -1))
  const minDate = toISODate(addDays(parseISODate(currentWeekStart), -MAX_LOOKBACK_WEEKS * 7))

  const toggleDate = (date: string) => {
    setSelectedDates((prev) => {
      if (prev.includes(date)) {
        setHoursByDate((hours) => {
          const next = { ...hours }
          delete next[date]
          return next
        })
        return prev.filter((d) => d !== date)
      }
      setHoursByDate((hours) => ({ ...hours, [date]: 1 }))
      return [...prev, date].sort()
    })
  }

  const totalHours = selectedDates.reduce((sum, date) => sum + (hoursByDate[date] ?? 0), 0)
  const totalAmount = totalHours * RATE_PER_HOUR
  const exceededMax = totalHours > TOTAL_MAX_HOURS
  const canGoNext =
    requestType === 'extra-hours'
      ? selectedDates.length > 0 && totalHours > 0 && !exceededMax
      : requestType === 'time-off'
        ? timeOffDates.length > 0 &&
          timeOffDates.reduce((sum, date) => sum + (timeOffHoursByDate[date] ?? 0), 0) > 0 &&
          timeOffDates.length <= MAX_TIME_OFF_DAYS
        : requestType === 'change-base-hours'
          ? baseHoursFirstEffectiveDay !== ''
          : true
  const weekGroups = buildWeekGroups(
    selectedDates,
    hoursByDate,
    vaEmail,
    preApprovedHours,
    agreementSettings.reportBackWeeks,
    maxDate,
  )
  // Auto-approval is an all-or-nothing switch for the whole request, not
  // per week — if any single week's hours exceed what's remaining, or falls
  // outside the auto-approval period, the entire request (every week, every
  // date) goes to manual approval.
  const anyWeekOverHours = weekGroups.some((week) => week.enteredHours > week.remainingHours)
  const anyWeekOutsidePeriod = weekGroups.some((week) => week.isOutsidePeriod)
  const anyWeekWithNoRemaining = preApprovedHours > 0 && weekGroups.some((week) => week.remainingHours === 0)

  // The bottom summary's second column and the big banner below it share
  // the same "which problem, which week" pick — outside-period beats having
  // no pre-approved hours left at all, which beats merely going over what's
  // left this week (Figma never shows more than one of these at once, so
  // ties are broken by this priority rather than shown side by side).
  const outsidePeriodWeek = weekGroups.find((week) => week.isOutsidePeriod)
  const noRemainingWeek = weekGroups.find((week) => week.remainingHours === 0)
  const overWithRemainingWeek = weekGroups.find((week) => week.enteredHours > week.remainingHours)

  const totalsSecondColumn = outsidePeriodWeek
    ? { label: 'Outside your auto-approval period', hours: outsidePeriodWeek.enteredHours, week: outsidePeriodWeek }
    : anyWeekWithNoRemaining && noRemainingWeek
      ? { label: 'No pre-approved hours left', hours: noRemainingWeek.enteredHours, week: noRemainingWeek }
      : preApprovedHours > 0 && anyWeekOverHours && overWithRemainingWeek
        ? {
            label: 'Over the weekly amount',
            hours: overWithRemainingWeek.enteredHours - overWithRemainingWeek.remainingHours,
            week: overWithRemainingWeek,
          }
        : null

  const bottomAlertMessage = anyWeekOutsidePeriod
    ? 'One week in this request is outside your auto-approval period, so the entire request will be sent to your client for approval, not only that week.'
    : anyWeekWithNoRemaining
      ? 'One week in this request has no pre-approved hours left, so the entire request will be sent to your client for approval, not only that week.'
      : preApprovedHours > 0 && anyWeekOverHours
        ? 'This request goes over your pre-approved amount for at least one week, so the entire request will be sent to your client for approval, not only the extra hours.'
        : null

  const handleReset = () => {
    setSelectedDates([])
    setHoursByDate({})
  }

  // Time Off: the calendar allows any date within 6 months forward / 3
  // months back (Figma's own NOTE copy), further restricted to the VA's
  // actual working days under this agreement.
  const timeOffMaxDate = toISODate(addMonths(new Date(), 6))
  const timeOffMinDate = toISODate(addMonths(new Date(), -3))
  const isTimeOffDayDisabled = (date: string) => getScheduledHoursForDate(date, agreementWeek) <= 0

  const handleTimeOffDayClick = (date: string) => {
    if (timeOffMode === 'non-consecutive') {
      setTimeOffDates((prev) => {
        if (prev.includes(date)) {
          setTimeOffHoursByDate((hours) => {
            const next = { ...hours }
            delete next[date]
            return next
          })
          return prev.filter((d) => d !== date)
        }
        setTimeOffHoursByDate((hours) => ({ ...hours, [date]: 1 }))
        return [...prev, date].sort()
      })
      return
    }

    // Consecutive mode: the first click sets the range's start, clicking it
    // again clears the selection, and a second click on any other day
    // completes the range — only the VA's working days within it are kept,
    // non-working days in between are simply skipped.
    if (!timeOffRangeAnchor) {
      setTimeOffRangeAnchor(date)
      setTimeOffDates([date])
      setTimeOffHoursByDate({ [date]: 1 })
      return
    }
    if (timeOffRangeAnchor === date) {
      setTimeOffRangeAnchor(null)
      setTimeOffDates([])
      setTimeOffHoursByDate({})
      return
    }

    const start = timeOffRangeAnchor < date ? timeOffRangeAnchor : date
    const end = timeOffRangeAnchor < date ? date : timeOffRangeAnchor
    const rangeDates: string[] = []
    for (let cursor = parseISODate(start); cursor <= parseISODate(end); cursor = addDays(cursor, 1)) {
      const iso = toISODate(cursor)
      if (!isTimeOffDayDisabled(iso)) rangeDates.push(iso)
    }
    setTimeOffDates(rangeDates)
    setTimeOffHoursByDate((prev) => {
      const next: Record<string, number> = {}
      for (const iso of rangeDates) next[iso] = prev[iso] ?? 1
      return next
    })
    setTimeOffRangeAnchor(null)
  }

  const handleTimeOffModeChange = (mode: 'consecutive' | 'non-consecutive') => {
    setTimeOffMode(mode)
    setTimeOffDates([])
    setTimeOffHoursByDate({})
    setTimeOffRangeAnchor(null)
  }

  const handleTimeOffReset = () => {
    setTimeOffDates([])
    setTimeOffHoursByDate({})
    setTimeOffRangeAnchor(null)
  }

  const sortedTimeOffDates = [...timeOffDates].sort()
  const timeOffRangeEndpoints =
    timeOffMode === 'consecutive' && sortedTimeOffDates.length > 0
      ? [sortedTimeOffDates[0], sortedTimeOffDates[sortedTimeOffDates.length - 1]]
      : sortedTimeOffDates
  const timeOffInRangeDates =
    timeOffMode === 'consecutive' && sortedTimeOffDates.length > 2 ? sortedTimeOffDates.slice(1, -1) : []

  const totalTimeOffHours = timeOffDates.reduce((sum, date) => sum + (timeOffHoursByDate[date] ?? 0), 0)
  const totalTimeOffCapacity = timeOffDates.reduce(
    (sum, date) => sum + getScheduledHoursForDate(date, agreementWeek),
    0,
  )
  const exceededTimeOffDays = timeOffDates.length > MAX_TIME_OFF_DAYS
  const alreadyRequestedTimeOffDates = getTimeOffRequestedDatesForVA(vaEmail)
  const hasAlreadyRequestedTimeOffDate = timeOffDates.some((date) => alreadyRequestedTimeOffDates.includes(date))

  const workingDaysPerWeek = agreementWeek.filter((day) => !day.disabled && parseHoursValue(day.value) > 0).length
  const workingHoursPerWeek = agreementWeek.reduce(
    (sum, day) => sum + (day.disabled ? 0 : parseHoursValue(day.value)),
    0,
  )

  const handleToggleBaseHoursDay = (key: string, checked: boolean) => {
    setBaseHoursDayEnabled((prev) => ({ ...prev, [key]: checked }))
    // A day that's turned off doesn't keep whatever hours it had — it reads
    // as 0 until (if ever) it's turned back on.
    if (!checked) setBaseHoursDayHours((prev) => ({ ...prev, [key]: '0' }))
  }

  const handleBaseHoursDayHoursChange = (key: string, value: string) => {
    setBaseHoursDayHours((prev) => ({ ...prev, [key]: value.replace(/-/g, '') }))
  }

  const totalBaseHoursEntered = sumEnabledDayHours(baseHoursDayEnabled, baseHoursDayHours)
  // The VA's own version of this form has no "New Base Hours/Week" field at
  // all — they're only redistributing hours across days, so the table
  // checks against their current total instead of a separately-requested one.
  const targetBaseHours = isClientPerspective ? parseFloat(newBaseHours) || 0 : workingHoursPerWeek

  let baseHoursAlert: { type: AlertType; message: string } | null = null
  if (targetBaseHours > 0) {
    if (totalBaseHoursEntered === targetBaseHours) {
      baseHoursAlert = {
        type: isClientPerspective ? 'info' : 'success',
        message: `${totalBaseHoursEntered}/${targetBaseHours} hours/week`,
      }
    } else if (totalBaseHoursEntered > targetBaseHours) {
      baseHoursAlert = {
        type: 'error',
        message: `${totalBaseHoursEntered}/${targetBaseHours} hours/week You have added too many hours. Make sure the hours match the weekly hours on your agreement.`,
      }
    } else {
      baseHoursAlert = {
        type: 'warning',
        message: `${totalBaseHoursEntered}/${targetBaseHours} hours/week You have added too few hours. Make sure the hours match the weekly hours on your agreement.`,
      }
    }
  }

  const handleSubmit = () => {
    if (requestType === 'extra-hours' && agreementId) {
      createExtraHoursCARequest({
        vaEmail,
        agreementId,
        selectedDates,
        hoursByDate,
        comments,
        requesterRole: showOnBehalfOf ? onBehalfOf : requesterRole,
        anyWeekOverHours,
        anyWeekOutsidePeriod,
      })
    }
    if (requestType === 'time-off' && agreementId) {
      createTimeOffCARequest({
        vaEmail,
        agreementId,
        mode: timeOffMode,
        paidType: timeOffPaid,
        makeUpHoursTiming: timeOffPaid === 'paid-replacing-hours' ? makeUpHoursTiming : undefined,
        clientResponse,
        selectedDates: timeOffDates,
        hoursByDate: timeOffHoursByDate,
        comments,
        requesterRole: showOnBehalfOf ? onBehalfOf : requesterRole,
      })
    }
    if (requestType === 'change-base-hours' && agreementId) {
      const scheduleSummary = DAY_ROWS.filter((day) => baseHoursDayEnabled[day.key])
        .map((day) => `${day.label}: ${baseHoursDayHours[day.key] || '0'} hrs`)
        .join('\n')
      const week: WeekDayData[] = DAY_ROWS.map((day) => ({
        key: day.key,
        dayLetter: day.dayLetter,
        value: `${baseHoursDayHours[day.key] || '0'} hrs`,
        disabled: !baseHoursDayEnabled[day.key],
      }))
      createChangeBaseHoursCARequest({
        vaEmail,
        agreementId,
        currentHoursPerWeek: workingHoursPerWeek,
        newHoursPerWeek: isClientPerspective ? targetBaseHours : totalBaseHoursEntered,
        week,
        scheduleSummary,
        firstEffectiveDay: baseHoursFirstEffectiveDay || undefined,
        comments,
        requesterRole: showOnBehalfOf ? onBehalfOf : requesterRole,
      })
    }
    setStep(4)
  }

  const handleRequestMore = () => {
    setRequestType('time-off')
    setSelectedDates([])
    setHoursByDate({})
    setComments('')
    handleTimeOffReset()
    setTimeOffMode('consecutive')
    setTimeOffPaid('paid')
    setMakeUpHoursTiming(MAKE_UP_HOURS_OPTIONS[0])
    setClientResponse(CLIENT_RESPONSE_OPTIONS[0])
    setBaseHoursFirstEffectiveDay('')
    const resetDayState = buildDayStateFromWeek(agreementWeek)
    setBaseHoursDayEnabled(resetDayState.enabled)
    setBaseHoursDayHours(resetDayState.hours)
    setNewBaseHours(String(sumEnabledDayHours(resetDayState.enabled, resetDayState.hours)))
    setStep(1)
  }

  return (
    <div className="ca-wizard">
      <StepsNavigation>
        <Step
          step={1}
          title="Choose Request for Changes"
          position="left"
          status={step > 1 ? 'completed' : 'selected'}
          onClick={step > 1 && step <= 3 ? () => setStep(1) : undefined}
        />
        <Step
          step={2}
          title="Fill request form"
          position="middle"
          status={step === 2 ? 'selected' : step > 2 ? 'completed' : 'default'}
          onClick={step > 2 && step <= 3 ? () => setStep(2) : undefined}
        />
        <Step
          step={3}
          title="Comments"
          position="right"
          status={step === 3 ? 'selected' : step > 3 ? 'completed' : 'default'}
        />
      </StepsNavigation>

      {showOnBehalfOf && step > 1 && (
        <div className="ca-wizard__on-behalf-badge-row">
          <Chip label={`Requesting on behalf of ${onBehalfOf === 'client' ? 'Client' : 'VA'}`} tone="gray" />
        </div>
      )}

      {step === 1 && (
        <div className="ca-wizard__row">
          <div className="ca-wizard__column ca-wizard__column--narrow">
            <h2 className="ca-wizard__heading">Change Request or Approval Details</h2>
            <p className="ca-wizard__description">
              Please let us know the details of what you&apos;d like to change or approve.
            </p>
            {recentRequests && recentRequests.length > 0 && (
              <>
                <h3 className="ca-wizard__subheading">Recent and Pending Changes</h3>
                <div className="ca-wizard__recent-list">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="ca-wizard__recent-card">
                      <div className="ca-wizard__recent-card-text">
                        <span className="ca-wizard__recent-card-date">{request.date}</span>
                        <span className="ca-wizard__recent-card-title">{request.title}</span>
                      </div>
                      <Chip label={CA_STATUS_LABEL[request.status]} tone={CA_STATUS_TONE[request.status]} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="ca-wizard__column ca-wizard__column--wide">
            <ProfileCard>
              <div className="ca-wizard__card-body">
                {showOnBehalfOf && (
                  <fieldset className="ca-wizard__radio-group">
                    <legend className="ca-wizard__radio-legend">Request on behalf of</legend>
                    <Radio
                      name="on-behalf-of"
                      value="client"
                      label="Client"
                      checked={onBehalfOf === 'client'}
                      onChange={() => {
                        setOnBehalfOf('client')
                        // Extra hours isn't offered from the client's perspective.
                        if (requestType === 'extra-hours') setRequestType('time-off')
                      }}
                    />
                    <Radio
                      name="on-behalf-of"
                      value="va"
                      label="VA"
                      checked={onBehalfOf === 'va'}
                      onChange={() => setOnBehalfOf('va')}
                    />
                  </fieldset>
                )}
                <fieldset className="ca-wizard__radio-group">
                  <legend className="ca-wizard__radio-legend">
                    {showOnBehalfOf && onBehalfOf === 'client'
                      ? 'Main Changes Requested from the Client'
                      : 'Main Changes Requested from the Virtual Assistant (VA)'}
                  </legend>
                  {REQUEST_TYPE_OPTIONS.filter((option) => option.value !== 'extra-hours').map((option) => (
                    <Radio
                      key={option.value}
                      name="request-type"
                      value={option.value}
                      label={option.label}
                      checked={requestType === option.value}
                      onChange={() => setRequestType(option.value)}
                    />
                  ))}
                </fieldset>
                <div className="ca-wizard__actions">
                  <Button buttonText="Next" onClick={() => setStep(2)} />
                </div>
              </div>
            </ProfileCard>
          </div>
        </div>
      )}

      {step === 2 && requestType !== 'extra-hours' && requestType !== 'time-off' && requestType !== 'change-base-hours' && (
        <ProfileCard>
          <p className="ca-wizard__description">
            This request type isn&apos;t available in the prototype yet — only &quot;Request approval
            for extra hours&quot; and &quot;Request approval for time off&quot; are fully built out.
          </p>
          <div className="ca-wizard__actions">
            <Button type="tertiary" buttonText="Back" onClick={() => setStep(1)} />
          </div>
        </ProfileCard>
      )}

      {step === 2 && requestType === 'extra-hours' && (
        <>
          <h2 className="ca-wizard__heading">Request Approval for Extra Hours</h2>
          <p className="ca-wizard__description">
            Please provide the details of the extra hours you worked, including date, number of
            hours and relevant information required for the approval
          </p>

          <div className="ca-wizard__row">
            <div className="ca-wizard__column ca-wizard__column--narrow">
              <ProfileCard>
                <div className="ca-wizard__card-body">
                  <h3 className="ca-wizard__subheading">Request Approval for Extra Hours</h3>
                  <p className="ca-wizard__description">
                    Fill out this section of the form if you&apos;d like to report any extra hours
                    worked during the last {MAX_LOOKBACK_WEEKS} weeks, in order to receive the
                    corresponding payment on your next invoice
                  </p>
                  <div className="ca-wizard__info-card ca-wizard__info-card--purple">
                    <span>Current Invoice period from:</span>
                    <strong>Aug 17 – 30, 2026</strong>
                  </div>
                  <div className="ca-wizard__info-card ca-wizard__info-card--purple">
                    <span>Requesting for:</span>
                    <strong>Bloominari dba Virtual Latinos</strong>
                  </div>
                  <div className="ca-wizard__info-card ca-wizard__info-card--orange">
                    <strong>Your deadline is August 25 at 11:59 PM PT.</strong>
                    <span>Once deadline is over, your changes will take effect on the next invoice period.</span>
                  </div>
                </div>
              </ProfileCard>
            </div>

            <div className="ca-wizard__column">
              <ProfileCard>
                <div className="ca-wizard__card-body">
                  <h3 className="ca-wizard__heading">Request Details</h3>

                  <div className="ca-wizard__details-box">
                    <div className="ca-wizard__metric-row">
                      {preApprovedHours > 0 ? (
                        <>
                          <FormField
                            label="Pre-approved Extra Hours"
                            info="The number of extra hours your agreement allows each week without needing separate client approval. Resets every Monday."
                          >
                            <p className="ca-wizard__metric-value">
                              {preApprovedHours} <span>Hrs/Week</span>
                            </p>
                          </FormField>
                          <FormField
                            label="Auto-approval Period"
                            info={`How far back your extra hours are auto-approved, set by your client. You can still report hours up to ${MAX_LOOKBACK_WEEKS} weeks back, but anything past this period needs their approval.`}
                          >
                            <p className="ca-wizard__metric-value">
                              Last {agreementSettings.reportBackWeeks} <span>Weeks</span>
                            </p>
                          </FormField>
                        </>
                      ) : (
                        <FormField label="Report up to">
                          <p className="ca-wizard__metric-value">
                            Last 12 <span className="ca-wizard__metric-value-suffix--dark">Weeks</span>
                          </p>
                        </FormField>
                      )}
                      <FormField label="Current Rate per hour">
                        <p className="ca-wizard__metric-value">
                          ${RATE_PER_HOUR.toFixed(2)} <span>USD</span>
                        </p>
                      </FormField>
                    </div>

                    <div className="ca-wizard__calendar-row">
                      <div className="ca-wizard__calendar-column">
                        <FormField
                          label="Specific dates that you worked extra hours"
                          description={`Select the dates you worked extra hours in the last ${MAX_LOOKBACK_WEEKS} weeks. Only past dates are eligible.`}
                        >
                          {null}
                        </FormField>
                        <Calendar
                          selectedDates={selectedDates}
                          onToggleDate={toggleDate}
                          minDate={minDate}
                          maxDate={maxDate}
                        />
                        <Button
                          type="secondary"
                          buttonText="Reset"
                          onClick={handleReset}
                          disabled={selectedDates.length === 0}
                        />
                      </div>

                      <div className="ca-wizard__hours-column">
                        {selectedDates.length === 0 ? (
                          <>
                            <h3 className="ca-wizard__subheading">Extra Hours</h3>
                            <div className="ca-wizard__empty-state">
                              <Icon name="calendar" size={40} />
                              <p className="ca-wizard__empty-title">No days selected</p>
                              <p className="ca-wizard__empty-subtitle">
                                Select at least one date to enter the hours you worked as extra hours
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <h3 className="ca-wizard__subheading">Extra Hours Worked</h3>
                            <p className="ca-wizard__description">
                              Enter the additional hours worked on each date below,{' '}
                              <strong>up to {DAILY_MAX_HOURS} hours per day</strong>. Dates are
                              grouped by week — your pre-approved hours reset every Monday. Weeks
                              beyond your {agreementSettings.reportBackWeeks}-week auto-approval
                              period, or that go over your pre-approved amount, will need your
                              client&apos;s approval.
                            </p>
                            <div className="ca-wizard__week-groups">
                              {weekGroups.map((week) => {
                                const isFlagged =
                                  preApprovedHours > 0 &&
                                  (week.isOutsidePeriod || week.enteredHours > week.remainingHours)
                                const caption = week.isOutsidePeriod
                                  ? 'No pre-approved hours apply to this week'
                                  : week.takenHours > 0
                                    ? `${week.takenHours} hrs already requested this week`
                                    : null
                                return (
                                  <div
                                    key={week.start}
                                    className={
                                      isFlagged
                                        ? 'ca-wizard__week-group ca-wizard__week-group--flagged'
                                        : 'ca-wizard__week-group'
                                    }
                                  >
                                    <div className="ca-wizard__week-header">
                                      <div className="ca-wizard__week-header-text">
                                        <p className="ca-wizard__week-title">
                                          Week of {formatWeekRange(week.start, week.end)}
                                        </p>
                                        {caption && <p className="ca-wizard__week-caption">{caption}</p>}
                                      </div>
                                      {preApprovedHours > 0 && (
                                        <Chip
                                          label={`${week.takenHours + week.enteredHours} of ${preApprovedHours} hrs`}
                                          tone={isFlagged ? 'orange' : 'green'}
                                        />
                                      )}
                                    </div>
                                    <div className="ca-wizard__date-rows">
                                      {week.dates.map((date) => (
                                        <FormField key={date} label={formatFullDate(date)}>
                                          <Input
                                            type="number"
                                            min={1}
                                            max={DAILY_MAX_HOURS}
                                            rightText="Hrs"
                                            value={hoursByDate[date] ?? 1}
                                            onChange={(event) =>
                                              setHoursByDate((prev) => ({
                                                ...prev,
                                                [date]: Math.min(
                                                  DAILY_MAX_HOURS,
                                                  Math.max(1, Number(event.target.value)),
                                                ),
                                              }))
                                            }
                                            onIncrement={() =>
                                              setHoursByDate((prev) => ({
                                                ...prev,
                                                [date]: Math.min(DAILY_MAX_HOURS, (prev[date] ?? 1) + 1),
                                              }))
                                            }
                                            onDecrement={() =>
                                              setHoursByDate((prev) => ({
                                                ...prev,
                                                [date]: Math.max(1, (prev[date] ?? 1) - 1),
                                              }))
                                            }
                                            incrementLabel={`Increase hours for ${formatFullDate(date)}`}
                                            decrementLabel={`Decrease hours for ${formatFullDate(date)}`}
                                          />
                                        </FormField>
                                      ))}
                                    </div>
                                    {isFlagged && (
                                      <InlineWarning
                                        message={
                                          week.isOutsidePeriod || week.remainingHours === 0
                                            ? "These hours need your client's approval."
                                            : 'Reduce the hours to keep this request automatic.'
                                        }
                                      />
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedDates.length === 0 ? (
                    <div className="ca-wizard__totals">
                      <div className="ca-wizard__totals-columns">
                        <div className="ca-wizard__totals-column">
                          <span className="ca-wizard__totals-label">Total worked extra hours</span>
                          <p className="ca-wizard__totals-value">
                            {totalHours} <span>Hours</span>
                          </p>
                        </div>
                        <div className="ca-wizard__totals-column">
                          <span className="ca-wizard__totals-label">Total amount of money you will receive</span>
                          <p className="ca-wizard__totals-value">
                            ${totalAmount.toFixed(2)} <span>USD</span>
                          </p>
                        </div>
                      </div>
                      <p className="ca-wizard__totals-caption">
                        Calculated from number of dates and hours you worked extra hours.
                      </p>
                    </div>
                  ) : (
                    <div className="ca-wizard__totals">
                      <div className="ca-wizard__totals-columns">
                        <div className="ca-wizard__totals-column">
                          <span className="ca-wizard__totals-label">Total extra hours worked</span>
                          <p className="ca-wizard__totals-value">
                            {totalHours} <span>Hrs</span>
                          </p>
                        </div>
                        {totalsSecondColumn && (
                          <div className="ca-wizard__totals-column">
                            <span className="ca-wizard__totals-label">{totalsSecondColumn.label}</span>
                            <div className="ca-wizard__totals-value-row">
                              <p className="ca-wizard__totals-value">
                                {totalsSecondColumn.hours} <span>Hrs</span>
                              </p>
                              <span className="ca-wizard__totals-week-label">
                                Week of {formatWeekRange(totalsSecondColumn.week.start, totalsSecondColumn.week.end)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="ca-wizard__totals-estimate-row">
                        <span className="ca-wizard__totals-caption">Estimated amount, if approved</span>
                        <span className="ca-wizard__totals-amount">
                          ${totalAmount.toFixed(2)} USD
                        </span>
                      </div>
                    </div>
                  )}

                  {bottomAlertMessage && <InlineWarning message={bottomAlertMessage} />}
                  {exceededMax && (
                    <Alert
                      type="error"
                      message="This request exceeds the 60-hour limit for requests that require client approval. Reduce the hours or remove some dates, then submit the remaining hours as a separate request."
                    />
                  )}

                  <div className="ca-wizard__actions">
                    <Button buttonText="Next" onClick={() => setStep(3)} disabled={!canGoNext} />
                  </div>
                </div>
              </ProfileCard>
            </div>
          </div>
        </>
      )}

      {step === 2 && requestType === 'time-off' && (
        <>
          <h2 className="ca-wizard__heading">
            {isClientPerspective ? 'Provide or Approve for Time Off, Vacations, Etc' : 'Request Approval for Time Off, Vacations, Etc'}
          </h2>

          <div className="ca-wizard__row">
            <div className="ca-wizard__column ca-wizard__column--narrow">
              <ProfileCard>
                <div className="ca-wizard__card-body">
                  <h3 className="ca-wizard__subheading">
                    {isClientPerspective
                      ? 'Provide or Approve for Time Off, Vacations, Etc'
                      : 'Request Approval for Time Off, Vacations, Etc'}
                  </h3>
                  <div className="ca-wizard__info-card ca-wizard__info-card--purple">
                    <span>Current Invoice period from:</span>
                    <strong>Aug 17 – 30, 2026</strong>
                  </div>
                  <div className="ca-wizard__info-card ca-wizard__info-card--purple">
                    <span>Requesting for:</span>
                    <strong>Bloominari dba Virtual Latinos</strong>
                  </div>
                  <div className="ca-wizard__info-card ca-wizard__info-card--orange">
                    <strong>Your deadline is August 25 at 11:59 PM PT.</strong>
                    <span>Once deadline is over, your changes will take effect on the next invoice period.</span>
                  </div>
                </div>
              </ProfileCard>
              <p className="ca-wizard__note">
                <strong>NOTE: </strong>
                You can request time off up to 6 months in advance; or log time off for past pay periods
                within the last 3 months.
              </p>
            </div>

            <div className="ca-wizard__column">
              <ProfileCard>
                <div className="ca-wizard__card-body">
                  <h3 className="ca-wizard__heading">Request Details</h3>

                  <FormField
                    label={isClientPerspective ? 'How would you like to request your time off' : 'How would your VA like to request time off'}
                  >
                    <div className="ca-wizard__radio-option-list">
                      <RadioOptionWithDescription
                        name="time-off-mode"
                        value="consecutive"
                        checked={timeOffMode === 'consecutive'}
                        onChange={() => handleTimeOffModeChange('consecutive')}
                        title="Consecutive days"
                        description="Select a continuous range of days with no breaks (e.g. Monday 1st - Friday 5th)"
                      />
                      <RadioOptionWithDescription
                        name="time-off-mode"
                        value="non-consecutive"
                        checked={timeOffMode === 'non-consecutive'}
                        onChange={() => handleTimeOffModeChange('non-consecutive')}
                        title="Non-consecutive days"
                        description="Select individual days that don&rsquo;t have to be in sequence (e.g. Monday 1st, Wednesday 3rd, Tuesday 9th)"
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Will this be Paid or Non-Paid Time Off?"
                    info="Paid time off is covered by your agreement. Non-Paid time off is unpaid and won't be billed on your next invoice."
                  >
                    <Select
                      options={TIME_OFF_PAID_OPTIONS}
                      value={timeOffPaid}
                      onChange={(value) => setTimeOffPaid(value as 'paid' | 'non-paid' | 'paid-replacing-hours')}
                    />
                  </FormField>

                  {timeOffPaid === 'paid-replacing-hours' && (
                    <FormField label="When will you make up the work hours missed during your time off?">
                      <fieldset className="ca-wizard__radio-group">
                        {MAKE_UP_HOURS_OPTIONS.map((option) => (
                          <Radio
                            key={option}
                            name="make-up-hours-timing"
                            value={option}
                            label={option}
                            checked={makeUpHoursTiming === option}
                            onChange={() => setMakeUpHoursTiming(option)}
                          />
                        ))}
                      </fieldset>
                    </FormField>
                  )}

                  <FormField label="Client response to your request">
                    <fieldset className="ca-wizard__radio-group">
                      {CLIENT_RESPONSE_OPTIONS.map((option) => (
                        <Radio
                          key={option}
                          name="client-response"
                          value={option}
                          label={option}
                          checked={clientResponse === option}
                          onChange={() => setClientResponse(option)}
                        />
                      ))}
                    </fieldset>
                  </FormField>

                  <div className="ca-wizard__details-box">
                    <div className="ca-wizard__schedule-panel">
                      <p className="ca-wizard__subheading">Your Schedule (Work Hours per Day)</p>
                      <Week days={agreementWeek} />
                      <div className="ca-wizard__schedule-stats">
                        <div className="ca-wizard__schedule-stat">
                          <span className="ca-wizard__subheading">Current Working Days/Week</span>
                          <p className="ca-wizard__metric-value">
                            {workingDaysPerWeek} <span>Days</span>
                          </p>
                        </div>
                        <div className="ca-wizard__schedule-stat">
                          <span className="ca-wizard__subheading">Current Working Hours/Week</span>
                          <p className="ca-wizard__metric-value">
                            {workingHoursPerWeek} <span>Hours</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="ca-wizard__calendar-row">
                      <div className="ca-wizard__calendar-column">
                        <FormField
                          label="Specific dates that you&apos;d like to request off"
                          description="Count only business days as applicable in your schedule. You can request up to 14 days of time off per Changes & Approvals form."
                        >
                          {null}
                        </FormField>
                        <Input
                          readOnly
                          placeholder="yyyy-mm-dd"
                          value={
                            sortedTimeOffDates.length === 0
                              ? ''
                              : timeOffMode === 'consecutive'
                                ? sortedTimeOffDates.length > 1
                                  ? `${sortedTimeOffDates[0]} to ${sortedTimeOffDates[sortedTimeOffDates.length - 1]}`
                                  : sortedTimeOffDates[0]
                                : sortedTimeOffDates.join(', ')
                          }
                        />
                        <Calendar
                          selectedDates={timeOffRangeEndpoints}
                          inRangeDates={timeOffInRangeDates}
                          onToggleDate={handleTimeOffDayClick}
                          isDayDisabled={isTimeOffDayDisabled}
                          minDate={timeOffMinDate}
                          maxDate={timeOffMaxDate}
                          initialViewDate={toISODate(new Date())}
                        />
                        <Button
                          type="secondary"
                          buttonText="Reset"
                          onClick={handleTimeOffReset}
                          disabled={timeOffDates.length === 0}
                        />
                      </div>

                      <div className="ca-wizard__hours-column">
                        {timeOffDates.length === 0 ? (
                          <>
                            <h3 className="ca-wizard__subheading">Daily Time Off Hours</h3>
                            <div className="ca-wizard__empty-state">
                              <Icon name="calendar" size={40} />
                              <p className="ca-wizard__empty-title">No days selected</p>
                              <p className="ca-wizard__empty-subtitle">
                                Select at least one date to enter the hours your VA will take off
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <h3 className="ca-wizard__subheading">Daily Time Off Hours</h3>
                            <p className="ca-wizard__description">
                              {isClientPerspective
                                ? "The maximum amount of hours you can request is based on your VA's scheduled work hours for this day."
                                : 'The maximum amount of hours you can request is based on your scheduled work hours for this day.'}
                            </p>
                            <div className="ca-wizard__date-rows">
                              {sortedTimeOffDates.map((date) => {
                                const dayMax = getScheduledHoursForDate(date, agreementWeek)
                                const dayLabel = isClientPerspective
                                  ? `Hours your VA will take off on ${formatFullDate(date)}`
                                  : `Hours you will take off on ${formatFullDate(date)}`
                                return (
                                  <FormField key={date} label={dayLabel}>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={dayMax}
                                      value={timeOffHoursByDate[date] ?? 1}
                                      onChange={(event) =>
                                        setTimeOffHoursByDate((prev) => ({
                                          ...prev,
                                          [date]: Math.min(dayMax, Math.max(1, Number(event.target.value))),
                                        }))
                                      }
                                      onIncrement={() =>
                                        setTimeOffHoursByDate((prev) => ({
                                          ...prev,
                                          [date]: Math.min(dayMax, (prev[date] ?? 1) + 1),
                                        }))
                                      }
                                      onDecrement={() =>
                                        setTimeOffHoursByDate((prev) => ({
                                          ...prev,
                                          [date]: Math.max(1, (prev[date] ?? 1) - 1),
                                        }))
                                      }
                                      incrementLabel={`Increase hours for ${formatFullDate(date)}`}
                                      decrementLabel={`Decrease hours for ${formatFullDate(date)}`}
                                    />
                                  </FormField>
                                )
                              })}
                            </div>

                            <div className="ca-wizard__totals">
                              <div className="ca-wizard__totals-columns">
                                <div className="ca-wizard__totals-column">
                                  <span className="ca-wizard__totals-label">Total hours your VA will take off</span>
                                  <p className="ca-wizard__totals-value">
                                    {totalTimeOffHours}/{totalTimeOffCapacity} <span>Hours/week</span>
                                  </p>
                                  <p className="ca-wizard__totals-caption">
                                    Calculated from number of dates and hours your VA would like to take off.
                                  </p>
                                </div>
                                <div className="ca-wizard__totals-column">
                                  <span className="ca-wizard__totals-label">Total days your VA will take off</span>
                                  <p className="ca-wizard__totals-value">
                                    {timeOffDates.length} <span>Days</span>
                                  </p>
                                </div>
                              </div>
                            </div>

                            {hasAlreadyRequestedTimeOffDate && (
                              <div className="ca-wizard__inline-warning">
                                <Icon name="triangle-exclamation" size={20} />
                                <span>
                                  One or more selected dates have already been requested{' '}
                                  {onViewChangesApprovals ? (
                                    <button
                                      type="button"
                                      className="ca-wizard__inline-link"
                                      onClick={onViewChangesApprovals}
                                    >
                                      See C&amp;A
                                    </button>
                                  ) : (
                                    <span className="ca-wizard__inline-link">See C&amp;A</span>
                                  )}
                                  .
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {exceededTimeOffDays && (
                    <Alert
                      type="error"
                      message={`You can request up to ${MAX_TIME_OFF_DAYS} days of time off per Changes & Approvals form. Reduce the dates, then submit the rest as a separate request.`}
                    />
                  )}

                  <div className="ca-wizard__actions">
                    <Button buttonText="Next" onClick={() => setStep(3)} disabled={!canGoNext} />
                  </div>
                </div>
              </ProfileCard>
            </div>
          </div>
        </>
      )}

      {step === 2 && requestType === 'change-base-hours' && (
        <div className="ca-wizard__row">
          <div className="ca-wizard__column ca-wizard__column--narrow">
            <ProfileCard>
              <div className="ca-wizard__card-body">
                <h3 className="ca-wizard__subheading">
                  {isClientPerspective
                    ? 'Change Base Work Hours / Week'
                    : 'Request approval for agreement Work Hours Per Day change'}
                </h3>
                <p className="ca-wizard__description">
                  {isClientPerspective
                    ? "Details of the new base hours/week you'd like your VA to work."
                    : 'Details of the request to change the base hours/day to work.'}
                </p>
                <div className="ca-wizard__info-card ca-wizard__info-card--purple">
                  <span>Current Invoice period from:</span>
                  <strong>Aug 17 – 30, 2026</strong>
                </div>
                <div className="ca-wizard__info-card ca-wizard__info-card--purple">
                  <span>Requesting for:</span>
                  <strong>Bloominari dba Virtual Latinos</strong>
                </div>
                <div className="ca-wizard__info-card ca-wizard__info-card--orange">
                  <strong>Your deadline is August 25 at 11:59 PM PT.</strong>
                  <span>Once deadline is over, your changes will take effect on the next invoice period.</span>
                </div>
              </div>
            </ProfileCard>
          </div>

          <div className="ca-wizard__column">
            <ProfileCard>
              <div className="ca-wizard__card-body">
                <div className="ca-wizard__current-hours-box">
                  <p className="ca-wizard__current-hours-title">Current Base Hours/Week</p>
                  <div className="ca-wizard__current-hours-value-row">
                    <span className="ca-wizard__current-hours-value">{workingHoursPerWeek}</span>
                    <span className="ca-wizard__current-hours-suffix">Hours/week</span>
                  </div>
                </div>

                {isClientPerspective && (
                  <FormField
                    label="New Base Hours/Week you&apos;d like to request to work for your VA?"
                    badge="(Optional)"
                    description="This will be the new base minimum hours/week your VA will work."
                  >
                    <Input
                      type="number"
                      min={0}
                      value={newBaseHours}
                      onChange={(event) => setNewBaseHours(event.target.value.replace(/-/g, ''))}
                      placeholder="Enter new base hours/week"
                    />
                  </FormField>
                )}

                <FormField
                  label={isClientPerspective ? 'Days your VA is available to work' : 'Days you are available to work'}
                  description={
                    isClientPerspective
                      ? 'Select the days of the week your VA is available to work as VA'
                      : 'Select the days of the week you are available to work as VA'
                  }
                  helpText="Note: Only multiples of 0.25 are allowed into the hours per day fields: e.g: 4.25, 6.5, 7.75, 8"
                >
                  <div className="ca-wizard__hours-table">
                    <div className="ca-wizard__hours-header">
                      <span>Selected work day</span>
                      <span>Hours Per Day</span>
                    </div>
                    {DAY_ROWS.map((day) => (
                      <div key={day.key} className="ca-wizard__hours-row">
                        <div className="ca-wizard__hours-day">
                          <Switch
                            checked={baseHoursDayEnabled[day.key]}
                            onChange={(checked) => handleToggleBaseHoursDay(day.key, checked)}
                            aria-label={`Toggle ${day.label}`}
                          />
                          <span>{day.label}</span>
                        </div>
                        <Input
                          value={baseHoursDayHours[day.key]}
                          onChange={(event) => handleBaseHoursDayHoursChange(day.key, event.target.value)}
                          disabled={!baseHoursDayEnabled[day.key]}
                          rightText="Hrs"
                          className="ca-wizard__hours-input"
                          type="number"
                          min={0}
                          step={0.25}
                        />
                      </div>
                    ))}
                    {baseHoursAlert && <Alert type={baseHoursAlert.type} message={baseHoursAlert.message} />}
                  </div>
                </FormField>

                <FormField
                  label="First Effective Day of new Work Hours Per Day"
                  description={
                    isClientPerspective
                      ? "First day your VA would like to start working the new base hours/week. Must be on a Monday."
                      : "First day you'd like to start working the new base hours/week. Must be on a Monday."
                  }
                  helpText="*Please note that you are unable to request changes before current Invoice period."
                >
                  <DatePickerField
                    value={baseHoursFirstEffectiveDay}
                    onChange={setBaseHoursFirstEffectiveDay}
                    minDate={getCurrentWeekMonday()}
                    maxDate={toISODate(addMonths(new Date(), 6))}
                    isDayDisabled={(date) => !isMonday(date)}
                  />
                </FormField>

                <div className="ca-wizard__actions">
                  <Button buttonText="Next" onClick={() => setStep(3)} disabled={!canGoNext} />
                </div>
              </div>
            </ProfileCard>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="ca-wizard__row">
          <div className="ca-wizard__column ca-wizard__column--narrow">
            <h2 className="ca-wizard__heading">Anything else you&apos;d like to tell us?</h2>
            <p className="ca-wizard__description">
              Let us know if there&apos;s anything else you&apos;d like the Virtual Latinos team to know.
            </p>
          </div>
          <div className="ca-wizard__column ca-wizard__column--wide">
            <ProfileCard>
              <div className="ca-wizard__card-body">
                <FormField label="Comments, Questions, Requests, Etc">
                  <TextArea
                    placeholder="Enter your comment, question or request"
                    value={comments}
                    onChange={(event) => setComments(event.target.value)}
                  />
                </FormField>
                <p className="ca-wizard__important-note">
                  <strong>IMPORTANT NOTE:</strong> After submitting this form, no changes can be made to
                  this request. Thus, please double check everything you&apos;re submitting is correct.
                </p>
                <div className="ca-wizard__actions ca-wizard__actions--end">
                  <Button buttonText="Submit form" onClick={handleSubmit} />
                </div>
              </div>
            </ProfileCard>
          </div>
        </div>
      )}

      {step === 4 && (
        <>
          <ProfileCard className="ca-wizard__success-card">
            <div className="ca-wizard__success-content">
              <Icon name="memo-circle-check" variant="bold" size={40} className="ca-wizard__success-icon" />
              <h2 className="ca-wizard__heading">Request Submitted Successfully</h2>
              <p className="ca-wizard__description">
                The request has been created and is now available in your Changes and Approvals section,
                where you can track its status and view related updates.
              </p>
            </div>
          </ProfileCard>
          <div className="ca-wizard__finish-actions">
            <Button type="secondary" buttonText="Request More Changes" onClick={handleRequestMore} />
            <Button buttonText={finishButtonLabel} onClick={onFinish} />
          </div>
        </>
      )}
    </div>
  )
}
