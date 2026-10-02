import { CADayGroups } from '../components'
import type { ClientCARequestView } from '../services/clientAccount'
import './CARequestFields.css'

export interface CARequestFieldsProps {
  request: ClientCARequestView
  /** "Link to Request" — shows the VA's own read-only summary card for this same request, in place of this view. Omit to hide the link (e.g. the bulk review modal, which doesn't support swapping its per-item view). */
  onViewSummary?: () => void
}

/**
 * The common label/value rows shown for a single C&A request — VA/Company
 * name, the request's own `details` grid, request date, comments, and
 * status — shared by the "View" details modal and each item of the bulk
 * "Review Request" modal so both present a request's data identically.
 */
export const CARequestFields = ({ request, onViewSummary }: CARequestFieldsProps) => {
  const isPending = request.status === 'new'

  return (
    <div className="ca-request-fields">
      <div className="ca-request-fields__row">
        <span className="ca-request-fields__label">VA Name</span>
        <span className="ca-request-fields__value">{request.vaName}</span>
      </div>
      <div className="ca-request-fields__row">
        <span className="ca-request-fields__label">Company Name</span>
        <span className="ca-request-fields__value">{request.clientName}</span>
      </div>
      {request.details.map((detail) => (
        <div
          key={detail.label}
          className={detail.dayGroups ? 'ca-request-fields__row ca-request-fields__row--stacked' : 'ca-request-fields__row'}
        >
          <span className="ca-request-fields__label">{detail.label}</span>
          {detail.dayGroups ? (
            <CADayGroups groups={detail.dayGroups} requestStatus={request.status} />
          ) : (
            <span className="ca-request-fields__value ca-request-fields__value--pre">{detail.value}</span>
          )}
        </div>
      ))}
      <div className="ca-request-fields__row">
        <span className="ca-request-fields__label">Request Date</span>
        <span className="ca-request-fields__value">{request.requestedDate}</span>
      </div>
      {request.comments && (
        <div className="ca-request-fields__row">
          <span className="ca-request-fields__label">Comments</span>
          <span className="ca-request-fields__value">{request.comments}</span>
        </div>
      )}
      {isPending ? (
        <div className="ca-request-fields__row">
          <span className="ca-request-fields__label">Review Date</span>
          <span className="ca-request-fields__value">—</span>
        </div>
      ) : (
        <>
          <div className="ca-request-fields__row">
            <span className="ca-request-fields__label">Status</span>
            <span className="ca-request-fields__value">
              {request.status === 'approved' ? 'Approved' : request.status === 'rejected' ? 'Rejected' : 'Expired'}
            </span>
          </div>
          {request.resolvedDate && (
            <div className="ca-request-fields__row">
              <span className="ca-request-fields__label">Review Date</span>
              <span className="ca-request-fields__value">{request.resolvedDate}</span>
            </div>
          )}
        </>
      )}
      {onViewSummary && (
        <div className="ca-request-fields__row">
          <span className="ca-request-fields__label">Link to Request</span>
          <button type="button" className="ca-request-fields__link" onClick={onViewSummary}>
            Link to original request
          </button>
        </div>
      )}
    </div>
  )
}
