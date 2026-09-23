import type { WeekDayData } from '../components';

export type AgreementStatus = 'active' | 'inactive';

/**
 * The client's controls over how their VA's requests get resolved — edited
 * from the client's Agreement Settings screen, and the single source of
 * truth the VA's "Request approval for extra hours" wizard reads from (no
 * more hardcoded pre-approved-hours/lookback-window constants there).
 */
export interface AgreementSettings {
  autoApproveChanges: boolean;
  notifyOverThreshold: boolean;
  /** USD amount above which a change request triggers a notification, when `notifyOverThreshold` is set. */
  overThresholdAmount: number;
  autoApproveExtraHours: boolean;
  /** Max weekly extra hours auto-approved without manual review, when `autoApproveExtraHours` is set. */
  preApprovedHoursPerWeek: number;
  /** How many weeks back the VA may report extra hours for. */
  reportBackWeeks: number;
  emailOnPreApprovedExtraHours: boolean;
}

export interface Agreement {
  id: string;
  /** References a MOCK_USERS email — never duplicate that user's name here. */
  vaEmail: string;
  /** References a MOCK_USERS email — never duplicate that user's company name here. */
  clientEmail: string;
  clientName: string;
  /** The company's own point of contact — shown on the client-facing Agreement screen's Company card. */
  contactName: string;
  contactEmail: string;
  /** e.g. "VA Rate: $11.00" — shown on the VA's own AgreementCard (VA/Admin only, never Client). */
  vaRate: string;
  /** The bare hourly rate the client is billed, e.g. "$18.00" — used in the client-facing agreement title. */
  billedRate: string;
  /** The bare hourly rate the VA is paid, e.g. "$11.00" — used on the client-facing Agreement screen's VA card. */
  vaHourlyRate: string;
  hoursPerWeek: string;
  billingType: string;
  status: AgreementStatus;
  dateStart: string;
  dateEnd?: string;
  /** Bare start date, e.g. "7/21/2026" — used by the client-facing Agreement header (unlike `dateStart`, which bakes in its own "Date Start " label for the VA's AgreementCard). */
  startDate: string;
  /** Bare end date, e.g. "6/1/2026". Omit for an ongoing agreement. */
  endDate?: string;
  /** e.g. "9/13/2026" — shown in the client-facing Agreement header, Client/Admin only. */
  nextPaymentDate: string;
  hubspotId: string;
  /** Omit for an inactive agreement with no ongoing schedule. */
  week?: WeekDayData[];
  settings: AgreementSettings;
  /** e.g. "10 - 20 hours per week @ $20.00/hr" — shown by the Company card's "View Client Rate ranges" dropdown. */
  clientRateRanges: string[];
  /** e.g. "10 - 20 hours per week @ $10.00/hr" — shown by the VA card's "View VA Rate ranges" dropdown. */
  vaRateRanges: string[];
}

const FULL_TIME_WEEK: WeekDayData[] = [
  { key: 'mon', dayLetter: 'M', value: '8 hrs' },
  { key: 'tue', dayLetter: 'T', value: '8 hrs' },
  { key: 'wed', dayLetter: 'W', value: '8 hrs' },
  { key: 'thu', dayLetter: 'T', value: '8 hrs' },
  { key: 'fri', dayLetter: 'F', value: '8 hrs' },
  { key: 'sat', dayLetter: 'S', value: '0 hrs', disabled: true },
  { key: 'sun', dayLetter: 'S', value: '0 hrs', disabled: true },
];

const DEFAULT_SETTINGS: AgreementSettings = {
  autoApproveChanges: false,
  notifyOverThreshold: false,
  overThresholdAmount: 500,
  autoApproveExtraHours: true,
  preApprovedHoursPerWeek: 5,
  reportBackWeeks: 12,
  emailOnPreApprovedExtraHours: false,
};

