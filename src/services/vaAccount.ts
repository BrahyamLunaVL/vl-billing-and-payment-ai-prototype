import { MOCK_VA_PROFILES, type VAProfile } from '../mocks/vaProfiles';
import { MOCK_AGREEMENTS, type Agreement } from '../mocks/agreements';
import { MOCK_CA_REQUESTS, type CARequest } from '../mocks/caRequests';
import { MOCK_INVOICES, type InvoiceRecord } from '../mocks/invoices';

export type { VAProfile } from '../mocks/vaProfiles';
export type { Agreement, AgreementStatus } from '../mocks/agreements';
export type { CARequest, CARequestStatus } from '../mocks/caRequests';
export type { InvoiceRecord, InvoiceLineItemData } from '../mocks/invoices';

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

export function getCARequestsForVA(email: string): CARequest[] {
  return MOCK_CA_REQUESTS.filter((request) => request.vaEmail === email);
}

export function getInvoicesForVA(email: string): InvoiceRecord[] {
  return MOCK_INVOICES.filter((invoice) => invoice.vaEmail === email);
}
