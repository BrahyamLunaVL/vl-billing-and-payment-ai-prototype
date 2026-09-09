import { useState } from 'react'
import { Sidebar } from '../components'
import type { AuthenticatedUser } from '../services/auth'
import './HomeScreen.css'

export interface HomeScreenProps {
  user: AuthenticatedUser
}

/**
 * The screen shown right after login. Its Sidebar's nav items depend
 * entirely on `user.role` (Sidebar already picks the right list for
 * admin/client/va) — the content area itself is a placeholder until each
 * role's actual home content is designed.
 */
export const HomeScreen = ({ user }: HomeScreenProps) => {
  const [selectedItem, setSelectedItem] = useState('')

  return (
    <div className="home-screen">
      <Sidebar
        user={user.role}
        userName={user.name}
        userEmail={user.email}
        userAvatarSrc={user.photo}
        selectedItem={selectedItem}
        onSelectItem={setSelectedItem}
      />
      <main className="home-screen__content">
        <h1 className="home-screen__title">Welcome, {user.name}</h1>
      </main>
    </div>
  )
}
