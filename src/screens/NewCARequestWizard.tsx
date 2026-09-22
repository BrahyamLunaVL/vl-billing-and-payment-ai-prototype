import { useEffect, useState } from 'react'
import {
  StepsNavigation,
  Step,
  ProfileCard,
  Chip,
  FormField,
  Input,
  TextArea,
  Calendar,
  Alert,
  Icon,
  Button,
  Radio,
} from '../components'
import {
  CA_STATUS_LABEL,
  CA_STATUS_TONE,
  getWeekRange,
  getExtraHoursTakenForWeek,
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

const DEFAULT_AGREEMENT_SETTINGS: AgreementSettings = {
  autoApproveChanges: false,
  notifyOverThreshold: false,
  overThresholdAmount: 500,
  autoApproveExtraHours: true,
  preApprovedHoursPerWeek: 5,
  reportBackWeeks: 12,
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

interface WeekGroup {
  start: string
  end: string
  dates: string[]
  enteredHours: number
  takenHours: number
  remainingHours: number
}

/**
 * Buckets the in-progress selection into Monday–Sunday weeks, each with its
 * own pre-approved-hours math — the allowance resets every week, so "taken"
 * (from prior approved requests) and "remaining" only make sense per week,
 * not as a single total across the whole multi-week selection.
 */
function buildWeekGroups(
  selectedDates: string[],
  hoursByDate: Record<string, number>,
  vaEmail: string,
  preApprovedHours: number,
): WeekGroup[] {
  const byWeekStart = new Map<string, WeekGroup>()

  for (const date of selectedDates) {
    const { start, end } = getWeekRange(date)
    let group = byWeekStart.get(start)
    if (!group) {
      const takenHours = getExtraHoursTakenForWeek(vaEmail, start, end)
      group = {
        start,
        end,
        dates: [],
        enteredHours: 0,
        takenHours,
        remainingHours: Math.max(0, preApprovedHours - takenHours),
      }
      byWeekStart.set(start, group)
    }
    group.dates.push(date)
    group.enteredHours += hoursByDate[date] ?? 0
  }

  return [...byWeekStart.values()].sort((a, b) => a.start.localeCompare(b.start))
}

export interface NewCARequestWizardProps {
  /** The VA the request is for — used to look up hours already taken this week against their pre-approved allowance. */
  vaEmail: string
  /** The VA's most recent request, shown as a reference on step 1. */
  recentRequest?: CARequest
  /**
   * The client's Agreement Settings for the agreement this request is
   * under — the source of the pre-approved-hours/lookback-window rules
   * below, so a change the client makes on their Agreement screen is
   * reflected here immediately. Falls back to sensible defaults when the
   * VA has no active agreement (shouldn't normally happen).
   */
  agreementSettings?: AgreementSettings
  /** Shows the Admin-only "Request on behalf of" Client/VA selector on step 1, above the request type list. */
  showOnBehalfOf?: boolean
  /** Label for step 4's primary button — where it goes differs per viewer role (e.g. "Go My Account" for a VA, "Go to C&A Table" for a Client/Admin). */
  finishButtonLabel: string
  /** Called when step 4's primary button is clicked — navigates the viewer to their role's home for this flow. */
  onFinish: () => void
  /** Called whenever the current step changes, so the parent screen can swap its own header (e.g. to "Success" on step 4). */
  onStepChange?: (step: 1 | 2 | 3 | 4) => void
}

/** The 4-step "New Request for Changes" wizard (Figma's "Changes & Approvals Form" flow). */
export const NewCARequestWizard = ({
  vaEmail,
  recentRequest,
  agreementSettings = DEFAULT_AGREEMENT_SETTINGS,
  showOnBehalfOf = false,
  finishButtonLabel,
  onFinish,
  onStepChange,
}: NewCARequestWizardProps) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [onBehalfOf, setOnBehalfOf] = useState<'client' | 'va'>('va')
  const [requestType, setRequestType] = useState<RequestType>('extra-hours')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [hoursByDate, setHoursByDate] = useState<Record<string, number>>({})
  const [comments, setComments] = useState('')

  useEffect(() => {
    onStepChange?.(step)
  }, [step, onStepChange])

  const preApprovedHours = agreementSettings.preApprovedHoursPerWeek

  const today = new Date()
  const maxDate = toISODate(today)
  const minDate = toISODate(addDays(today, -agreementSettings.reportBackWeeks * 7))

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
  const canGoNext = requestType === 'extra-hours' ? selectedDates.length > 0 && totalHours > 0 && !exceededMax : true
  const weekGroups = buildWeekGroups(selectedDates, hoursByDate, vaEmail, preApprovedHours)

  const handleReset = () => {
    setSelectedDates([])
    setHoursByDate({})
  }

  const handleRequestMore = () => {
    setRequestType('extra-hours')
    setSelectedDates([])
    setHoursByDate({})
    setComments('')
    setStep(1)
  }

  return (
    <div className="ca-wizard">
      <StepsNavigation>
        <Step step={1} title="Choose Request for Changes" position="left" status={step > 1 ? 'completed' : 'selected'} />
        <Step
          step={2}
          title="Fill request form"
          position="middle"
          status={step === 2 ? 'selected' : step > 2 ? 'completed' : 'default'}
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
            {recentRequest && (
              <>
                <h3 className="ca-wizard__subheading">Recent and Pending Changes</h3>
                <div className="ca-wizard__recent-card">
                  <div className="ca-wizard__recent-card-text">
                    <span className="ca-wizard__recent-card-date">{recentRequest.date}</span>
                    <span className="ca-wizard__recent-card-title">{recentRequest.title}</span>
                  </div>
                  <Chip label={CA_STATUS_LABEL[recentRequest.status]} tone={CA_STATUS_TONE[recentRequest.status]} />
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
                      onChange={() => setOnBehalfOf('client')}
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
                  {REQUEST_TYPE_OPTIONS.map((option) => (
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

      {step === 2 && requestType !== 'extra-hours' && (
        <ProfileCard>
          <p className="ca-wizard__description">
            This request type isn&apos;t available in the prototype yet — only &quot;Request approval
            for extra hours&quot; is fully built out.
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
                    worked during the last {agreementSettings.reportBackWeeks} weeks, in order to
                    receive the corresponding payment on your next invoice
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
                      <FormField
                        label="Pre-approved Extra Hours"
                        info="The number of extra hours your agreement already allows without needing separate client approval."
                      >
                        <p className="ca-wizard__metric-value">
                          {preApprovedHours} <span>Hours</span>
                        </p>
                      </FormField>
                      <FormField
                        label="Pre-approved Period"
                        info="How far back you can report extra hours for, set by your client."
                      >
                        <p className="ca-wizard__metric-value">
                          Last {agreementSettings.reportBackWeeks} <span>Weeks</span>
                        </p>
                      </FormField>
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
                          description={`Select the dates you worked extra hours in the last ${agreementSettings.reportBackWeeks} weeks. Only past dates are eligible.`}
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
                              grouped by week — your pre-approved hours reset every Monday. If a
                              week&apos;s hours exceed what&apos;s remaining for that week, that
                              week&apos;s request will be sent to your client for approval.
                            </p>
                            <div className="ca-wizard__week-groups">
                              {weekGroups.map((week) => (
                                <div key={week.start} className="ca-wizard__week-group">
                                  <h4 className="ca-wizard__week-title">
                                    Week of {formatWeekRange(week.start, week.end)}
                                  </h4>
                                  <div className="ca-wizard__metric-row">
                                    <FormField label="Total">
                                      <p className="ca-wizard__metric-value">
                                        {preApprovedHours} <span>Hours</span>
                                      </p>
                                    </FormField>
                                    <FormField label="Taken">
                                      <p className="ca-wizard__metric-value">
                                        {week.takenHours} <span>Hours</span>
                                      </p>
                                    </FormField>
                                    <FormField label="Remaining">
                                      <p className="ca-wizard__metric-value">
                                        {week.remainingHours} <span>Hours</span>
                                      </p>
                                    </FormField>
                                  </div>
                                  <div className="ca-wizard__date-rows">
                                    {week.dates.map((date) => (
                                      <FormField key={date} label={formatFullDate(date)}>
                                        <Input
                                          type="number"
                                          min={0}
                                          max={DAILY_MAX_HOURS}
                                          rightText="Hrs"
                                          value={hoursByDate[date] ?? 0}
                                          onChange={(event) =>
                                            setHoursByDate((prev) => ({
                                              ...prev,
                                              [date]: Math.min(
                                                DAILY_MAX_HOURS,
                                                Math.max(0, Number(event.target.value)),
                                              ),
                                            }))
                                          }
                                          onIncrement={() =>
                                            setHoursByDate((prev) => ({
                                              ...prev,
                                              [date]: Math.min(DAILY_MAX_HOURS, (prev[date] ?? 0) + 1),
                                            }))
                                          }
                                          onDecrement={() =>
                                            setHoursByDate((prev) => ({
                                              ...prev,
                                              [date]: Math.max(0, (prev[date] ?? 0) - 1),
                                            }))
                                          }
                                          incrementLabel={`Increase hours for ${formatFullDate(date)}`}
                                          decrementLabel={`Decrease hours for ${formatFullDate(date)}`}
                                        />
                                      </FormField>
                                    ))}
                                  </div>
                                  {week.enteredHours > week.remainingHours && (
                                    <Alert
                                      type="warning"
                                      message="Hours entered for this week exceed your remaining pre-approved amount — this request will notify your client for approval."
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ca-wizard__totals">
                    <div className="ca-wizard__totals-columns">
                      <div className="ca-wizard__totals-column">
                        <span className="ca-wizard__totals-label">Total extra hours worked</span>
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
                  <Button buttonText="Submit form" onClick={() => setStep(4)} />
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
