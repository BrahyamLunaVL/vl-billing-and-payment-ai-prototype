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

/**
 * Every VA starts with exactly 2 resolved extra-hours requests (one
 * approved, one rejected) — no pending ("new") ones. Pending requests are
 * created live through the wizard (`createExtraHoursCARequest`) as part of
 * whatever's being tested, since only one can be active per VA at a time.
 */
const INITIAL_CA_REQUESTS: CARequest[] = [
  {
    id: 'ca-1',
    vaEmail: 'va@virtuallatinos.com',
    title: 'Request approval for extra hours',
    date: 'April 27, 2026',
    status: 'rejected',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'April 27, 2026',
    resolvedBy: 'Erick Farias VL',
    resolvedDate: 'April 27, 2026',
    appliedBillingPeriod: '4/27/2026 - 5/10/2026',
    details: [
      { label: 'Pre-approved Hours per week', value: '5 Hours' },
      {
        label: 'Remaining Pre-approved Hours',
        value: 'Week from Apr 20 to Apr 26, 2026: 5 Hours',
        fullWidth: true,
      },
      { label: 'Total Extra Hours Reported', value: '15 Hours' },
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
    id: 'ca-2',
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
      { label: 'Pre-approved Hours per week', value: '5 Hours' },
      {
        label: 'Remaining Pre-approved Hours',
        value: 'Week from Apr 6 to Apr 12, 2026: 1 Hours\nWeek from Apr 13 to Apr 19, 2026: 2 Hours',
        fullWidth: true,
      },
      { label: 'Total Extra Hours Reported', value: '7 Hours' },
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
    id: 'ca-3',
    vaEmail: 'va2@virtuallatinos.com',
    title: 'Request approval for extra hours',
    date: 'May 25, 2026',
    status: 'rejected',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'May 25, 2026',
    resolvedBy: 'Erick Farias VL',
    resolvedDate: 'May 25, 2026',
    appliedBillingPeriod: '5/25/2026 - 6/7/2026',
    details: [
      { label: 'Pre-approved Hours per week', value: '5 Hours' },
      {
        label: 'Remaining Pre-approved Hours',
        value: 'Week from May 18 to May 24, 2026: 5 Hours',
        fullWidth: true,
      },
      { label: 'Total Extra Hours Reported', value: '15 Hours' },
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
    id: 'ca-4',
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
      { label: 'Pre-approved Hours per week', value: '5 Hours' },
      {
        label: 'Remaining Pre-approved Hours',
        value: 'Week from May 4 to May 10, 2026: 2 Hours\nWeek from May 11 to May 17, 2026: 1 Hours',
        fullWidth: true,
      },
      { label: 'Total Extra Hours Reported', value: '7 Hours' },
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
    id: 'ca-5',
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
      { label: 'Pre-approved Hours per week', value: '0 Hours' },
      {
        label: 'Remaining Pre-approved Hours',
        value: 'Week from Feb 16 to Feb 22, 2026: 0 Hours',
        fullWidth: true,
      },
      { label: 'Total Extra Hours Reported', value: '15 Hours' },
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
    id: 'ca-6',
    vaEmail: 'va-no-hours@virtuallatinos.com',
    title: 'Request approval for extra hours',
    date: 'February 16, 2026',
    status: 'rejected',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: 'va',
    requestedDate: 'February 16, 2026',
    resolvedBy: 'Erick Farias VL',
    resolvedDate: 'February 16, 2026',
    appliedBillingPeriod: '2/16/2026 - 3/1/2026',
    details: [
      { label: 'Pre-approved Hours per week', value: '0 Hours' },
      {
        label: 'Remaining Pre-approved Hours',
        value: 'Week from Feb 2 to Feb 8, 2026: 0 Hours\nWeek from Feb 9 to Feb 15, 2026: 0 Hours',
        fullWidth: true,
      },
      { label: 'Total Extra Hours Reported', value: '7 Hours' },
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
