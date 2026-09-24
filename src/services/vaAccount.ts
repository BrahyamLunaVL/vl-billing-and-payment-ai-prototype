import type { ChipTone } from '../components';
import { MOCK_VA_PROFILES, type VAProfile } from '../mocks/vaProfiles';
import { MOCK_AGREEMENTS, type Agreement, type AgreementStatus } from '../mocks/agreements';
import { MOCK_CA_REQUESTS, type CARequest, type CARequestStatus, type CARequestDetail } from '../mocks/caRequests';
import { MOCK_USERS } from '../mocks/users';
import { MOCK_INVOICES, groupInvoiceItems, type InvoiceRecord, type InvoiceGroupView, type InvoiceStatus } from '../mocks/invoices';

export type { VAProfile } from '../mocks/vaProfiles';
export type { Agreement, AgreementStatus } from '../mocks/agreements';
export type { CARequest, CARequestStatus, CARequestDetail } from '../mocks/caRequests';
export type { InvoiceRecord, InvoiceLineItemData, InvoiceGroupView, InvoiceStatus } from '../mocks/invoices';

/** Shared status -> display label/color mappings, so every screen that shows one of these statuses agrees. */
export const AGREEMENT_STATUS_LABEL: Record<AgreementStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
};

export const AGREEMENT_STATUS_TONE: Record<AgreementStatus, ChipTone> = {
  active: 'blue',
  inactive: 'red',
};

export const CA_STATUS_LABEL: Record<CARequestStatus, string> = {
  new: 'New',
  approved: 'Approved',
  rejected: 'Rejected',
  expired: 'Expired',
};

export const CA_STATUS_TONE: Record<CARequestStatus, ChipTone> = {
  new: 'purple',
  approved: 'blue',
  rejected: 'red',
  expired: 'red',
};

/** Admin's "Invoice Status" chip — the VA's own View Invoice always hardcodes "Preview" instead of reading this. */
export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  due: 'Due',
  paid: 'Paid',
  preview: 'Preview',
};

export const INVOICE_STATUS_TONE: Record<InvoiceStatus, ChipTone> = {
  due: 'gray',
  paid: 'blue',
  preview: 'blue',
};

/**
 * Everything a VA's "My Account" screen needs, keyed off the same email
 * `login()` already returns — none of these mock files know about each
 * other's fields (the VA's name/photo still only lives in src/mocks/users.ts).
 */
export function getVAProfile(email: string): VAProfile | undefined {
  return MOCK_VA_PROFILES.find((profile) => profile.email === email);
}

export function getAgreementsForVA(email: string): Agreement[] {
  return MOCK_AGREEMENTS.filter((agreement) => agreement.vaEmail === email);
}

