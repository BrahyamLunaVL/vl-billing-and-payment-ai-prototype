import { useState } from 'react'
import { PopUp, Icon, Button } from '../components'
import type { ClientCARequestView } from '../services/clientAccount'
import { CARequestFields } from './CARequestFields'
import './SelectedRequestsModal.css'

export interface SelectedRequestsModalProps {
  requests: ClientCARequestView[]
  onClose: () => void
  onApproveAll: () => void
  onRejectAll: () => void
}

/**
 * The bulk "Review Request" popup (Figma's multi-select review flow): same
 * modal chrome as the single-request "View" popup (`CARequestDetailsModal`)
 * — header bar, close button, bottom-anchored actions — but titled "Selected
 * requests (N)" and listing each selected request as its own collapsible
 * section (title: "{request type} for {VA name}") instead of one fixed
 * field grid, since there can be several requests of different types here.
 */
export const SelectedRequestsModal = ({ requests, onClose, onApproveAll, onRejectAll }: SelectedRequestsModalProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
          {requests.map((request) => {
            const expanded = expandedId === request.id
            return (
              <div key={request.id} className="selected-requests-modal__item">
                <button
                  type="button"
                  className="selected-requests-modal__item-header"
                  onClick={() => setExpandedId(expanded ? null : request.id)}
                  aria-expanded={expanded}
                >
                  <span className="selected-requests-modal__item-title">
                    <span className="selected-requests-modal__item-type">{request.title}</span> for {request.vaName}
                  </span>
                  <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={16} />
                </button>
                {expanded && (
                  <div className="selected-requests-modal__item-body">
                    <CARequestFields request={request} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="selected-requests-modal__footer">
          <Button type="tertiary" buttonText="Reject All" onClick={onRejectAll} style={{ width: '160px' }} />
          <Button buttonText="Approve All" onClick={onApproveAll} style={{ width: '160px' }} />
        </div>
      </div>
    </PopUp>
  )
}
