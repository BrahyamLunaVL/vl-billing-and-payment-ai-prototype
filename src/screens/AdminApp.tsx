import { useState } from 'react'
import type { AuthenticatedUser } from '../services/auth'
import { AdminAppShell } from './AdminAppShell'
import { ClientAgreementScreen } from './ClientAgreementScreen'
import { ClientChangesApprovalsScreen } from './ClientChangesApprovalsScreen'
import { AdminPlaceholderScreen } from './AdminPlaceholderScreen'

export interface AdminAppProps {
  user: AuthenticatedUser
}

type AdminPage =
  | 'agreements'
  | 'users'
  | 'vas'
  | 'clients'
  | 'va-invoice'
  | 'va-invoice-claims'
  | 'client-invoice'
  | 'client-invoice-claims'
  | 'changes-approvals-form'
  | 'ca-webhook'
  | 'codes'
  | 'deposits'
  | 'resources'

const PLACEHOLDER_TITLES: Record<Exclude<AdminPage, 'agreements' | 'changes-approvals-form'>, string> = {
  users: 'Users',
  vas: 'VAs',
  clients: 'Clients',
  'va-invoice': 'VA Invoice',
  'va-invoice-claims': 'VA Invoice Claims',
  'client-invoice': 'Client Invoice',
  'client-invoice-claims': 'Client Invoice Claims',
  'ca-webhook': 'C&A Webhook',
  codes: 'Codes',
  deposits: 'Deposits',
  resources: 'Resources',
}

// Per the client's instruction, Admin has no dedicated home/agreements-list
// screen — its landing page is this agreement's own detail view.
const ADMIN_HOME_AGREEMENT_ID = 'agr-1'

/** Owns which Admin page is showing and drives the shared Sidebar's selection to match. */
export const AdminApp = ({ user }: AdminAppProps) => {
  const [page, setPage] = useState<AdminPage>('agreements')
  const [selectedSidebarItem, setSelectedSidebarItem] = useState('agreements')

  const handleSelectSidebarItem = (key: string) => {
    setSelectedSidebarItem(key)
    setPage(key as AdminPage)
  }

  return (
    <AdminAppShell user={user} selectedSidebarItem={selectedSidebarItem} onSelectSidebarItem={handleSelectSidebarItem}>
      {page === 'agreements' && (
        <ClientAgreementScreen
          user={user}
          agreementId={ADMIN_HOME_AGREEMENT_ID}
          onBack={() => setPage('agreements')}
          viewerRole="admin"
        />
      )}
      {page === 'changes-approvals-form' && <ClientChangesApprovalsScreen user={user} scope="admin" />}
      {page !== 'agreements' && page !== 'changes-approvals-form' && (
        <AdminPlaceholderScreen title={PLACEHOLDER_TITLES[page]} />
      )}
    </AdminAppShell>
  )
}
