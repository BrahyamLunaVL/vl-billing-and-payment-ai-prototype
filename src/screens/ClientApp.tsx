import { useState } from 'react'
import type { AuthenticatedUser } from '../services/auth'
import { ClientAppShell } from './ClientAppShell'
import { ClientMyAccountScreen } from './ClientMyAccountScreen'
import { ClientAgreementsListScreen } from './ClientAgreementsListScreen'
import { ClientAgreementScreen } from './ClientAgreementScreen'
import { ClientInvoiceScreen } from './ClientInvoiceScreen'
import { ClientNewCARequestScreen } from './ClientNewCARequestScreen'
import { ClientChangesApprovalsScreen } from './ClientChangesApprovalsScreen'
import { PlaceholderScreen } from './PlaceholderScreen'
import { getAgreementById } from '../services/clientAccount'

export interface ClientAppProps {
  user: AuthenticatedUser
}

type ClientPage =
  | 'my-account'
  | 'agreements'
  | 'agreement'
  | 'ca-wizard'
  | 'changes-approvals-form'
  | 'client-invoice'
  | 'my-va'
  | 'resources'
  | 'notifications'
  | 'settings'

const PLACEHOLDER_TITLES: Record<
  Exclude<ClientPage, 'my-account' | 'agreements' | 'agreement' | 'ca-wizard' | 'changes-approvals-form' | 'client-invoice'>,
  string
> = {
  'my-va': 'My VA',
  resources: 'Resources',
  notifications: 'Notifications',
  settings: 'Settings',
}

/**
 * Owns which Client page is showing and drives the shared Sidebar's
 * selection to match.
 */
export const ClientApp = ({ user }: ClientAppProps) => {
  const [page, setPage] = useState<ClientPage>('my-account')
  const [selectedSidebarItem, setSelectedSidebarItem] = useState('my-account')
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null)
  // Where "View Agreement" was opened from, so "Back" returns there instead of always My Account.
  const [agreementOrigin, setAgreementOrigin] = useState<'my-account' | 'agreements'>('my-account')

  const handleSelectSidebarItem = (key: string) => {
    setSelectedSidebarItem(key)
    setPage(key as ClientPage)
  }

  const handleViewAgreement = (agreementId: string) => {
    setAgreementOrigin(page === 'agreements' ? 'agreements' : 'my-account')
    setSelectedAgreementId(agreementId)
    setPage('agreement')
  }

  const handleBackFromAgreement = () => {
    setSelectedSidebarItem(agreementOrigin)
    setPage(agreementOrigin)
  }

  const handleRequestChangesForAgreement = (agreementId: string) => {
    setSelectedAgreementId(agreementId)
    setPage('ca-wizard')
  }

  const handleFinishWizard = () => {
    setSelectedSidebarItem('changes-approvals-form')
    setPage('changes-approvals-form')
  }

  const selectedAgreement = selectedAgreementId ? getAgreementById(selectedAgreementId) : undefined

  return (
    <ClientAppShell user={user} selectedSidebarItem={selectedSidebarItem} onSelectSidebarItem={handleSelectSidebarItem}>
      {page === 'my-account' && (
        <ClientMyAccountScreen
          user={user}
          onEditAgreement={handleViewAgreement}
          onRequestChanges={handleRequestChangesForAgreement}
        />
      )}
      {page === 'agreements' && (
        <ClientAgreementsListScreen
          user={user}
          onEditAgreement={handleViewAgreement}
          onRequestChanges={handleRequestChangesForAgreement}
        />
      )}
      {page === 'agreement' && selectedAgreementId && (
        <ClientAgreementScreen
          user={user}
          agreementId={selectedAgreementId}
          onBack={handleBackFromAgreement}
          onRequestChanges={() => setPage('ca-wizard')}
        />
      )}
      {page === 'ca-wizard' && selectedAgreement && (
        <ClientNewCARequestScreen agreement={selectedAgreement} onFinish={handleFinishWizard} />
      )}
      {page === 'changes-approvals-form' && <ClientChangesApprovalsScreen user={user} />}
      {page === 'client-invoice' && <ClientInvoiceScreen user={user} />}
      {page !== 'my-account' &&
        page !== 'agreements' &&
        page !== 'agreement' &&
        page !== 'ca-wizard' &&
        page !== 'changes-approvals-form' &&
        page !== 'client-invoice' && <PlaceholderScreen title={PLACEHOLDER_TITLES[page]} />}
    </ClientAppShell>
  )
}
