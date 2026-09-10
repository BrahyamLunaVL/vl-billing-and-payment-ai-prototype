export interface InvoiceLineItemData {
  key: string;
  description: string;
  amount: string;
}

export interface InvoiceRecord {
  id: string;
  /** References a MOCK_USERS email. */
  vaEmail: string;
  /** e.g. "Invoice Preview #1940-3326" — shown in My Account's compact Invoice list. */
  title: string;
  /** e.g. "9" — shown as "Invoice #9" on the full Invoices - Preview screen. */
  invoiceNumber: string;
  clientName: string;
  clientAddress: string;
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
      { key: '1', description: '40hs @ $8.00 | Weekly Service from 2026-08-03 to 2026-08-09', amount: '$320.00' },
      { key: '2', description: '40hs @ $8.00 | Weekly Service from 2026-08-10 to 2026-08-16', amount: '$320.00' },
    ],
    totalLabel: 'Invoice Preview Total:',
    totalAmount: '$640.00',
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
