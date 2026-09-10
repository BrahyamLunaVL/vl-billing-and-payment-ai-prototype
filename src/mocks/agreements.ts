import type { WeekDayData } from '../components';

export type AgreementStatus = 'active' | 'terminated' | 'paused';

export interface Agreement {
  id: string;
  /** References a MOCK_USERS email — never duplicate that user's name here. */
  vaEmail: string;
  clientName: string;
  vaRate: string;
  clientRate?: string;
  hoursPerWeek: string;
  status: AgreementStatus;
  dateStart: string;
  dateEnd?: string;
  /** Omit for a terminated/paused agreement with no ongoing schedule. */
  week?: WeekDayData[];
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

const INITIAL_AGREEMENTS: Agreement[] = [
  {
    id: 'agr-1',
    vaEmail: 'va@virtuallatinos.com',
    clientName: 'The Matian Firm @ $8.00',
    vaRate: 'VA Rate: $11.00',
    dateStart: 'Date Start 2025-04-28',
    hoursPerWeek: '40 Hours per week',
    status: 'active',
    week: FULL_TIME_WEEK,
  },
  {
    id: 'agr-2',
    vaEmail: 'va@virtuallatinos.com',
    clientName: 'The Matian Firm @ $8.00',
    vaRate: 'VA Rate: $11.00',
    clientRate: 'Client Rate: $15.00',
    dateStart: 'Date Start 2025-04-28',
    dateEnd: 'Date End: 2025-01-24',
    hoursPerWeek: '40 Hours per week',
    status: 'terminated',
  },
];

/** Stand-in for an agreements table — see MOCK_USERS' own doc comment for the pattern. */
export const MOCK_AGREEMENTS: Agreement[] = INITIAL_AGREEMENTS.map((agreement) => ({ ...agreement }));
