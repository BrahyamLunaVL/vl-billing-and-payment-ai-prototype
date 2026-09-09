import { MOCK_USERS, resetMockUsers } from '../mocks/users';

export { resetMockUsers };

export type LoginErrorCode =
  | 'EMAIL_NOT_REGISTERED'
  | 'WRONG_PASSWORD'
  | 'USER_DISABLED'
  | 'TOO_MANY_REQUESTS';

export interface LoginSuccess {
  success: true;
  user: { email: string };
}

export interface LoginFailure {
  success: false;
  code: LoginErrorCode;
  message: string;
}

export type LoginResult = LoginSuccess | LoginFailure;

const ERROR_MESSAGES: Record<LoginErrorCode, string> = {
  EMAIL_NOT_REGISTERED: 'The email address you entered is not registered',
  WRONG_PASSWORD: 'The password you entered is incorrect',
  USER_DISABLED: 'User is currently disabled. Please contact system administrator.',
  TOO_MANY_REQUESTS: 'Too many requests. Try again later',
};

const MAX_CONSECUTIVE_FAILURES = 5;
// Simulated only — a real rate limiter would use a much longer window. This
// is intentionally short so the lockout is easy to test by hand; raise it
// once this is backed by a real API.
const LOCKOUT_DURATION_MS = 10_000;
const SIMULATED_LATENCY_MS = 400;

// Global (not per-email) consecutive-failure counter, matching a simple
// client/IP-based rate limiter rather than a per-account one. A failed
// attempt from any email counts toward the same lockout.
let consecutiveFailures = 0;
let lockedUntil: number | null = null;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fail(code: LoginErrorCode): LoginFailure {
  return { success: false, code, message: ERROR_MESSAGES[code] };
}

function recordFailure(code: LoginErrorCode): LoginFailure {
  consecutiveFailures += 1;
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
  }
  return fail(code);
}

/**
 * Simulates an authentication API call: a network delay, then email/
 * password/disabled checks against `MOCK_USERS`, plus a simple global rate
 * limiter — after `MAX_CONSECUTIVE_FAILURES` failed attempts in a row, any
 * further attempt is rejected with `TOO_MANY_REQUESTS` until
 * `LOCKOUT_DURATION_MS` has passed, at which point the counter resets on its
 * own. A successful login also resets the counter immediately.
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  await wait(SIMULATED_LATENCY_MS);

  if (lockedUntil !== null) {
    if (Date.now() < lockedUntil) {
      return fail('TOO_MANY_REQUESTS');
    }
    lockedUntil = null;
    consecutiveFailures = 0;
  }

  const user = MOCK_USERS.find((candidate) => candidate.email === email);

  if (!user) {
    return recordFailure('EMAIL_NOT_REGISTERED');
  }
  if (user.disabled) {
    return recordFailure('USER_DISABLED');
  }
  if (user.password !== password) {
    return recordFailure('WRONG_PASSWORD');
  }

  consecutiveFailures = 0;
  lockedUntil = null;
  return { success: true, user: { email: user.email } };
}

/**
 * Clears the rate limiter's in-memory state. Exported for tests/stories so
 * each one starts from a clean slate instead of inheriting failures counted
 * by whatever ran before it in the same session.
 */
export function resetLoginRateLimit(): void {
  consecutiveFailures = 0;
  lockedUntil = null;
}

export type RequestPasswordResetErrorCode = 'EMAIL_NOT_REGISTERED';

export type RequestPasswordResetResult =
  | { success: true }
  | { success: false; code: RequestPasswordResetErrorCode; message: string };

/** Simulates the "forgot password" step: just checks the email is registered. */
export async function requestPasswordReset(email: string): Promise<RequestPasswordResetResult> {
  await wait(SIMULATED_LATENCY_MS);

  const user = MOCK_USERS.find((candidate) => candidate.email === email);
  if (!user) {
    return { success: false, code: 'EMAIL_NOT_REGISTERED', message: ERROR_MESSAGES.EMAIL_NOT_REGISTERED };
  }
  return { success: true };
}

export type ResetPasswordErrorCode = 'PASSWORD_TOO_SHORT' | 'PASSWORDS_DONT_MATCH';

export type ResetPasswordResult =
  | { success: true }
  | { success: false; code: ResetPasswordErrorCode; message: string };

const MIN_PASSWORD_LENGTH = 12;

const RESET_PASSWORD_ERROR_MESSAGES: Record<ResetPasswordErrorCode, string> = {
  PASSWORD_TOO_SHORT: `The password must contain at least ${MIN_PASSWORD_LENGTH} characters`,
  PASSWORDS_DONT_MATCH: "Passwords don't match",
};

/**
 * Simulates completing a password reset: validates the new password length
 * and that it matches its confirmation, then — since there's no real
 * backend yet — actually mutates the matching `MOCK_USERS` entry so a
 * subsequent `login()` call reflects the change, the same way a real API
 * would persist it.
 */
export async function resetPassword(
  email: string,
  newPassword: string,
  confirmPassword: string,
): Promise<ResetPasswordResult> {
  await wait(SIMULATED_LATENCY_MS);

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { success: false, code: 'PASSWORD_TOO_SHORT', message: RESET_PASSWORD_ERROR_MESSAGES.PASSWORD_TOO_SHORT };
  }
  if (newPassword !== confirmPassword) {
    return { success: false, code: 'PASSWORDS_DONT_MATCH', message: RESET_PASSWORD_ERROR_MESSAGES.PASSWORDS_DONT_MATCH };
  }

  const user = MOCK_USERS.find((candidate) => candidate.email === email);
  if (user) {
    user.password = newPassword;
  }

  return { success: true };
}
