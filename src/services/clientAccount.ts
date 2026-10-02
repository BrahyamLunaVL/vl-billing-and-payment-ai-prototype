import { MOCK_CLIENT_PROFILES, type ClientProfile } from '../mocks/clients';
import {
  MOCK_AGREEMENTS,
  resetMockAgreements,
  DEFAULT_AGREEMENT_SETTINGS,
  type Agreement,
  type AgreementSettings,
  type AgreementStatus,
} from '../mocks/agreements';
import { MOCK_VA_PROFILES } from '../mocks/vaProfiles';
import { MOCK_USERS } from '../mocks/users';
import { MOCK_INVOICES, groupInvoiceItems, type InvoiceGroupView, type InvoiceRecord } from '../mocks/invoices';
import { sortCARequestsByRecency, shortenVAName, applyChangeBaseHoursToAgreement } from './vaAccount';
import {
  MOCK_CA_REQUESTS,
  resetMockCARequests,
  type CARequest,
  type CARequestStatus,
} from '../mocks/caRequests';

export type { ClientProfile, ClientContact } from '../mocks/clients';
export type { Agreement, AgreementStatus, AgreementSettings } from '../mocks/agreements';
export type { CARequest, CARequestStatus, CARequestDetail } from '../mocks/caRequests';
export type { InvoiceGroupView } from '../mocks/invoices';
export { resetMockAgreements, resetMockCARequests };

export function getClientProfile(email: string): ClientProfile | undefined {
  return MOCK_CLIENT_PROFILES.find((profile) => profile.email === email);
}

/** An `Agreement` plus the VA display info the client's screens show alongside it. */
export interface ClientAgreementView extends Agreement {
  vaName: string;
  vaEmail: string;
  vaWorkEmail: string;
  vaCountry: string;
  vaAka: string;
  vaTelegramHandle: string;
  vaHiredStatus: 'hired' | 'inactive';
  vaPaymentMethod: string;
  vaPhoneNumber: string;
  vaHubspotId: string;
  /** The VA's own SAM contact, e.g. "Javiera Mercado" — shown on the Admin agreements table's SAM column. */
  samContactName: string;
  clientCompanyName: string;
  /** The client company's own payment method — shown on the Agreement screen's Company card, Client only. */
  clientPaymentMethod: string;
}

function joinAgreementWithVA(agreement: Agreement): ClientAgreementView {
  const vaUser = MOCK_USERS.find((user) => user.email === agreement.vaEmail);
  const vaProfile = MOCK_VA_PROFILES.find((profile) => profile.email === agreement.vaEmail);
  const clientProfile = MOCK_CLIENT_PROFILES.find((profile) => profile.email === agreement.clientEmail);
  return {
    ...agreement,
    vaName: vaUser?.name ?? agreement.vaEmail,
    vaWorkEmail: vaUser?.email ?? '',
    vaCountry: vaProfile?.country ?? '',
    vaAka: vaProfile?.aka ?? '',
    vaTelegramHandle: vaProfile?.telegramHandle ?? '',
    vaHiredStatus: vaProfile?.hiredStatus ?? 'hired',
    vaPaymentMethod: vaProfile?.paymentMethod ?? '',
    vaPhoneNumber: vaProfile?.phoneNumber ?? '',
    vaHubspotId: vaProfile?.hubspotId ?? '',
    samContactName: agreement.samContactName ?? vaProfile?.samContactName ?? '',
    clientCompanyName: clientProfile?.companyName ?? agreement.clientName,
    clientPaymentMethod: clientProfile?.paymentMethod ?? '',
  };
}

export function getAgreementsForClient(clientEmail: string): ClientAgreementView[] {
  return MOCK_AGREEMENTS.filter((agreement) => agreement.clientEmail === clientEmail).map(joinAgreementWithVA);
}

/** Every agreement platform-wide — the Admin table's view, unscoped to one client. */
export function getAllAgreements(): ClientAgreementView[] {
  return MOCK_AGREEMENTS.map(joinAgreementWithVA);
}

