export interface InvoiceLineItemData {
  key: string;
  description: string;
  amount: string;
}

export interface InvoiceRecord {
  id: string;
  /** References a MOCK_USERS email. */
  vaEmail: string;
  title: string;
  items: InvoiceLineItemData[];
  totalLabel: string;
  totalAmount: string;
  warnings?: string[];
  approvedMessage?: string;
}

const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: 'inv-1',
    vaEmail: 'va@virtuallatinos.com',
    title: 'Invoice Preview #1940-3326',
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
  },
];

/** Stand-in for an invoices table — see MOCK_USERS' own doc comment for the pattern. */
export const MOCK_INVOICES: InvoiceRecord[] = INITIAL_INVOICES.map((invoice) => ({ ...invoice }));
