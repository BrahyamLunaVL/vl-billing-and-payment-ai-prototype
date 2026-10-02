import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Table, type TableColumn, Chip, Icon, Button, Input, TabBar, Dropdown, DropdownOption } from '../components'
import { getAllInvoices, type AdminInvoiceView } from '../services/clientAccount'
import { INVOICE_STATUS_LABEL, INVOICE_STATUS_TONE } from '../services/vaAccount'
import './AdminInvoicesListScreen.css'

export interface AdminInvoicesListScreenProps {
  onViewInvoice: (invoiceId: string) => void
}

type SortDirection = 'asc' | 'desc'

function compareValues(a: string, b: string, direction: SortDirection): number {
  const result = a.localeCompare(b)
  return direction === 'asc' ? result : -result
}

interface InvoiceActionsMenuProps {
  onView: () => void
}

/**
 * The per-row "Select Action" dropdown (Figma's "VA Invoice - All Invoices -
 * Actions"): just "View", opening the invoice's own detail screen — same
 * portaled-to-`document.body`, text-only pattern as the Agreements table's
 * own action menu (see `AdminAgreementsListScreen`'s `AgreementActionsMenu`
 * for why it's portaled rather than living inside the table's DOM).
 */
function InvoiceActionsMenu({ onView }: InvoiceActionsMenuProps) {
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
    <div className="admin-invoices-list-screen__actions-menu" ref={containerRef}>
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
            className="admin-invoices-list-screen__dropdown-wrapper"
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
            </Dropdown>
          </div>,
          document.body,
        )}
    </div>
  )
}

/**
 * Admin's "Invoices" table (Figma's "VA Invoice - All Invoices"): every
 * invoice platform-wide, sortable/paginated, with a per-row "Select Action"
 * menu whose "View" opens the invoice's own detail screen (the same "View
 * Invoice" page the VA's own Invoices list already reaches). The Regular/
 * Irregular/Invoice Preview/Product Code tabs aren't wired to any filtering
 * yet — same not-yet-designed-destination treatment as the Agreements
 * table's "My Agreements" tab.
 */
export const AdminInvoicesListScreen = ({ onViewInvoice }: AdminInvoicesListScreenProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState<string | undefined>(undefined)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedTab, setSelectedTab] = useState('all')

  const allInvoices = getAllInvoices()

  const sorted = sortKey
    ? [...allInvoices].sort((a, b) =>
        compareValues(String(a[sortKey as keyof AdminInvoiceView] ?? ''), String(b[sortKey as keyof AdminInvoiceView] ?? ''), sortDirection),
      )
    : allInvoices

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

  const columns: TableColumn<AdminInvoiceView>[] = [
    {
      key: 'actions',
      label: 'ACTIONS',
      width: 160,
      render: (row) => <InvoiceActionsMenu onView={() => onViewInvoice(row.id)} />,
    },
    {
      key: 'isRegular',
      label: 'REGULAR',
      width: 110,
      render: (row) => (
        <span className="admin-invoices-list-screen__regular-cell">
          <Icon
            name={row.isRegular ? 'check' : 'xmark'}
            variant="bold"
            size={16}
            className={
              row.isRegular
                ? 'admin-invoices-list-screen__regular-icon--check'
                : 'admin-invoices-list-screen__regular-icon--x'
            }
          />
        </span>
      ),
    },
    { key: 'invoiceNumber', label: 'INVOICE NUMBER', width: 180, sortable: true, render: (row) => row.invoiceNumber },
    { key: 'totalAmount', label: 'TOTAL', width: 150, sortable: true, render: (row) => row.totalAmount },
    {
      key: 'status',
      label: 'STATUS',
      width: 150,
      sortable: true,
      render: (row) => (
        <Chip label={INVOICE_STATUS_LABEL[row.status ?? 'due']} tone={INVOICE_STATUS_TONE[row.status ?? 'due']} />
      ),
    },
    {
      key: 'vaLegalName',
      label: 'VA LEGAL NAME',
      width: 250,
      sortable: true,
      render: (row) => <span className="admin-invoices-list-screen__link">{row.vaLegalName}</span>,
    },
    {
      key: 'vaEmail',
      label: 'EMAIL',
      width: 280,
      render: (row) => <span className="admin-invoices-list-screen__link">{row.vaEmail}</span>,
    },
    {
      key: 'vaPaymentEmail',
      label: 'PAYMENT EMAIL',
      width: 280,
      render: (row) => <span className="admin-invoices-list-screen__link">{row.vaPaymentEmail}</span>,
    },
    { key: 'vaBillingCountry', label: 'BILLING COUNTRY', width: 180, sortable: true, render: (row) => row.vaBillingCountry },
    { key: 'approvalDate', label: 'APPROVAL DATE', width: 250, sortable: true, render: (row) => row.approvalDate },
    { key: 'dueDate', label: 'DUE DATE', width: 150, sortable: true, render: (row) => row.dueDate },
    { key: 'billingPeriod', label: 'BILLING PERIOD', width: 220, render: (row) => row.billingPeriod },
  ]

  return (
    <>
      <div className="admin-invoices-list-screen__header">
        <h1 className="admin-invoices-list-screen__title">Invoices</h1>
      </div>

      <TabBar
        tabs={[
          { key: 'all', label: 'All Invoices' },
          { key: 'regular', label: 'Regular', disabled: true },
          { key: 'irregular', label: 'Irregular', disabled: true },
          { key: 'invoice-preview', label: 'Invoice Preview', disabled: true },
          { key: 'product-code', label: 'Product Code', disabled: true },
        ]}
        selectedKey={selectedTab}
        onSelectTab={setSelectedTab}
      />

      <div className="admin-invoices-list-screen__filters">
        <Input placeholder="Filter by Date" rightIcon="calendar" className="input--muted-icon" readOnly value="" style={{ width: '200px' }} />
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
