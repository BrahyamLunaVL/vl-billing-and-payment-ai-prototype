import type { WeekDayData } from '../components';

export type CARequestStatus = 'new' | 'approved' | 'rejected' | 'expired';

/** One week's worth of selected days, for the "Days Selected (with hours/day)" detail's collapsible per-week display. */
export interface CARequestDayGroup {
  /** e.g. "Week from Apr 6 to Apr 12, 2026". */
  weekLabel: string;
  /** e.g. "Wednesday 04-08-2026 (4 Hours)". */
  days: string[];
  /**
   * Present when the agreement has pre-approved hours — shown as a tooltip
   * on the week header. Deliberately doesn't store a "remaining" number:
   * `CADayGroups` derives it live from the request's *current* status (so
   * approving/rejecting a pending request updates the tooltip immediately,
   * unlike the other frozen-at-submission `details` fields).
   */
  hoursTooltip?: {
    /** Same value as the "Pre-approved Hours per week" detail. */
    preApprovedHoursPerWeek: number;
    /** Hours this VA's OTHER requests already reported in this week — the tooltip omits this row when 0. */
    takenByOtherRequests: number;
    /** This request's own reported hours falling in this week. */
    reportedInThisRequest: number;
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
  /** The agreement this request was submitted under. */
  agreementId?: string;
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
  /** Structured per-date hours for time-off requests, mirroring `extraHoursByDate` — used to flag dates a VA already requested time off for in an earlier request. */
  timeOffByDate?: { date: string; hours: number }[];
  /** Present only on "Request approval for changing base hours/week worked" — applied to the agreement's own `week`/`hoursPerWeek` once this request becomes approved (immediately, if auto-approved, or later when manually resolved). */
  newWeekSchedule?: WeekDayData[];
  newHoursPerWeek?: number;
}

/**
 * TEMP (offline V2 export): with "Request approval for extra hours" routed
 * to the generic placeholder on this branch, the seed data no longer
 * includes any extra-hours requests — every VA instead starts with one
 * resolved "time off" request and one resolved "change base hours" request
 * (matching the two request types `NewCARequestWizard` still fully builds
 * out on this branch).
 */
const INITIAL_CA_REQUESTS: CARequest[] = [
  {
    id: 'ca-1',
    vaEmail: 'va@virtuallatinos.com',
    agreementId: 'agr-1',
    title: 'Request approval for time off',
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
      { label: 'Request Type', value: 'Non-consecutive days' },
      { label: 'Paid or Non-Paid', value: 'Non-Paid' },
      { label: 'Total Hours Requested', value: '15 Hours' },
      { label: 'Total Days Requested', value: '2 Days' },
      {
        label: 'Dates Requested',
        value: 'Tuesday 04-21-2026 (8 Hours)\nThursday 04-23-2026 (7 Hours)',
        fullWidth: true,
      },
    ],
    comments: 'Family event, requesting unpaid time off those two days.',
    timeOffByDate: [
      { date: '2026-04-21', hours: 8 },
      { date: '2026-04-23', hours: 7 },
    ],
  },
  {
    id: 'ca-2',
    vaEmail: 'va@virtuallatinos.com',
    agreementId: 'agr-1',
    title: 'Request approval for changing base hours/week worked',
    date: 'April 20, 2026',
    status: 'approved',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'Bloominari dba Virtual Latinos',
    requestedBy: 'you',
    requestedByRole: 'client',
    requestedDate: 'April 20, 2026',
    resolvedBy: 'Auto-Approval System',
    resolvedDate: '4/20/2026',
    appliedBillingPeriod: '4/20/2026 - 5/3/2026',
    details: [
      { label: 'Current Base Hours/Week', value: '40 Hours/week' },
      { label: 'New Base Hours/Week', value: '32 Hours/week' },
      {
        label: 'New Weekly Schedule',
        value: 'Monday: 8 hrs\nTuesday: 8 hrs\nWednesday: 8 hrs\nThursday: 8 hrs',
        fullWidth: true,
      },
      { label: 'First Effective Day', value: 'Monday 04-27-2026', fullWidth: true },
    ],
    comments: 'Reducing days to 4 per week going forward.',
    newWeekSchedule: [
      { key: 'mon', dayLetter: 'M', value: '8 hrs' },
      { key: 'tue', dayLetter: 'T', value: '8 hrs' },
      { key: 'wed', dayLetter: 'W', value: '8 hrs' },
      { key: 'thu', dayLetter: 'T', value: '8 hrs' },
      { key: 'fri', dayLetter: 'F', value: '0 hrs', disabled: true },
      { key: 'sat', dayLetter: 'S', value: '0 hrs', disabled: true },
      { key: 'sun', dayLetter: 'S', value: '0 hrs', disabled: true },
    ],
    newHoursPerWeek: 32,
  },
  {
    id: 'ca-3',
    vaEmail: 'va2@virtuallatinos.com',
    agreementId: 'agr-5',
    title: 'Request approval for time off',
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
      { label: 'Request Type', value: 'Non-consecutive days' },
      { label: 'Paid or Non-Paid', value: 'Paid' },
      { label: 'Total Hours Requested', value: '15 Hours' },
      { label: 'Total Days Requested', value: '2 Days' },
      {
        label: 'Dates Requested',
        value: 'Monday 05-18-2026 (9 Hours)\nWednesday 05-20-2026 (6 Hours)',
        fullWidth: true,
      },
    ],
    comments: 'Taking partial days off to handle a personal matter.',
    timeOffByDate: [
      { date: '2026-05-18', hours: 9 },
      { date: '2026-05-20', hours: 6 },
    ],
  },
  {
    id: 'ca-4',
    vaEmail: 'va2@virtuallatinos.com',
    agreementId: 'agr-5',
    title: 'Request approval for changing base hours/week worked',
    date: 'May 18, 2026',
    status: 'approved',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'Bloominari dba Virtual Latinos',
    requestedBy: 'you',
    requestedByRole: 'client',
    requestedDate: 'May 18, 2026',
    resolvedBy: 'Auto-Approval System',
    resolvedDate: '5/18/2026',
    appliedBillingPeriod: '5/18/2026 - 5/31/2026',
    details: [
      { label: 'Current Base Hours/Week', value: '40 Hours/week' },
      { label: 'New Base Hours/Week', value: '24 Hours/week' },
      {
        label: 'New Weekly Schedule',
        value: 'Monday: 8 hrs\nWednesday: 8 hrs\nFriday: 8 hrs',
        fullWidth: true,
      },
      { label: 'First Effective Day', value: 'Monday 05-25-2026', fullWidth: true },
    ],
    comments: 'Switching to a 3-day part-time schedule.',
    newWeekSchedule: [
      { key: 'mon', dayLetter: 'M', value: '8 hrs' },
      { key: 'tue', dayLetter: 'T', value: '0 hrs', disabled: true },
      { key: 'wed', dayLetter: 'W', value: '8 hrs' },
      { key: 'thu', dayLetter: 'T', value: '0 hrs', disabled: true },
      { key: 'fri', dayLetter: 'F', value: '8 hrs' },
      { key: 'sat', dayLetter: 'S', value: '0 hrs', disabled: true },
      { key: 'sun', dayLetter: 'S', value: '0 hrs', disabled: true },
    ],
    newHoursPerWeek: 24,
  },
  {
    id: 'ca-5',
    vaEmail: 'va-no-hours@virtuallatinos.com',
    agreementId: 'agr-3',
    title: 'Request approval for changing base hours/week worked',
    date: 'February 23, 2026',
    status: 'approved',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'Bloominari dba Virtual Latinos',
    requestedBy: 'you',
    requestedByRole: 'client',
    requestedDate: 'February 23, 2026',
    resolvedBy: 'Auto-Approval System',
    resolvedDate: '2/23/2026',
    appliedBillingPeriod: '2/23/2026 - 3/8/2026',
    details: [
      { label: 'Current Base Hours/Week', value: '40 Hours/week' },
      { label: 'New Base Hours/Week', value: '20 Hours/week' },
      {
        label: 'New Weekly Schedule',
        value: 'Monday: 5 hrs\nTuesday: 5 hrs\nWednesday: 5 hrs\nThursday: 5 hrs',
        fullWidth: true,
      },
      { label: 'First Effective Day', value: 'Monday 03-02-2026', fullWidth: true },
    ],
    comments: 'Reducing weekly commitment per new availability.',
    newWeekSchedule: [
      { key: 'mon', dayLetter: 'M', value: '5 hrs' },
      { key: 'tue', dayLetter: 'T', value: '5 hrs' },
      { key: 'wed', dayLetter: 'W', value: '5 hrs' },
      { key: 'thu', dayLetter: 'T', value: '5 hrs' },
      { key: 'fri', dayLetter: 'F', value: '0 hrs', disabled: true },
      { key: 'sat', dayLetter: 'S', value: '0 hrs', disabled: true },
      { key: 'sun', dayLetter: 'S', value: '0 hrs', disabled: true },
    ],
    newHoursPerWeek: 20,
  },
  {
    id: 'ca-6',
    vaEmail: 'va-no-hours@virtuallatinos.com',
    agreementId: 'agr-3',
    title: 'Request approval for time off',
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
      { label: 'Request Type', value: 'Non-consecutive days' },
      { label: 'Paid or Non-Paid', value: 'Non-Paid' },
      { label: 'Total Hours Requested', value: '7 Hours' },
      { label: 'Total Days Requested', value: '2 Days' },
      {
        label: 'Dates Requested',
        value: 'Wednesday 02-04-2026 (4 Hours)\nThursday 02-12-2026 (3 Hours)',
        fullWidth: true,
      },
    ],
    comments: "This agreement doesn't have pre-approved hours yet, so time off needs the client's review.",
    timeOffByDate: [
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
