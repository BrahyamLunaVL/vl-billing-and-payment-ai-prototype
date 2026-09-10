import { useState } from 'react'
import {
  StepsNavigation,
  Step,
  ProfileCard,
  CACard,
  FormField,
  TextArea,
  Calendar,
  Alert,
  Icon,
  Button,
} from '../components'
import { CA_STATUS_LABEL, CA_STATUS_TONE, type CARequest } from '../services/vaAccount'
import './NewCARequestWizard.css'

type RequestType =
  | 'boh-package'
  | 'submit-boh'
  | 'time-off'
  | 'extra-hours'
  | 'change-base-hours'
  | 'bonus-commission'
  | 'agreement-hours-per-day'

const REQUEST_TYPE_OPTIONS: { value: RequestType; label: string }[] = [
  { value: 'boh-package', label: 'Request new Bank of Hours (BOH) package' },
  { value: 'submit-boh', label: 'Submit hours worked to Bank of Hours (BOH)' },
  { value: 'time-off', label: 'Request approval for time off' },
  { value: 'extra-hours', label: 'Request approval for extra hours' },
  { value: 'change-base-hours', label: 'Request approval for changing base hours/week worked' },
  { value: 'bonus-commission', label: 'Request approval for a bonus or commission' },
  { value: 'agreement-hours-per-day', label: 'Request approval for agreement Work Hours Per Day change' },
]

const DAILY_MAX_HOURS = 12
const TOTAL_MAX_HOURS = 60
const PRE_APPROVED_HOURS = 5
const RATE_PER_HOUR = 10

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

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
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

interface HourStepperProps {
  value: number
  onChange: (value: number) => void
}

function HourStepper({ value, onChange }: HourStepperProps) {
  return (
    <div className="hour-stepper">
      <button
        type="button"
        className="hour-stepper__button"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value <= 0}
        aria-label="Decrease hours"
      >
        −
      </button>
      <span className="hour-stepper__value">{value} Hrs</span>
      <button
        type="button"
        className="hour-stepper__button"
        onClick={() => onChange(Math.min(DAILY_MAX_HOURS, value + 1))}
        disabled={value >= DAILY_MAX_HOURS}
        aria-label="Increase hours"
      >
        +
      </button>
    </div>
  )
}

export interface NewCARequestWizardProps {
  /** The VA's most recent request, shown as a reference on step 1. */
  recentRequest?: CARequest
  onCancel: () => void
}

