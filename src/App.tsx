import { useState } from 'react'
import { LoginScreen } from './screens/LoginScreen'
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen'
import { ResetPasswordScreen } from './screens/ResetPasswordScreen'
import { HomeScreen } from './screens/HomeScreen'
import { VAApp } from './screens/VAApp'
import type { AuthenticatedUser } from './services/auth'

type Screen = 'login' | 'forgot-password' | 'reset-password' | 'home'

/**
 * Thin screen switcher. There's no router yet — this is a small enough set
 * of screens that a simple state machine is the right amount of
 * infrastructure for a prototype; reach for a real router once there are
 * enough screens (or a need for deep-linking/back-button support) to
 * justify it.
 */
function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [resetEmail, setResetEmail] = useState('')
  const [loggedInUser, setLoggedInUser] = useState<AuthenticatedUser | null>(null)

  if (screen === 'forgot-password') {
    return (
      <ForgotPasswordScreen
        onBackToLogin={() => setScreen('login')}
        onEmailSent={(email) => {
          setResetEmail(email)
          setScreen('reset-password')
        }}
      />
    )
  }

  if (screen === 'reset-password') {
    return (
      <ResetPasswordScreen
        email={resetEmail}
        onPasswordReset={() => setScreen('login')}
      />
    )
  }

  if (screen === 'home' && loggedInUser) {
    // VAs land on "My Account" (their agreements/C&A/invoices, plus the
    // Changes & Approvals and Invoice Preview pages reachable from it);
    // other roles get the generic Home screen until their own is built.
    if (loggedInUser.role === 'va') {
      return <VAApp user={loggedInUser} />
    }
    return <HomeScreen user={loggedInUser} />
  }

  return (
    <LoginScreen
      onForgotPassword={() => setScreen('forgot-password')}
      onLoginSuccess={(user) => {
        setLoggedInUser(user)
        setScreen('home')
      }}
    />
  )
}

export default App
