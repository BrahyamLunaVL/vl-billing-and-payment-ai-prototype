import type { ChipTone } from '../components';
import { MOCK_VA_PROFILES, type VAProfile } from '../mocks/vaProfiles';
import { MOCK_AGREEMENTS, type Agreement, type AgreementStatus } from '../mocks/agreements';
import { MOCK_CA_REQUESTS, type CARequest, type CARequestStatus } from '../mocks/caRequests';
import { MOCK_INVOICES, type InvoiceRecord } from '../mocks/invoices';

export type { VAProfile } from '../mocks/vaProfiles';
export type { Agreement, AgreementStatus } from '../mocks/agreements';
export type { CARequest, CARequestStatus, CARequestDetail } from '../mocks/caRequests';
export type { InvoiceRecord, InvoiceLineItemData } from '../mocks/invoices';

/** Shared status -> display label/color mappings, so every screen that shows one of these statuses agrees. */
export const AGREEMENT_STATUS_LABEL: Record<AgreementStatus, string> = {
  active: 'Active',
  terminated: 'Terminated',
  paused: 'Paused',
};

export const AGREEMENT_STATUS_TONE: Record<AgreementStatus, ChipTone> = {
  active: 'blue',
  terminated: 'red',
  paused: 'orange',
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

export function getCARequestById(id: string): CARequest | undefined {
  return MOCK_CA_REQUESTS.find((request) => request.id === id);
}

export function getInvoicesForVA(email: string): InvoiceRecord[] {
  return MOCK_INVOICES.filter((invoice) => invoice.vaEmail === email);
}

export function getInvoiceById(id: string): InvoiceRecord | undefined {
  return MOCK_INVOICES.find((invoice) => invoice.id === id);
}
