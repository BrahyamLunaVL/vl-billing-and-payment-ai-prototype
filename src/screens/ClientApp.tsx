import { useState } from 'react'
import type { AuthenticatedUser } from '../services/auth'
import { ClientAppShell } from './ClientAppShell'
import { ClientMyAccountScreen } from './ClientMyAccountScreen'

export interface ClientAppProps {
  user: AuthenticatedUser
}

type ClientPage = 'my-account'

/** Owns which Client page is showing and drives the shared Sidebar's selection to match. */
export const ClientApp = ({ user }: ClientAppProps) => {
  const [page, setPage] = useState<ClientPage>('my-account')
  const [selectedSidebarItem, setSelectedSidebarItem] = useState('my-account')

  const handleSelectSidebarItem = (key: string) => {
    setSelectedSidebarItem(key)
    if (key === 'my-account') setPage('my-account')
  }

  return (
    <ClientAppShell user={user} selectedSidebarItem={selectedSidebarItem} onSelectSidebarItem={handleSelectSidebarItem}>
      {page === 'my-account' && (
        <ClientMyAccountScreen
          user={user}
          onEditAgreement={() => {}}
          onRequestChanges={() => {}}
        />
      )}
    </ClientAppShell>
  )
}
