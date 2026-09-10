export type CARequestStatus = 'new' | 'approved' | 'rejected' | 'expired';

export interface CARequest {
  id: string;
  /** References a MOCK_USERS email. */
  vaEmail: string;
  title: string;
  /** e.g. "December 10, 2025". */
  date: string;
  status: CARequestStatus;
}

const INITIAL_CA_REQUESTS: CARequest[] = [
  { id: 'ca-1', vaEmail: 'va@virtuallatinos.com', title: 'Request approval for short time off', date: 'December 10, 2025', status: 'new' },
  { id: 'ca-2', vaEmail: 'va@virtuallatinos.com', title: 'Request approval for extra hours', date: 'December 2, 2025', status: 'approved' },
  { id: 'ca-3', vaEmail: 'va@virtuallatinos.com', title: 'Request approval for a raise', date: 'November 18, 2025', status: 'rejected' },
  { id: 'ca-4', vaEmail: 'va@virtuallatinos.com', title: 'Request approval for a BOH package', date: 'October 30, 2025', status: 'expired' },
];

/** Stand-in for a Changes & Approvals requests table — see MOCK_USERS' own doc comment for the pattern. */
export const MOCK_CA_REQUESTS: CARequest[] = INITIAL_CA_REQUESTS.map((request) => ({ ...request }));