export function getAgreementById(id: string): ClientAgreementView | undefined {
  const agreement = MOCK_AGREEMENTS.find((candidate) => candidate.id === id);
  return agreement ? joinAgreementWithVA(agreement) : undefined;
}

export interface ClientCompanyOption {
  clientName: string;
  clientEmail: string;
  contactName: string;
  contactEmail: string;
}

/**
 * The "Client" select's options on the Create/Edit Agreement form — the
 * distinct company identities already in use across existing agreements
 * (this prototype's single client login, `client@virtuallatinos.com`, acts
 * as several different companies depending on the agreement, e.g.
 * "Bloominari dba Virtual Latinos" vs "The Matian Firm").
 */
export function getAllClientCompanies(): ClientCompanyOption[] {
  const seen = new Set<string>();
  const companies: ClientCompanyOption[] = [];
  for (const agreement of MOCK_AGREEMENTS) {
    if (seen.has(agreement.clientName)) continue;
    seen.add(agreement.clientName);
    companies.push({
      clientName: agreement.clientName,
      clientEmail: agreement.clientEmail,
      contactName: agreement.contactName,
      contactEmail: agreement.contactEmail,
    });
  }
  return companies;
}

function nextAgreementId(): string {
  const maxNum = MOCK_AGREEMENTS.reduce((max, agreement) => {
    const match = /^agr-(\d+)$/.exec(agreement.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `agr-${maxNum + 1}`;
}

/** Everything Admin's Create/Edit Agreement form collects. */
export interface SaveAgreementInput {
  agreementName: string;
  samContactName: string;
  vaEmail: string;
  clientName: string;
  clientEmail: string;
  contactName: string;
  contactEmail: string;
  startDateISO: string;
  endDateISO?: string;
  received: boolean;
  status: AgreementStatus;
  billingType: string;
  clientBillingFrequencyType?: string;
  clientBillingFrequencyQty?: string;
  vaInvoicingFrequencyType?: string;
  vaInvoicingFrequencyQty?: string;
  clientRateRanges: string[];
  vaRateRanges: string[];
  billedRate: string;
  vaHourlyRate: string;
  hoursPerWeek?: string;
  week: Agreement['week'];
  firstEffectiveDay?: string;
}

function formatMDY(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return `${month}/${day}/${year}`;
}

/** Admin's "Save" on Create New Agreement — pushes a new record onto `MOCK_AGREEMENTS` so it shows up immediately in the "All Agreements" table. */
export function createAgreement(input: SaveAgreementInput): Agreement {
  const vaUser = MOCK_USERS.find((user) => user.email === input.vaEmail);
  const agreement: Agreement = {
    id: nextAgreementId(),
    vaEmail: input.vaEmail,
    clientEmail: input.clientEmail,
    clientName: input.clientName,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    vaRate: `VA Rate: ${input.vaHourlyRate}`,
    billedRate: input.billedRate,
    vaHourlyRate: input.vaHourlyRate,
    hoursPerWeek: input.hoursPerWeek ?? '',
    billingType: input.billingType,
    status: input.status,
    dateStart: `Date Start ${input.startDateISO}`,
    dateEnd: input.endDateISO ? `Date End: ${input.endDateISO}` : undefined,
    startDate: formatMDY(input.startDateISO),
    endDate: input.endDateISO ? formatMDY(input.endDateISO) : undefined,
    nextPaymentDate: formatMDY(input.startDateISO),
    hubspotId: String(Date.now()),
    agreementName: input.agreementName,
    week: input.week,
    settings: { ...DEFAULT_AGREEMENT_SETTINGS },
    clientRateRanges: input.clientRateRanges,
    vaRateRanges: input.vaRateRanges,
    samContactName: input.samContactName,
    received: input.received,
    clientBillingFrequencyType: input.clientBillingFrequencyType,
    clientBillingFrequencyQty: input.clientBillingFrequencyQty,
    vaInvoicingFrequencyType: input.vaInvoicingFrequencyType,
    vaInvoicingFrequencyQty: input.vaInvoicingFrequencyQty,
    initialClientRate: input.billedRate,
    initialVARate: input.vaHourlyRate,
    initialWeeklyHours: input.hoursPerWeek,
  };
  MOCK_AGREEMENTS.push(agreement);
  if (vaUser) {
    const vaProfile = MOCK_VA_PROFILES.find((profile) => profile.email === input.vaEmail);
    if (vaProfile) vaProfile.samContactName = input.samContactName;
  }
  return agreement;
}

/** Admin's "Save" on Editing Agreement — VA/Client stay fixed (the form disables them), everything else can change. */
export function updateAgreement(agreementId: string, input: SaveAgreementInput): void {
  const agreement = MOCK_AGREEMENTS.find((candidate) => candidate.id === agreementId);
  if (!agreement) return;

  agreement.agreementName = input.agreementName;
  agreement.samContactName = input.samContactName;
  agreement.status = input.status;
  agreement.received = input.received;
  agreement.billingType = input.billingType;
  agreement.dateStart = `Date Start ${input.startDateISO}`;
  agreement.dateEnd = input.endDateISO ? `Date End: ${input.endDateISO}` : undefined;
  agreement.startDate = formatMDY(input.startDateISO);
  agreement.endDate = input.endDateISO ? formatMDY(input.endDateISO) : undefined;
  agreement.clientBillingFrequencyType = input.clientBillingFrequencyType;
  agreement.clientBillingFrequencyQty = input.clientBillingFrequencyQty;
  agreement.vaInvoicingFrequencyType = input.vaInvoicingFrequencyType;
  agreement.vaInvoicingFrequencyQty = input.vaInvoicingFrequencyQty;
  agreement.clientRateRanges = input.clientRateRanges;
  agreement.vaRateRanges = input.vaRateRanges;
  agreement.billedRate = input.billedRate;
  agreement.vaHourlyRate = input.vaHourlyRate;
  agreement.vaRate = `VA Rate: ${input.vaHourlyRate}`;
  agreement.hoursPerWeek = input.hoursPerWeek ?? '';
  agreement.week = input.week;
  agreement.firstEffectiveDay = input.firstEffectiveDay;

  const vaProfile = MOCK_VA_PROFILES.find((profile) => profile.email === agreement.vaEmail);
  if (vaProfile) vaProfile.samContactName = input.samContactName;
}

/** "Elena Ruiz" + "Bloominari dba Virtual Latinos" -> "VL-Agreement-Bloominari dba Virtual Latinos-Elena R.-2026-04-08 09:14:02", matching the existing seeded agreements' own format. */
export function generateAgreementName(clientName: string, vaName: string): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const timePart = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  return `VL-Agreement-${clientName}-${shortenVAName(vaName)}-${datePart} ${timePart}`;
}

/** An `InvoiceRecord` plus the VA display info Admin's "All Invoices" table shows alongside it. */
export interface AdminInvoiceView extends InvoiceRecord {
  vaLegalName: string;
  vaPaymentEmail: string;
  vaBillingCountry: string;
}

/** Every invoice platform-wide — the Admin table's view, unscoped to one VA/client. */
export function getAllInvoices(): AdminInvoiceView[] {
  return MOCK_INVOICES.map((invoice) => {
    const vaProfile = MOCK_VA_PROFILES.find((profile) => profile.email === invoice.vaEmail);
    return {
      ...invoice,
      vaLegalName: vaProfile?.legalName ?? invoice.vaEmail,
      vaPaymentEmail: vaProfile?.paymentEmail ?? '',
      vaBillingCountry: vaProfile?.country ?? '',
    };
  });
}

/** Persists edits made from the client's Agreement Settings screen — the VA's wizard reads the same record. */
export function updateAgreementSettings(agreementId: string, settings: AgreementSettings): void {
  const agreement = MOCK_AGREEMENTS.find((candidate) => candidate.id === agreementId);
  if (agreement) {
    agreement.settings = { ...settings };
  }
}

export interface InvoiceByVAView {
  vaEmail: string;
  vaName: string;
  invoiceId: string;
  groups: InvoiceGroupView[];
  totalAmount: number;
}

/** The client's invoices grouped "Per VA" (Figma's default Invoice breakdown view). */
export function getInvoiceBreakdownForClient(clientEmail: string): InvoiceByVAView[] {
  return MOCK_INVOICES.filter((invoice) => invoice.clientAccountEmail === clientEmail).map((invoice) => {
    const vaUser = MOCK_USERS.find((user) => user.email === invoice.vaEmail);
    const groups = groupInvoiceItems(invoice.items);
    return {
      vaEmail: invoice.vaEmail,
      vaName: vaUser?.name ?? invoice.vaEmail,
      invoiceId: invoice.id,
      groups,
      totalAmount: groups.reduce((sum, group) => sum + group.totalAmount, 0),
    };
  });
}

/** The same invoices grouped "Per Charge Type" instead — across every VA. */
export function getInvoiceBreakdownByChargeTypeForClient(clientEmail: string): InvoiceGroupView[] {
  const items = MOCK_INVOICES.filter((invoice) => invoice.clientAccountEmail === clientEmail).flatMap(
    (invoice) => invoice.items,
  );
  return groupInvoiceItems(items);
}

/** A `CARequest` plus the VA display name the client's table shows it under. */
export interface ClientCARequestView extends CARequest {
  vaName: string;
}

/** Every Changes & Approvals request under this client's account (Figma's client-facing table). */
export function getCARequestsForClient(clientEmail: string): ClientCARequestView[] {
  const requests = MOCK_CA_REQUESTS.filter((request) => request.clientEmail === clientEmail).map((request) => {
    const vaUser = MOCK_USERS.find((user) => user.email === request.vaEmail);
    return { ...request, vaName: vaUser?.name ?? request.vaEmail };
  });
  return sortCARequestsByRecency(requests);
}

/** Every Changes & Approvals request platform-wide — the Admin table's view, unscoped to one client. */
export function getAllCARequests(): ClientCARequestView[] {
  const requests = MOCK_CA_REQUESTS.map((request) => {
    const vaUser = MOCK_USERS.find((user) => user.email === request.vaEmail);
    return { ...request, vaName: vaUser?.name ?? request.vaEmail };
  });
  return sortCARequestsByRecency(requests);
}

export function getCARequestByIdForClient(id: string): ClientCARequestView | undefined {
  const request = MOCK_CA_REQUESTS.find((candidate) => candidate.id === id);
  if (!request) return undefined;
  const vaUser = MOCK_USERS.find((user) => user.email === request.vaEmail);
  return { ...request, vaName: vaUser?.name ?? request.vaEmail };
}

const RESOLUTION_STATUS: Record<'approved' | 'rejected', CARequestStatus> = {
  approved: 'approved',
  rejected: 'rejected',
};

/** Resolves one request from the client's table — used by both the single "View" modal and the bulk "Review Request" action. */
export function resolveCARequest(id: string, decision: 'approved' | 'rejected', resolvedBy = 'You'): void {
  const request = MOCK_CA_REQUESTS.find((candidate) => candidate.id === id);
  if (!request) return;
  request.status = RESOLUTION_STATUS[decision];
  request.resolvedBy = resolvedBy;
  request.resolvedDate = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  // A pending "change base hours" request only reaches the agreement's own
  // week/hoursPerWeek once it's actually approved — an auto-approved one
  // already applied this at creation time, so this is a no-op for those.
  if (decision === 'approved') applyChangeBaseHoursToAgreement(request);
}

/** Resolves several requests at once — the client table's checkbox multi-select + "Review Request" action. */
export function resolveCARequests(ids: string[], decision: 'approved' | 'rejected', resolvedBy = 'You'): void {
  ids.forEach((id) => resolveCARequest(id, decision, resolvedBy));
}
