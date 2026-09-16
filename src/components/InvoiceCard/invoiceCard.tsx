import { Button } from '../Button';
import { Icon } from '../Icon';
import { InvoiceSummary, type InvoiceSummarySection } from '../InvoiceSummary';
import './invoicecard.css';

export interface InvoiceCardAction {
  key: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export interface InvoiceCardProps {
  /** e.g. "Invoice preview #1343-2345". */
  title: string;
  sections: InvoiceSummarySection[];
  totalLabel: string;
  totalAmount: string;
  /** The first action renders as the enabled primary button; the rest typically pass `disabled`. Omit entirely for a page with no action buttons (e.g. the full "View Invoice" screen). */
  actions?: InvoiceCardAction[];
  /** Bold red lines explaining why disabled actions can't be used right now. */
  warnings?: string[];
  /** A green "Approved on: ..." confirmation line, shown once the invoice has been approved. */
  approvedMessage?: string;
  className?: string;
}

/**
 * An invoice's grouped/collapsible line-item breakdown plus its title,
 * total, and optional action buttons (Figma's redesigned "Invoice" —
 * replaces the old flat-list `Invoice` component). Used by both the VA's
 * My Account invoice list and its full "View Invoice" page.
 */
export const InvoiceCard = ({
  title,
  sections,
  totalLabel,
  totalAmount,
  actions,
  warnings,
  approvedMessage,
  className,
}: InvoiceCardProps) => {
  const classNames = ['invoice-card', className].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      <div className="invoice-card__row">
        <div className="invoice-card__details">
          <p className="invoice-card__title">{title}</p>
          <InvoiceSummary sections={sections} totalLabel={totalLabel} totalAmount={totalAmount} />
        </div>
        {actions && actions.length > 0 && (
          <div className="invoice-card__actions">
            {actions.map((action, index) => (
              <Button
                key={action.key}
                type="primary"
                buttonText={action.label}
                disabled={action.disabled ?? index !== 0}
                onClick={action.onClick}
                style={{ width: '250px' }}
              />
            ))}
          </div>
        )}
      </div>
      {warnings?.map((warning) => (
        <p key={warning} className="invoice-card__warning">
          {warning}
        </p>
      ))}
      {approvedMessage && (
        <div className="invoice-card__approved">
          <Icon name="circle-check" variant="bold" size={20} />
          <span>{approvedMessage}</span>
        </div>
      )}
    </div>
  );
};
