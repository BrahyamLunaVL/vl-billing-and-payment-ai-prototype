import clientPhoto from '../assets/users/client.jpg';
import vaPhoto from '../assets/users/va.jpg';

export type UserRole = 'admin' | 'client' | 'va';

export interface MockUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  /** URL of the user's profile photo. */
  photo: string;
  /** Defaults to false when omitted. */
  disabled?: boolean;
}

const INITIAL_USERS: MockUser[] = [
  // TODO: swap in the admin's own photo once available — reusing the VA's
  // for now as a placeholder.
  { email: 'admin@virtuallatinos.com', password: 'VL-Testing-2026', name: 'James Carter', role: 'admin', photo: vaPhoto },
  { email: 'client@virtuallatinos.com', password: 'VL-Testing-2026', name: 'Sofia Martinez', role: 'client', photo: clientPhoto },
  { email: 'va@virtuallatinos.com', password: 'VL-Testing-2026', name: 'Elena Ruiz', role: 'va', photo: vaPhoto },
  { email: 'va2@virtuallatinos.com', password: 'VL-Testing-2026', name: 'Laura Gomez', role: 'va', photo: vaPhoto, disabled: true },
];

/**
 * Stand-in for a users table until a real backend exists. Other mock
 * "collections" the app needs later (accounts, invoices, etc.) should follow
 * this same pattern: a plain typed array in its own file under `src/mocks/`,
 * read (and, like here, sometimes written) by a `src/services/*` module
 * that's the only thing components talk to — so swapping this for a real
 * API later only touches the service, not every screen that uses it.
 *
 * This one is genuinely mutated at runtime (`resetPassword` in
 * `src/services/auth.ts` writes to it), so tests/stories that change a
 * user's password should call `resetMockUsers()` afterward to avoid
 * leaking state into whatever runs next in the same session.
 */
export const MOCK_USERS: MockUser[] = INITIAL_USERS.map((user) => ({ ...user }));

export function resetMockUsers(): void {
  MOCK_USERS.length = 0;
  MOCK_USERS.push(...INITIAL_USERS.map((user) => ({ ...user })));
}
