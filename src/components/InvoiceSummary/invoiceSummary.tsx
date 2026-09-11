import { useState } from 'react';
import { Icon } from '../Icon';
import './invoicesummary.css';

export interface InvoiceSummaryLineItem {
  key: string;
  description: string;
  amount: string;
}

export interface InvoiceSummarySection {
  key: string;
  label: string;
  totalAmount: string;
  /** Either nested sections (e.g. one per VA, each holding charge-type sections) or leaf line items — never both. */
  sections?: InvoiceSummarySection[];
  items?: InvoiceSummaryLineItem[];
}

export interface InvoiceSummaryProps {
  sections: InvoiceSummarySection[];
  totalLabel: string;
  totalAmount: string;
  className?: string;
}

interface SectionRowProps {
  section: InvoiceSummarySection;
  depth: number;
}

function SectionRow({ section, depth }: SectionRowProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = Boolean(section.sections?.length || section.items?.length);

  return (
    <div className="invoice-summary__section">
      <button
        type="button"
        className={`invoice-summary__section-header invoice-summary__section-header--depth-${depth}`}
        style={{ paddingLeft: `${20 + depth * 20}px` }}
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        disabled={!hasChildren}
      >
        <span className="invoice-summary__section-title">
          {hasChildren && (
            <Icon
              name="chevron-down"
              variant="bold"
              size={16}
              className={expanded ? 'invoice-summary__chevron' : 'invoice-summary__chevron invoice-summary__chevron--collapsed'}
            />
          )}
          <span className="invoice-summary__count">(1)</span>
          <span>{section.label}</span>
        </span>
        <span className="invoice-summary__section-total">
          <span>Total</span>
          <span className="invoice-summary__amount">{section.totalAmount}</span>
        </span>
      </button>
      {expanded && section.sections && (
        <div className="invoice-summary__children">
          {section.sections.map((child) => (
            <SectionRow key={child.key} section={child} depth={depth + 1} />
          ))}
        </div>
      )}
      {expanded && section.items && (
        <div className="invoice-summary__items">
          {section.items.map((item) => (
            <div
              key={item.key}
              className="invoice-summary__item"
              style={{ paddingLeft: `${20 + (depth + 2) * 20}px` }}
            >
              <span>{item.description}</span>
              <span className="invoice-summary__amount invoice-summary__amount--regular">{item.amount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The client-facing grouped invoice breakdown (Figma's "Invoice" — renamed
 * here to avoid colliding with the existing flat `Invoice` component used
 * by the VA's Invoice Preview page). Same underlying line items, a
 * different, collapsible tree structure: per-VA totals, each expanding
 * into "Agreement"/"Extra Hours" charge-type subtotals, each expanding
 * into its individual line items — plus a final grand-total bar.
 */
export const InvoiceSummary = ({ sections, totalLabel, totalAmount, className }: InvoiceSummaryProps) => {
  const classNames = ['invoice-summary', className].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      <div className="invoice-summary__tree">
        {sections.map((section) => (
          <SectionRow key={section.key} section={section} depth={0} />
        ))}
      </div>
      <div className="invoice-summary__total-bar">
        <span className="invoice-summary__total-label">{totalLabel}</span>
        <span className="invoice-summary__total-amount">{totalAmount}</span>
      </div>
    </div>
  );
};