const INITIAL_AGREEMENTS: Agreement[] = [
  {
    id: 'agr-1',
    vaEmail: 'va@virtuallatinos.com',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'Bloominari dba Virtual Latinos',
    contactName: 'Jaime Nacach',
    contactEmail: 'jaime@virtuallatinos.com',
    vaRate: 'VA Rate: $11.00',
    billedRate: '$8.00',
    vaHourlyRate: '$11.00',
    hoursPerWeek: '40 Hours per week',
    billingType: 'Post Pay',
    dateStart: 'Date Start 2025-04-28',
    startDate: '4/28/2025',
    nextPaymentDate: '9/13/2026',
    hubspotId: '44787728131',
    status: 'active',
    week: FULL_TIME_WEEK,
    settings: { ...DEFAULT_SETTINGS },
    clientRateRanges: [
      '10 - 20 hours per week @ $20.00/hr',
      '21 - 30 hours per week @ $19.00/hr',
      '31 - 40 hours per week @ $35.00/hr',
    ],
    vaRateRanges: [
      '10 - 20 hours per week @ $10.00/hr',
      '21 - 30 hours per week @ $10.50/hr',
      '31 - 40 hours per week @ $11.00/hr',
    ],
  },
  {
    id: 'agr-2',
    vaEmail: 'va@virtuallatinos.com',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'The Matian Firm',
    contactName: 'Sarah Matian',
    contactEmail: 'jaime@virtuallatinos.com',
    vaRate: 'VA Rate: $8.00',
    billedRate: '$15.00',
    vaHourlyRate: '$8.00',
    hoursPerWeek: '40 Hours per week',
    billingType: 'Post Pay',
    dateStart: 'Date Start 2024-07-25',
    dateEnd: 'Date End: 2025-01-24',
    startDate: '7/25/2024',
    endDate: '1/24/2025',
    nextPaymentDate: '1/24/2025',
    hubspotId: '44787728132',
    status: 'inactive',
    settings: { ...DEFAULT_SETTINGS, autoApproveExtraHours: false },
    clientRateRanges: [
      '10 - 20 hours per week @ $15.00/hr',
      '21 - 30 hours per week @ $16.00/hr',
      '31 - 40 hours per week @ $17.00/hr',
    ],
    vaRateRanges: [
      '10 - 20 hours per week @ $7.00/hr',
      '21 - 30 hours per week @ $7.50/hr',
      '31 - 40 hours per week @ $8.00/hr',
    ],
  },
  {
    id: 'agr-3',
    vaEmail: 'va-no-hours@virtuallatinos.com',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'Bloominari dba Virtual Latinos',
    contactName: 'Jaime Nacach',
    contactEmail: 'jaime@virtuallatinos.com',
    vaRate: 'VA Rate: $10.00',
    billedRate: '$8.00',
    vaHourlyRate: '$10.00',
    hoursPerWeek: '40 Hours per week',
    billingType: 'Post Pay',
    dateStart: 'Date Start 2026-01-12',
    startDate: '1/12/2026',
    nextPaymentDate: '9/13/2026',
    hubspotId: '44787728133',
    status: 'active',
    week: FULL_TIME_WEEK,
    // No pre-approved extra hours from the client — every extra hour this
    // VA reports needs manual approval.
    settings: { ...DEFAULT_SETTINGS, autoApproveExtraHours: false, preApprovedHoursPerWeek: 0 },
    clientRateRanges: [
      '10 - 20 hours per week @ $20.00/hr',
      '21 - 30 hours per week @ $19.00/hr',
      '31 - 40 hours per week @ $35.00/hr',
    ],
    vaRateRanges: [
      '10 - 20 hours per week @ $9.00/hr',
      '21 - 30 hours per week @ $9.50/hr',
      '31 - 40 hours per week @ $10.00/hr',
    ],
  },
  {
    id: 'agr-4',
    vaEmail: 'va-requested@virtuallatinos.com',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'Bloominari dba Virtual Latinos',
    contactName: 'Jaime Nacach',
    contactEmail: 'jaime@virtuallatinos.com',
    vaRate: 'VA Rate: $11.00',
    billedRate: '$8.00',
    vaHourlyRate: '$11.00',
    hoursPerWeek: '40 Hours per week',
    billingType: 'Post Pay',
    dateStart: 'Date Start 2026-02-18',
    startDate: '2/18/2026',
    nextPaymentDate: '9/13/2026',
    hubspotId: '44787728134',
    status: 'active',
    week: FULL_TIME_WEEK,
    settings: { ...DEFAULT_SETTINGS },
    clientRateRanges: [
      '10 - 20 hours per week @ $20.00/hr',
      '21 - 30 hours per week @ $19.00/hr',
      '31 - 40 hours per week @ $35.00/hr',
    ],
    vaRateRanges: [
      '10 - 20 hours per week @ $10.00/hr',
      '21 - 30 hours per week @ $10.50/hr',
      '31 - 40 hours per week @ $11.00/hr',
    ],
  },
];

/** Stand-in for an agreements table — see MOCK_USERS' own doc comment for the pattern. */
export const MOCK_AGREEMENTS: Agreement[] = INITIAL_AGREEMENTS.map((agreement) => ({
  ...agreement,
  settings: { ...agreement.settings },
}));

/**
 * Restores the seed data — for tests/stories that call `updateAgreementSettings`
 * (itself a real mutation, same as `resetPassword` in src/services/auth.ts)
 * to avoid leaking state into whatever runs next in the same session.
 */
export function resetMockAgreements(): void {
  MOCK_AGREEMENTS.length = 0;
  MOCK_AGREEMENTS.push(...INITIAL_AGREEMENTS.map((agreement) => ({ ...agreement, settings: { ...agreement.settings } })));
}
