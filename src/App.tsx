import { useState } from 'react'
import { FormField, Input, Button } from './components'
import './App.css'

const VALID_EMAIL = 'test@vl.com'
const VALID_PASSWORD = '123'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const canSubmit = email.trim() !== '' && password.trim() !== ''

  const handleSubmit = () => {
    const isEmailValid = email === VALID_EMAIL
    const isPasswordValid = password === VALID_PASSWORD

    setEmailError(isEmailValid ? '' : 'Invalid email')
    setPasswordError(isPasswordValid ? '' : 'Invalid password')

    if (isEmailValid && isPasswordValid) {
      alert('Success')
    }
  }

  return (
    <section id="login">
      <div className="login-card">
        <h1>Sign in</h1>
        <FormField label="Email" errorMessage={emailError}>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={Boolean(emailError)}
          />
        </FormField>
        <FormField label="Password" errorMessage={passwordError}>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={Boolean(passwordError)}
          />
        </FormField>
        <Button buttonText="Log in" disabled={!canSubmit} onClick={handleSubmit} />
      </div>
    </section>
  )
}

export default App