/** The 3-step "New Request for Changes" wizard (Figma's "Changes & Approvals Form" flow). */
export const NewCARequestWizard = ({ recentRequest, onCancel }: NewCARequestWizardProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [requestType, setRequestType] = useState<RequestType>('extra-hours')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [hoursByDate, setHoursByDate] = useState<Record<string, number>>({})
  const [description, setDescription] = useState('')

  const today = new Date()
  const maxDate = toISODate(today)
  const minDate = toISODate(addMonths(today, -4))

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
  const exceededPreApproved = totalHours > PRE_APPROVED_HOURS
  const exceededMax = totalHours > TOTAL_MAX_HOURS
  const canGoNext = requestType === 'extra-hours' ? selectedDates.length > 0 && totalHours > 0 && !exceededMax : true

  const handleReset = () => {
    setSelectedDates([])
    setHoursByDate({})
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
        <Step step={3} title="Preview" position="right" status={step === 3 ? 'selected' : 'default'} />
      </StepsNavigation>

      {step === 1 && (
        <div className="ca-wizard__row">
          <div className="ca-wizard__column">
            <h2 className="ca-wizard__heading">Change Request or Approval Details</h2>
            <p className="ca-wizard__description">
              Please let us know the details of what you&apos;d like to change or approve.
            </p>
            {recentRequest && (
              <>
                <h3 className="ca-wizard__subheading">Recent and Pending Changes</h3>
                <CACard
                  title={recentRequest.title}
                  date={recentRequest.date}
                  statusLabel={CA_STATUS_LABEL[recentRequest.status]}
                  statusTone={CA_STATUS_TONE[recentRequest.status]}
                />
              </>
            )}
          </div>
          <div className="ca-wizard__column">
            <ProfileCard>
              <fieldset className="ca-wizard__radio-group">
                <legend className="ca-wizard__radio-legend">
                  Main Changes Requested from the Virtual Assistant (VA)
                </legend>
                {REQUEST_TYPE_OPTIONS.map((option) => (
                  <label key={option.value} className="ca-wizard__radio-option">
                    <input
                      type="radio"
                      name="request-type"
                      value={option.value}
                      checked={requestType === option.value}
                      onChange={() => setRequestType(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </fieldset>
              <div className="ca-wizard__actions">
                <Button buttonText="Next" onClick={() => setStep(2)} />
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
        <div className="ca-wizard__row">
          <div className="ca-wizard__column ca-wizard__column--narrow">
            <h2 className="ca-wizard__heading">Request Approval for Extra Hours</h2>
            <p className="ca-wizard__description">
              Fill out this section of the form if you&apos;d like to report any extra hours worked
              during the last 4 weeks, in order to receive the corresponding payment on your next
              invoice.
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

          <div className="ca-wizard__column">
            <ProfileCard>
              <div className="ca-wizard__metric-row">
                <FormField
                  label="Pre-approved Extra Hours"
                  info="The number of extra hours your agreement already allows without needing separate client approval."
                >
                  <p className="ca-wizard__metric-value">
                    {PRE_APPROVED_HOURS} <span>Hours</span>
                  </p>
                </FormField>
                <FormField label="Current Working Hours/Day">
                  <p className="ca-wizard__metric-value">
                    8 <span>Hours</span>
                  </p>
                </FormField>
                <FormField label="Current Rate per hour">
                  <p className="ca-wizard__metric-value">
                    ${RATE_PER_HOUR.toFixed(2)} <span>USD</span>
                  </p>
                </FormField>
              </div>

              <FormField
                label="Specific dates that you worked extra hours"
                helpText="Select the dates you worked extra hours in the last 4 weeks. Only past dates are eligible."
              >
                <Calendar selectedDates={selectedDates} onToggleDate={toggleDate} minDate={minDate} maxDate={maxDate} />
              </FormField>
              <div className="ca-wizard__actions">
                <Button type="secondary" buttonText="Reset" onClick={handleReset} disabled={selectedDates.length === 0} />
              </div>

              {selectedDates.length === 0 ? (
                <div className="ca-wizard__empty-state">
                  <Icon name="calendar" size={40} />
                  <p className="ca-wizard__empty-title">No days selected</p>
                  <p className="ca-wizard__empty-subtitle">
                    Select at least one date to enter the hours you worked as extra hours
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="ca-wizard__subheading">Extra Hours Worked</h3>
                  <p className="ca-wizard__description">
                    Enter the number of extra hours your worked on each of the dates listed below.
                    Please make sure to enter only the additional hours worked on each date. If the
                    total requested hours exceed the pre-approved amount of hours, the additional
                    hours will require the client approval.
                  </p>
                  <div className="ca-wizard__date-rows">
                    {selectedDates.map((date) => (
                      <FormField
                        key={date}
                        errorMessage={
                          hoursByDate[date] >= DAILY_MAX_HOURS
                            ? "You've reached the maximum of 12 extra hours per day"
                            : undefined
                        }
                      >
                        <div className="ca-wizard__date-row">
                          <span>{formatFullDate(date)}</span>
                          <HourStepper
                            value={hoursByDate[date] ?? 0}
                            onChange={(value) => setHoursByDate((prev) => ({ ...prev, [date]: value }))}
                          />
                        </div>
                      </FormField>
                    ))}
                  </div>
                </>
              )}

              <div className="ca-wizard__totals">
                <div className="ca-wizard__totals-row">
                  <span>Total extra hours worked</span>
                  <strong>{totalHours} Hours</strong>
                </div>
                <div className="ca-wizard__totals-row">
                  <span>Total amount of money you will receive</span>
                  <strong>${totalAmount.toFixed(2)} USD</strong>
                </div>
                <p className="ca-wizard__totals-caption">
                  Calculated from number of dates and hours you worked extra hours.
                </p>
              </div>

              {exceededPreApproved && !exceededMax && (
                <Alert
                  type="warning"
                  message="You have exceeded the total number of pre-approved extra hours. You can still request additional extra hours, but any hour exceeding the pre-approved amount must be reviewed and approved by the client"
                />
              )}
              {exceededMax && (
                <Alert
                  type="error"
                  message="You have reached the maximum number of extra hours that can be requested in a single request. The current limit is 60 hours. If you need to report additional hours, please contact your client or SAM"
                />
              )}

              <FormField label="Description">
                <TextArea
                  placeholder="Add any relevant details for this request"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </FormField>

              <div className="ca-wizard__actions">
                <Button type="tertiary" buttonText="Back" onClick={() => setStep(1)} />
                <Button buttonText="Next" onClick={() => setStep(3)} disabled={!canGoNext} />
              </div>
            </ProfileCard>
          </div>
        </div>
      )}

      {step === 3 && (
        <ProfileCard className="ca-wizard__submitted-card">
          <div className="ca-wizard__submitted-content">
            <Icon name="circle-check" variant="bold" size={40} className="ca-wizard__submitted-icon" />
            <h2 className="ca-wizard__heading">Your request has been submitted</h2>
            <p className="ca-wizard__description">
              We&apos;ll let you know once it&apos;s been reviewed. You can track its status from the
              Changes &amp; Approvals list.
            </p>
            <Button buttonText="Back to Changes & Approvals" onClick={onCancel} />
          </div>
        </ProfileCard>
      )}
    </div>
  )
}
