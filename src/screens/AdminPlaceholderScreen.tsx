import { ProfileCard } from '../components'
import './AdminPlaceholderScreen.css'

export interface AdminPlaceholderScreenProps {
  title: string
}

/** Stand-in for the Admin sidebar items Figma hasn't designed yet. */
export const AdminPlaceholderScreen = ({ title }: AdminPlaceholderScreenProps) => {
  return (
    <>
      <h1 className="admin-placeholder-screen__title">{title}</h1>
      <ProfileCard>
        <p className="admin-placeholder-screen__notice">This page isn&apos;t available in the prototype yet.</p>
      </ProfileCard>
    </>
  )
}
