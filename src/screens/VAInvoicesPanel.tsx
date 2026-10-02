import { useReducer, useState } from 'react'
import { InvoiceCard, TabBar } from '../components'
import type { InvoiceGroupView, InvoiceRecord } from '../services/vaAccount'
import { getInvoiceBreakdownForVA, canTakeInvoiceAction, formatApprovedMessage, approveInvoice } from '../services/vaAccount'
import './VAInvoicesPanel.css'

export interface VAInvoicesPanelProps {
  userEmail: string
  onViewInvoice: (invoiceId: string) => void
}

function sectionsFor(invoice: InvoiceRecord, groups: InvoiceGroupView[]) {
  return [
    {
      key: invoice.id,
      label: invoice.clientName,
      totalAmount: invoice.totalAmount,
      sections: groups.map((group) => ({
        key: `${invoice.id}-${group.group}`,
        label: group.label,
        totalAmount: `$${group.totalAmount.toFixed(2)}`,
        items: group.items,
      })),
    },
  ]
}

/**
 * The Invoice Preview/Approved/Pending/... tabs and the grouped
 * `InvoiceCard` breakdown (Figma's My Account — Invoice Preview state).
 * Shared between My Account's own Invoices section and the full-page
 * Invoices screen — same data, same behavior, just embedded in a different
 * page around it. Doesn't render its own heading — each caller owns
 * whatever title fits its page (My Account's "Virtual Latinos Invoices",
 * the standalone page's own "Invoices" title, or none at all).
 */
export const VAInvoicesPanel = ({ userEmail, onViewInvoice }: VAInvoicesPanelProps) => {
  const [selectedTab, setSelectedTab] = useState('preview')
  // `approveInvoice` mutates the shared mock record in place — this forces
  // a re-render so the just-approved invoice moves tabs immediately.
  const [, forceRefresh] = useReducer((tick: number) => tick + 1, 0)

  const previewInvoices = getInvoiceBreakdownForVA(userEmail, 'preview')
  const pendingApprovalInvoices = getInvoiceBreakdownForVA(userEmail, 'pending-approval')
  const previouslyApprovedInvoices = getInvoiceBreakdownForVA(userEmail, 'previously-approved')

  const invoiceTabs = [
    { key: 'preview', label: 'Invoice Preview', counter: String(previewInvoices.length) },
    { key: 'approved', label: 'Approved Invoices', counter: '0' },
    { key: 'pending', label: 'Pending Approval', counter: String(pendingApprovalInvoices.length) },
    { key: 'previously-approved', label: 'Previously Approved', counter: String(previouslyApprovedInvoices.length) },
    { key: 'past', label: 'Past', counter: '0' },
  ]

  const handleApprove = (invoiceId: string) => {
    approveInvoice(invoiceId)
    forceRefresh()
  }

  return (
    <>
      <TabBar tabs={invoiceTabs} selectedKey={selectedTab} onSelectTab={setSelectedTab} />

      {selectedTab === 'preview' && (
        <>
          <div className="va-invoices-panel__invoice-notices">
            <p className="va-invoices-panel__notice va-invoices-panel__notice--bold">
              Please take a moment to review the forthcoming invoices for the upcoming payment
              period.
            </p>
            <p className="va-invoices-panel__notice">
              On the second week of the billing period, you have the option to approve payment
              for the invoice between Friday, 1 PM PT and Sunday midnight PT.
            </p>
            <p className="va-invoices-panel__notice">
              If you wish to have your invoice reviewed or require any changes prior to approval,
              please submit your request between Monday, 6 AM PT and Thursday, 4 PM PT.
            </p>
            <p className="va-invoices-panel__notice">
              Once you upload your report(s), please remember to also click &quot;Approve&quot;
              next to your invoice within its approval period. Otherwise, we may not receive it
              and your payment could be delayed.
            </p>
          </div>
          {previewInvoices.map(({ invoice, groups }) => {
            const actionsEnabled = canTakeInvoiceAction(invoice)
            return (
              <InvoiceCard
                key={invoice.id}
                title={invoice.title}
                sections={sectionsFor(invoice, groups)}
                totalLabel={invoice.totalLabel}
                totalAmount={invoice.totalAmount}
                warnings={actionsEnabled ? undefined : invoice.warnings}
                actions={[
                  { key: 'view', label: 'View', onClick: () => onViewInvoice(invoice.id) },
                  { key: 'approve', label: 'Approve', disabled: !actionsEnabled, onClick: () => handleApprove(invoice.id) },
                  { key: 'upload', label: 'Upload Reports', disabled: !actionsEnabled },
                  { key: 'claim', label: 'Request Invoice Review (Claim)', disabled: !actionsEnabled },
                ]}
              />
            )
          })}
          <div className="va-invoices-panel__pending-changes">
            <p className="va-invoices-panel__notice va-invoices-panel__notice--bold">
              Any invoices for which you&apos;ve requested any changes that are pending approval
              by our admin team.
            </p>
            <p className="va-invoices-panel__notice va-invoices-panel__notice--bold">No changes pending yet</p>
          </div>
        </>
      )}

      {selectedTab === 'pending' && (
        <>
          {pendingApprovalInvoices.length === 0 ? (
            <p className="va-invoices-panel__notice">Nothing to show here yet.</p>
          ) : (
            pendingApprovalInvoices.map(({ invoice, groups }) => (
              <InvoiceCard
                key={invoice.id}
                title={invoice.title}
                sections={sectionsFor(invoice, groups)}
                totalLabel={invoice.totalLabel}
                totalAmount={invoice.totalAmount}
                actions={[
                  { key: 'view', label: 'View', onClick: () => onViewInvoice(invoice.id) },
                  { key: 'approve', label: 'Approve', disabled: false, onClick: () => handleApprove(invoice.id) },
                  { key: 'upload', label: 'Upload Reports', disabled: false },
                ]}
              />
            ))
          )}
        </>
      )}

      {selectedTab === 'previously-approved' && (
        <>
          {previouslyApprovedInvoices.length === 0 ? (
            <p className="va-invoices-panel__notice">Nothing to show here yet.</p>
          ) : (
            previouslyApprovedInvoices.map(({ invoice, groups }) => (
              <InvoiceCard
                key={invoice.id}
                title={invoice.title}
                sections={sectionsFor(invoice, groups)}
                totalLabel={invoice.totalLabel}
                totalAmount={invoice.totalAmount}
                approvedMessage={invoice.vaApprovedAt ? formatApprovedMessage(invoice.vaApprovedAt) : undefined}
                actions={[
                  { key: 'view', label: 'View', onClick: () => onViewInvoice(invoice.id) },
                  { key: 'download', label: 'Download PDF', disabled: false },
                ]}
              />
            ))
          )}
        </>
      )}

      {(selectedTab === 'approved' || selectedTab === 'past') && (
        <p className="va-invoices-panel__notice">Nothing to show here yet.</p>
      )}
    </>
  )
}
