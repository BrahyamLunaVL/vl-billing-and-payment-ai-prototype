import { useState } from 'react'
import { ProfileCard, Toggle, InvoiceSummary, TabBar } from '../components'
import { getInvoiceBreakdownForClient, getInvoiceBreakdownByChargeTypeForClient } from '../services/clientAccount'
import './ClientInvoicesPanel.css'

export interface ClientInvoicesPanelProps {
  clientEmail: string
}

const INVOICE_TABS = [
  { key: 'upcoming', label: 'Upcoming Invoice (Current Working Period)' },
  { key: 'all', label: 'All Invoices' },
]

function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`
}

/**
 * The client's invoice breakdown widget (Figma's Invoices "Form"): the
 * Upcoming/All tabs, the Per VA / Per Charge Type toggle, and the grouped
 * `InvoiceSummary` tree. Shared between My Account's Invoices section and
 * the full-page Client Invoice screen — same data, same behavior, just
 * embedded in a different page around it.
 */
export const ClientInvoicesPanel = ({ clientEmail }: ClientInvoicesPanelProps) => {
  const [selectedTab, setSelectedTab] = useState('upcoming')
  const [invoiceViewKey, setInvoiceViewKey] = useState('per-va')

  const perVABreakdown = getInvoiceBreakdownForClient(clientEmail)
  const perChargeTypeBreakdown = getInvoiceBreakdownByChargeTypeForClient(clientEmail)

  const invoiceTotal = perVABreakdown.reduce((sum, va) => sum + va.totalAmount, 0)

  const perVASections = perVABreakdown.map((va) => ({
    key: va.vaEmail,
    label: va.vaName,
    totalAmount: formatUSD(va.totalAmount),
    sections: va.groups.map((group) => ({
      key: `${va.vaEmail}-${group.group}`,
      label: group.label,
      totalAmount: formatUSD(group.totalAmount),
      items: group.items,
    })),
  }))

  const perChargeTypeSections = perChargeTypeBreakdown.map((group) => ({
    key: group.group,
    label: group.label,
    totalAmount: formatUSD(group.totalAmount),
    items: group.items,
  }))

  return (
    <>
      <TabBar tabs={INVOICE_TABS} selectedKey={selectedTab} onSelectTab={setSelectedTab} />
      <ProfileCard>
        <div className="client-invoices-panel__toggle-row">
          <Toggle
            options={[
              { key: 'per-va', label: 'Per VA', icon: 'user-group' },
              { key: 'per-charge-type', label: 'Per Charge Type', icon: 'folders' },
            ]}
            selectedKey={invoiceViewKey}
            onSelect={setInvoiceViewKey}
          />
        </div>
        {perVABreakdown.length === 0 ? (
          <p className="client-invoices-panel__notice">No invoices found</p>
        ) : (
          <InvoiceSummary
            sections={invoiceViewKey === 'per-va' ? perVASections : perChargeTypeSections}
            totalLabel="(1) Invoice Total:"
            totalAmount={formatUSD(invoiceTotal)}
          />
        )}
      </ProfileCard>
    </>
  )
}
