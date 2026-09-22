import type { ChipTone } from '../components';
import { MOCK_VA_PROFILES, type VAProfile } from '../mocks/vaProfiles';
import { MOCK_AGREEMENTS, type Agreement, type AgreementStatus } from '../mocks/agreements';
import { MOCK_CA_REQUESTS, type CARequest, type CARequestStatus } from '../mocks/caRequests';
import { MOCK_INVOICES, groupInvoiceItems, type InvoiceRecord, type InvoiceGroupView, type InvoiceStatus } from '../mocks/invoices';

export type { VAProfile } from '../mocks/vaProfiles';
export type { Agreement, AgreementStatus } from '../mocks/agreements';
export type { CARequest, CARequestStatus, CARequestDetail } from '../mocks/caRequests';
export type { InvoiceRecord, InvoiceLineItemData, InvoiceGroupView, InvoiceStatus } from '../mocks/invoices';

/** Shared status -> display label/color mappings, so every screen that shows one of these statuses agrees. */
export const AGREEMENT_STATUS_LABEL: Record<AgreementStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
};

export const AGREEMENT_STATUS_TONE: Record<AgreementStatus, ChipTone> = {
  active: 'blue',
  inactive: 'red',
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

/** Admin's "Invoice Status" chip — the VA's own View Invoice always hardcodes "Preview" instead of reading this. */
export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  due: 'Due',
  paid: 'Paid',
  preview: 'Preview',
};

export const INVOICE_STATUS_TONE: Record<InvoiceStatus, ChipTone> = {
  due: 'gray',
  paid: 'blue',
  preview: 'blue',
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

/** The Monday–Sunday week containing an ISO date, matching Calendar's own Monday-first grid. */
export function getWeekRange(dateISO: string): { start: string; end: string } {
  const [year, month, day] = dateISO.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const daysSinceMonday = (date.getDay() + 6) % 7;
  const start = new Date(date);
  start.setDate(start.getDate() - daysSinceMonday);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const toISO = (value: Date) =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;

  return { start: toISO(start), end: toISO(end) };
}

/**
 * Hours already taken in [weekStartISO, weekEndISO] from this VA's
 * *approved* extra-hours requests (`extraHoursByDate`). Scoped to the VA,
 * not a specific agreement — this prototype's mock data only has one VA/one
 * active agreement in play, so this is a reasonable simplification.
 * Rejected/expired/pending ("new") requests don't count — they never
 * consumed the allowance.
 */
export function getExtraHoursTakenForWeek(vaEmail: string, weekStartISO: string, weekEndISO: string): number {
  return MOCK_CA_REQUESTS.filter((request) => request.vaEmail === vaEmail && request.status === 'approved')
    .flatMap((request) => request.extraHoursByDate ?? [])
    .filter((entry) => entry.date >= weekStartISO && entry.date <= weekEndISO)
    .reduce((sum, entry) => sum + entry.hours, 0);
}

export function getInvoicesForVA(email: string): InvoiceRecord[] {
  return MOCK_INVOICES.filter((invoice) => invoice.vaEmail === email);
}

export function getInvoiceById(id: string): InvoiceRecord | undefined {
  return MOCK_INVOICES.find((invoice) => invoice.id === id);
}

export interface VAInvoiceBreakdown {
  invoice: InvoiceRecord;
  groups: InvoiceGroupView[];
}

/** Each of the VA's invoices, its line items split into the same Agreement/Extra Hours/Time Off groups the client's invoice screens use. */
export function getInvoiceBreakdownForVA(email: string): VAInvoiceBreakdown[] {
  return getInvoicesForVA(email).map((invoice) => ({
    invoice,
    groups: groupInvoiceItems(invoice.items),
  }));
}

/** A single invoice's line items split into groups, for the full "View Invoice" page. */
export function getInvoiceBreakdownById(id: string): VAInvoiceBreakdown | undefined {
  const invoice = getInvoiceById(id);
  return invoice ? { invoice, groups: groupInvoiceItems(invoice.items) } : undefined;
}
