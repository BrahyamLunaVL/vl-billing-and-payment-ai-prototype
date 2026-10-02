import { MOCK_AGREEMENTS } from './agreements';

export type InvoiceLineItemGroup = 'agreement' | 'extra-hours' | 'time-off';

/**
 * Admin's "Invoice Status" chip variants (the VA's own View Invoice always
 * shows "Preview" regardless of this field — only Admin's screen reads it).
 * 'new' is the VA's own still-open, current billing-period invoice — see
 * `getVAInvoiceBucket`.
 */
export type InvoiceStatus = 'new' | 'due' | 'paid' | 'preview' | 'refunded' | 'pending-payment' | 'payment-failed';

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
  /** e.g. "No reports uploaded". Shown as-is when `uploadedReportName` is omitted. */
  uploadedReportsMessage: string;
  /** e.g. "Work Report" — when present, Admin's screen shows it as a downloadable attachment instead of `uploadedReportsMessage`. */
  uploadedReportName?: string;
  /** Admin's "Invoice Status" chip. Defaults to 'due' for invoices that omit it. */
  status?: InvoiceStatus;
  /** e.g. "10/5/2023, 09:14:22 AM PST" — when the invoice was approved for issuing, shown on Admin's "All Invoices" table. */
  approvalDate: string;
  /** Whether this is a standard recurring billing cycle, shown as a check/x-mark icon on Admin's "All Invoices" table. */
  isRegular: boolean;
  /**
   * ISO datetime the VA clicked "Approve" on this invoice — undefined until
   * then. The single source of truth for which of My Account's three
   * Invoices tabs it belongs in (see `getVAInvoiceBucket`) and for the
   * "Approved on: ..." message `formatApprovedMessage` derives from it.
   */
  vaApprovedAt?: string;
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
        description: 'Weekly Service from 2026-08-03 to 2026-08-09, 40 hours, rate $8.00',
        amount: '$320.00',
        group: 'agreement',
      },
      {
        key: '2',
        description: 'Weekly Service from 2026-08-10 to 2026-08-16, 40 hours, rate $8.00',
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
    uploadedReportName: 'Work Report',
    status: 'due',
    approvalDate: '10/5/2023, 09:14:22 AM PST',
    isRegular: true,
  },
  {
    id: 'inv-2',
    vaEmail: 'va2@virtuallatinos.com',
    clientAccountEmail: 'client@virtuallatinos.com',
    title: 'Invoice Preview #1940-3327',
    invoiceNumber: '10',
    clientName: 'Bloominari, LLC',
    clientAddress: '5425 Oberlin Drive, Suite #205, San Diego, CA, 92121, US',
    clientEmail: 'billing@virtuallatinos.com',
    clientPhone: '+1 (619) 604-2604',
    invoiceDate: '9/20/2026',
    dueDate: '9/20/2026',
    invoicedTo: 'BiGmedia.ai, Inc.',
    billingPeriod: '9/7/2026 - 9/20/2026',
    items: [
      {
        key: '1',
        description: 'Weekly Service from 2026-09-07 to 2026-09-13, 40 hours, rate $7.00',
        amount: '$280.00',
        group: 'agreement',
      },
      {
        key: '2',
        description: 'Weekly Service from 2026-09-14 to 2026-09-20, 40 hours, rate $7.00',
        amount: '$280.00',
        group: 'agreement',
      },
      {
        key: '3',
        description: 'Total extra hrs - 4 hrs (Pre-approved 4 · Manually approved 0), rate $8.00/hr',
        amount: '$32.00',
        group: 'extra-hours',
      },
    ],
    totalLabel: 'Invoice Preview Total:',
    totalAmount: '$592.00',
    warnings: [
      'Cannot approve invoice preview outside approval period.',
      'Cannot upload invoice reports outside approval period.',
      'Cannot request review outside review invoice period.',
    ],
    uploadedReportsMessage: 'No reports uploaded',
    status: 'paid',
    approvalDate: '9/20/2026, 11:02:47 AM PST',
    isRegular: true,
    vaApprovedAt: '2026-09-18T18:45:00',
  },
  {
    id: 'inv-3',
    vaEmail: 'va-no-hours@virtuallatinos.com',
    clientAccountEmail: 'client@virtuallatinos.com',
    title: 'Invoice Preview #1940-3328',
    invoiceNumber: '11',
    clientName: 'Bloominari, LLC',
    clientAddress: '5425 Oberlin Drive, Suite #205, San Diego, CA, 92121, US',
    clientEmail: 'billing@virtuallatinos.com',
    clientPhone: '+1 (619) 604-2604',
    invoiceDate: '9/20/2026',
    dueDate: '9/20/2026',
    invoicedTo: 'BiGmedia.ai, Inc.',
    billingPeriod: '9/7/2026 - 9/20/2026',
    items: [
      {
        key: '1',
        description: 'Weekly Service from 2026-09-07 to 2026-09-13, 40 hours, rate $8.00',
        amount: '$320.00',
        group: 'agreement',
      },
      {
        key: '2',
        description: 'Weekly Service from 2026-09-14 to 2026-09-20, 40 hours, rate $8.00',
        amount: '$320.00',
        group: 'agreement',
      },
    ],
    totalLabel: 'Invoice Preview Total:',
    totalAmount: '$640.00',
    warnings: [
      'Cannot approve invoice preview outside approval period.',
      'Cannot upload invoice reports outside approval period.',
      'Cannot request review outside review invoice period.',
    ],
    uploadedReportsMessage: 'No reports uploaded',
    status: 'preview',
    approvalDate: '9/20/2026, 08:47:15 AM PST',
    isRegular: true,
  },
  {
    id: 'inv-4',
    vaEmail: 'va2@virtuallatinos.com',
    clientAccountEmail: 'client@virtuallatinos.com',
    title: 'Invoice Preview #1940-3329',
    invoiceNumber: '12',
    clientName: 'Bloominari, LLC',
    clientAddress: '5425 Oberlin Drive, Suite #205, San Diego, CA, 92121, US',
    clientEmail: 'billing@virtuallatinos.com',
    clientPhone: '+1 (619) 604-2604',
    invoiceDate: '8/23/2026',
    dueDate: '8/23/2026',
    invoicedTo: 'BiGmedia.ai, Inc.',
    billingPeriod: '8/10/2026 - 8/23/2026',
    items: [
      {
        key: '1',
        description: 'Weekly Service from 2026-08-10 to 2026-08-16, 40 hours, rate $7.00',
        amount: '$280.00',
        group: 'agreement',
      },
      {
        key: '2',
        description: 'Weekly Service from 2026-08-17 to 2026-08-23, 40 hours, rate $7.00',
        amount: '$280.00',
        group: 'agreement',
      },
    ],
    totalLabel: 'Invoice Preview Total:',
    totalAmount: '$560.00',
    uploadedReportsMessage: 'No reports uploaded',
    status: 'refunded',
    approvalDate: '8/23/2026, 10:33:09 AM PST',
    isRegular: true,
    vaApprovedAt: '2026-08-21T17:30:00',
  },
  {
    id: 'inv-5',
    vaEmail: 'va-no-hours@virtuallatinos.com',
    clientAccountEmail: 'client@virtuallatinos.com',
    title: 'Invoice Preview #1940-3330',
    invoiceNumber: '13',
    clientName: 'Bloominari, LLC',
    clientAddress: '5425 Oberlin Drive, Suite #205, San Diego, CA, 92121, US',
    clientEmail: 'billing@virtuallatinos.com',
    clientPhone: '+1 (619) 604-2604',
    invoiceDate: '8/23/2026',
    dueDate: '8/23/2026',
    invoicedTo: 'BiGmedia.ai, Inc.',
    billingPeriod: '8/10/2026 - 8/23/2026',
    items: [
      {
        key: '1',
        description: 'Weekly Service from 2026-08-10 to 2026-08-16, 40 hours, rate $8.00',
        amount: '$320.00',
        group: 'agreement',
      },
      {
        key: '2',
        description: 'Weekly Service from 2026-08-17 to 2026-08-23, 40 hours, rate $8.00',
        amount: '$320.00',
        group: 'agreement',
      },
    ],
    totalLabel: 'Invoice Preview Total:',
    totalAmount: '$640.00',
    uploadedReportsMessage: 'No reports uploaded',
    status: 'pending-payment',
    approvalDate: '8/23/2026, 09:18:52 AM PST',
    isRegular: true,
    vaApprovedAt: '2026-08-21T19:10:00',
  },
  {
    id: 'inv-6',
    vaEmail: 'va2@virtuallatinos.com',
    clientAccountEmail: 'client@virtuallatinos.com',
    title: 'Invoice Preview #1940-3331',
    invoiceNumber: '14',
    clientName: 'Bloominari, LLC',
    clientAddress: '5425 Oberlin Drive, Suite #205, San Diego, CA, 92121, US',
    clientEmail: 'billing@virtuallatinos.com',
    clientPhone: '+1 (619) 604-2604',
    invoiceDate: '8/9/2026',
    dueDate: '8/9/2026',
    invoicedTo: 'BiGmedia.ai, Inc.',
    billingPeriod: '7/27/2026 - 8/9/2026',
    items: [
      {
        key: '1',
        description: 'Weekly Service from 2026-07-27 to 2026-08-02, 40 hours, rate $7.00',
        amount: '$280.00',
        group: 'agreement',
      },
      {
        key: '2',
        description: 'Weekly Service from 2026-08-03 to 2026-08-09, 40 hours, rate $7.00',
        amount: '$280.00',
        group: 'agreement',
      },
    ],
    totalLabel: 'Invoice Preview Total:',
    totalAmount: '$560.00',
    uploadedReportsMessage: 'No reports uploaded',
    status: 'payment-failed',
    approvalDate: '8/9/2026, 02:41:36 PM PST',
    isRegular: true,
    vaApprovedAt: '2026-08-07T16:50:00',
  },
  {
    id: 'inv-7',
    vaEmail: 'va@virtuallatinos.com',
    clientAccountEmail: 'client@virtuallatinos.com',
    title: 'Invoice Preview #1940-3332',
    invoiceNumber: '15',
    clientName: 'Bloominari, LLC',
    clientAddress: '5425 Oberlin Drive, Suite #205, San Diego, CA, 92121, US',
    clientEmail: 'billing@virtuallatinos.com',
    clientPhone: '+1 (619) 604-2604',
    invoiceDate: '6/7/2026',
    dueDate: '6/7/2026',
    invoicedTo: 'BiGmedia.ai, Inc.',
    billingPeriod: '5/25/2026 - 6/7/2026',
    items: [
      {
        key: '1',
        description: 'Weekly Service from 2026-05-25 to 2026-05-31, 40 hours, rate $8.00',
        amount: '$320.00',
        group: 'agreement',
      },
      {
        key: '2',
        description: 'Weekly Service from 2026-06-01 to 2026-06-07, 40 hours, rate $8.00',
        amount: '$320.00',
        group: 'agreement',
      },
      {
        key: '3',
        description: 'Non-Paid Non-Consecutive Time Off during 2026-05-25, 8 hours, rate $12.50',
        amount: '$100.00',
        group: 'time-off',
      },
    ],
    totalLabel: 'Invoice Preview Total:',
    totalAmount: '$740.00',
    uploadedReportsMessage: 'No reports uploaded',
    status: 'paid',
    approvalDate: '6/7/2026, 10:15:00 AM PST',
    isRegular: true,
    vaApprovedAt: '2026-06-05T17:35:00',
  },
  {
    id: 'inv-8',
    vaEmail: 'va@virtuallatinos.com',
    clientAccountEmail: 'client@virtuallatinos.com',
    title: 'Invoice Preview #1940-3333',
    invoiceNumber: '16',
    clientName: 'Bloominari, LLC',
    clientAddress: '5425 Oberlin Drive, Suite #205, San Diego, CA, 92121, US',
    clientEmail: 'billing@virtuallatinos.com',
    clientPhone: '+1 (619) 604-2604',
    invoiceDate: '5/31/2026',
    dueDate: '5/31/2026',
    invoicedTo: 'BiGmedia.ai, Inc.',
    billingPeriod: '5/18/2026 - 5/31/2026',
    items: [
      {
        key: '1',
        description: 'Weekly Service from 2026-05-18 to 2026-05-24, 40 hours, rate $8.00',
        amount: '$320.00',
        group: 'agreement',
      },
      {
        key: '2',
        description: 'Weekly Service from 2026-05-25 to 2026-05-31, 40 hours, rate $8.00',
        amount: '$320.00',
        group: 'agreement',
      },
      {
        key: '3',
        description: 'Total extra hrs - 4 hrs (Pre-approved 4 · Manually approved 0), rate $8.50/hr',
        amount: '$34.00',
        group: 'extra-hours',
      },
      {
        key: '4',
        description: 'Non-Paid Consecutive Time Off during 2026-05-18 to 2026-05-24, 40 hours, rate $12.50',
        amount: '$500.00',
        group: 'time-off',
      },
    ],
    totalLabel: 'Invoice Preview Total:',
    totalAmount: '$1174.00',
    uploadedReportsMessage: 'No reports uploaded',
    status: 'paid',
    approvalDate: '5/31/2026, 11:40:00 AM PST',
    isRegular: true,
    vaApprovedAt: '2026-05-29T19:53:00',
  },
  {
    id: 'inv-9',
    vaEmail: 'va2@virtuallatinos.com',
    clientAccountEmail: 'client@virtuallatinos.com',
    title: 'Invoice Preview #1940-3334',
    invoiceNumber: '17',
    clientName: 'Bloominari, LLC',
    clientAddress: '5425 Oberlin Drive, Suite #205, San Diego, CA, 92121, US',
    clientEmail: 'billing@virtuallatinos.com',
    clientPhone: '+1 (619) 604-2604',
    invoiceDate: '5/10/2026',
    dueDate: '5/10/2026',
    invoicedTo: 'BiGmedia.ai, Inc.',
    billingPeriod: '4/27/2026 - 5/10/2026',
    items: [
      {
        key: '1',
        description: 'Weekly Service from 2026-04-27 to 2026-05-03, 40 hours, rate $7.00',
        amount: '$280.00',
        group: 'agreement',
      },
      {
        key: '2',
        description: 'Weekly Service from 2026-05-04 to 2026-05-10, 40 hours, rate $7.00',
        amount: '$280.00',
        group: 'agreement',
      },
      {
        key: '3',
        description: 'Paid Non-Consecutive Time Off during 2026-04-27, 8 hours, rate $12.50',
        amount: '$100.00',
        group: 'time-off',
      },
    ],
    totalLabel: 'Invoice Preview Total:',
    totalAmount: '$660.00',
    uploadedReportsMessage: 'No reports uploaded',
    status: 'paid',
    approvalDate: '5/10/2026, 09:05:00 AM PST',
    isRegular: true,
    vaApprovedAt: '2026-05-08T19:32:00',
  },
  {
    id: 'inv-10',
    vaEmail: 'va2@virtuallatinos.com',
    clientAccountEmail: 'client@virtuallatinos.com',
    title: 'Invoice Preview #1940-3335',
    invoiceNumber: '18',
    clientName: 'Bloominari, LLC',
    clientAddress: '5425 Oberlin Drive, Suite #205, San Diego, CA, 92121, US',
    clientEmail: 'billing@virtuallatinos.com',
    clientPhone: '+1 (619) 604-2604',
    invoiceDate: '4/26/2026',
    dueDate: '4/26/2026',
    invoicedTo: 'BiGmedia.ai, Inc.',
    billingPeriod: '4/13/2026 - 4/26/2026',
    items: [
      {
        key: '1',
        description: 'Weekly Service from 2026-04-13 to 2026-04-19, 40 hours, rate $7.00',
        amount: '$280.00',
        group: 'agreement',
      },
      {
        key: '2',
        description: 'Weekly Service from 2026-04-20 to 2026-04-26, 40 hours, rate $7.00',
        amount: '$280.00',
        group: 'agreement',
      },
      {
        key: '3',
        description: 'Total extra hrs - 3 hrs (Pre-approved 4 · Manually approved 0), rate $7.50/hr',
        amount: '$22.50',
        group: 'extra-hours',
      },
      {
        key: '4',
        description: 'Paid Consecutive Time Off during 2026-04-13 to 2026-04-19, 40 hours, rate $12.50',
        amount: '$500.00',
        group: 'time-off',
      },
    ],
    totalLabel: 'Invoice Preview Total:',
    totalAmount: '$1082.50',
    uploadedReportsMessage: 'No reports uploaded',
    status: 'paid',
    approvalDate: '4/26/2026, 02:20:00 PM PST',
    isRegular: true,
    vaApprovedAt: '2026-04-24T20:03:00',
  },
];

