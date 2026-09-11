import type { ReactNode } from 'react'
import { Sidebar } from '../components'
import type { AuthenticatedUser } from '../services/auth'
import './ClientAppShell.css'

export interface ClientAppShellProps {
  user: AuthenticatedUser
  selectedSidebarItem: string
  onSelectSidebarItem: (key: string) => void
  children: ReactNode
}

/**
 * The chrome shared by every Client page (My Account, Agreements, Client
 * Invoice, Changes & Approvals, ...): the Sidebar plus a scrollable content
 * area. Mirrors `VAAppShell` — kept as its own component (rather than a
 * shared `user`-parameterized shell) since each role's page set/behavior
 * will keep diverging as more Client pages get built.
 */
export const ClientAppShell = ({ user, selectedSidebarItem, onSelectSidebarItem, children }: ClientAppShellProps) => {
  return (
    <div className="client-shell">
      <Sidebar
        user="client"
        userName={user.name}
        userEmail={user.email}
        userAvatarSrc={user.photo}
        selectedItem={selectedSidebarItem}
        onSelectItem={onSelectSidebarItem}
      />
      <main className="client-shell__content">{children}</main>
    </div>
  )
}
