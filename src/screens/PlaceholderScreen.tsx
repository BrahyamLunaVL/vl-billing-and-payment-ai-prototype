import { ProfileCard } from '../components'
import './PlaceholderScreen.css'

export interface PlaceholderScreenProps {
  title: string
}

/** Stand-in for any sidebar item (Admin, Client, or VA) that has no screen designed/built yet. */
export const PlaceholderScreen = ({ title }: PlaceholderScreenProps) => {
  return (
    <>
      <h1 className="placeholder-screen__title">{title}</h1>
      <ProfileCard>
        <p className="placeholder-screen__notice">This page isn&apos;t available in the prototype yet.</p>
      </ProfileCard>
    </>
  )
}
