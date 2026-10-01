import { useState } from 'react'
import { PopUp, Icon, Chip, Button, CADayGroups } from '../components'
import type { ClientCARequestView } from '../services/clientAccount'
import { CA_STATUS_LABEL, CA_STATUS_TONE } from '../services/vaAccount'
import './SelectedRequestsModal.css'

export interface SelectedRequestsModalProps {
  requests: ClientCARequestView[]
  onClose: () => void
  onApproveAll: () => void
  onRejectAll: () => void
}

interface ReviewItemProps {
  request: ClientCARequestView
  expanded: boolean
  onToggle: () => void
}

function ReviewItem({ request, expanded, onToggle }: ReviewItemProps) {
  return (
    <>
      <button type="button" className="selected-requests-modal__item-header" onClick={onToggle} aria-expanded={expanded}>
        <span className="selected-requests-modal__item-title">{request.title}</span>
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={16} />
      </button>
      {expanded && (
        <>
          <div className="selected-requests-modal__field-row">
            <span className="selected-requests-modal__field-label">VA Name</span>
            <span className="selected-requests-modal__field-value">{request.vaName}</span>
          </div>
          {request.details.map((detail) => (
            <div
              key={detail.label}
              className={
                detail.dayGroups
                  ? 'selected-requests-modal__field-row selected-requests-modal__field-row--stacked'
                  : 'selected-requests-modal__field-row'
              }
            >
              <span className="selected-requests-modal__field-label">{detail.label}</span>
              {detail.dayGroups ? (
                <CADayGroups groups={detail.dayGroups} requestStatus={request.status} />
              ) : (
                <span className="selected-requests-modal__field-value selected-requests-modal__field-value--pre">
                  {detail.value}
                </span>
              )}
            </div>
          ))}
          <div className="selected-requests-modal__field-row">
            <span className="selected-requests-modal__field-label">Request Date</span>
            <span className="selected-requests-modal__field-value">{request.requestedDate}</span>
          </div>
          <div className="selected-requests-modal__field-row">
            <span className="selected-requests-modal__field-label">Review Date</span>
            <span className="selected-requests-modal__field-value">{request.resolvedDate ?? '—'}</span>
          </div>
          <div className="selected-requests-modal__field-row">
            <span className="selected-requests-modal__field-label">Status</span>
            <Chip label={CA_STATUS_LABEL[request.status]} tone={CA_STATUS_TONE[request.status]} />
          </div>
        </>
      )}
    </>
  )
}

/**
 * The bulk "Review Request" popup (Figma's "Changes & Approvals Form - View
 * Requests"): same modal chrome as the single-request "View" popup — header
 * bar, close button, bottom-anchored actions — but titled "Selected requests
 * (N)", its header a fuchsia-to-purple gradient, and its body a flat,
 * divider-separated list of collapsible sections (one per selected request,
 * all expanded by default) rather than one fixed field grid — each
 * section's own title is just the request type (no VA name folded in; VA
 * Name is its own row below, same as every other field) so it can repeat
 * verbatim across sections without implying they're grouped together. The
 * list scrolls within its own fixed-height area — the Reject/Approve
 * footer stays put below it.
 */
export const SelectedRequestsModal = ({ requests, onClose, onApproveAll, onRejectAll }: SelectedRequestsModalProps) => {
  const [expandedIds, setExpandedIds] = useState(() => new Set(requests.map((request) => request.id)))

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <PopUp>
      <div className="selected-requests-modal">
        <div className="selected-requests-modal__header">
          <h2 className="selected-requests-modal__title">Selected requests ({requests.length})</h2>
          <button type="button" className="selected-requests-modal__close" onClick={onClose} aria-label="Close">
            <Icon name="xmark" size={16} />
          </button>
        </div>
        <div className="selected-requests-modal__body">
          {requests.map((request) => (
            <ReviewItem
              key={request.id}
              request={request}
              expanded={expandedIds.has(request.id)}
              onToggle={() => handleToggle(request.id)}
            />
          ))}
        </div>
        <div className="selected-requests-modal__footer">
          <Button type="tertiary" buttonText="Reject All" onClick={onRejectAll} style={{ width: '160px' }} />
          <Button buttonText="Approve All" onClick={onApproveAll} style={{ width: '160px' }} />
        </div>
      </div>
    </PopUp>
  )
}
