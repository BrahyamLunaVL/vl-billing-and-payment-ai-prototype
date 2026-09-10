import { Button } from '../Button';
import { Icon } from '../Icon';
import './invoice.css';

export interface InvoiceLineItem {
  key: string;
  description: string;
  amount: string;
}

export interface InvoiceAction {
  key: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export interface InvoiceProps {
  /** e.g. "Invoice Preview #1940-3326". */
  title: string;
  items: InvoiceLineItem[];
  totalLabel: string;
  totalAmount: string;
  /** The first action renders as the enabled primary button; the rest typically pass `disabled`. */
  actions: InvoiceAction[];
  /** Bold red lines explaining why disabled actions can't be used right now. */
  warnings?: string[];
  /** A green "Approved on: ..." confirmation line, shown once the invoice has been approved. */
  approvedMessage?: string;
  className?: string;
}

/**
 * A single invoice's line items, total, and action buttons (Figma's
 * "Invoice"), used across the VA/Client/Admin invoice screens.
 */
export const Invoice = ({
  title,
  items,
  totalLabel,
  totalAmount,
  actions,
  warnings,
  approvedMessage,
  className,
}: InvoiceProps) => {
  const classNames = ['invoice', className].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      <div className="invoice__row">
        <div className="invoice__details">
          <p className="invoice__title">{title}</p>
          <div className="invoice__items">
            {items.map((item) => (
              <div key={item.key} className="invoice__item">
                <span>{item.description}</span>
                <span>{item.amount}</span>
              </div>
            ))}
          </div>
          <div className="invoice__divider" />
          <div className="invoice__total">
            <span>{totalLabel}</span>
            <span className="invoice__total-amount">{totalAmount}</span>
          </div>
        </div>
        <div className="invoice__actions">
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
      </div>
      {warnings?.map((warning) => (
        <p key={warning} className="invoice__warning">
          {warning}
        </p>
      ))}
      {approvedMessage && (
        <div className="invoice__approved">
          <Icon name="circle-check" variant="bold" size={20} />
          <span>{approvedMessage}</span>
        </div>
      )}
    </div>
  );
};
