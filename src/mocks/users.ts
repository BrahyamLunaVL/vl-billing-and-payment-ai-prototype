export interface MockUser {
  email: string;
  password: string;
  /** Defaults to false when omitted. */
  disabled?: boolean;
}

/**
 * Stand-in for a users table until a real backend exists. Other mock
 * "collections" the app needs later (accounts, invoices, etc.) should follow
 * this same pattern: a plain typed array in its own file under `src/mocks/`,
 * read by a `src/services/*` module that's the only thing components talk
 * to — so swapping this for a real API later only touches the service, not
 * every screen that uses it.
 */
export const MOCK_USERS: MockUser[] = [
  { email: 'admin@virtuallatinos.com', password: 'VL-Testing-2026' },
  { email: 'client@virtuallatinos.com', password: 'VL-Testing-2026' },
  { email: 'va@virtuallatinos.com', password: 'VL-Testing-2026' },
  { email: 'va2@virtuallatinos.com', password: 'VL-Testing-2026', disabled: true },
];
