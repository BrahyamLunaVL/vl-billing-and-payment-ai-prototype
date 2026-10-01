import { ProfileCard, Chip, CADayGroups, Button } from '../components'
import { CA_STATUS_LABEL, CA_STATUS_TONE, type CARequest } from '../services/vaAccount'
import './CADetailsView.css'

export interface CADetailsViewProps {
  request: CARequest
  /** Present only for a pending ('new') request — simulates Admin/Client resolving it, for demoing the flow without switching accounts. */
  onApprove?: () => void
  onReject?: () => void
}

/**
 * The detail view opened by clicking a CACard (Figma's "My Account - C&A
 * Details"). The way back to the dashboard is a tertiary button in the
 * screen's own header row (next to the SAM contact button), not part of
 * this component.
 */
export const CADetailsView = ({ request, onApprove, onReject }: CADetailsViewProps) => {
  return (
    <div className="ca-details-view">
      <ProfileCard className="ca-details-view__card">
        <div className="ca-details-view__intro">
          <div className="ca-details-view__header">
            <h1 className="ca-details-view__title">{request.title}</h1>
            <Chip label={CA_STATUS_LABEL[request.status]} tone={CA_STATUS_TONE[request.status]} />
          </div>
          <p className="ca-details-view__meta">
            Requested by <strong>{request.requestedBy}</strong> on <strong>{request.requestedDate}</strong>
          </p>
          {request.resolvedBy && (
            <p className="ca-details-view__meta">
              Resolved by <strong>{request.resolvedBy}</strong> on <strong>{request.resolvedDate}</strong>
            </p>
          )}
        </div>
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
              {detail.dayGroups ? (
                <CADayGroups groups={detail.dayGroups} requestStatus={request.status} />
              ) : (
                <span className="ca-details-view__field-value">{detail.value}</span>
              )}
            </div>
          ))}
          {request.comments && (
            <div className="ca-details-view__field ca-details-view__field--full">
              <span className="ca-details-view__field-label">Comments</span>
              <span className="ca-details-view__field-value">{request.comments}</span>
            </div>
          )}
        </div>
        {request.status === 'new' && (onApprove || onReject) && (
          <div className="ca-details-view__footer">
            <Button type="tertiary" buttonText="Reject" onClick={onReject} style={{ width: '160px' }} />
            <Button buttonText="Approve" onClick={onApprove} style={{ width: '160px' }} />
          </div>
        )}
      </ProfileCard>
    </div>
  )
}
