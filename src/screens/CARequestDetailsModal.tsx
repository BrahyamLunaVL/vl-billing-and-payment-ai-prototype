import { PopUp, Icon, Button } from '../components'
import type { ClientCARequestView } from '../services/clientAccount'
import { CARequestFields } from './CARequestFields'
import './CARequestDetailsModal.css'

export interface CARequestDetailsModalProps {
  request: ClientCARequestView
  onClose: () => void
  onApprove: () => void
  onReject: () => void
  /** "Link to Request" — closes this modal and shows the VA's own read-only summary card as its own full page instead. Omit to hide the link. */
  onViewSummary?: () => void
}

/**
 * The per-row "View" details popup (Figma's "Extra Hours for {VA}" modal,
 * generalized to every request type): common fields plus the request's own
 * `details` grid, then either a Close button (already resolved) or
 * Reject/Approve (still pending) — mirroring Figma's Auto-Approved vs
 * Manual Approval variants, driven by `status` rather than two separate
 * hardcoded layouts.
 */
export const CARequestDetailsModal = ({ request, onClose, onApprove, onReject, onViewSummary }: CARequestDetailsModalProps) => {
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
          <CARequestFields request={request} onViewSummary={onViewSummary} />
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
