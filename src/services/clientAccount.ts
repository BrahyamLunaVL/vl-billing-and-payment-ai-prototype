import { MOCK_CLIENT_PROFILES, type ClientProfile } from '../mocks/clients';
import { MOCK_AGREEMENTS, resetMockAgreements, type Agreement, type AgreementSettings } from '../mocks/agreements';
import { MOCK_VA_PROFILES } from '../mocks/vaProfiles';
import { MOCK_USERS } from '../mocks/users';
import { MOCK_INVOICES, type InvoiceLineItemData, type InvoiceLineItemGroup } from '../mocks/invoices';
import {
  MOCK_CA_REQUESTS,
  resetMockCARequests,
  type CARequest,
  type CARequestStatus,
} from '../mocks/caRequests';

export type { ClientProfile, ClientContact } from '../mocks/clients';
export type { Agreement, AgreementStatus, AgreementSettings } from '../mocks/agreements';
export type { CARequest, CARequestStatus, CARequestDetail } from '../mocks/caRequests';
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
  clientCompanyName: string;
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
    clientCompanyName: clientProfile?.companyName ?? agreement.clientName,
  };
}

export function getAgreementsForClient(clientEmail: string): ClientAgreementView[] {
  return MOCK_AGREEMENTS.filter((agreement) => agreement.clientEmail === clientEmail).map(joinAgreementWithVA);
}

export function getAgreementById(id: string): ClientAgreementView | undefined {
  const agreement = MOCK_AGREEMENTS.find((candidate) => candidate.id === id);
  return agreement ? joinAgreementWithVA(agreement) : undefined;
}

/** Persists edits made from the client's Agreement Settings screen — the VA's wizard reads the same record. */
export function updateAgreementSettings(agreementId: string, settings: AgreementSettings): void {
  const agreement = MOCK_AGREEMENTS.find((candidate) => candidate.id === agreementId);
  if (agreement) {
    agreement.settings = { ...settings };
  }
}

export interface InvoiceGroupView {
  group: InvoiceLineItemGroup;
  label: string;
  items: InvoiceLineItemData[];
  totalAmount: number;
}

export interface InvoiceByVAView {
  vaEmail: string;
  vaName: string;
  invoiceId: string;
  groups: InvoiceGroupView[];
  totalAmount: number;
}

const GROUP_LABEL: Record<InvoiceLineItemGroup, string> = {
  agreement: 'Agreement',
  'extra-hours': 'Extra Hours',
};

function parseAmount(amount: string): number {
  return Number(amount.replace(/[^0-9.-]/g, '')) || 0;
}

function groupItems(items: InvoiceLineItemData[]): InvoiceGroupView[] {
  const order: InvoiceLineItemGroup[] = ['agreement', 'extra-hours'];
  return order
    .map((group) => {
      const groupItemsList = items.filter((item) => item.group === group);
      if (groupItemsList.length === 0) return null;
      return {
        group,
        label: GROUP_LABEL[group],
        items: groupItemsList,
        totalAmount: groupItemsList.reduce((sum, item) => sum + parseAmount(item.amount), 0),
      };
    })
    .filter((group): group is InvoiceGroupView => group !== null);
}

/** The client's invoices grouped "Per VA" (Figma's default Invoice breakdown view). */
export function getInvoiceBreakdownForClient(clientEmail: string): InvoiceByVAView[] {
  return MOCK_INVOICES.filter((invoice) => invoice.clientAccountEmail === clientEmail).map((invoice) => {
    const vaUser = MOCK_USERS.find((user) => user.email === invoice.vaEmail);
    const groups = groupItems(invoice.items);
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
  return groupItems(items);
}

/** A `CARequest` plus the VA display name the client's table shows it under. */
export interface ClientCARequestView extends CARequest {
  vaName: string;
}

/** Every Changes & Approvals request under this client's account (Figma's client-facing table). */
export function getCARequestsForClient(clientEmail: string): ClientCARequestView[] {
  return MOCK_CA_REQUESTS.filter((request) => request.clientEmail === clientEmail).map((request) => {
    const vaUser = MOCK_USERS.find((user) => user.email === request.vaEmail);
    return { ...request, vaName: vaUser?.name ?? request.vaEmail };
  });
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
}

/** Resolves several requests at once — the client table's checkbox multi-select + "Review Request" action. */
export function resolveCARequests(ids: string[], decision: 'approved' | 'rejected', resolvedBy = 'You'): void {
  ids.forEach((id) => resolveCARequest(id, decision, resolvedBy));
}
