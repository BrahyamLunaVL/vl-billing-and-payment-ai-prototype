import { useState } from 'react'
import { InvoiceCard, TabBar } from '../components'
import { getInvoiceBreakdownForVA } from '../services/vaAccount'
import './VAInvoicesPanel.css'

export interface VAInvoicesPanelProps {
  userEmail: string
  onViewInvoice: (invoiceId: string) => void
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

  const invoiceBreakdowns = getInvoiceBreakdownForVA(userEmail)

  const invoiceTabs = [
    { key: 'preview', label: 'Invoice Preview', counter: String(invoiceBreakdowns.length) },
    { key: 'approved', label: 'Approved Invoices', counter: '0' },
    { key: 'pending', label: 'Pending Approval', counter: '0' },
    { key: 'previously-approved', label: 'Previously Approved', counter: '0' },
    { key: 'past', label: 'Past', counter: '0' },
  ]

  return (
    <>
      <TabBar tabs={invoiceTabs} selectedKey={selectedTab} onSelectTab={setSelectedTab} />

      {selectedTab === 'preview' ? (
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
          {invoiceBreakdowns.map(({ invoice, groups }) => (
            <InvoiceCard
              key={invoice.id}
              title={invoice.title}
              sections={[
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
              ]}
              totalLabel={invoice.totalLabel}
              totalAmount={invoice.totalAmount}
              warnings={invoice.warnings}
              approvedMessage={invoice.approvedMessage}
              actions={[
                { key: 'view', label: 'View', onClick: () => onViewInvoice(invoice.id) },
                { key: 'approve', label: 'Approve' },
                { key: 'upload', label: 'Upload Reports' },
                { key: 'claim', label: 'Request Invoice Review (Claim)' },
              ]}
            />
          ))}
          <div className="va-invoices-panel__pending-changes">
            <p className="va-invoices-panel__notice va-invoices-panel__notice--bold">
              Any invoices for which you&apos;ve requested any changes that are pending approval
              by our admin team.
            </p>
            <p className="va-invoices-panel__notice va-invoices-panel__notice--bold">No changes pending yet</p>
          </div>
        </>
      ) : (
        <p className="va-invoices-panel__notice">Nothing to show here yet.</p>
      )}
    </>
  )
}
