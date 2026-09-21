import { ProfileCard, Chip, Button, Icon, Alert, InvoiceCard } from '../components'
import { getInvoiceBreakdownById, INVOICE_STATUS_LABEL, INVOICE_STATUS_TONE } from '../services/vaAccount'
import './AdminInvoiceScreen.css'

export interface AdminInvoiceScreenProps {
  invoiceId: string
}

/**
 * Admin's "View Invoice" (Figma's "Admin - Invoices - Payment Due/Paid/
 * Preview"): the same invoice breakdown as the VA's own View Invoice, plus
 * a "Payment Data" card and a conditional authorization warning for
 * already-issued invoices ("Due"/"Paid" — Figma's two frames are otherwise
 * identical, so the warning is the one real difference between them), or,
 * for a still-editable "Preview" invoice, decorative per-line "Revert"
 * buttons and an "Add new item" button — none of this wired to real
 * behavior, since Figma doesn't define what either does yet.
 */
export const AdminInvoiceScreen = ({ invoiceId }: AdminInvoiceScreenProps) => {
  const breakdown = getInvoiceBreakdownById(invoiceId)

  if (!breakdown) {
    return (
      <div className="admin-invoice-screen">
        <p className="admin-invoice-screen__notice">This invoice could not be found.</p>
      </div>
    )
  }

  const { invoice, groups } = breakdown
  const status = invoice.status ?? 'due'
  const isPreview = status === 'preview'

  return (
    <div className="admin-invoice-screen">
      <div className="admin-invoice-screen__header">
        <h1 className="admin-invoice-screen__title">View Invoice</h1>
        <Button leftIcon="arrow-down-to-line" buttonText="Download PDF" />
      </div>

      <ProfileCard
        className="admin-invoice-screen__card"
        header={
          <div className="admin-invoice-screen__title-row">
            <span className="admin-invoice-screen__invoice-number">Invoice #{invoice.invoiceNumber}</span>
            <span className="admin-invoice-screen__client-name">{invoice.clientName}</span>
          </div>
        }
      >
        <div className="admin-invoice-screen__meta-row">
          <div className="admin-invoice-screen__meta-field admin-invoice-screen__meta-field--inline">
            <span className="admin-invoice-screen__meta-label">Invoice Status:</span>
            <Chip label={INVOICE_STATUS_LABEL[status]} tone={INVOICE_STATUS_TONE[status]} />
          </div>
          <p className="admin-invoice-screen__address admin-invoice-screen__meta-field--right">
            Address: {invoice.clientAddress}
          </p>
        </div>
        <div className="admin-invoice-screen__meta-subgroup">
          <div className="admin-invoice-screen__meta-row">
            <div className="admin-invoice-screen__meta-field admin-invoice-screen__meta-field--inline">
              <span className="admin-invoice-screen__meta-label">Invoice Date:</span>
              <span>{invoice.invoiceDate}</span>
            </div>
            <div className="admin-invoice-screen__meta-field admin-invoice-screen__meta-field--inline admin-invoice-screen__meta-field--right">
              <span className="admin-invoice-screen__meta-label">Email:</span>
              <span>{invoice.clientEmail}</span>
            </div>
          </div>
          <div className="admin-invoice-screen__meta-row">
            <div className="admin-invoice-screen__meta-field admin-invoice-screen__meta-field--inline">
              <span className="admin-invoice-screen__meta-label">Due Date:</span>
              <span>{invoice.dueDate}</span>
            </div>
            <div className="admin-invoice-screen__meta-field admin-invoice-screen__meta-field--inline admin-invoice-screen__meta-field--right">
              <span className="admin-invoice-screen__meta-label">Phone:</span>
              <span>{invoice.clientPhone}</span>
            </div>
          </div>
        </div>
        <div className="admin-invoice-screen__divider" />
        <div className="admin-invoice-screen__meta-row">
          <div className="admin-invoice-screen__meta-field">
            <span className="admin-invoice-screen__meta-label">Invoiced to</span>
            <span>{invoice.invoicedTo}</span>
          </div>
          <div className="admin-invoice-screen__meta-field admin-invoice-screen__meta-field--right">
            <span className="admin-invoice-screen__meta-label">Billing Period</span>
            <span>{invoice.billingPeriod}</span>
          </div>
        </div>

        <InvoiceCard
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
          showRevertButtons={isPreview}
        />

        {isPreview && (
          <div className="admin-invoice-screen__notices">
            <div className="admin-invoice-screen__notice-item">
              <p className="admin-invoice-screen__notice-title">C&amp;As - Changes to Hours/Week</p>
              <p className="admin-invoice-screen__notice-body">
                Recent change notice — VA: Fatima Julissa Lopez Lopez. Previous weekly base hours: 35
                hours/week. New weekly base hours: 40 hours/week. Effective date: 2025/11/03.
              </p>
            </div>
            <div className="admin-invoice-screen__notice-item">
              <p className="admin-invoice-screen__notice-title">C&amp;As - Raises</p>
              <p className="admin-invoice-screen__notice-body">
                Recent change notice — VA: Fatima Julissa Lopez Lopez. Previous rate: $0.00 / hr. New rate:
                $1.00 / hr. Effective date: 2025/07/21.
              </p>
            </div>
            <Button buttonText="Add new item" leftIcon="plus" style={{ width: '200px', alignSelf: 'center' }} />
          </div>
        )}

        <p className="admin-invoice-screen__disclaimer">*This is an unofficial preview copy of your invoice*.</p>
      </ProfileCard>

      <ProfileCard
        className="admin-invoice-screen__card"
        header={<span className="admin-invoice-screen__section-title">Uploaded Reports</span>}
      >
        {invoice.uploadedReportName ? (
          <div className="admin-invoice-screen__report-row">
            <span className="admin-invoice-screen__report-name">
              <Icon name="paperclip" size={16} />
              {invoice.uploadedReportName}
            </span>
            <div className="admin-invoice-screen__report-actions">
              <Button type="tertiary" size="small" buttonText="View" style={{ width: 'auto' }} />
              <Button type="primary" size="small" buttonText="Download" style={{ width: 'auto' }} />
            </div>
          </div>
        ) : (
          <p className="admin-invoice-screen__notice">{invoice.uploadedReportsMessage}</p>
        )}
      </ProfileCard>

      {!isPreview && (
        <ProfileCard
          className="admin-invoice-screen__card"
          header={<span className="admin-invoice-screen__section-title">Payment Data</span>}
        >
          <p className="admin-invoice-screen__notice">Payment data not found.</p>
        </ProfileCard>
      )}

      {status === 'due' && (
        <Alert type="warning" message="You cannot add payment data before Invoice has been authorized for payment." />
      )}
    </div>
  )
}
