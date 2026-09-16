export type InvoiceLineItemGroup = 'agreement' | 'extra-hours' | 'time-off';

export interface InvoiceLineItemData {
  key: string;
  description: string;
  amount: string;
  /**
   * Every invoice bills 2 weekly "agreement" lines plus 1 "extra-hours"
   * line — this tag is what lets the client's grouped/collapsible invoice
   * view total & label them separately while the VA's flat Invoice Preview
   * just lists all 3 in order, from the same underlying data.
   */
  group: InvoiceLineItemGroup;
}

export interface InvoiceRecord {
  id: string;
  /** References a MOCK_USERS email. */
  vaEmail: string;
  /** References a MOCK_USERS email — the client account this invoice bills, for the Client portal's own screens. */
  clientAccountEmail: string;
  /** e.g. "Invoice Preview #1940-3326" — shown in My Account's compact Invoice list. */
  title: string;
  /** e.g. "9" — shown as "Invoice #9" on the full Invoices - Preview screen. */
  invoiceNumber: string;
  clientName: string;
  clientAddress: string;
  /** The billing contact email printed on the invoice document — not a MOCK_USERS reference. */
  clientEmail: string;
  clientPhone: string;
  invoiceDate: string;
  dueDate: string;
  invoicedTo: string;
  billingPeriod: string;
  items: InvoiceLineItemData[];
  totalLabel: string;
  totalAmount: string;
  warnings?: string[];
  approvedMessage?: string;
  /** e.g. "No reports uploaded". */
  uploadedReportsMessage: string;
}

const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: 'inv-1',
    vaEmail: 'va@virtuallatinos.com',
    clientAccountEmail: 'client@virtuallatinos.com',
    title: 'Invoice Preview #1940-3326',
    invoiceNumber: '9',
    clientName: 'Bloominari, LLC',
    clientAddress: '5425 Oberlin Drive, Suite #205, San Diego, CA, 92121, US',
    clientEmail: 'billing@virtuallatinos.com',
    clientPhone: '+1 (619) 604-2604',
    invoiceDate: '10/5/2023',
    dueDate: '10/5/2023',
    invoicedTo: 'BiGmedia.ai, Inc.',
    billingPeriod: '9/18/2023 - 10/1/2023',
    items: [
      {
        key: '1',
        description: '40hs @ $8.00 | Weekly Service from 2026-08-03 to 2026-08-09',
        amount: '$320.00',
        group: 'agreement',
      },
      {
        key: '2',
        description: '40hs @ $8.00 | Weekly Service from 2026-08-10 to 2026-08-16',
        amount: '$320.00',
        group: 'agreement',
      },
      {
        key: '3',
        description: 'Total extra hrs - 5 hrs (Pre-approved 4 · Manually approved 1), rate $8.50/hr',
        amount: '$42.50',
        group: 'extra-hours',
      },
    ],
    totalLabel: 'Invoice Preview Total:',
    totalAmount: '$682.50',
    warnings: [
      'Cannot approve invoice preview outside approval period.',
      'Cannot upload invoice reports outside approval period.',
      'Cannot request review outside review invoice period.',
    ],
    uploadedReportsMessage: 'No reports uploaded',
  },
];

/** Stand-in for an invoices table — see MOCK_USERS' own doc comment for the pattern. */
export const MOCK_INVOICES: InvoiceRecord[] = INITIAL_INVOICES.map((invoice) => ({ ...invoice }));

export interface InvoiceGroupView {
  group: InvoiceLineItemGroup;
  label: string;
  items: InvoiceLineItemData[];
  totalAmount: number;
}

const GROUP_LABEL: Record<InvoiceLineItemGroup, string> = {
  agreement: 'Agreement',
  'extra-hours': 'Extra Hours',
  'time-off': 'Time Off',
};

const GROUP_ORDER: InvoiceLineItemGroup[] = ['agreement', 'extra-hours', 'time-off'];

function parseAmount(amount: string): number {
  return Number(amount.replace(/[^0-9.-]/g, '')) || 0;
}

/**
 * Splits an invoice's flat line items into the "Agreement"/"Extra Hours"/
 * "Time Off" charge-type groups the grouped/collapsible `InvoiceSummary`
 * tree renders — shared by both the VA's and the client's invoice screens
 * so they build the exact same breakdown from the same underlying data.
 */
export function groupInvoiceItems(items: InvoiceLineItemData[]): InvoiceGroupView[] {
  return GROUP_ORDER.map((group) => {
    const groupItemsList = items.filter((item) => item.group === group);
    if (groupItemsList.length === 0) return null;
    return {
      group,
      label: GROUP_LABEL[group],
      items: groupItemsList,
      totalAmount: groupItemsList.reduce((sum, item) => sum + parseAmount(item.amount), 0),
    };
  }).filter((group): group is InvoiceGroupView => group !== null);
}
