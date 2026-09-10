import { ProfileCard, Chip, Button, type ChipTone } from '../components'
import type { CARequest, CARequestStatus } from '../services/vaAccount'
import './CADetailsView.css'

const STATUS_LABEL: Record<CARequestStatus, string> = {
  new: 'New',
  approved: 'Approved',
  rejected: 'Rejected',
  expired: 'Expired',
}

const STATUS_TONE: Record<CARequestStatus, ChipTone> = {
  new: 'purple',
  approved: 'blue',
  rejected: 'red',
  expired: 'red',
}

export interface CADetailsViewProps {
  request: CARequest
  onBack: () => void
}

/** The detail view opened by clicking a CACard (Figma's "My Account - C&A Details"). */
export const CADetailsView = ({ request, onBack }: CADetailsViewProps) => {
  return (
    <div className="ca-details-view">
      <Button type="ghost" leftIcon="chevron-left" buttonText="Back to Changes & Approvals" onClick={onBack} />
      <ProfileCard>
        <div className="ca-details-view__header">
          <h1 className="ca-details-view__title">{request.title}</h1>
          <Chip label={STATUS_LABEL[request.status]} tone={STATUS_TONE[request.status]} />
        </div>
        <p className="ca-details-view__meta">
          Requested by <strong>{request.requestedBy}</strong> on <strong>{request.requestedDate}</strong>
        </p>
        {request.resolvedBy && (
          <p className="ca-details-view__meta">
            Resolved by <strong>{request.resolvedBy}</strong> on <strong>{request.resolvedDate}</strong>
          </p>
        )}
        <div className="ca-details-view__grid">
          {request.details.map((detail) => (
            <div
              key={detail.label}
              className={
                detail.fullWidth
                  ? 'ca-details-view__field ca-details-view__field--full'
                  : 'ca-details-view__field'
              }
            >
              <span className="ca-details-view__field-label">{detail.label}</span>
              <span className="ca-details-view__field-value">{detail.value}</span>
            </div>
          ))}
          {request.comments && (
            <div className="ca-details-view__field ca-details-view__field--full">
              <span className="ca-details-view__field-label">Comments</span>
              <span className="ca-details-view__field-value">{request.comments}</span>
            </div>
          )}
        </div>
      </ProfileCard>
    </div>
  )
}
