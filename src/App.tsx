import { useState } from 'react'
import { LoginScreen } from './screens/LoginScreen'
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen'
import { ResetPasswordScreen } from './screens/ResetPasswordScreen'

type Screen = 'login' | 'forgot-password' | 'reset-password'

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

  return <LoginScreen onForgotPassword={() => setScreen('forgot-password')} />
}

export default App
