export type CARequestStatus = 'new' | 'approved' | 'rejected' | 'expired';

export interface CARequestDetail {
  label: string;
  value: string;
  /** Spans both columns of the details grid instead of sharing a row. */
  fullWidth?: boolean;
}

export interface CARequest {
  id: string;
  /** References a MOCK_USERS email. */
  vaEmail: string;
  /** References a MOCK_USERS email — the client the underlying agreement is with. */
  clientEmail: string;
  title: string;
  /** e.g. "December 10, 2025" — shown in the C&A list. */
  date: string;
  status: CARequestStatus;
  /** The client the underlying agreement is with, e.g. "LTM Innovation". */
  clientName: string;
  requestedBy: string;
  /** Who actually initiated the request — drives the client table's "Req By" column. */
  requestedByRole: 'va' | 'client';
  requestedDate: string;
  resolvedBy?: string;
  resolvedDate?: string;
  /** e.g. "8/17/2026 - 8/30/2026" — the invoice period this request's effect is applied to, once known. */
  appliedBillingPeriod?: string;
  /** The request-specific fields shown in its details view, 2 per row unless `fullWidth`. */
  details: CARequestDetail[];
  comments?: string;
}

const INITIAL_CA_REQUESTS: CARequest[] = [
  {
    id: 'ca-1',
    vaEmail: 'va@virtuallatinos.com',
    title: 'Request approval for short time off',
    date: 'December 10, 2025',
    status: 'new',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'December 10, 2025',
    details: [
      { label: 'Time Off Dates', value: '2025-12-10' },
      { label: 'Hours Off by Day', value: 'On 2025-12-10: 8 Hours' },
      { label: 'Description', value: 'I took a time off on Wednesday, December 10 as a Sick day' },
      { label: 'Total Days Off', value: '1' },
      { label: 'Total Hours Off', value: '8 hours', fullWidth: true },
    ],
    comments:
      "I want to take my last PTO (Sick day) to attend a medical procedure. I've already talked with Viridiana and Diana to inform them about my request and they agree.",
  },
  {
    id: 'ca-2',
    vaEmail: 'va@virtuallatinos.com',
    title: 'Request approval for extra hours',
    date: 'August 3, 2026',
    status: 'approved',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'August 3, 2026',
    resolvedBy: 'Erick Farias VL',
    resolvedDate: 'August 3, 2026',
    appliedBillingPeriod: '8/17/2026 - 8/30/2026',
    details: [
      { label: 'Approval Type', value: 'Manual' },
      { label: 'Total Extra Hours', value: '7 Hours' },
      { label: 'Pre-approved Hours', value: '5 Hours' },
      { label: 'Manual Approved', value: '2 Hours' },
      { label: 'Extra Hours Dates', value: '08/05/2026\n08/07/2026\n08/11/2026' },
      {
        label: 'Extra Hours by Day',
        value: 'On 08/05/2026: 1 Hour\nOn 08/07/2026: 2 Hours\nOn 08/11/2026: 2 Hours',
      },
      { label: 'Description', value: 'I worked 7 extra hours', fullWidth: true },
      {
        label: 'Agreement',
        value: 'VL-Agreement-Bloominari dba Virtual Latinos-Juan G.-2024-05-17 07:25:51',
      },
    ],
    comments:
      'I was working on the invoice project during the extra hours taken on august 5th, 7th and 11th',
  },
  {
    id: 'ca-3',
    vaEmail: 'va@virtuallatinos.com',
    title: 'Request approval for a raise',
    date: 'November 18, 2025',
    status: 'rejected',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'November 18, 2025',
    resolvedBy: 'Erick Farias VL',
    resolvedDate: 'November 18, 2025',
    details: [
      { label: 'Current Rate', value: '$11.00/hr' },
      { label: 'Requested Rate', value: '$13.00/hr' },
      { label: 'Reason', value: 'Increased scope of responsibilities', fullWidth: true },
    ],
    comments: 'Client declined the raise at this time; revisit next quarter.',
  },
  {
    id: 'ca-4',
    vaEmail: 'va@virtuallatinos.com',
    title: 'Request approval for a BOH package',
    date: 'October 30, 2025',
    status: 'expired',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'October 30, 2025',
    details: [
      { label: 'Package Type', value: 'Extra 10 hours/week' },
      { label: 'Requested Duration', value: '3 months' },
      { label: 'Reason', value: 'Support for new client onboarding', fullWidth: true },
    ],
    comments: 'Request expired without a response from the client.',
  },
];

/** Stand-in for a Changes & Approvals requests table — see MOCK_USERS' own doc comment for the pattern. */
export const MOCK_CA_REQUESTS: CARequest[] = INITIAL_CA_REQUESTS.map((request) => ({ ...request }));

/**
 * Restores the seed data — for tests/stories that resolve a request (a real
 * mutation, same as `resetPassword` in src/services/auth.ts) to avoid
 * leaking state into whatever runs next in the same session.
 */
export function resetMockCARequests(): void {
  MOCK_CA_REQUESTS.length = 0;
  MOCK_CA_REQUESTS.push(...INITIAL_CA_REQUESTS.map((request) => ({ ...request })));
}