function parseRequestedDate(request: CARequest): number {
  const parsed = Date.parse(request.requestedDate);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Newest-first by creation date (`requestedDate`) — resolving a request
 * (approve/reject) never changes its position, only creating one does.
 * Same-day ties keep their relative array order (stable sort), which is why
 * `createExtraHoursCARequest` unshifts new requests onto the front of
 * `MOCK_CA_REQUESTS` instead of pushing them.
 */
export function sortCARequestsByRecency<T extends CARequest>(requests: T[]): T[] {
  return [...requests].sort((a, b) => parseRequestedDate(b) - parseRequestedDate(a));
}

export function getCARequestsForVA(email: string): CARequest[] {
  return sortCARequestsByRecency(MOCK_CA_REQUESTS.filter((request) => request.vaEmail === email));
}

export function getCARequestById(id: string): CARequest | undefined {
  return MOCK_CA_REQUESTS.find((request) => request.id === id);
}

/** The Monday–Sunday week containing an ISO date, matching Calendar's own Monday-first grid. */
export function getWeekRange(dateISO: string): { start: string; end: string } {
  const [year, month, day] = dateISO.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const daysSinceMonday = (date.getDay() + 6) % 7;
  const start = new Date(date);
  start.setDate(start.getDate() - daysSinceMonday);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const toISO = (value: Date) =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;

  return { start: toISO(start), end: toISO(end) };
}

/**
 * Hours already taken in [weekStartISO, weekEndISO] from this VA's
 * *approved* extra-hours requests (`extraHoursByDate`). Scoped to the VA,
 * not a specific agreement — this prototype's mock data only has one VA/one
 * active agreement in play, so this is a reasonable simplification.
 * Rejected/expired/pending ("new") requests don't count — they never
 * consumed the allowance.
 */
export function getExtraHoursTakenForWeek(vaEmail: string, weekStartISO: string, weekEndISO: string): number {
  return MOCK_CA_REQUESTS.filter((request) => request.vaEmail === vaEmail && request.status === 'approved')
    .flatMap((request) => request.extraHoursByDate ?? [])
    .filter((entry) => entry.date >= weekStartISO && entry.date <= weekEndISO)
    .reduce((sum, entry) => sum + entry.hours, 0);
}

function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export interface WeekGroup {
  start: string;
  end: string;
  dates: string[];
  enteredHours: number;
  takenHours: number;
  remainingHours: number;
  /** True once this week falls further back than the agreement's own
   *  auto-approval period (`reportBackWeeks`) — still selectable up to the
   *  wizard's own lookback ceiling, just no longer auto-approvable. */
  isOutsidePeriod: boolean;
}

/**
 * Buckets a set of selected extra-hours dates into Monday–Sunday weeks, each
 * with its own pre-approved-hours math — the allowance resets every week, so
 * "taken" (from prior approved requests) and "remaining" only make sense per
 * week, not as a single total across a multi-week selection. Shared by the
 * wizard (to render its per-week cards/alerts) and `createExtraHoursCARequest`
 * (to decide auto- vs manual-approval on submit), so both always agree.
 */
export function buildWeekGroups(
  selectedDates: string[],
  hoursByDate: Record<string, number>,
  vaEmail: string,
  preApprovedHours: number,
  reportBackWeeks: number,
  maxDate: string,
): WeekGroup[] {
  const byWeekStart = new Map<string, WeekGroup>();
  const currentWeekStart = getWeekRange(maxDate).start;

  for (const date of selectedDates) {
    const { start, end } = getWeekRange(date);
    let group = byWeekStart.get(start);
    if (!group) {
      const takenHours = getExtraHoursTakenForWeek(vaEmail, start, end);
      const weeksAgo = Math.round(
        (parseISODate(currentWeekStart).getTime() - parseISODate(start).getTime()) / (7 * 24 * 60 * 60 * 1000),
      );
      group = {
        start,
        end,
        dates: [],
        enteredHours: 0,
        takenHours,
        remainingHours: Math.max(0, preApprovedHours - takenHours),
        isOutsidePeriod: weeksAgo >= reportBackWeeks,
      };
      byWeekStart.set(start, group);
    }
    group.dates.push(date);
    group.enteredHours += hoursByDate[date] ?? 0;
  }

  return [...byWeekStart.values()].sort((a, b) => a.start.localeCompare(b.start));
}

function nextCARequestId(): string {
  const maxNum = MOCK_CA_REQUESTS.reduce((max, request) => {
    const match = /^ca-(\d+)$/.exec(request.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `ca-${maxNum + 1}`;
}

function formatWeekdayISO(dateISO: string): string {
  const weekday = parseISODate(dateISO).toLocaleDateString('en-US', { weekday: 'long' });
  return `${weekday} ${dateISO}`;
}

/** "Elena Ruiz" -> "Elena R." — matches the short-name style already used in the "Agreement" detail line. */
function shortenVAName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

/** "4/28/2025" -> "2025-04-28", matching the ISO suffix on existing "Agreement" detail values. */
function slashDateToISO(mdy: string): string {
  const [month, day, year] = mdy.split('/').map(Number);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * "Remaining Pre-approved Hours" broken out per week — one line per week
 * this request's own selected dates actually fall into (not every week in
 * the lookback window), oldest first. A frozen snapshot computed once at
 * submission time, like every other `details` field — it does not update
 * if resolved later or if other requests change the VA's balance afterward.
 */
function buildRemainingPreApprovedHoursBreakdown(
  vaEmail: string,
  preApprovedHours: number,
  selectedDates: string[],
  hoursByDate: Record<string, number>,
  countOwnHours: boolean,
): string {
  const weekStarts = [...new Set(selectedDates.map((date) => getWeekRange(date).start))].sort();

  return weekStarts
    .map((weekStartISO) => {
      const weekStart = parseISODate(weekStartISO);
      const weekEnd = addDays(weekStart, 6);
      const weekEndISO = toISODate(weekEnd);

      let taken = getExtraHoursTakenForWeek(vaEmail, weekStartISO, weekEndISO);
      if (countOwnHours) {
        taken += Object.entries(hoursByDate)
          .filter(([date]) => date >= weekStartISO && date <= weekEndISO)
          .reduce((sum, [, hours]) => sum + hours, 0);
      }
      const remaining = Math.max(0, preApprovedHours - taken);
      return `Week from ${formatShortDate(weekStart)} to ${formatShortDate(weekEnd)}, ${weekEnd.getFullYear()}: ${remaining} Hours`;
    })
    .join('\n');
}

export interface CreateExtraHoursRequestInput {
  vaEmail: string;
  agreementId: string;
  selectedDates: string[];
  hoursByDate: Record<string, number>;
  comments: string;
  /** Who's submitting — drives `requestedByRole`, which Admin/Client's table reads as its "Req By" column. */
  requesterRole: 'va' | 'client';
  /** Reuse the wizard's own per-week math instead of recomputing it, so the submitted request and the alerts the VA just saw always agree. */
  anyWeekOverHours: boolean;
  anyWeekOutsidePeriod: boolean;
}

/**
 * Actually persists a "Request approval for extra hours" submission — until
 * this existed, the wizard's "Submit form" button only advanced its own
 * step, so a submitted request never showed up anywhere (not on the VA's My
 * Account, not in `getExtraHoursTakenForWeek` for the *next* request).
 * Mirrors the client's own auto-approval rule: when the request doesn't need
 * manual review, it's created already `approved` (so its hours immediately
 * count toward future weeks' "taken" total) instead of sitting as `new`
 * until someone manually approves it.
 */
export function createExtraHoursCARequest(input: CreateExtraHoursRequestInput): CARequest {
  const { vaEmail, agreementId, selectedDates, hoursByDate, comments, requesterRole, anyWeekOverHours, anyWeekOutsidePeriod } =
    input;
  const agreement = MOCK_AGREEMENTS.find((candidate) => candidate.id === agreementId);
  const vaUser = MOCK_USERS.find((user) => user.email === vaEmail);

  const totalHours = selectedDates.reduce((sum, date) => sum + (hoursByDate[date] ?? 0), 0);
  const needsManualApproval = !agreement?.settings.autoApproveExtraHours || anyWeekOverHours || anyWeekOutsidePeriod;

  const todayLong = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const todayNumeric = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });

  const preApprovedHours = agreement?.settings.preApprovedHoursPerWeek ?? 0;
  const remainingBreakdown = buildRemainingPreApprovedHoursBreakdown(
    vaEmail,
    preApprovedHours,
    selectedDates,
    hoursByDate,
    !needsManualApproval,
  );

  const details: CARequestDetail[] = [
    { label: 'Pre-approved Hours per week', value: `${preApprovedHours} Hours` },
    { label: 'Remaining Pre-approved Hours', value: remainingBreakdown, fullWidth: true },
    { label: 'Total Extra Hours Reported', value: `${totalHours} Hours` },
    {
      label: 'Days Selected (with hours/day)',
      value: selectedDates.map((date) => `${formatWeekdayISO(date)} (${hoursByDate[date] ?? 0} Hrs)`).join('\n'),
    },
    { label: 'Approval Type', value: needsManualApproval ? 'Manual' : 'Auto Approval' },
  ];
  if (agreement && vaUser) {
    details.push({
      label: 'Agreement',
      value: `VL-Agreement-${agreement.clientName}-${shortenVAName(vaUser.name)}-${slashDateToISO(agreement.startDate)}`,
    });
  }

  const request: CARequest = {
    id: nextCARequestId(),
    vaEmail,
    clientEmail: agreement?.clientEmail ?? '',
    title: 'Request approval for extra hours',
    date: todayLong,
    status: needsManualApproval ? 'new' : 'approved',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: requesterRole,
    requestedDate: todayLong,
    details,
    comments: comments.trim() || undefined,
    extraHoursByDate: selectedDates.map((date) => ({ date, hours: hoursByDate[date] ?? 0 })),
    ...(needsManualApproval ? {} : { resolvedBy: 'Auto-Approval System', resolvedDate: todayNumeric }),
  };

  MOCK_CA_REQUESTS.unshift(request);
  return request;
}

export function getInvoicesForVA(email: string): InvoiceRecord[] {
  return MOCK_INVOICES.filter((invoice) => invoice.vaEmail === email);
}

export function getInvoiceById(id: string): InvoiceRecord | undefined {
  return MOCK_INVOICES.find((invoice) => invoice.id === id);
}

export interface VAInvoiceBreakdown {
  invoice: InvoiceRecord;
  groups: InvoiceGroupView[];
}

/** Each of the VA's invoices, its line items split into the same Agreement/Extra Hours/Time Off groups the client's invoice screens use. */
export function getInvoiceBreakdownForVA(email: string): VAInvoiceBreakdown[] {
  return getInvoicesForVA(email).map((invoice) => ({
    invoice,
    groups: groupInvoiceItems(invoice.items),
  }));
}

/** A single invoice's line items split into groups, for the full "View Invoice" page. */
export function getInvoiceBreakdownById(id: string): VAInvoiceBreakdown | undefined {
  const invoice = getInvoiceById(id);
  return invoice ? { invoice, groups: groupInvoiceItems(invoice.items) } : undefined;
}
