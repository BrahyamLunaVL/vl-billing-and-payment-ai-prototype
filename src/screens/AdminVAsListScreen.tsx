import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Table, type TableColumn, Chip, Button, Icon, Input, TabBar, Dropdown, DropdownOption } from '../components'
import { getAllVAs, type AdminVAView } from '../services/vaAccount'
import './AdminVAsListScreen.css'

type SortDirection = 'asc' | 'desc'

function compareValues(a: string, b: string, direction: SortDirection): number {
  const result = a.localeCompare(b)
  return direction === 'asc' ? result : -result
}

/**
 * The per-row "Select Action" dropdown (Figma's "VAs - All VAs - Actions").
 * "Edit" navigates to the shared Create/Edit VA form pre-filled with this
 * row's VA; "View" stays decorative for now — there's no VA detail screen
 * yet, same as this prototype's other not-yet-designed actions.
 */
function VAActionsMenu({ onEdit }: { onEdit: () => void }) {
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
    <div className="admin-vas-list-screen__actions-menu" ref={containerRef}>
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
            className="admin-vas-list-screen__dropdown-wrapper"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <Dropdown>
              <DropdownOption text="View" onClick={() => setOpen(false)} />
              <DropdownOption
                text="Edit"
                onClick={() => {
                  setOpen(false)
                  onEdit()
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
 * Admin's "VAs" table (Figma's "VAs - All VAs"): every VA platform-wide,
 * sortable/paginated, reusing the same `Table` chrome as the Agreements and
 * Changes & Approvals tables. "Change SAM" only unlocks once at least one
 * row is checked; "New VA" and each row's "Edit" open the shared Create/Edit
 * VA form (`onNewVA`/`onEditVA`, owned by `AdminApp`).
 */
export interface AdminVAsListScreenProps {
  onNewVA: () => void
  onEditVA: (vaEmail: string) => void
}

export const AdminVAsListScreen = ({ onNewVA, onEditVA }: AdminVAsListScreenProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState<string | undefined>(undefined)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedTab, setSelectedTab] = useState('all')

  const allVAs = getAllVAs()

  // Two pairs of columns (Username/Email, Country Citizenship/Residence)
  // show the same underlying field twice — this maps each such column's own
  // (necessarily unique, for React's sake) key back to the `AdminVAView`
  // field it actually sorts by.
  const sortField: Partial<Record<string, keyof AdminVAView>> = {
    username: 'email',
    countryCitizenship: 'country',
    countryResidence: 'country',
  }

  const sorted = sortKey
    ? [...allVAs].sort((a, b) => {
        const field = sortField[sortKey] ?? (sortKey as keyof AdminVAView)
        return compareValues(String(a[field] ?? ''), String(b[field] ?? ''), sortDirection)
      })
    : allVAs

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
      const allOnPageSelected = pageRows.length > 0 && pageRows.every((row) => prev.has(row.id))
      if (allOnPageSelected) return new Set()
      return new Set(pageRows.map((row) => row.id))
    })
  }

  const columns: TableColumn<AdminVAView>[] = [
    { key: 'actions', label: 'ACTIONS', width: 160, render: (row) => <VAActionsMenu onEdit={() => onEditVA(row.email)} /> },
    { key: 'id', label: 'ID', width: 100, sortable: true, render: (row) => row.id },
    {
      key: 'isActive',
      label: 'ACTIVE',
      width: 100,
      render: (row) =>
        row.isActive ? (
          <Icon name="check" variant="bold" size={16} className="admin-vas-list-screen__active-icon" />
        ) : (
          <span className="admin-vas-list-screen__inactive-dash">—</span>
        ),
    },
    {
      key: 'legalName',
      label: 'VA LEGAL NAME',
      width: 220,
      sortable: true,
      render: (row) => <span className="admin-vas-list-screen__link">{row.legalName}</span>,
    },
    {
      key: 'username',
      label: 'USERNAME',
      width: 260,
      sortable: true,
      render: (row) => <span className="admin-vas-list-screen__link">{row.email}</span>,
    },
    {
      key: 'email',
      label: 'EMAIL',
      width: 260,
      sortable: true,
      render: (row) => <span className="admin-vas-list-screen__link">{row.email}</span>,
    },
    {
      key: 'hiredStatus',
      label: 'STATUS',
      width: 150,
      sortable: true,
      render: (row) => (
        <Chip label={row.hiredStatus === 'hired' ? 'Hired' : 'Inactive'} tone={row.hiredStatus === 'hired' ? 'orange' : 'red'} />
      ),
    },
    {
      key: 'telegramHandle',
      label: 'TELEGRAM',
      width: 200,
      sortable: true,
      render: (row) => <span className="admin-vas-list-screen__link">{row.telegramHandle}</span>,
    },
    { key: 'samContactName', label: 'ASSIGNED SAM', width: 200, sortable: true, render: (row) => row.samContactName },
    { key: 'paymentMethod', label: 'PAYMENT METHOD', width: 180, sortable: true, render: (row) => row.paymentMethod },
    { key: 'countryCitizenship', label: 'COUNTRY CITIZENSHIP', width: 200, sortable: true, render: (row) => row.country },
    { key: 'countryResidence', label: 'COUNTRY RESIDENCE', width: 200, sortable: true, render: (row) => row.country },
  ]

  return (
    <>
      <div className="admin-vas-list-screen__header">
        <h1 className="admin-vas-list-screen__title">Virtual Assistance</h1>
        <div className="admin-vas-list-screen__header-actions">
          <Button type="secondary" leftIcon="pencil" buttonText="Change SAM" disabled={selectedIds.size === 0} />
          <Button leftIcon="plus" buttonText="New VA" onClick={onNewVA} />
        </div>
      </div>

      <TabBar
        tabs={[
          { key: 'all', label: 'All VAs' },
          { key: 'mine', label: 'My VAs', disabled: true },
          { key: 'wo-invoice-preview', label: 'W/O Invoice Preview', disabled: true },
          { key: 'onboarding', label: 'Onboarding', disabled: true },
          { key: 'offboarding', label: 'Offboarding', disabled: true },
        ]}
        selectedKey={selectedTab}
        onSelectTab={setSelectedTab}
      />

      <div className="admin-vas-list-screen__filters">
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
