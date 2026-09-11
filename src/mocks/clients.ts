export interface ClientContact {
  name: string;
  /** e.g. "Access Type (Admin):". */
  accessTypeLabel: string;
  description: string;
  phone: string;
  email: string;
}

export interface ClientProfile {
  /** References a MOCK_USERS email — never duplicate that user's name/photo here. */
  email: string;
  companyName: string;
  enabled: boolean;
  /** e.g. "Saturday, June 12, 2021". */
  clientSinceDate: string;
  legalName: string;
  paymentMethod: string;
  /** e.g. "Tuesday, July 21, 2026". */
  lastUpdatedDate: string;
  contacts: ClientContact[];
}

const INITIAL_CLIENT_PROFILES: ClientProfile[] = [
  {
    email: 'client@virtuallatinos.com',
    companyName: 'LTM Innovation',
    enabled: true,
    clientSinceDate: 'Saturday, June 12, 2021',
    legalName: 'Ujala Life',
    paymentMethod: 'ACH (Bank Account)',
    lastUpdatedDate: 'Tuesday, July 21, 2026',
    contacts: [
      {
        name: 'Manusha Chereddy',
        accessTypeLabel: 'Access Type (Admin):',
        description: 'Access to billing information and Approvals.',
        phone: '+1 (619) 555-0134',
        email: 'manusha.chereddy@ltminnovation.com',
      },
    ],
  },
];

/** Stand-in for a client company profiles table — see MOCK_USERS' own doc comment for the pattern. */
export const MOCK_CLIENT_PROFILES: ClientProfile[] = INITIAL_CLIENT_PROFILES.map((profile) => ({
  ...profile,
  contacts: profile.contacts.map((contact) => ({ ...contact })),
}));
