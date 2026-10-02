import type { ChipTone, WeekDayData } from '../components';
import { MOCK_VA_PROFILES, type VAProfile } from '../mocks/vaProfiles';
import { MOCK_AGREEMENTS, type Agreement, type AgreementStatus } from '../mocks/agreements';
import {
  MOCK_CA_REQUESTS,
  type CARequest,
  type CARequestStatus,
  type CARequestDetail,
  type CARequestDayGroup,
} from '../mocks/caRequests';
import { MOCK_USERS } from '../mocks/users';
import vaPhoto from '../assets/users/va.jpg';
import {
  MOCK_INVOICES,
  groupInvoiceItems,
  getVAInvoiceBucket,
  type InvoiceRecord,
  type InvoiceGroupView,
  type InvoiceStatus,
  type VAInvoiceBucket,
} from '../mocks/invoices';

export type { VAProfile } from '../mocks/vaProfiles';
export type { Agreement, AgreementStatus } from '../mocks/agreements';
export type { CARequest, CARequestStatus, CARequestDetail, CARequestDayGroup } from '../mocks/caRequests';
export type { InvoiceRecord, InvoiceLineItemData, InvoiceGroupView, InvoiceStatus, VAInvoiceBucket } from '../mocks/invoices';
export { formatApprovedMessage, canTakeInvoiceAction, approveInvoice } from '../mocks/invoices';

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
  new: 'New',
  due: 'Due',
  paid: 'Paid',
  preview: 'Preview',
  refunded: 'Refunded',
  'pending-payment': 'Pending Payment',
  'payment-failed': 'Payment Failed',
};

