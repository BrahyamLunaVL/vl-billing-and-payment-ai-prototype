import { ProfileCard, Chip, Button, InvoiceCard } from '../components'
import { getInvoiceBreakdownById } from '../services/vaAccount'
import './InvoicePreviewScreen.css'

export interface InvoicePreviewScreenProps {
  invoiceId: string
  onBack: () => void
}

/**
 * The full invoice detail screen (Figma's "View Invoice"), opened by
 * clicking "View" on an Invoice in My Account's Invoices tab. Reuses
 * `InvoiceCard` for the grouped line-item breakdown (no action buttons
 * here — those only appear on My Account's own invoice list), wrapped in
 * a `ProfileCard` for the invoice metadata header.
 */
export const InvoicePreviewScreen = ({ invoiceId, onBack }: InvoicePreviewScreenProps) => {
  const breakdown = getInvoiceBreakdownById(invoiceId)

  if (!breakdown) {
    return (
      <div className="invoice-preview-screen">
        <Button type="tertiary" leftIcon="chevron-left" buttonText="Back" onClick={onBack} />
        <p className="invoice-preview-screen__notice">This invoice could not be found.</p>
      </div>
    )
  }

  const { invoice, groups } = breakdown

  return (
    <div className="invoice-preview-screen">
      <div className="invoice-preview-screen__header">
        <h1 className="invoice-preview-screen__title">View Invoice</h1>
        <Button leftIcon="arrow-down-to-line" buttonText="Download PDF" />
      </div>

      <ProfileCard
        className="invoice-preview-screen__card"
        header={
          <div className="invoice-preview-screen__title-row">
            <span className="invoice-preview-screen__invoice-number">Invoice #{invoice.invoiceNumber}</span>
            <span className="invoice-preview-screen__client-name">{invoice.clientName}</span>
          </div>
        }
      >
        <div className="invoice-preview-screen__card-body">
          <div className="invoice-preview-screen__meta-row">
            <div className="invoice-preview-screen__meta-field invoice-preview-screen__meta-field--inline">
              <span className="invoice-preview-screen__meta-label">Invoice Status:</span>
              <Chip label="Preview" tone="blue" />
            </div>
            <p className="invoice-preview-screen__address invoice-preview-screen__meta-field--right">
              Address: {invoice.clientAddress}
            </p>
          </div>
          <div className="invoice-preview-screen__meta-subgroup">
            <div className="invoice-preview-screen__meta-row">
              <div className="invoice-preview-screen__meta-field invoice-preview-screen__meta-field--inline">
                <span className="invoice-preview-screen__meta-label">Invoice Date:</span>
                <span>{invoice.invoiceDate}</span>
              </div>
              <div className="invoice-preview-screen__meta-field invoice-preview-screen__meta-field--inline invoice-preview-screen__meta-field--right">
                <span className="invoice-preview-screen__meta-label">Email:</span>
                <span>{invoice.clientEmail}</span>
              </div>
            </div>
            <div className="invoice-preview-screen__meta-row">
              <div className="invoice-preview-screen__meta-field invoice-preview-screen__meta-field--inline">
                <span className="invoice-preview-screen__meta-label">Due Date:</span>
                <span>{invoice.dueDate}</span>
              </div>
              <div className="invoice-preview-screen__meta-field invoice-preview-screen__meta-field--inline invoice-preview-screen__meta-field--right">
                <span className="invoice-preview-screen__meta-label">Phone:</span>
                <span>{invoice.clientPhone}</span>
              </div>
            </div>
          </div>
          <div className="invoice-preview-screen__divider" />
          <div className="invoice-preview-screen__meta-row">
            <div className="invoice-preview-screen__meta-field">
              <span className="invoice-preview-screen__meta-label">Invoiced to</span>
              <span>{invoice.invoicedTo}</span>
            </div>
            <div className="invoice-preview-screen__meta-field invoice-preview-screen__meta-field--right">
              <span className="invoice-preview-screen__meta-label">Billing Period</span>
              <span>{invoice.billingPeriod}</span>
            </div>
          </div>

          <InvoiceCard
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
          />

          <p className="invoice-preview-screen__disclaimer">
            *This is an unofficial preview copy of your invoice*.
          </p>
        </div>
      </ProfileCard>

      <ProfileCard
        className="invoice-preview-screen__card"
        header={<span className="invoice-preview-screen__section-title">Uploaded Reports</span>}
      >
        <p className="invoice-preview-screen__notice">{invoice.uploadedReportsMessage}</p>
      </ProfileCard>
    </div>
  )
}
