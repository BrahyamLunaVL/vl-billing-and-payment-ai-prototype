import { useState } from 'react'
import { Table, type TableColumn, Chip, Button, Icon, Input, PopUp } from '../components'
import type { AuthenticatedUser } from '../services/auth'
import {
  getCARequestsForClient,
  resolveCARequest,
  resolveCARequests,
  type ClientCARequestView,
} from '../services/clientAccount'
import { CA_STATUS_LABEL, CA_STATUS_TONE } from '../services/vaAccount'
import { CARequestDetailsModal } from './CARequestDetailsModal'
import './ClientChangesApprovalsScreen.css'

export interface ClientChangesApprovalsScreenProps {
  user: AuthenticatedUser
}

type SortDirection = 'asc' | 'desc'

function compareValues(a: string, b: string, direction: SortDirection): number {
  const result = a.localeCompare(b)
  return direction === 'asc' ? result : -result
}

/**
 * The client's "Changes & Approvals Form" (Figma's table view): every
 * request across the client's VAs, sortable/paginated, with a per-row
 * "View" details modal and a checkbox multi-select for bulk review. The
 * bulk "Review Request" flow here is a simple placeholder (select rows,
 * approve or reject them all) — Figma didn't detail its exact result view
 * for this specific interaction yet.
 */
