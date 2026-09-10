import type { ReactNode } from 'react'
import { Sidebar } from '../components'
import type { AuthenticatedUser } from '../services/auth'
import './VAAppShell.css'

export interface VAAppShellProps {
  user: AuthenticatedUser
  selectedSidebarItem: string
  onSelectSidebarItem: (key: string) => void
  children: ReactNode
}

/**
 * The chrome shared by every VA page (My Account, Changes & Approvals,
 * Invoice Preview, ...): the Sidebar plus a scrollable content area. Each
 * page only renders its own content — the Sidebar is owned here so
 * switching pages doesn't remount/re-fetch it.
 */
export const VAAppShell = ({ user, selectedSidebarItem, onSelectSidebarItem, children }: VAAppShellProps) => {
  return (
    <div className="va-shell">
      <Sidebar
        user="va"
        userName={user.name}
        userEmail={user.email}
        userAvatarSrc={user.photo}
        selectedItem={selectedSidebarItem}
        onSelectItem={onSelectSidebarItem}
      />
      <main className="va-shell__content">{children}</main>
    </div>
  )
}
