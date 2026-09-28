import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Table, type TableColumn, Chip, Button, Input, TabBar, Dropdown, DropdownOption } from '../components'
import { getAllAgreements, type ClientAgreementView } from '../services/clientAccount'
import { AGREEMENT_STATUS_LABEL, AGREEMENT_STATUS_TONE } from '../services/vaAccount'
import './AdminAgreementsListScreen.css'

export interface AdminAgreementsListScreenProps {
  onViewAgreement: (agreementId: string) => void
  onRequestChanges: (agreementId: string) => void
}

type SortDirection = 'asc' | 'desc'

function compareValues(a: string, b: string, direction: SortDirection): number {
  const result = a.localeCompare(b)
  return direction === 'asc' ? result : -result
}

interface AgreementActionsMenuProps {
  onView: () => void
  onRequestChanges: () => void
}

/** Bare "N hrs" from a week's day entry (or "-" when the agreement has no active schedule) — Admin table's Monday..Sunday columns. */
function weekDayValue(row: ClientAgreementView, index: number): string {
  const day = row.week?.[index]
  return day ? day.value.replace(' hrs', '') : '-'
}

/**
 * The per-row "Select Action" dropdown (Figma's "Admin - Agreements - All
 * Agreements - Actions"): View and Request for Changes are both wired,
 * Edit stays decorative since it has no designed destination yet —
 * text-only, no icons.
 *
 * The menu itself is portaled to `document.body` and positioned with
 * `position: fixed` from the trigger's own `getBoundingClientRect()`,
 * rather than living inside the table's DOM — the table scrolls both axes
 * (`overflow: hidden` / `overflow-x: auto`), which clips anything
 * `position: absolute` that extends past its bounds, no matter the
 * z-index. That's exactly what happens for a short table or a dropdown
 * opened from one of the last rows.
 */
function AgreementActionsMenu({ onView, onRequestChanges }: AgreementActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      const inTrigger = containerRef.current?.contains(target)
      const inMenu = menuRef.current?.contains(target)
      if (!inTrigger && !inMenu) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    // The menu's fixed position is only computed once, on open — rather
    // than track it, just close on any scroll so it never goes stale.
    const handleScroll = () => setOpen(false)
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [open])

  const handleToggle = () => {
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setMenuPosition({ top: rect.bottom + 4, left: rect.left })
    }
    setOpen((value) => !value)
  }

  return (
    <div className="admin-agreements-list-screen__actions-menu" ref={containerRef}>
      <Button
        type="tertiary"
        size="small"
        rightIcon="chevron-down"
        buttonText="Select Action"
        onClick={handleToggle}
        style={{ width: 'auto' }}
      />
      {open &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            className="admin-agreements-list-screen__dropdown-wrapper"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <Dropdown>
              <DropdownOption
                text="View"
                onClick={() => {
                  setOpen(false)
                  onView()
                }}
              />
              <DropdownOption text="Edit" onClick={() => setOpen(false)} />
              <DropdownOption
                text="Request for Changes"
                onClick={() => {
                  setOpen(false)
                  onRequestChanges()
                }}
              />
            </Dropdown>
          </div>,
          document.body,
        )}
    </div>
  )
}

/**
 * Admin's "Agreements" table (Figma's "Admin - Agreements - All Agreements"):
 * every agreement platform-wide, sortable/paginated, with a per-row "Select
 * Action" menu whose "View" opens the agreement's own detail screen and
 * "Request for Changes" opens that agreement's own Request Changes wizard
 * directly — "Edit" stays decorative, same as this prototype's other
 * not-yet-designed actions.
 */
