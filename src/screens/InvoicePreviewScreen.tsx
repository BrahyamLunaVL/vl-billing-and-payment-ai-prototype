import { ProfileCard, Chip, Button, Invoice } from '../components'
import { getInvoiceById } from '../services/vaAccount'
import './InvoicePreviewScreen.css'

export interface InvoicePreviewScreenProps {
  invoiceId: string
  onBack: () => void
}

/**
 * The full invoice detail screen (Figma's "Invoices - Preview"), opened by
 * clicking "View" on an Invoice in My Account's Invoices tab. Reuses the
 * existing `Invoice` component for the line-items/total/actions block,
 * wrapped in a `ProfileCard` for the invoice metadata header and footer.
 */
export const InvoicePreviewScreen = ({ invoiceId, onBack }: InvoicePreviewScreenProps) => {
  const invoice = getInvoiceById(invoiceId)

  if (!invoice) {
    return (
      <div className="invoice-preview-screen">
        <Button type="tertiary" leftIcon="chevron-left" buttonText="Back" onClick={onBack} />
        <p className="invoice-preview-screen__notice">This invoice could not be found.</p>
      </div>
    )
  }

  return (
    <div className="invoice-preview-screen">
      <div className="invoice-preview-screen__header">
        <Button type="tertiary" leftIcon="chevron-left" buttonText="Back to My Account" onClick={onBack} />
        <h1 className="invoice-preview-screen__title">View Invoice</h1>
        <Button leftIcon="arrow-down-to-line" buttonText="Download PDF" />
      </div>

      <ProfileCard
        header={
          <div className="invoice-preview-screen__title-row">
            <span className="invoice-preview-screen__invoice-number">Invoice #{invoice.invoiceNumber}</span>
            <span className="invoice-preview-screen__client-name">{invoice.clientName}</span>
          </div>
        }
        footer={
          <span className="invoice-preview-screen__footer-total">
            (1) Invoice Total: {invoice.totalAmount}
          </span>
        }
      >
        <div className="invoice-preview-screen__meta-grid">
          <div className="invoice-preview-screen__meta-field">
            <span>Invoice Status:</span>
            <Chip label="Preview" tone="blue" />
          </div>
          <div className="invoice-preview-screen__meta-field invoice-preview-screen__meta-field--right">
            <span>Address: {invoice.clientAddress}</span>
          </div>
          <div className="invoice-preview-screen__meta-field">
            <span>Invoice Date: {invoice.invoiceDate}</span>
          </div>
          <div className="invoice-preview-screen__meta-field invoice-preview-screen__meta-field--right">
            <span>Email: {invoice.clientEmail}</span>
          </div>
          <div className="invoice-preview-screen__meta-field">
            <span>Due Date: {invoice.dueDate}</span>
          </div>
          <div className="invoice-preview-screen__meta-field invoice-preview-screen__meta-field--right">
            <span>Phone: {invoice.clientPhone}</span>
          </div>
        </div>
        <div className="invoice-preview-screen__divider" />
        <div className="invoice-preview-screen__meta-grid">
          <div className="invoice-preview-screen__meta-field">
            <span className="invoice-preview-screen__meta-label">Invoiced to</span>
            <span>{invoice.invoicedTo}</span>
          </div>
          <div className="invoice-preview-screen__meta-field invoice-preview-screen__meta-field--right">
            <span className="invoice-preview-screen__meta-label">Billing Period</span>
            <span>{invoice.billingPeriod}</span>
          </div>
        </div>

        <Invoice
          title={invoice.title}
          items={invoice.items}
          totalLabel={invoice.totalLabel}
          totalAmount={invoice.totalAmount}
          warnings={invoice.warnings}
          approvedMessage={invoice.approvedMessage}
          actions={[
            { key: 'view', label: 'View' },
            { key: 'approve', label: 'Approve' },
            { key: 'upload', label: 'Upload Reports' },
            { key: 'claim', label: 'Request Invoice Review (Claim)' },
          ]}
        />

        <p className="invoice-preview-screen__disclaimer">
          *This is an unofficial preview copy of your invoice*.
        </p>
      </ProfileCard>

      <ProfileCard header={<span className="invoice-preview-screen__section-title">Uploaded Reports</span>}>
        <p className="invoice-preview-screen__notice">{invoice.uploadedReportsMessage}</p>
      </ProfileCard>
    </div>
  )
}