function parseUSDate(value: string): Date {
  const [month, day, year] = value.trim().split('/').map(Number);
  return new Date(year, month - 1, day);
}

function formatUSDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function toISODateLocal(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addDaysLocal(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function parseRate(billedRate: string): number {
  return Number(billedRate.replace(/[^0-9.]/g, '')) || 0;
}

function parseWeeklyHours(hoursPerWeek: string): number {
  const match = /(\d+)/.exec(hoursPerWeek);
  return match ? Number(match[1]) : 40;
}

/** A known biweekly-cycle-start Monday, so "the current period" always lands on the same 2-week grid regardless of when this runs. */
const BIWEEKLY_CYCLE_ANCHOR = new Date(2026, 8, 28); // 2026-09-28, a Monday

function getCurrentBiweeklyPeriod(now: Date): { start: Date; end: Date } {
  const daysSinceMonday = (now.getDay() + 6) % 7;
  const thisWeekMonday = addDaysLocal(now, -daysSinceMonday);
  thisWeekMonday.setHours(0, 0, 0, 0);
  const weeksSinceAnchor = Math.round(
    (thisWeekMonday.getTime() - BIWEEKLY_CYCLE_ANCHOR.getTime()) / (7 * 24 * 60 * 60 * 1000),
  );
  const isSecondWeek = ((weeksSinceAnchor % 2) + 2) % 2 === 1;
  const start = isSecondWeek ? addDaysLocal(thisWeekMonday, -7) : thisWeekMonday;
  const end = addDaysLocal(start, 13);
  return { start, end };
}

/**
 * One "Invoice Preview" entry per agreement that's active and ongoing during
 * the current 2-week billing cycle (the cycle containing `now`) — these are
 * real `MOCK_INVOICES` entries from the start, not computed on the fly, so
 * approving one (`approveInvoice`) is exactly the same mutation as for any
 * seeded invoice.
 */
function buildCurrentPeriodInvoices(now: Date): InvoiceRecord[] {
  const { start, end } = getCurrentBiweeklyPeriod(now);
  const week1End = addDaysLocal(start, 6);
  const week2Start = addDaysLocal(start, 7);
  const billingPeriod = `${formatUSDate(start)} - ${formatUSDate(end)}`;

  return MOCK_AGREEMENTS.filter((agreement) => {
    if (agreement.status !== 'active') return false;
    const agreementStart = parseUSDate(agreement.startDate);
    const agreementEnd = agreement.endDate ? parseUSDate(agreement.endDate) : null;
    return agreementStart <= end && (!agreementEnd || agreementEnd >= start);
  }).map((agreement, index) => {
    const rate = parseRate(agreement.billedRate);
    const hours = parseWeeklyHours(agreement.hoursPerWeek);
    const weeklyAmount = rate * hours;
    const totalAmount = weeklyAmount * 2;

    const invoice: InvoiceRecord = {
      id: `inv-current-${agreement.id}`,
      vaEmail: agreement.vaEmail,
      clientAccountEmail: agreement.clientEmail,
      title: `Invoice Preview #1940-${3340 + index}`,
      invoiceNumber: String(19 + index),
      clientName: 'Bloominari, LLC',
      clientAddress: '5425 Oberlin Drive, Suite #205, San Diego, CA, 92121, US',
      clientEmail: 'billing@virtuallatinos.com',
      clientPhone: '+1 (619) 604-2604',
      invoiceDate: formatUSDate(end),
      dueDate: formatUSDate(end),
      invoicedTo: 'BiGmedia.ai, Inc.',
      billingPeriod,
      items: [
        {
          key: '1',
          description: `Weekly Service from ${toISODateLocal(start)} to ${toISODateLocal(week1End)}, ${hours} hours, rate $${rate.toFixed(2)}`,
          amount: `$${weeklyAmount.toFixed(2)}`,
          group: 'agreement',
        },
        {
          key: '2',
          description: `Weekly Service from ${toISODateLocal(week2Start)} to ${toISODateLocal(end)}, ${hours} hours, rate $${rate.toFixed(2)}`,
          amount: `$${weeklyAmount.toFixed(2)}`,
          group: 'agreement',
        },
      ],
      totalLabel: 'Invoice Preview Total:',
      totalAmount: `$${totalAmount.toFixed(2)}`,
      warnings: [
        'Cannot approve invoice preview outside approval period.',
        'Cannot upload invoice reports outside approval period.',
        'Cannot request review outside review invoice period.',
      ],
      uploadedReportsMessage: 'No reports uploaded',
      status: 'new',
      approvalDate: `${formatUSDate(end)}, 12:00:00 AM PST`,
      isRegular: true,
    };
    return invoice;
  });
}

/** Stand-in for an invoices table — see MOCK_USERS' own doc comment for the pattern. */
export const MOCK_INVOICES: InvoiceRecord[] = [
  ...INITIAL_INVOICES.map((invoice) => ({ ...invoice })),
  ...buildCurrentPeriodInvoices(new Date()),
];

/**
 * Restores the seed data, including a freshly (re)computed current-period
 * invoice per qualifying agreement — for tests/stories that call
 * `approveInvoice` (a real mutation, same as `resetPassword` in
 * src/services/auth.ts) to avoid leaking state into whatever runs next.
 */
export function resetMockInvoices(): void {
  MOCK_INVOICES.length = 0;
  MOCK_INVOICES.push(...INITIAL_INVOICES.map((invoice) => ({ ...invoice })), ...buildCurrentPeriodInvoices(new Date()));
}

export type VAInvoiceBucket = 'preview' | 'pending-approval' | 'previously-approved';

function parseBillingPeriodEnd(billingPeriod: string): Date {
  const [, endPart] = billingPeriod.split(' - ');
  const end = parseUSDate(endPart);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Which of My Account's three Invoices tabs this invoice belongs in:
 * - 'preview': still-open current period, not yet approved.
 * - 'pending-approval': its period closed before the VA approved it.
 * - 'previously-approved': the VA has approved it (on time or late — once
 *   approved, it's permanently here regardless of when that happened).
 */
export function getVAInvoiceBucket(invoice: InvoiceRecord, now: Date = new Date()): VAInvoiceBucket {
  if (invoice.vaApprovedAt) return 'previously-approved';
  const periodEnd = parseBillingPeriodEnd(invoice.billingPeriod);
  return now > periodEnd ? 'pending-approval' : 'preview';
}

/**
 * Whether "Approve"/"Upload Reports"/"Request Invoice Review" are usable
 * right now. A still-open ('preview') invoice only allows them during the
 * Friday–Sunday window right before its period closes; a 'pending-approval'
 * invoice (period already closed, never approved) allows them anytime, since
 * it's already overdue; an already-approved invoice never shows them again.
 */
export function canTakeInvoiceAction(invoice: InvoiceRecord, now: Date = new Date()): boolean {
  if (invoice.vaApprovedAt) return false;
  const periodEnd = parseBillingPeriodEnd(invoice.billingPeriod);
  if (now > periodEnd) return true;
  const windowStart = addDaysLocal(periodEnd, -2);
  windowStart.setHours(0, 0, 0, 0);
  return now >= windowStart;
}

/** "Approved on: Friday, June 5, 2026 at 05:35 PM" — the Previously Approved tab's confirmation line. */
export function formatApprovedMessage(vaApprovedAt: string): string {
  const date = new Date(vaApprovedAt);
  const dateLabel = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const hour24 = date.getHours();
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const meridiem = hour24 < 12 ? 'AM' : 'PM';
  return `Approved on: ${dateLabel} at ${String(hour12).padStart(2, '0')}:${minutes} ${meridiem}`;
}

/** Marks an invoice approved by the VA — a real mutation, same pattern as `resolveCARequest`. */
export function approveInvoice(invoiceId: string, now: Date = new Date()): void {
  const invoice = MOCK_INVOICES.find((candidate) => candidate.id === invoiceId);
  if (invoice) invoice.vaApprovedAt = now.toISOString();
}

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