export const AdminAgreementsListScreen = ({ onViewAgreement, onRequestChanges }: AdminAgreementsListScreenProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState<string | undefined>(undefined)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedTab, setSelectedTab] = useState('all')

  const allAgreements = getAllAgreements()

  const sorted = sortKey
    ? [...allAgreements].sort((a, b) =>
        compareValues(String(a[sortKey as keyof ClientAgreementView] ?? ''), String(b[sortKey as keyof ClientAgreementView] ?? ''), sortDirection),
      )
    : allAgreements

  const totalRows = sorted.length
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize)

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

  const columns: TableColumn<ClientAgreementView>[] = [
    {
      key: 'actions',
      label: 'ACTIONS',
      width: 160,
      render: (row) => (
        <AgreementActionsMenu onView={() => onViewAgreement(row.id)} onRequestChanges={() => onRequestChanges(row.id)} />
      ),
    },
    {
      key: 'status',
      label: 'ACTIVE',
      width: 150,
      sortable: true,
      render: (row) => <Chip label={AGREEMENT_STATUS_LABEL[row.status]} tone={AGREEMENT_STATUS_TONE[row.status]} />,
    },
    {
      key: 'clientCompanyName',
      label: 'COMPANY LEGAL NAME',
      width: 350,
      sortable: true,
      render: (row) => <span className="admin-agreements-list-screen__link">{row.clientCompanyName}</span>,
    },
    {
      key: 'vaName',
      label: 'VA LEGAL NAME',
      width: 250,
      sortable: true,
      render: (row) => <span className="admin-agreements-list-screen__link">{row.vaName}</span>,
    },
    { key: 'billedRate', label: 'CLIENT RATE', width: 150, sortable: true, render: (row) => `${row.billedRate}/hr` },
    { key: 'vaHourlyRate', label: 'VA RATE', width: 150, sortable: true, render: (row) => `${row.vaHourlyRate}/hr` },
    {
      key: 'hoursPerWeek',
      label: 'BASE HOURS',
      width: 150,
      render: (row) => row.hoursPerWeek.replace('Hours per week', 'hr/week'),
    },
    { key: 'samContactName', label: 'SAM', width: 180, sortable: true, render: (row) => row.samContactName },
    { key: 'billingType', label: 'BILLING TYPE', width: 150, sortable: true, render: (row) => row.billingType },
    { key: 'startDate', label: 'START DATE', width: 150, sortable: true, render: (row) => row.startDate },
    { key: 'endDate', label: 'END DATE', width: 150, sortable: true, render: (row) => row.endDate ?? '-' },
    { key: 'monday', label: 'MONDAY', width: 110, render: (row) => weekDayValue(row, 0) },
    { key: 'tuesday', label: 'TUESDAY', width: 110, render: (row) => weekDayValue(row, 1) },
    { key: 'wednesday', label: 'WEDNESDAY', width: 130, render: (row) => weekDayValue(row, 2) },
    { key: 'thursday', label: 'THURSDAY', width: 120, render: (row) => weekDayValue(row, 3) },
    { key: 'friday', label: 'FRIDAY', width: 110, render: (row) => weekDayValue(row, 4) },
    { key: 'saturday', label: 'SATURDAY', width: 120, render: (row) => weekDayValue(row, 5) },
    { key: 'sunday', label: 'SUNDAY', width: 110, render: (row) => weekDayValue(row, 6) },
    { key: 'agreementName', label: 'AGREEMENT NAME', width: 420, sortable: true, render: (row) => row.agreementName },
  ]

  return (
    <>
      <div className="admin-agreements-list-screen__header">
        <h1 className="admin-agreements-list-screen__title">Agreements</h1>
        <div className="admin-agreements-list-screen__header-actions">
          <Button type="secondary" leftIcon="pencil" buttonText="Change SAM" disabled />
          <Button leftIcon="plus" buttonText="New Agreement" />
        </div>
      </div>

      <TabBar
        tabs={[
          { key: 'all', label: 'All Agreements' },
          { key: 'mine', label: 'My Agreements', disabled: true },
        ]}
        selectedKey={selectedTab}
        onSelectTab={setSelectedTab}
      />

      <div className="admin-agreements-list-screen__filters">
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
    </>
  )
}