export const ClientChangesApprovalsScreen = ({ user }: ClientChangesApprovalsScreenProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState<string | undefined>(undefined)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [viewingRequestId, setViewingRequestId] = useState<string | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showBulkReview, setShowBulkReview] = useState(false)
  // Forces a re-read of the mutable mock after an approve/reject action —
  // `getCARequestsForClient` always reads the live array, so bumping this
  // to trigger a re-render is all a "refresh" needs to be.
  const [, forceRefresh] = useState(0)

  const allRequests = getCARequestsForClient(user.email)

  const sorted = sortKey
    ? [...allRequests].sort((a, b) =>
        compareValues(String(a[sortKey as keyof ClientCARequestView] ?? ''), String(b[sortKey as keyof ClientCARequestView] ?? ''), sortDirection),
      )
    : allRequests

  const totalRows = sorted.length
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize)
  const viewingRequest = viewingRequestId ? allRequests.find((request) => request.id === viewingRequestId) : undefined
  const selectedRequests = allRequests.filter((request) => selectedIds.has(request.id))

  const handleSort = (key: string) => {
    if (key === sortKey) setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleToggleAll = () => {
    setSelectedIds((prev) => {
      const allOnPageSelected = pageRows.every((row) => prev.has(row.id))
      if (allOnPageSelected) return new Set()
      return new Set(pageRows.map((row) => row.id))
    })
  }

  const handleResolve = (id: string, decision: 'approved' | 'rejected') => {
    resolveCARequest(id, decision)
    setViewingRequestId(null)
    forceRefresh((key) => key + 1)
  }

  const handleBulkResolve = (decision: 'approved' | 'rejected') => {
    resolveCARequests(Array.from(selectedIds), decision)
    setSelectedIds(new Set())
    setShowBulkReview(false)
    forceRefresh((key) => key + 1)
  }

  const columns: TableColumn<ClientCARequestView>[] = [
    {
      key: 'vaName',
      label: 'VA NAME',
      width: 250,
      sortable: true,
      render: (row) => <span className="client-ca-screen__link">{row.vaName}</span>,
    },
    {
      key: 'clientName',
      label: 'COMPANY NAME',
      width: 450,
      sortable: true,
      render: (row) => <span className="client-ca-screen__link">{row.clientName}</span>,
    },
    { key: 'title', label: 'REQUEST TYPE', width: 500, render: (row) => row.title },
    { key: 'requestedDate', label: 'DATE REQUESTED', width: 250, sortable: true, render: (row) => row.requestedDate },
    {
      key: 'status',
      label: 'STATUS',
      width: 200,
      sortable: true,
      render: (row) => <Chip label={CA_STATUS_LABEL[row.status]} tone={CA_STATUS_TONE[row.status]} />,
    },
    {
      key: 'requestedByRole',
      label: 'REQ BY',
      width: 200,
      render: (row) => (row.requestedByRole === 'va' ? 'VA' : 'Client'),
    },
    { key: 'resolvedDate', label: 'REVIEW DATE', width: 250, render: (row) => row.resolvedDate ?? '—' },
    {
      key: 'appliedBillingPeriod',
      label: 'APPLIED BILLING PERIOD',
      width: 300,
      render: (row) => row.appliedBillingPeriod ?? '—',
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      width: 200,
      render: (row) => (
        <Button
          type="tertiary"
          size="small"
          buttonText="View"
          onClick={() => setViewingRequestId(row.id)}
          style={{ width: 'auto' }}
        />
      ),
    },
  ]

  return (
    <>
      <div className="client-ca-screen__header">
        <h1 className="client-ca-screen__title">Changes & Approvals Form</h1>
        <div className="client-ca-screen__header-actions">
          <Button
            type="secondary"
            buttonText="Review Request"
            disabled={selectedIds.size === 0}
            onClick={() => setShowBulkReview(true)}
          />
          <button
            type="button"
            className="client-ca-screen__help-button"
            aria-label="Show help"
            onClick={() => setShowTutorial((value) => !value)}
          >
            <Icon name="question" size={16} />
          </button>
        </div>
      </div>

      {showTutorial && (
        <div className="client-ca-screen__tutorial">
          <div className="client-ca-screen__tutorial-header">
            <p className="client-ca-screen__tutorial-title">New functionality (Massive approval)</p>
            <button
              type="button"
              className="client-ca-screen__tutorial-close"
              aria-label="Dismiss"
              onClick={() => setShowTutorial(false)}
            >
              <Icon name="xmark" size={14} />
            </button>
          </div>
          <p className="client-ca-screen__tutorial-body">
            You can now approve or reject multiple requests at once. Simply select the checkboxes in the first
            column, then click the &quot;Review Request&quot; button that appears above the table.
          </p>
          <Button buttonText="Got it" onClick={() => setShowTutorial(false)} style={{ width: '120px' }} />
        </div>
      )}

      <div className="client-ca-screen__filters">
        <Input placeholder="Filter by Date" rightIcon="calendar" readOnly value="" style={{ width: '200px' }} />
        <Button type="secondary" buttonText="Filters" />
        <Button type="tertiary" buttonText="Reset Filters" disabled />
      </div>

      <Table
        columns={columns}
        rows={pageRows}
        getRowId={(row) => row.id}
        selectedIds={selectedIds}
        onToggleRow={handleToggleRow}
        onToggleAll={handleToggleAll}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        page={page}
        pageSize={pageSize}
        totalRows={totalRows}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />

      <Button type="secondary" leftIcon="arrow-down-to-line" buttonText="Export CSV" style={{ width: '200px' }} />

      {viewingRequest && (
        <CARequestDetailsModal
          request={viewingRequest}
          onClose={() => setViewingRequestId(null)}
          onApprove={() => handleResolve(viewingRequest.id, 'approved')}
          onReject={() => handleResolve(viewingRequest.id, 'rejected')}
        />
      )}

      {showBulkReview && (
        <PopUp>
          <div className="client-ca-screen__bulk-review">
            <h2 className="client-ca-screen__bulk-review-title">
              Review {selectedRequests.length} selected request{selectedRequests.length === 1 ? '' : 's'}
            </h2>
            <ul className="client-ca-screen__bulk-review-list">
              {selectedRequests.map((request) => (
                <li key={request.id}>
                  {request.vaName} — {request.title}
                </li>
              ))}
            </ul>
            <div className="client-ca-screen__bulk-review-actions">
              <Button
                type="tertiary"
                buttonText="Reject All"
                onClick={() => handleBulkResolve('rejected')}
                style={{ width: '160px' }}
              />
              <Button buttonText="Approve All" onClick={() => handleBulkResolve('approved')} style={{ width: '160px' }} />
            </div>
            <button
              type="button"
              className="client-ca-screen__bulk-review-cancel"
              onClick={() => setShowBulkReview(false)}
            >
              Cancel
            </button>
          </div>
        </PopUp>
      )}
    </>
  )
}
