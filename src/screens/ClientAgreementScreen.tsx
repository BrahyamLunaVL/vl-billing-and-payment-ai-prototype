import { useState } from 'react'
import {
  ProfileCard,
  CardRow,
  Week,
  Chip,
  Button,
  Icon,
  Switch,
  Checkbox,
  Input,
  Select,
  FormField,
} from '../components'
import type { AuthenticatedUser } from '../services/auth'
import { getAgreementById, updateAgreementSettings, type AgreementSettings } from '../services/clientAccount'
import { AGREEMENT_STATUS_LABEL, AGREEMENT_STATUS_TONE } from '../services/vaAccount'
import './ClientAgreementScreen.css'

export interface ClientAgreementScreenProps {
  user: AuthenticatedUser
  agreementId: string
  onBack: () => void
}

const REPORT_BACK_WEEK_OPTIONS = Array.from({ length: 8 }, (_, index) => {
  const weeks = index + 1
  return { value: String(weeks), label: `${weeks} week${weeks === 1 ? '' : 's'}` }
})

const MAX_PRE_APPROVED_HOURS_PER_WEEK = 60

/**
 * The client's per-agreement detail screen (Figma's "Agreements - Agreement"),
 * reached from My Account's agreement list: the client's and VA's own info
 * cards, the weekly schedule, and the collapsible Agreement Settings —
 * the single source of truth the VA's Extra Hours wizard reads its
 * pre-approved-hours/lookback-window/auto-approval rules from.
 */
