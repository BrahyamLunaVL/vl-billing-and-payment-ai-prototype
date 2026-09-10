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
  title: string;
  /** e.g. "December 10, 2025" — shown in the C&A list. */
  date: string;
  status: CARequestStatus;
  requestedBy: string;
  requestedDate: string;
  resolvedBy?: string;
  resolvedDate?: string;
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
    requestedBy: 'you',
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
    date: 'December 2, 2025',
    status: 'approved',
    requestedBy: 'you',
    requestedDate: 'December 2, 2025',
    resolvedBy: 'Javiera Mercado',
    resolvedDate: 'December 2, 2025',
    details: [
      { label: 'Extra Hours Date', value: '2025-12-01' },
      { label: 'Hours Requested', value: '4 Hours' },
      { label: 'Reason', value: 'Client requested urgent report delivery' },
      { label: 'Hourly Rate', value: '$11.00' },
      { label: 'Total Extra Pay', value: '$44.00', fullWidth: true },
    ],
    comments: 'Client approved the extra hours over email.',
  },
  {
    id: 'ca-3',
    vaEmail: 'va@virtuallatinos.com',
    title: 'Request approval for a raise',
    date: 'November 18, 2025',
    status: 'rejected',
    requestedBy: 'you',
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
    requestedBy: 'you',
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
