import { useState } from 'react'
import { Icon, Chip, Button, CADayGroups } from '../components'
import type { AuthenticatedUser } from '../services/auth'
import {
  getCARequestsForVA,
  getAgreementsForVA,
  CA_STATUS_LABEL,
  CA_STATUS_TONE,
  type CARequest,
} from '../services/vaAccount'
import { NewCARequestWizard } from './NewCARequestWizard'
import './ChangesApprovalsScreen.css'

export interface ChangesApprovalsScreenProps {
  user: AuthenticatedUser
  /** Skips the request list and opens the "New Request" wizard directly, e.g. from the Agreement screen's "Request Changes" button. */
  openWizard?: boolean
  /** Called when the wizard's final step's primary button is clicked — sends the VA back to My Account. */
  onFinishWizard: () => void
}

interface RequestAccordionCardProps {
  request: CARequest
  expanded: boolean
  onToggle: () => void
}

function RequestAccordionCard({ request, expanded, onToggle }: RequestAccordionCardProps) {
  return (
    <div className={expanded ? 'ca-list-card ca-list-card--expanded' : 'ca-list-card'}>
      <button type="button" className="ca-list-card__header" onClick={onToggle} aria-expanded={expanded}>
        <div className="ca-list-card__header-main">
          <p className="ca-list-card__title">{request.title}</p>
          <div className="ca-list-card__meta-row">
            <span className="ca-list-card__meta-item">
              <Icon name="buildings" size={14} />
              Client: <strong>{request.clientName}</strong>
            </span>
            <span className="ca-list-card__meta-item">
              <Icon name="calendar" size={14} />
              Requested by: <strong>{request.requestedBy} on {request.requestedDate}</strong>
            </span>
          </div>
        </div>
        <div className="ca-list-card__header-side">
          <Chip label={CA_STATUS_LABEL[request.status]} tone={CA_STATUS_TONE[request.status]} />
          <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={16} />
        </div>
      </button>
      {expanded && (
        <div className="ca-list-card__body">
          <div className="ca-list-card__divider" />
          <div className="ca-list-card__grid">
            {request.details.map((detail) => (
              <div
                key={detail.label}
                className={detail.fullWidth ? 'ca-list-card__field ca-list-card__field--full' : 'ca-list-card__field'}
              >
                <span className="ca-list-card__field-label">{detail.label}</span>
                {detail.dayGroups ? (
                  <CADayGroups groups={detail.dayGroups} />
                ) : (
                  <span className="ca-list-card__field-value">{detail.value}</span>
                )}
              </div>
            ))}
            {request.resolvedBy && (
              <div className="ca-list-card__field">
                <span className="ca-list-card__field-label">Resolved by</span>
                <span className="ca-list-card__field-value">
                  {request.resolvedBy} on {request.resolvedDate}
                </span>
              </div>
            )}
            {request.comments && (
              <div className="ca-list-card__field ca-list-card__field--full">
                <span className="ca-list-card__field-label">Comments</span>
                <span className="ca-list-card__field-value">{request.comments}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/** Figma's "Changes & Approvals Form" — the list of past requests plus the "New Request" wizard. */
export const ChangesApprovalsScreen = ({ user, openWizard = false, onFinishWizard }: ChangesApprovalsScreenProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showWizard, setShowWizard] = useState(openWizard)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1)

  const requests = getCARequestsForVA(user.email)
  const activeAgreement = getAgreementsForVA(user.email).find((agreement) => agreement.status === 'active')

  const showSuccessHeader = showWizard && wizardStep === 4

  return (
    <div className="ca-screen">
      <div className="ca-screen__header">
        <h1 className="ca-screen__title">
          {showSuccessHeader ? 'Success' : showWizard ? '' : 'Changes & Approvals Form'}
        </h1>
        {!showSuccessHeader && <Button type="tertiary" buttonText="Click to see SAM Contact Info" />}
      </div>

      {showWizard ? (
        <NewCARequestWizard
          vaEmail={user.email}
          agreementId={activeAgreement?.id}
          recentRequest={requests[0]}
          agreementSettings={activeAgreement?.settings}
          requesterRole="va"
          onStepChange={setWizardStep}
          finishButtonLabel="Go My Account"
          onFinish={onFinishWizard}
        />
      ) : (
        <>
          <p className="ca-screen__description">
            Please complete this form to request any changes to your working hours (time off, extra
            hours), bonuses, commissions, and other related details as a VA.
          </p>
          <div className="ca-screen__new-request">
            <Button buttonText="New Request for Changes" onClick={() => setShowWizard(true)} />
          </div>
          <div className="ca-screen__list">
            {requests.map((request) => (
              <RequestAccordionCard
                key={request.id}
                request={request}
                expanded={expandedId === request.id}
                onToggle={() => setExpandedId((prev) => (prev === request.id ? null : request.id))}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
