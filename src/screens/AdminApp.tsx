import { useState } from 'react'
import type { AuthenticatedUser } from '../services/auth'
import { AdminAppShell } from './AdminAppShell'
import { AdminAgreementsListScreen } from './AdminAgreementsListScreen'
import { ClientAgreementScreen } from './ClientAgreementScreen'
import { AdminNewCARequestScreen } from './AdminNewCARequestScreen'
import { AdminInvoicesListScreen } from './AdminInvoicesListScreen'
import { AdminInvoiceScreen } from './AdminInvoiceScreen'
import { ClientChangesApprovalsScreen } from './ClientChangesApprovalsScreen'
import { AdminPlaceholderScreen } from './AdminPlaceholderScreen'
import { getAgreementById } from '../services/clientAccount'

export interface AdminAppProps {
  user: AuthenticatedUser
}

type AdminPage =
  | 'agreements'
  | 'agreement'
  | 'ca-wizard'
  | 'users'
  | 'vas'
  | 'clients'
  | 'va-invoice'
  | 'va-invoice-detail'
  | 'va-invoice-claims'
  | 'client-invoice'
  | 'client-invoice-claims'
  | 'changes-approvals-form'
  | 'ca-webhook'
  | 'codes'
  | 'deposits'
  | 'resources'

const PLACEHOLDER_TITLES: Record<
  Exclude<
    AdminPage,
    'agreements' | 'agreement' | 'ca-wizard' | 'changes-approvals-form' | 'va-invoice' | 'va-invoice-detail'
  >,
  string
> = {
  users: 'Users',
  vas: 'VAs',
  clients: 'Clients',
  'va-invoice-claims': 'VA Invoice Claims',
  'client-invoice': 'Client Invoice',
  'client-invoice-claims': 'Client Invoice Claims',
  'ca-webhook': 'C&A Webhook',
  codes: 'Codes',
  deposits: 'Deposits',
  resources: 'Resources',
}

/** Owns which Admin page is showing and drives the shared Sidebar's selection to match. */
export const AdminApp = ({ user }: AdminAppProps) => {
  const [page, setPage] = useState<AdminPage>('agreements')
  const [selectedSidebarItem, setSelectedSidebarItem] = useState('agreements')
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)

  const handleSelectSidebarItem = (key: string) => {
    setSelectedSidebarItem(key)
    setPage(key as AdminPage)
  }

  const handleViewAgreement = (agreementId: string) => {
    setSelectedAgreementId(agreementId)
    setPage('agreement')
  }

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId)
    setPage('va-invoice-detail')
  }

  const handleFinishWizard = () => {
    setSelectedSidebarItem('changes-approvals-form')
    setPage('changes-approvals-form')
  }

  const selectedAgreement = selectedAgreementId ? getAgreementById(selectedAgreementId) : undefined

  return (
    <AdminAppShell user={user} selectedSidebarItem={selectedSidebarItem} onSelectSidebarItem={handleSelectSidebarItem}>
      {page === 'agreements' && <AdminAgreementsListScreen onViewAgreement={handleViewAgreement} />}
      {page === 'agreement' && selectedAgreementId && (
        <ClientAgreementScreen
          user={user}
          agreementId={selectedAgreementId}
          onBack={() => setPage('agreements')}
          viewerRole="admin"
          onRequestChanges={() => setPage('ca-wizard')}
        />
      )}
      {page === 'ca-wizard' && selectedAgreement && (
        <AdminNewCARequestScreen agreement={selectedAgreement} onFinish={handleFinishWizard} />
      )}
      {page === 'changes-approvals-form' && <ClientChangesApprovalsScreen user={user} scope="admin" />}
      {page === 'va-invoice' && <AdminInvoicesListScreen onViewInvoice={handleViewInvoice} />}
      {page === 'va-invoice-detail' && selectedInvoiceId && <AdminInvoiceScreen invoiceId={selectedInvoiceId} />}
      {page !== 'agreements' &&
        page !== 'agreement' &&
        page !== 'ca-wizard' &&
        page !== 'changes-approvals-form' &&
        page !== 'va-invoice' &&
        page !== 'va-invoice-detail' && <AdminPlaceholderScreen title={PLACEHOLDER_TITLES[page]} />}
    </AdminAppShell>
  )
}
