import { MOCK_CLIENT_PROFILES, type ClientProfile } from '../mocks/clients';
import { MOCK_AGREEMENTS, type Agreement, type AgreementSettings } from '../mocks/agreements';
import { MOCK_VA_PROFILES } from '../mocks/vaProfiles';
import { MOCK_USERS } from '../mocks/users';
import { MOCK_INVOICES, type InvoiceLineItemData, type InvoiceLineItemGroup } from '../mocks/invoices';

export type { ClientProfile, ClientContact } from '../mocks/clients';
export type { Agreement, AgreementStatus, AgreementSettings } from '../mocks/agreements';

export function getClientProfile(email: string): ClientProfile | undefined {
  return MOCK_CLIENT_PROFILES.find((profile) => profile.email === email);
}

/** An `Agreement` plus the VA display info the client's screens show alongside it. */
export interface ClientAgreementView extends Agreement {
  vaName: string;
  vaCountry: string;
  vaAka: string;
  vaTelegramHandle: string;
  vaHiredStatus: 'hired' | 'inactive';
}

export function getAgreementsForClient(clientEmail: string): ClientAgreementView[] {
  return MOCK_AGREEMENTS.filter((agreement) => agreement.clientEmail === clientEmail).map((agreement) => {
    const vaUser = MOCK_USERS.find((user) => user.email === agreement.vaEmail);
    const vaProfile = MOCK_VA_PROFILES.find((profile) => profile.email === agreement.vaEmail);
    return {
      ...agreement,
      vaName: vaUser?.name ?? agreement.vaEmail,
      vaCountry: vaProfile?.country ?? '',
      vaAka: vaProfile?.aka ?? '',
      vaTelegramHandle: vaProfile?.telegramHandle ?? '',
      vaHiredStatus: vaProfile?.hiredStatus ?? 'hired',
    };
  });
}

export function getAgreementById(id: string): Agreement | undefined {
  return MOCK_AGREEMENTS.find((agreement) => agreement.id === id);
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
