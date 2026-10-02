import { useState } from 'react'
import type { AuthenticatedUser } from '../services/auth'
import { AdminAppShell } from './AdminAppShell'
import { AdminAgreementsListScreen } from './AdminAgreementsListScreen'
import { ClientAgreementScreen } from './ClientAgreementScreen'
import { AdminNewCARequestScreen } from './AdminNewCARequestScreen'
import { AdminInvoicesListScreen } from './AdminInvoicesListScreen'
import { AdminInvoiceScreen } from './AdminInvoiceScreen'
import { ClientChangesApprovalsScreen } from './ClientChangesApprovalsScreen'
import { AdminVAsListScreen } from './AdminVAsListScreen'
import { AdminVAFormScreen } from './AdminVAFormScreen'
import { AdminAgreementFormScreen } from './AdminAgreementFormScreen'
import { AdminPlaceholderScreen } from './AdminPlaceholderScreen'
import { getAgreementById } from '../services/clientAccount'

export interface AdminAppProps {
  user: AuthenticatedUser
}

type AdminPage =
  | 'agreements'
  | 'agreement'
  | 'agreement-form'
  | 'ca-wizard'
  | 'users'
  | 'vas'
  | 'va-form'
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
    | 'agreements'
    | 'agreement'
    | 'agreement-form'
    | 'ca-wizard'
    | 'changes-approvals-form'
    | 'va-invoice'
    | 'va-invoice-detail'
    | 'vas'
    | 'va-form'
  >,
  string
> = {
  users: 'Users',
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
  const [vaFormMode, setVaFormMode] = useState<'create' | 'edit'>('create')
  const [editingVAEmail, setEditingVAEmail] = useState<string | undefined>(undefined)
  const [agreementFormMode, setAgreementFormMode] = useState<'create' | 'edit'>('create')
  const [editingAgreementId, setEditingAgreementId] = useState<string | undefined>(undefined)

  const handleSelectSidebarItem = (key: string) => {
    setSelectedSidebarItem(key)
    setPage(key as AdminPage)
  }

  const handleViewAgreement = (agreementId: string) => {
    setSelectedAgreementId(agreementId)
    setPage('agreement')
  }

  const handleRequestChangesForAgreement = (agreementId: string) => {
    setSelectedAgreementId(agreementId)
    setPage('ca-wizard')
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

  const handleNewVA = () => {
    setVaFormMode('create')
    setEditingVAEmail(undefined)
    setPage('va-form')
  }

  const handleEditVA = (vaEmail: string) => {
    setVaFormMode('edit')
    setEditingVAEmail(vaEmail)
    setPage('va-form')
  }

  const handleVAFormDone = () => setPage('vas')

  const handleNewAgreement = () => {
    setAgreementFormMode('create')
    setEditingAgreementId(undefined)
    setPage('agreement-form')
  }

  const handleEditAgreement = (agreementId: string) => {
    setAgreementFormMode('edit')
    setEditingAgreementId(agreementId)
    setPage('agreement-form')
  }

  const handleAgreementFormDone = () => setPage('agreements')

  return (
    <AdminAppShell user={user} selectedSidebarItem={selectedSidebarItem} onSelectSidebarItem={handleSelectSidebarItem}>
      {page === 'agreements' && (
        <AdminAgreementsListScreen
          onViewAgreement={handleViewAgreement}
          onRequestChanges={handleRequestChangesForAgreement}
          onNewAgreement={handleNewAgreement}
          onEditAgreement={handleEditAgreement}
        />
      )}
      {page === 'agreement-form' && (
        <AdminAgreementFormScreen
          mode={agreementFormMode}
          agreementId={editingAgreementId}
          onCancel={handleAgreementFormDone}
          onSaved={handleAgreementFormDone}
        />
      )}
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
      {page === 'vas' && <AdminVAsListScreen onNewVA={handleNewVA} onEditVA={handleEditVA} />}
      {page === 'va-form' && (
        <AdminVAFormScreen mode={vaFormMode} vaEmail={editingVAEmail} onCancel={handleVAFormDone} onSaved={handleVAFormDone} />
      )}
      {page !== 'agreements' &&
        page !== 'agreement' &&
        page !== 'agreement-form' &&
        page !== 'ca-wizard' &&
        page !== 'changes-approvals-form' &&
        page !== 'va-invoice' &&
        page !== 'va-invoice-detail' &&
        page !== 'vas' &&
        page !== 'va-form' && <AdminPlaceholderScreen title={PLACEHOLDER_TITLES[page]} />}
    </AdminAppShell>
  )
}
