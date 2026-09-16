import type { ReactNode } from 'react'
import { Sidebar } from '../components'
import type { AuthenticatedUser } from '../services/auth'
import './AdminAppShell.css'

export interface AdminAppShellProps {
  user: AuthenticatedUser
  selectedSidebarItem: string
  onSelectSidebarItem: (key: string) => void
  children: ReactNode
}

/** The chrome shared by every Admin page. Mirrors `ClientAppShell`/`VAAppShell`. */
export const AdminAppShell = ({ user, selectedSidebarItem, onSelectSidebarItem, children }: AdminAppShellProps) => {
  return (
    <div className="admin-shell">
      <Sidebar
        user="admin"
        userName={user.name}
        userEmail={user.email}
        userAvatarSrc={user.photo}
        selectedItem={selectedSidebarItem}
        onSelectItem={onSelectSidebarItem}
      />
      <main className="admin-shell__content">{children}</main>
    </div>
  )
}