export const ClientAgreementScreen = ({ agreementId, onBack }: ClientAgreementScreenProps) => {
  const [agreement, setAgreement] = useState(() => getAgreementById(agreementId))
  const [draftSettings, setDraftSettings] = useState<AgreementSettings | undefined>(agreement?.settings)
  const [changesExpanded, setChangesExpanded] = useState(true)
  const [extraHoursExpanded, setExtraHoursExpanded] = useState(false)

  if (!agreement || !draftSettings) {
    return (
      <ProfileCard>
        <p className="client-agreement-screen__notice">This agreement could not be found.</p>
        <Button type="tertiary" leftIcon="chevron-left" buttonText="Back to My Account" onClick={onBack} />
      </ProfileCard>
    )
  }

  const handleSaveSettings = () => {
    updateAgreementSettings(agreement.id, draftSettings)
    setAgreement(getAgreementById(agreementId))
  }

  const handleToggleAutoApproveChanges = (checked: boolean) => {
    setDraftSettings((prev) =>
      prev && { ...prev, autoApproveChanges: checked, notifyOverThreshold: checked ? prev.notifyOverThreshold : false },
    )
  }

  return (
    <>
      <div className="client-agreement-screen__header">
        <div className="client-agreement-screen__header-titles">
          <Button type="tertiary" leftIcon="chevron-left" buttonText="Back to My Account" onClick={onBack} />
          <h1 className="client-agreement-screen__title">
            {agreement.clientCompanyName} - {agreement.vaName} ({agreement.hoursPerWeek.replace(' per week', '')})
          </h1>
          <div className="client-agreement-screen__meta-row">
            <span className="client-agreement-screen__meta">Started on {agreement.startDate}</span>
            <Chip label={AGREEMENT_STATUS_LABEL[agreement.status]} tone={AGREEMENT_STATUS_TONE[agreement.status]} />
          </div>
          {agreement.endDate && <p className="client-agreement-screen__meta">Ends on {agreement.endDate}</p>}
          <p className="client-agreement-screen__meta">HubSpot ID: {agreement.hubspotId}</p>
        </div>
        <div className="client-agreement-screen__header-actions">
          <Button type="secondary" leftIcon="pen-to-square" buttonText="Request Changes" />
          <Button type="primary" leftIcon="arrow-u-turn-up-left" buttonText="Change History" />
          <button type="button" className="client-agreement-screen__menu-button" aria-label="More options">
            <Icon name="ellipsis-vertical" size={16} />
          </button>
        </div>
      </div>

      <div className="client-agreement-screen__row">
        <div className="client-agreement-screen__column">
          <ProfileCard leftBorder header={<CardHeader icon="buildings" title={agreement.clientCompanyName} />}>
            <div className="client-agreement-screen__card-rows">
              <CardRow title="Rate:" value={`${agreement.billedRate}/hr`} />
              <CardRow title="Base Hours:" value={agreement.hoursPerWeek.replace(' per week', '/week')} />
            </div>
          </ProfileCard>

          {agreement.week && (
            <ProfileCard header={<CardHeader icon="calendar" title="Work Hours Per Day" />}>
              <Week days={agreement.week} />
            </ProfileCard>
          )}

          <ProfileCard header={<h2 className="client-agreement-screen__card-title">Agreement Settings</h2>}>
            <div className="client-agreement-screen__accordion">
              <button
                type="button"
                className="client-agreement-screen__accordion-header"
                onClick={() => setChangesExpanded((value) => !value)}
                aria-expanded={changesExpanded}
              >
                <span>Auto-approval for Changes</span>
                <Icon
                  name="chevron-down"
                  variant="bold"
                  size={20}
                  className={
                    changesExpanded
                      ? 'client-agreement-screen__chevron'
                      : 'client-agreement-screen__chevron client-agreement-screen__chevron--collapsed'
                  }
                />
              </button>
              {changesExpanded && (
                <div className="client-agreement-screen__accordion-body">
                  <SwitchRow
                    label="Auto-Approval of Change Requests initiated by VA"
                    checked={draftSettings.autoApproveChanges}
                    onChange={handleToggleAutoApproveChanges}
                  />
                  <SwitchRow
                    label="Notification Alerts for Requests over the threshold"
                    description="Checkable only when auto-approval is checked."
                    checked={draftSettings.notifyOverThreshold}
                    disabled={!draftSettings.autoApproveChanges}
                    onChange={(checked) => setDraftSettings((prev) => prev && { ...prev, notifyOverThreshold: checked })}
                  />
                  <FormField
                    label="Any request above this amount will trigger an alert:"
                    description="Editable only when Notification Alerts for Request over threshold is checked."
                  >
                    <Input
                      type="number"
                      min={0}
                      leftIcon="dollar-sign"
                      rightText="USD"
                      disabled={!draftSettings.notifyOverThreshold}
                      value={draftSettings.overThresholdAmount}
                      onChange={(event) =>
                        setDraftSettings((prev) => prev && { ...prev, overThresholdAmount: Number(event.target.value) })
                      }
                    />
                  </FormField>
                  <div className="client-agreement-screen__save-row">
                    <Button buttonText="Save" onClick={handleSaveSettings} style={{ width: '200px' }} />
                  </div>
                </div>
              )}

              <button
                type="button"
                className="client-agreement-screen__accordion-header"
                onClick={() => setExtraHoursExpanded((value) => !value)}
                aria-expanded={extraHoursExpanded}
              >
                <span>Auto-approval for Extra Hours</span>
                <Icon
                  name="chevron-down"
                  variant="bold"
                  size={20}
                  className={
                    extraHoursExpanded
                      ? 'client-agreement-screen__chevron'
                      : 'client-agreement-screen__chevron client-agreement-screen__chevron--collapsed'
                  }
                />
              </button>
              {extraHoursExpanded && (
                <div className="client-agreement-screen__accordion-body">
                  <SwitchRow
                    label="Auto-Approval for Extra Hours Requests by VA"
                    description="When button is off, all extra hours require your manual approval."
                    checked={draftSettings.autoApproveExtraHours}
                    onChange={(checked) => setDraftSettings((prev) => prev && { ...prev, autoApproveExtraHours: checked })}
                  />
                  <FormField
                    label="Pre-approved hours per week"
                    description={`Enter the amount of hours / week (max ${MAX_PRE_APPROVED_HOURS_PER_WEEK})`}
                  >
                    <Input
                      type="number"
                      min={0}
                      max={MAX_PRE_APPROVED_HOURS_PER_WEEK}
                      rightText="Hours"
                      value={draftSettings.preApprovedHoursPerWeek}
                      onChange={(event) =>
                        setDraftSettings(
                          (prev) =>
                            prev && {
                              ...prev,
                              preApprovedHoursPerWeek: Math.min(
                                MAX_PRE_APPROVED_HOURS_PER_WEEK,
                                Number(event.target.value),
                              ),
                            },
                        )
                      }
                    />
                  </FormField>
                  <FormField
                    label="How far back can the VA report hours"
                    description="Introduce the amount of weeks that the VA can go back in the past"
                  >
                    <Select
                      options={REPORT_BACK_WEEK_OPTIONS}
                      value={String(draftSettings.reportBackWeeks)}
                      onChange={(value) =>
                        setDraftSettings((prev) => prev && { ...prev, reportBackWeeks: Number(value) })
                      }
                    />
                  </FormField>
                  <Checkbox
                    label={
                      <>
                        Email me when my VA reports pre-approved extra hours{' '}
                        <span className="client-agreement-screen__optional">(Optional)</span>
                      </>
                    }
                    checked={draftSettings.emailOnPreApprovedExtraHours}
                    onChange={(event) =>
                      setDraftSettings((prev) => prev && { ...prev, emailOnPreApprovedExtraHours: event.target.checked })
                    }
                  />
                  <div className="client-agreement-screen__save-row">
                    <Button buttonText="Save" onClick={handleSaveSettings} style={{ width: '200px' }} />
                  </div>
                </div>
              )}
            </div>
          </ProfileCard>
        </div>

        <div className="client-agreement-screen__column">
          <ProfileCard leftBorder header={<CardHeader icon="clipboard-user" title={agreement.vaName} />}>
            <div className="client-agreement-screen__card-rows">
              <CardRow title="Rate:" value={`${agreement.vaHourlyRate}/hr`} />
              <CardRow title="Base Hours:" value={agreement.hoursPerWeek.replace(' per week', '/week')} />
              <CardRow title="Payment Method:" value={agreement.vaPaymentMethod} />
              <CardRow title="Email:" value={agreement.vaWorkEmail} />
              <CardRow title="Phone Number:" value={agreement.vaPhoneNumber} />
              <CardRow title="Country Billing:" value={agreement.vaCountry} />
              <CardRow title="Country Citizenship:" value={agreement.vaCountry} />
              <CardRow title="Country Residence:" value={agreement.vaCountry} />
              <CardRow title="Telegram:" value={agreement.vaTelegramHandle} link />
              <CardRow title="HubSpot ID:" value={agreement.vaHubspotId} />
            </div>
            <div className="client-agreement-screen__va-actions">
              <Button type="tertiary" rightIcon="chevron-down" buttonText="View VA Rate ranges" />
              <Button type="secondary" buttonText="View VA Details" />
            </div>
          </ProfileCard>
        </div>
      </div>

      <div className="client-agreement-screen__row">
        <div className="client-agreement-screen__column">
          <ProfileCard header={<h2 className="client-agreement-screen__card-title">Upcoming Invoices</h2>}>
            <p className="client-agreement-screen__notice">No Invoice Preview Found</p>
          </ProfileCard>
          <ProfileCard header={<h2 className="client-agreement-screen__card-title">Invoices</h2>}>
            <p className="client-agreement-screen__notice">No Invoices Found</p>
          </ProfileCard>
        </div>
        <div className="client-agreement-screen__column">
          <ProfileCard header={<h2 className="client-agreement-screen__card-title">Invoice Preview</h2>}>
            <p className="client-agreement-screen__notice">No Invoice Preview Found</p>
          </ProfileCard>
          <ProfileCard header={<h2 className="client-agreement-screen__card-title">Invoices</h2>}>
            <p className="client-agreement-screen__notice">No Invoices Found</p>
          </ProfileCard>
        </div>
      </div>
    </>
  )
}

function CardHeader({ icon, title }: { icon: 'buildings' | 'calendar' | 'clipboard-user'; title: string }) {
  return (
    <div className="client-agreement-screen__card-header">
      <Icon name={icon} size={40} />
      <h2 className="client-agreement-screen__card-title">{title}</h2>
    </div>
  )
}

interface SwitchRowProps {
  label: string
  description?: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}

function SwitchRow({ label, description, checked, disabled, onChange }: SwitchRowProps) {
  return (
    <div className="client-agreement-screen__switch-row">
      <div className="client-agreement-screen__switch-text">
        <p className="client-agreement-screen__switch-label">{label}</p>
        {description && <p className="client-agreement-screen__switch-description">{description}</p>}
      </div>
      <Switch checked={checked} disabled={disabled} onChange={onChange} aria-label={label} />
    </div>
  )
}