export const INVOICE_STATUS_TONE: Record<InvoiceStatus, ChipTone> = {
  new: 'purple',
  due: 'purple',
  paid: 'green',
  preview: 'blue',
  refunded: 'gray',
  'pending-payment': 'orange',
  'payment-failed': 'red',
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

/** Admin's "VAs" table row — every VA user joined with their profile, in one flat shape the Table component can sort/render directly. */
export interface AdminVAView {
  id: string;
  email: string;
  legalName: string;
  /** Whether the login itself is enabled — distinct from `hiredStatus` (e.g. a hired VA whose account was disabled). */
  isActive: boolean;
  hiredStatus: VAProfile['hiredStatus'];
  telegramHandle: string;
  samContactName: string;
  paymentMethod: string;
  country: string;
}

/** Every VA across the platform (Admin's own "VAs — All VAs" table), not scoped to any one client. */
export function getAllVAs(): AdminVAView[] {
  return MOCK_USERS.filter((user) => user.role === 'va').map((user, index) => {
    const profile = MOCK_VA_PROFILES.find((candidate) => candidate.email === user.email);
    return {
      id: String(101 + index),
      email: user.email,
      legalName: profile?.legalName ?? user.name,
      isActive: !user.disabled,
      hiredStatus: profile?.hiredStatus ?? 'hired',
      telegramHandle: profile?.telegramHandle ?? '',
      samContactName: profile?.samContactName ?? '',
      paymentMethod: profile?.paymentMethod ?? '',
      country: profile?.country ?? '',
    };
  });
}

/** Everything Admin's Create/Edit VA form collects — shared between both modes. */
export interface SaveVAInput {
  aka: string;
  legalName: string;
  email: string;
  paymentMethod: string;
  hubspotId?: string;
  firstName?: string;
  lastName?: string;
  surName?: string;
  countryResidence?: string;
  countryCitizenship?: string;
  countryBilling?: string;
  billingAddress?: string;
  telegramHandle?: string;
  phoneNumber?: string;
  paymentEmail?: string;
  workEmail?: string;
  samContactName?: string;
  shortIntro?: string;
}

/** Admin's "Save" on Create New VA — adds a new login (`MOCK_USERS`) and profile (`MOCK_VA_PROFILES`) so it shows up immediately in the "All VAs" table. */
export function createVA(input: SaveVAInput): void {
  MOCK_USERS.push({
    email: input.email,
    password: 'VL-Testing-2026',
    name: input.legalName,
    role: 'va',
    photo: vaPhoto,
  });

  MOCK_VA_PROFILES.push({
    email: input.email,
    legalName: input.legalName,
    vaSinceDate: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    samContactName: input.samContactName ?? '',
    telegramHandle: input.telegramHandle ?? '',
    paymentEmail: input.paymentEmail ?? '',
    paymentMethod: input.paymentMethod,
    hiredStatus: 'hired',
    country: input.countryResidence ?? '',
    aka: input.aka,
    phoneNumber: input.phoneNumber ?? '',
    hubspotId: input.hubspotId ?? '',
    firstName: input.firstName,
    lastName: input.lastName,
    surName: input.surName,
    countryCitizenship: input.countryCitizenship,
    countryBilling: input.countryBilling,
    billingAddress: input.billingAddress,
    workEmail: input.workEmail,
    shortIntro: input.shortIntro,
  });
}

/**
 * Admin's "Save" on Editing VA. Looks the existing records up by
 * `originalEmail` (the row being edited) rather than `input.email`, since
 * the form lets Admin change the email itself.
 */
export function updateVA(originalEmail: string, input: SaveVAInput): void {
  const user = MOCK_USERS.find((candidate) => candidate.email === originalEmail);
  if (user) {
    user.email = input.email;
    user.name = input.legalName;
  }

  const profile = MOCK_VA_PROFILES.find((candidate) => candidate.email === originalEmail);
  if (profile) {
    profile.email = input.email;
    profile.legalName = input.legalName;
    profile.aka = input.aka;
    profile.paymentMethod = input.paymentMethod;
    profile.hubspotId = input.hubspotId ?? '';
    profile.firstName = input.firstName;
    profile.lastName = input.lastName;
    profile.surName = input.surName;
    profile.country = input.countryResidence ?? '';
    profile.countryCitizenship = input.countryCitizenship;
    profile.countryBilling = input.countryBilling;
    profile.billingAddress = input.billingAddress;
    profile.telegramHandle = input.telegramHandle ?? '';
    profile.phoneNumber = input.phoneNumber ?? '';
    profile.paymentEmail = input.paymentEmail ?? '';
    profile.workEmail = input.workEmail;
    profile.samContactName = input.samContactName ?? '';
    profile.shortIntro = input.shortIntro;
  }
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

/** "8 hrs" -> 8. */
export function parseHoursValue(value: string): number {
  const match = /(\d+(?:\.\d+)?)/.exec(value);
  return match ? Number(match[1]) : 0;
}

/**
 * How many hours a VA is scheduled to work on a given date, per their
 * agreement's weekly schedule (`Agreement.week`, Monday-first) — 0 for a
 * disabled/non-working day, or when no schedule is known at all. Drives both
 * which days the Time Off calendar allows selecting and each selected day's
 * own max-hours cap.
 */
export function getScheduledHoursForDate(dateISO: string, week: WeekDayData[] | undefined): number {
  if (!week || week.length !== 7) return 0;
  const date = parseISODate(dateISO);
  const weekdayIndex = (date.getDay() + 6) % 7;
  const day = week[weekdayIndex];
  if (!day || day.disabled) return 0;
  return parseHoursValue(day.value);
}

/**
 * Every date this VA has ever requested time off for, across ALL of their
 * time-off requests regardless of status — a date stays "already requested"
 * even if that earlier request was rejected, since it still occupied that
 * slot once (the VA would resubmit the same date in a new request otherwise).
 */
export function getTimeOffRequestedDatesForVA(vaEmail: string): string[] {
  return MOCK_CA_REQUESTS.filter((request) => request.vaEmail === vaEmail)
    .flatMap((request) => request.timeOffByDate ?? [])
    .map((entry) => entry.date);
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

/** "2026-04-08" -> "Wednesday 04-08-2026". */
function formatWeekdayMDY(dateISO: string): string {
  const date = parseISODate(dateISO);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const mdy = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`;
  return `${weekday} ${mdy}`;
}

/** "Week from Apr 6 to Apr 12, 2026" — the "Days Selected (with hours/day)" week-group header. */
function formatWeekLabel(weekStart: Date, weekEnd: Date): string {
  return `Week from ${formatShortDate(weekStart)} to ${formatShortDate(weekEnd)}, ${weekEnd.getFullYear()}`;
}

/** "Elena Ruiz" -> "Elena R." — matches the short-name style already used in the "Agreement" detail line and in auto-generated agreement names. */
export function shortenVAName(fullName: string): string {
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
 * Groups a request's selected dates into Monday–Sunday weeks for the
 * "Days Selected (with hours/day)" detail's collapsible per-week display,
 * each week carrying its own `hoursTooltip` breakdown: the weekly
 * pre-approved allowance (`preApprovedHoursPerWeek`), what this VA's OTHER
 * requests already reported that week (`takenByOtherRequests`), and what
 * THIS request reports that week (`reportedInThisRequest`). Deliberately
 * doesn't compute a "remaining" number here — `CADayGroups` derives that
 * live from the request's current status, since only an approved request's
 * hours actually count against the balance, and this request's own status
 * can change after submission (resolved later).
 */
function buildDaySelectionGroups(
  vaEmail: string,
  preApprovedHours: number,
  selectedDates: string[],
  hoursByDate: Record<string, number>,
): CARequestDayGroup[] {
  const weekStarts = [...new Set(selectedDates.map((date) => getWeekRange(date).start))].sort();

  return weekStarts.map((weekStartISO) => {
    const weekStart = parseISODate(weekStartISO);
    const weekEnd = addDays(weekStart, 6);
    const weekEndISO = toISODate(weekEnd);
    const daysInWeek = selectedDates.filter((date) => date >= weekStartISO && date <= weekEndISO).sort();

    return {
      weekLabel: formatWeekLabel(weekStart, weekEnd),
      days: daysInWeek.map((date) => `${formatWeekdayMDY(date)} (${hoursByDate[date] ?? 0} Hours)`),
      hoursTooltip: {
        preApprovedHoursPerWeek: preApprovedHours,
        takenByOtherRequests: getExtraHoursTakenForWeek(vaEmail, weekStartISO, weekEndISO),
        reportedInThisRequest: daysInWeek.reduce((sum, date) => sum + (hoursByDate[date] ?? 0), 0),
      },
    };
  });
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
  const dayGroups = buildDaySelectionGroups(vaEmail, preApprovedHours, selectedDates, hoursByDate);

  const details: CARequestDetail[] = [
    { label: 'Pre-approved Hours per week', value: `${preApprovedHours} Hours` },
    { label: 'Total Extra Hours Reported', value: `${totalHours} Hours` },
    {
      label: 'Days Selected (with hours/day)',
      value: dayGroups.flatMap((group) => group.days).join('\n'),
      dayGroups,
    },
    { label: 'Approval Type', value: needsManualApproval ? 'Manual' : 'Auto Approval' },
  ];
  if (agreement && vaUser) {
    details.push({
      label: 'Agreement',
      value: `VL-Agreement-${agreement.clientName}-${shortenVAName(vaUser.name)}-${slashDateToISO(agreement.startDate)}`,
      fullWidth: true,
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

export type TimeOffPaidType = 'paid' | 'non-paid' | 'paid-replacing-hours';

const TIME_OFF_PAID_TYPE_LABEL: Record<TimeOffPaidType, string> = {
  paid: 'Paid',
  'non-paid': 'Non-Paid',
  'paid-replacing-hours': 'Paid-Replacing Hours',
};

export interface CreateTimeOffRequestInput {
  vaEmail: string;
  agreementId: string;
  mode: 'consecutive' | 'non-consecutive';
  paidType: TimeOffPaidType;
  /** Only meaningful when `paidType` is 'paid-replacing-hours'. */
  makeUpHoursTiming?: string;
  clientResponse: string;
  selectedDates: string[];
  hoursByDate: Record<string, number>;
  comments: string;
  requesterRole: 'va' | 'client';
}

/**
 * Persists a "Request approval for time off" submission. A VA's own request
 * always needs the client's manual review (`status: 'new'`); a request made
 * by (or on behalf of) the client is the client approving their own ask, so
 * it's auto-approved immediately — same idea as extra hours' auto-approval,
 * just keyed off who's submitting rather than a pre-approved-hours rule.
 */
export function createTimeOffCARequest(input: CreateTimeOffRequestInput): CARequest {
  const {
    vaEmail,
    agreementId,
    mode,
    paidType,
    makeUpHoursTiming,
    selectedDates,
    hoursByDate,
    comments,
    requesterRole,
  } = input;
  const agreement = MOCK_AGREEMENTS.find((candidate) => candidate.id === agreementId);

  const totalHours = selectedDates.reduce((sum, date) => sum + (hoursByDate[date] ?? 0), 0);
  const sortedDates = [...selectedDates].sort();
  const todayLong = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const todayNumeric = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  const autoApproved = requesterRole === 'client';

  const details: CARequestDetail[] = [
    { label: 'Request Type', value: mode === 'consecutive' ? 'Consecutive days' : 'Non-consecutive days' },
    { label: 'Paid or Non-Paid', value: TIME_OFF_PAID_TYPE_LABEL[paidType] },
    ...(paidType === 'paid-replacing-hours' && makeUpHoursTiming
      ? [{ label: 'Make-up Hours Timing', value: makeUpHoursTiming, fullWidth: true }]
      : []),
    { label: 'Total Hours Requested', value: `${totalHours} Hours` },
    { label: 'Total Days Requested', value: `${sortedDates.length} Days` },
    {
      label: 'Dates Requested',
      value: sortedDates.map((date) => `${formatWeekdayMDY(date)} (${hoursByDate[date] ?? 0} Hours)`).join('\n'),
      fullWidth: true,
    },
  ];

  const request: CARequest = {
    id: nextCARequestId(),
    vaEmail,
    clientEmail: agreement?.clientEmail ?? '',
    title: 'Request approval for time off',
    date: todayLong,
    status: autoApproved ? 'approved' : 'new',
    clientName: 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: requesterRole,
    requestedDate: todayLong,
    details,
    comments: comments.trim() || undefined,
    timeOffByDate: selectedDates.map((date) => ({ date, hours: hoursByDate[date] ?? 0 })),
    ...(autoApproved ? { resolvedBy: 'Auto-Approval System', resolvedDate: todayNumeric } : {}),
  };

  MOCK_CA_REQUESTS.unshift(request);
  return request;
}

export interface CreateChangeBaseHoursRequestInput {
  vaEmail: string;
  agreementId: string;
  currentHoursPerWeek: number;
  newHoursPerWeek: number;
  /** Pre-formatted "Monday: 8 hrs" lines for the enabled days of the newly requested schedule, newline-joined. */
  scheduleSummary: string;
  /** ISO date, e.g. "2026-09-14". */
  firstEffectiveDay?: string;
  comments: string;
  requesterRole: 'va' | 'client';
}

/**
 * Persists a "Request approval for changing base hours/week worked"
 * submission. Unlike extra hours/time off, there's no auto-approval rule
 * for this request type — changing the agreement's own base schedule always
 * needs the client's manual review. Approving it doesn't yet mutate the
 * agreement's actual `week`/`hoursPerWeek` (out of scope here, same as the
 * other request types' own `appliedBillingPeriod` staying unset until a
 * real invoice cycle exists).
 */
export function createChangeBaseHoursCARequest(input: CreateChangeBaseHoursRequestInput): CARequest {
  const { vaEmail, agreementId, currentHoursPerWeek, newHoursPerWeek, scheduleSummary, firstEffectiveDay, comments, requesterRole } =
    input;
  const agreement = MOCK_AGREEMENTS.find((candidate) => candidate.id === agreementId);
  const todayLong = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const details: CARequestDetail[] = [
    { label: 'Current Base Hours/Week', value: `${currentHoursPerWeek} Hours/week` },
    { label: 'New Base Hours/Week', value: `${newHoursPerWeek} Hours/week` },
    { label: 'New Weekly Schedule', value: scheduleSummary, fullWidth: true },
    ...(firstEffectiveDay
      ? [{ label: 'First Effective Day', value: formatWeekdayMDY(firstEffectiveDay), fullWidth: true }]
      : []),
  ];

  const request: CARequest = {
    id: nextCARequestId(),
    vaEmail,
    clientEmail: agreement?.clientEmail ?? '',
    title: 'Request approval for changing base hours/week worked',
    date: todayLong,
    status: 'new',
    clientName: agreement?.clientName ?? 'LTM Innovation',
    requestedBy: 'you',
    requestedByRole: requesterRole,
    requestedDate: todayLong,
    details,
    comments: comments.trim() || undefined,
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

/**
 * Each of the VA's invoices, its line items split into the same Agreement/
 * Extra Hours/Time Off groups the client's invoice screens use. Pass
 * `bucket` to scope this to just one of My Account's three Invoices tabs
 * (Invoice Preview/Pending Approval/Previously Approved) — see
 * `getVAInvoiceBucket`.
 */
export function getInvoiceBreakdownForVA(email: string, bucket?: VAInvoiceBucket): VAInvoiceBreakdown[] {
  return getInvoicesForVA(email)
    .filter((invoice) => bucket === undefined || getVAInvoiceBucket(invoice) === bucket)
    .map((invoice) => ({
      invoice,
      groups: groupInvoiceItems(invoice.items),
    }));
}

/** A single invoice's line items split into groups, for the full "View Invoice" page. */
export function getInvoiceBreakdownById(id: string): VAInvoiceBreakdown | undefined {
  const invoice = getInvoiceById(id);
  return invoice ? { invoice, groups: groupInvoiceItems(invoice.items) } : undefined;
}
