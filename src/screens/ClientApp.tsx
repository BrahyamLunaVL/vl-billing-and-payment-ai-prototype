import { useState } from 'react'
import type { AuthenticatedUser } from '../services/auth'
import { ClientAppShell } from './ClientAppShell'
import { ClientMyAccountScreen } from './ClientMyAccountScreen'
import { ClientAgreementScreen } from './ClientAgreementScreen'
import { ClientInvoiceScreen } from './ClientInvoiceScreen'
import { ClientChangesApprovalsScreen } from './ClientChangesApprovalsScreen'

export interface ClientAppProps {
  user: AuthenticatedUser
}

type ClientPage = 'my-account' | 'agreement' | 'client-invoice' | 'changes-approvals-form'

/** Owns which Client page is showing and drives the shared Sidebar's selection to match. */
export const ClientApp = ({ user }: ClientAppProps) => {
  const [page, setPage] = useState<ClientPage>('my-account')
  const [selectedSidebarItem, setSelectedSidebarItem] = useState('my-account')
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null)

  const handleSelectSidebarItem = (key: string) => {
    setSelectedSidebarItem(key)
    if (key === 'my-account') setPage('my-account')
    else if (key === 'client-invoice') setPage('client-invoice')
    else if (key === 'changes-approvals-form') setPage('changes-approvals-form')
  }

  const handleViewAgreement = (agreementId: string) => {
    setSelectedAgreementId(agreementId)
    setPage('agreement')
  }

  const handleBackToMyAccount = () => {
    setSelectedSidebarItem('my-account')
    setPage('my-account')
  }

  return (
    <ClientAppShell user={user} selectedSidebarItem={selectedSidebarItem} onSelectSidebarItem={handleSelectSidebarItem}>
      {page === 'my-account' && (
        <ClientMyAccountScreen
          user={user}
          onEditAgreement={handleViewAgreement}
          onRequestChanges={handleViewAgreement}
        />
      )}
      {page === 'agreement' && selectedAgreementId && (
        <ClientAgreementScreen user={user} agreementId={selectedAgreementId} onBack={handleBackToMyAccount} />
      )}
      {page === 'client-invoice' && <ClientInvoiceScreen user={user} />}
      {page === 'changes-approvals-form' && <ClientChangesApprovalsScreen user={user} />}
    </ClientAppShell>
  )
}
