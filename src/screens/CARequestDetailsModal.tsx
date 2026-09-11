import { PopUp, Icon, Button } from '../components'
import type { ClientCARequestView } from '../services/clientAccount'
import './CARequestDetailsModal.css'

export interface CARequestDetailsModalProps {
  request: ClientCARequestView
  onClose: () => void
  onApprove: () => void
  onReject: () => void
}

/**
 * The per-row "View" details popup (Figma's "Extra Hours for {VA}" modal,
 * generalized to every request type): common fields plus the request's own
 * `details` grid, then either a Close button (already resolved) or
 * Reject/Approve (still pending) — mirroring Figma's Auto-Approved vs
 * Manual Approval variants, driven by `status` rather than two separate
 * hardcoded layouts.
 */
export const CARequestDetailsModal = ({ request, onClose, onApprove, onReject }: CARequestDetailsModalProps) => {
  const isPending = request.status === 'new'

  return (
    <PopUp>
      <div className="ca-request-details-modal">
        <div className="ca-request-details-modal__header">
          <h2 className="ca-request-details-modal__title">
            {request.title} — {request.vaName}
          </h2>
          <button type="button" className="ca-request-details-modal__close" onClick={onClose} aria-label="Close">
            <Icon name="xmark" size={16} />
          </button>
        </div>
        <div className="ca-request-details-modal__body">
          <div className="ca-request-details-modal__row">
            <span className="ca-request-details-modal__label">VA Name</span>
            <span className="ca-request-details-modal__value">{request.vaName}</span>
          </div>
          <div className="ca-request-details-modal__row">
            <span className="ca-request-details-modal__label">Company Name</span>
            <span className="ca-request-details-modal__value">{request.clientName}</span>
          </div>
          {request.details.map((detail) => (
            <div key={detail.label} className="ca-request-details-modal__row">
              <span className="ca-request-details-modal__label">{detail.label}</span>
              <span className="ca-request-details-modal__value ca-request-details-modal__value--pre">
                {detail.value}
              </span>
            </div>
          ))}
          <div className="ca-request-details-modal__row">
            <span className="ca-request-details-modal__label">Request Date</span>
            <span className="ca-request-details-modal__value">{request.requestedDate}</span>
          </div>
          {request.comments && (
            <div className="ca-request-details-modal__row">
              <span className="ca-request-details-modal__label">Comments</span>
              <span className="ca-request-details-modal__value">{request.comments}</span>
            </div>
          )}
          {isPending ? (
            <div className="ca-request-details-modal__row">
              <span className="ca-request-details-modal__label">Review Date</span>
              <span className="ca-request-details-modal__value">—</span>
            </div>
          ) : (
            <>
              <div className="ca-request-details-modal__row">
                <span className="ca-request-details-modal__label">Status</span>
                <span className="ca-request-details-modal__value">
                  {request.status === 'approved' ? 'Approved' : request.status === 'rejected' ? 'Rejected' : 'Expired'}
                </span>
              </div>
              {request.resolvedDate && (
                <div className="ca-request-details-modal__row">
                  <span className="ca-request-details-modal__label">Review Date</span>
                  <span className="ca-request-details-modal__value">{request.resolvedDate}</span>
                </div>
              )}
            </>
          )}
        </div>
        <div className="ca-request-details-modal__footer">
          {isPending ? (
            <>
              <Button type="tertiary" buttonText="Reject" onClick={onReject} style={{ width: '160px' }} />
              <Button buttonText="Approve" onClick={onApprove} style={{ width: '160px' }} />
            </>
          ) : (
            <Button buttonText="Close" onClick={onClose} style={{ width: '200px' }} />
          )}
        </div>
      </div>
    </PopUp>
  )
}
