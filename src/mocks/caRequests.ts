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
  /**
   * Structured per-date hours for extra-hours requests, used to compute
   * already-taken hours per week. The free-text "Days Selected" detail line
   * above stays as-is for the details view — this is a parallel, typed
   * source for the per-week pre-approved-hours math.
   */
  extraHoursByDate?: { date: string; hours: number }[];
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
    vaEmail: 'va2@virtuallatinos.com',
    title: 'Request approval for short time off',
    date: 'September 15, 2026',
    status: 'new',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'September 15, 2026',
    details: [
      { label: 'Time Off Dates', value: '2026-09-18' },
      { label: 'Hours Off by Day', value: 'On 2026-09-18: 8 Hours' },
      { label: 'Description', value: 'Taking Friday off for a family event' },
      { label: 'Total Days Off', value: '1' },
      { label: 'Total Hours Off', value: '8 hours', fullWidth: true },
    ],
    comments: "It's my sister's graduation and I'd like to attend in person.",
  },
  {
    id: 'ca-3',
    vaEmail: 'va-no-hours@virtuallatinos.com',
    title: 'Request approval for short time off',
    date: 'September 10, 2026',
    status: 'new',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'September 10, 2026',
    details: [
      { label: 'Time Off Dates', value: '2026-09-14' },
      { label: 'Hours Off by Day', value: 'On 2026-09-14: 4 Hours' },
      { label: 'Description', value: 'Half day off for a doctor appointment' },
      { label: 'Total Days Off', value: '1' },
      { label: 'Total Hours Off', value: '4 hours', fullWidth: true },
    ],
    comments: 'Routine checkup, back online by early afternoon.',
  },
  {
    id: 'ca-4',
    vaEmail: 'va-requested@virtuallatinos.com',
    title: 'Request approval for short time off',
    date: 'September 12, 2026',
    status: 'new',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'September 12, 2026',
    details: [
      { label: 'Time Off Dates', value: '2026-09-17' },
      { label: 'Hours Off by Day', value: 'On 2026-09-17: 8 Hours' },
      { label: 'Description', value: 'Moving to a new apartment' },
      { label: 'Total Days Off', value: '1' },
      { label: 'Total Hours Off', value: '8 hours', fullWidth: true },
    ],
    comments: 'Move-in day for my new place, will be unreachable most of the day.',
  },
  {
    id: 'ca-5',
    vaEmail: 'va@virtuallatinos.com',
    title: 'Request approval for extra hours',
    date: 'April 27, 2026',
    status: 'approved',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'April 27, 2026',
    resolvedBy: 'Erick Farias VL',
    resolvedDate: 'April 27, 2026',
    appliedBillingPeriod: '4/27/2026 - 5/10/2026',
    details: [
      { label: 'Pre-approved Hours', value: '5 Hours' },
      { label: 'Total Extra Hours', value: '15 Hours' },
      { label: 'Manual Approved Hours', value: '10 Hours' },
      {
        label: 'Days Selected (with hours/day)',
        value: 'Tuesday 2026-04-21 (8 Hrs)\nThursday 2026-04-23 (7 Hrs)',
      },
      { label: 'Approval Type', value: 'Manual' },
      {
        label: 'Agreement',
        value: 'VL-Agreement-Bloominari dba Virtual Latinos-Elena R.-2025-04-28',
      },
    ],
    comments: 'Covered for a teammate out sick, worked extra to keep the deliverable on track.',
    extraHoursByDate: [
      { date: '2026-04-21', hours: 8 },
      { date: '2026-04-23', hours: 7 },
    ],
  },
  {
    id: 'ca-6',
    vaEmail: 'va@virtuallatinos.com',
    title: 'Request approval for extra hours',
    date: 'April 20, 2026',
    status: 'approved',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'April 20, 2026',
    resolvedBy: 'Erick Farias VL',
    resolvedDate: 'April 20, 2026',
    appliedBillingPeriod: '4/20/2026 - 5/3/2026',
    details: [
      { label: 'Pre-approved Hours', value: '5 Hours' },
      { label: 'Total Extra Hours', value: '7 Hours' },
      {
        label: 'Days Selected (with hours/day)',
        value: 'Wednesday 2026-04-08 (4 Hrs)\nThursday 2026-04-16 (3 Hrs)',
      },
      { label: 'Approval Type', value: 'Auto Approval' },
      {
        label: 'Agreement',
        value: 'VL-Agreement-Bloominari dba Virtual Latinos-Elena R.-2025-04-28',
      },
    ],
    comments: 'Worked ahead on the client deliverable within my pre-approved weekly hours.',
    extraHoursByDate: [
      { date: '2026-04-08', hours: 4 },
      { date: '2026-04-16', hours: 3 },
    ],
  },
  {
    id: 'ca-7',
    vaEmail: 'va@virtuallatinos.com',
    title: 'Request approval for extra hours',
    date: 'May 4, 2026',
    status: 'rejected',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'May 4, 2026',
    resolvedBy: 'Erick Farias VL',
    resolvedDate: 'May 4, 2026',
    appliedBillingPeriod: '5/4/2026 - 5/17/2026',
    details: [
      { label: 'Pre-approved Hours', value: '5 Hours' },
      { label: 'Total Extra Hours', value: '6 Hours' },
      { label: 'Days Selected (with hours/day)', value: 'Wednesday 2026-04-29 (6 Hrs)' },
      { label: 'Approval Type', value: 'Manual' },
      {
        label: 'Agreement',
        value: 'VL-Agreement-Bloominari dba Virtual Latinos-Elena R.-2025-04-28',
      },
    ],
    comments: 'One-off deadline push — client declined since it fell outside the review window.',
    extraHoursByDate: [{ date: '2026-04-29', hours: 6 }],
  },
  {
    id: 'ca-8',
    vaEmail: 'va2@virtuallatinos.com',
    title: 'Request approval for extra hours',
    date: 'May 25, 2026',
    status: 'approved',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'May 25, 2026',
    resolvedBy: 'Erick Farias VL',
    resolvedDate: 'May 25, 2026',
    appliedBillingPeriod: '5/25/2026 - 6/7/2026',
    details: [
      { label: 'Pre-approved Hours', value: '5 Hours' },
      { label: 'Total Extra Hours', value: '15 Hours' },
      { label: 'Manual Approved Hours', value: '10 Hours' },
      {
        label: 'Days Selected (with hours/day)',
        value: 'Monday 2026-05-18 (9 Hrs)\nWednesday 2026-05-20 (6 Hrs)',
      },
      { label: 'Approval Type', value: 'Manual' },
      {
        label: 'Agreement',
        value: 'VL-Agreement-Bloominari dba Virtual Latinos-Laura G.-2024-03-04',
      },
    ],
    comments: 'Picked up extra hours to cover a client launch week.',
    extraHoursByDate: [
      { date: '2026-05-18', hours: 9 },
      { date: '2026-05-20', hours: 6 },
    ],
  },
  {
    id: 'ca-9',
    vaEmail: 'va2@virtuallatinos.com',
    title: 'Request approval for extra hours',
    date: 'May 18, 2026',
    status: 'approved',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'May 18, 2026',
    resolvedBy: 'Erick Farias VL',
    resolvedDate: 'May 18, 2026',
    appliedBillingPeriod: '5/18/2026 - 5/31/2026',
    details: [
      { label: 'Pre-approved Hours', value: '5 Hours' },
      { label: 'Total Extra Hours', value: '7 Hours' },
      {
        label: 'Days Selected (with hours/day)',
        value: 'Tuesday 2026-05-05 (3 Hrs)\nWednesday 2026-05-13 (4 Hrs)',
      },
      { label: 'Approval Type', value: 'Auto Approval' },
      {
        label: 'Agreement',
        value: 'VL-Agreement-Bloominari dba Virtual Latinos-Laura G.-2024-03-04',
      },
    ],
    comments: 'Stayed a little late two days to finish a report ahead of schedule.',
    extraHoursByDate: [
      { date: '2026-05-05', hours: 3 },
      { date: '2026-05-13', hours: 4 },
    ],
  },
  {
    id: 'ca-10',
    vaEmail: 'va2@virtuallatinos.com',
    title: 'Request approval for extra hours',
    date: 'June 1, 2026',
    status: 'rejected',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'June 1, 2026',
    resolvedBy: 'Erick Farias VL',
    resolvedDate: 'June 1, 2026',
    appliedBillingPeriod: '6/1/2026 - 6/14/2026',
    details: [
      { label: 'Pre-approved Hours', value: '5 Hours' },
      { label: 'Total Extra Hours', value: '8 Hours' },
      { label: 'Days Selected (with hours/day)', value: 'Thursday 2026-05-28 (8 Hrs)' },
      { label: 'Approval Type', value: 'Manual' },
      {
        label: 'Agreement',
        value: 'VL-Agreement-Bloominari dba Virtual Latinos-Laura G.-2024-03-04',
      },
    ],
    comments: 'Requested for an unplanned data migration; client asked to keep it within scope next time.',
    extraHoursByDate: [{ date: '2026-05-28', hours: 8 }],
  },
  {
    id: 'ca-11',
    vaEmail: 'va-no-hours@virtuallatinos.com',
    title: 'Request approval for extra hours',
    date: 'February 23, 2026',
    status: 'approved',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'February 23, 2026',
    resolvedBy: 'Erick Farias VL',
    resolvedDate: 'February 23, 2026',
    appliedBillingPeriod: '2/23/2026 - 3/8/2026',
    details: [
      { label: 'Pre-approved Hours', value: '0 Hours' },
      { label: 'Total Extra Hours', value: '15 Hours' },
      { label: 'Manual Approved Hours', value: '15 Hours' },
      {
        label: 'Days Selected (with hours/day)',
        value: 'Tuesday 2026-02-17 (8 Hrs)\nThursday 2026-02-19 (7 Hrs)',
      },
      { label: 'Approval Type', value: 'Manual' },
      {
        label: 'Agreement',
        value: 'VL-Agreement-Bloominari dba Virtual Latinos-Camila T.-2026-01-12',
      },
    ],
    comments: 'Covered extra shifts while the team was short-staffed that week.',
    extraHoursByDate: [
      { date: '2026-02-17', hours: 8 },
      { date: '2026-02-19', hours: 7 },
    ],
  },
  {
    id: 'ca-12',
    vaEmail: 'va-no-hours@virtuallatinos.com',
    title: 'Request approval for extra hours',
    date: 'February 16, 2026',
    status: 'approved',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'February 16, 2026',
    resolvedBy: 'Erick Farias VL',
    resolvedDate: 'February 16, 2026',
    appliedBillingPeriod: '2/16/2026 - 3/1/2026',
    details: [
      { label: 'Pre-approved Hours', value: '0 Hours' },
      { label: 'Total Extra Hours', value: '7 Hours' },
      { label: 'Manual Approved Hours', value: '7 Hours' },
      {
        label: 'Days Selected (with hours/day)',
        value: 'Wednesday 2026-02-04 (4 Hrs)\nThursday 2026-02-12 (3 Hrs)',
      },
      { label: 'Approval Type', value: 'Manual' },
      {
        label: 'Agreement',
        value: 'VL-Agreement-Bloominari dba Virtual Latinos-Camila T.-2026-01-12',
      },
    ],
    comments: "This agreement doesn't have pre-approved hours yet, so every extra hour needs the client's review.",
    extraHoursByDate: [
      { date: '2026-02-04', hours: 4 },
      { date: '2026-02-12', hours: 3 },
    ],
  },
  {
    id: 'ca-13',
    vaEmail: 'va-no-hours@virtuallatinos.com',
    title: 'Request approval for extra hours',
    date: 'March 2, 2026',
    status: 'rejected',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'March 2, 2026',
    resolvedBy: 'Erick Farias VL',
    resolvedDate: 'March 2, 2026',
    appliedBillingPeriod: '3/2/2026 - 3/15/2026',
    details: [
      { label: 'Pre-approved Hours', value: '0 Hours' },
      { label: 'Total Extra Hours', value: '6 Hours' },
      { label: 'Days Selected (with hours/day)', value: 'Wednesday 2026-02-25 (6 Hrs)' },
      { label: 'Approval Type', value: 'Manual' },
      {
        label: 'Agreement',
        value: 'VL-Agreement-Bloominari dba Virtual Latinos-Camila T.-2026-01-12',
      },
    ],
    comments: 'Client asked to hold off until pre-approved hours are set up on this agreement.',
    extraHoursByDate: [{ date: '2026-02-25', hours: 6 }],
  },
  {
    id: 'ca-14',
    vaEmail: 'va-requested@virtuallatinos.com',
    title: 'Request approval for extra hours',
    date: 'March 23, 2026',
    status: 'approved',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'March 23, 2026',
    resolvedBy: 'Erick Farias VL',
    resolvedDate: 'March 23, 2026',
    appliedBillingPeriod: '3/23/2026 - 4/5/2026',
    details: [
      { label: 'Pre-approved Hours', value: '5 Hours' },
      { label: 'Total Extra Hours', value: '15 Hours' },
      { label: 'Manual Approved Hours', value: '10 Hours' },
      {
        label: 'Days Selected (with hours/day)',
        value: 'Monday 2026-03-16 (9 Hrs)\nWednesday 2026-03-18 (6 Hrs)',
      },
      { label: 'Approval Type', value: 'Manual' },
      {
        label: 'Agreement',
        value: 'VL-Agreement-Bloominari dba Virtual Latinos-Andres R.-2026-02-18',
      },
    ],
    comments: 'Took on extra hours to help onboard a new client integration.',
    extraHoursByDate: [
      { date: '2026-03-16', hours: 9 },
      { date: '2026-03-18', hours: 6 },
    ],
  },
  {
    id: 'ca-15',
    vaEmail: 'va-requested@virtuallatinos.com',
    title: 'Request approval for extra hours',
    date: 'March 16, 2026',
    status: 'approved',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'March 16, 2026',
    resolvedBy: 'Erick Farias VL',
    resolvedDate: 'March 16, 2026',
    appliedBillingPeriod: '3/16/2026 - 3/29/2026',
    details: [
      { label: 'Pre-approved Hours', value: '5 Hours' },
      { label: 'Total Extra Hours', value: '7 Hours' },
      {
        label: 'Days Selected (with hours/day)',
        value: 'Tuesday 2026-03-03 (2 Hrs)\nWednesday 2026-03-11 (5 Hrs)',
      },
      { label: 'Approval Type', value: 'Auto Approval' },
      {
        label: 'Agreement',
        value: 'VL-Agreement-Bloominari dba Virtual Latinos-Andres R.-2026-02-18',
      },
    ],
    comments: 'Reported extra hours from two different weeks, both within my pre-approved amount.',
    extraHoursByDate: [
      { date: '2026-03-03', hours: 2 },
      { date: '2026-03-11', hours: 5 },
    ],
  },
  {
    id: 'ca-16',
    vaEmail: 'va-requested@virtuallatinos.com',
    title: 'Request approval for extra hours',
    date: 'March 30, 2026',
    status: 'rejected',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'March 30, 2026',
    resolvedBy: 'Erick Farias VL',
    resolvedDate: 'March 30, 2026',
    appliedBillingPeriod: '3/30/2026 - 4/12/2026',
    details: [
      { label: 'Pre-approved Hours', value: '5 Hours' },
      { label: 'Total Extra Hours', value: '7 Hours' },
      { label: 'Days Selected (with hours/day)', value: 'Thursday 2026-03-26 (7 Hrs)' },
      { label: 'Approval Type', value: 'Manual' },
      {
        label: 'Agreement',
        value: 'VL-Agreement-Bloominari dba Virtual Latinos-Andres R.-2026-02-18',
      },
    ],
    comments: 'Client declined — the extra hours overlapped with a planned time-off day.',
    extraHoursByDate: [{ date: '2026-03-26', hours: 7 }],
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
