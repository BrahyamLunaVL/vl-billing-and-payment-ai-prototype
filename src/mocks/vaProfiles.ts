export interface VAProfile {
  /** References a MOCK_USERS email — never duplicate that user's name/photo here. */
  email: string;
  legalName: string;
  /** e.g. "Friday, June 30, 2023". */
  vaSinceDate: string;
  samContactName: string;
  telegramHandle: string;
  paymentEmail: string;
  paymentMethod: string;
  hiredStatus: 'hired' | 'inactive';
  /** Shown on the client-facing agreement card, e.g. "Peru" — also used for the Country Billing/Citizenship/Residence rows on the client's Agreement screen, which are all the same value in practice. */
  country: string;
  /** The VA's preferred/alias name, shown to clients as "AKA: ...". */
  aka: string;
  phoneNumber: string;
  /** The VA's own HubSpot contact ID — distinct from the agreement's own HubSpot ID. */
  hubspotId: string;
}

const INITIAL_VA_PROFILES: VAProfile[] = [
  {
    email: 'va@virtuallatinos.com',
    legalName: 'Elena Ruiz',
    vaSinceDate: 'Friday, June 30, 2023',
    samContactName: 'Javiera Mercado',
    telegramHandle: '@elena.ruiz',
    paymentEmail: 'elena.ruiz@virtuallatinos.com',
    paymentMethod: 'Payoneer',
    hiredStatus: 'hired',
    country: 'Peru',
    aka: 'Elena R.',
    phoneNumber: '+51 984 123 456',
    hubspotId: '124318284947',
  },
  {
    email: 'va2@virtuallatinos.com',
    legalName: 'Laura Gomez',
    vaSinceDate: 'Monday, March 4, 2024',
    samContactName: 'Javiera Mercado',
    telegramHandle: '@laura.gomez',
    paymentEmail: 'laura.gomez@virtuallatinos.com',
    paymentMethod: 'Payoneer',
    hiredStatus: 'inactive',
    country: 'Colombia',
    aka: 'Laura G.',
    phoneNumber: '+57 300 462 1845',
    hubspotId: '124318284948',
  },
];

/** VA-specific profile fields that don't belong on every user (see MockUser in ./users). */
export const MOCK_VA_PROFILES: VAProfile[] = INITIAL_VA_PROFILES.map((profile) => ({ ...profile }));
