export type CARequestStatus = 'new' | 'approved' | 'rejected' | 'expired';

/** One week's worth of selected days, for the "Days Selected (with hours/day)" detail's collapsible per-week display. */
export interface CARequestDayGroup {
  /** e.g. "Week from Apr 6 to Apr 12, 2026". */
  weekLabel: string;
  /** e.g. "Wednesday 04-08-2026 (4 Hours)". */
  days: string[];
  /** Present when the agreement has pre-approved hours — shown as a tooltip on the week header. */
  hoursTooltip?: {
    /** Pre-approved hours remaining before this week's own reported hours are counted. */
    initialRemaining: number;
    /** This request's own reported hours falling in this week. */
    reported: number;
    /** Pre-approved hours remaining after subtracting `reported` from `initialRemaining`. */
    newRemaining: number;
  };
}

export interface CARequestDetail {
  label: string;
  /** Plain-text form of the value — kept even when `dayGroups` is set, as a flat fallback for any consumer that doesn't render the grouped view. */
  value: string;
  /** Spans both columns of the details grid instead of sharing a row. */
  fullWidth?: boolean;
  /** Present only on "Days Selected (with hours/day)" — when set, render sites show a collapsible per-week list (`CADayGroups`) instead of the plain `value` string. */
  dayGroups?: CARequestDayGroup[];
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
      { label: 'Total Extra Hours Reported', value: '15 Hours' },
      {
        label: 'Days Selected (with hours/day)',
        value: 'Tuesday 04-21-2026 (8 Hours)\nThursday 04-23-2026 (7 Hours)',
        dayGroups: [
          {
            weekLabel: 'Week from Apr 20 to Apr 26, 2026',
            days: ['Tuesday 04-21-2026 (8 Hours)', 'Thursday 04-23-2026 (7 Hours)'],
            hoursTooltip: { initialRemaining: 5, reported: 15, newRemaining: 0 },
          },
        ],
      },
      { label: 'Approval Type', value: 'Manual' },
      {
        label: 'Agreement',
        value: 'VL-Agreement-Bloominari dba Virtual Latinos-Elena R.-2025-04-28',
        fullWidth: true,
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
      { label: 'Total Extra Hours Reported', value: '7 Hours' },
      {
        label: 'Days Selected (with hours/day)',
        value: 'Wednesday 04-08-2026 (4 Hours)\nThursday 04-16-2026 (3 Hours)',
        dayGroups: [
          {
            weekLabel: 'Week from Apr 6 to Apr 12, 2026',
            days: ['Wednesday 04-08-2026 (4 Hours)'],
            hoursTooltip: { initialRemaining: 5, reported: 4, newRemaining: 1 },
          },
          {
            weekLabel: 'Week from Apr 13 to Apr 19, 2026',
            days: ['Thursday 04-16-2026 (3 Hours)'],
            hoursTooltip: { initialRemaining: 5, reported: 3, newRemaining: 2 },
          },
        ],
      },
      { label: 'Approval Type', value: 'Auto Approval' },
      {
        label: 'Agreement',
        value: 'VL-Agreement-Bloominari dba Virtual Latinos-Elena R.-2025-04-28',
        fullWidth: true,
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
      { label: 'Total Extra Hours Reported', value: '15 Hours' },
      {
        label: 'Days Selected (with hours/day)',
        value: 'Monday 05-18-2026 (9 Hours)\nWednesday 05-20-2026 (6 Hours)',
        dayGroups: [
          {
            weekLabel: 'Week from May 18 to May 24, 2026',
            days: ['Monday 05-18-2026 (9 Hours)', 'Wednesday 05-20-2026 (6 Hours)'],
            hoursTooltip: { initialRemaining: 5, reported: 15, newRemaining: 0 },
          },
        ],
      },
      { label: 'Approval Type', value: 'Manual' },
      {
        label: 'Agreement',
        value: 'VL-Agreement-Bloominari dba Virtual Latinos-Laura G.-2024-03-04',
        fullWidth: true,
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
      { label: 'Total Extra Hours Reported', value: '7 Hours' },
      {
        label: 'Days Selected (with hours/day)',
        value: 'Tuesday 05-05-2026 (3 Hours)\nWednesday 05-13-2026 (4 Hours)',
        dayGroups: [
          {
            weekLabel: 'Week from May 4 to May 10, 2026',
            days: ['Tuesday 05-05-2026 (3 Hours)'],
            hoursTooltip: { initialRemaining: 5, reported: 3, newRemaining: 2 },
          },
          {
            weekLabel: 'Week from May 11 to May 17, 2026',
            days: ['Wednesday 05-13-2026 (4 Hours)'],
            hoursTooltip: { initialRemaining: 5, reported: 4, newRemaining: 1 },
          },
        ],
      },
      { label: 'Approval Type', value: 'Auto Approval' },
      {
        label: 'Agreement',
        value: 'VL-Agreement-Bloominari dba Virtual Latinos-Laura G.-2024-03-04',
        fullWidth: true,
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
      { label: 'Total Extra Hours Reported', value: '15 Hours' },
      { label: 'Manual Approved Hours', value: '15 Hours' },
      {
        label: 'Days Selected (with hours/day)',
        value: 'Tuesday 02-17-2026 (8 Hours)\nThursday 02-19-2026 (7 Hours)',
        dayGroups: [
          {
            weekLabel: 'Week from Feb 16 to Feb 22, 2026',
            days: ['Tuesday 02-17-2026 (8 Hours)', 'Thursday 02-19-2026 (7 Hours)'],
            hoursTooltip: { initialRemaining: 0, reported: 15, newRemaining: 0 },
          },
        ],
      },
      { label: 'Approval Type', value: 'Manual' },
      {
        label: 'Agreement',
        value: 'VL-Agreement-Bloominari dba Virtual Latinos-Camila T.-2026-01-12',
        fullWidth: true,
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
      { label: 'Total Extra Hours Reported', value: '7 Hours' },
      {
        label: 'Days Selected (with hours/day)',
        value: 'Wednesday 02-04-2026 (4 Hours)\nThursday 02-12-2026 (3 Hours)',
        dayGroups: [
          {
            weekLabel: 'Week from Feb 2 to Feb 8, 2026',
            days: ['Wednesday 02-04-2026 (4 Hours)'],
            hoursTooltip: { initialRemaining: 0, reported: 4, newRemaining: 0 },
          },
          {
            weekLabel: 'Week from Feb 9 to Feb 15, 2026',
            days: ['Thursday 02-12-2026 (3 Hours)'],
            hoursTooltip: { initialRemaining: 0, reported: 3, newRemaining: 0 },
          },
        ],
      },
      { label: 'Approval Type', value: 'Manual' },
      {
        label: 'Agreement',
        value: 'VL-Agreement-Bloominari dba Virtual Latinos-Camila T.-2026-01-12',
        fullWidth: true,
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
