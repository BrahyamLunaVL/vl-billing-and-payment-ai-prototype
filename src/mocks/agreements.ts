import type { WeekDayData } from '../components';

export type AgreementStatus = 'active' | 'terminated' | 'paused';

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
  vaRate: string;
  clientRate?: string;
  /** The bare hourly rate the client is billed, e.g. "$18.00" — used in the client-facing agreement title. */
  billedRate: string;
  hoursPerWeek: string;
  billingType: string;
  status: AgreementStatus;
  dateStart: string;
  dateEnd?: string;
  /** Omit for a terminated/paused agreement with no ongoing schedule. */
  week?: WeekDayData[];
  settings: AgreementSettings;
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
  reportBackWeeks: 4,
  emailOnPreApprovedExtraHours: false,
};

const INITIAL_AGREEMENTS: Agreement[] = [
  {
    id: 'agr-1',
    vaEmail: 'va@virtuallatinos.com',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'The Matian Firm @ $8.00',
    vaRate: 'VA Rate: $11.00',
    billedRate: '$18.00',
    hoursPerWeek: '40 Hours per week',
    billingType: 'Post Pay',
    dateStart: 'Date Start 2025-04-28',
    status: 'active',
    week: FULL_TIME_WEEK,
    settings: { ...DEFAULT_SETTINGS },
  },
  {
    id: 'agr-2',
    vaEmail: 'va@virtuallatinos.com',
    clientEmail: 'client@virtuallatinos.com',
    clientName: 'The Matian Firm @ $8.00',
    vaRate: 'VA Rate: $11.00',
    clientRate: 'Client Rate: $15.00',
    billedRate: '$15.00',
    hoursPerWeek: '40 Hours per week',
    billingType: 'Post Pay',
    dateStart: 'Date Start 2025-04-28',
    dateEnd: 'Date End: 2025-01-24',
    status: 'terminated',
    settings: { ...DEFAULT_SETTINGS, autoApproveExtraHours: false },
  },
];

/** Stand-in for an agreements table — see MOCK_USERS' own doc comment for the pattern. */
export const MOCK_AGREEMENTS: Agreement[] = INITIAL_AGREEMENTS.map((agreement) => ({
  ...agreement,
  settings: { ...agreement.settings },
}));
