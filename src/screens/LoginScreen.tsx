import { useState } from 'react'
import logo from '../assets/logo.png'
import { Background, Form, FormField, Input, Button } from '../components'
import { login } from '../services/auth'
import './AuthScreen.css'

export interface LoginScreenProps {
  onForgotPassword: () => void
}

export const LoginScreen = ({ onForgotPassword }: LoginScreenProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = email.trim() !== '' && password.trim() !== '' && !isSubmitting

  const handleSubmit = async () => {
    if (!canSubmit) return

    setIsSubmitting(true)
    setEmailError('')
    setPasswordError('')

    const result = await login(email, password)

    if (result.success) {
      alert(`Welcome, ${result.user.email}`)
    } else if (result.code === 'INVALID_EMAIL_FORMAT' || result.code === 'EMAIL_NOT_REGISTERED') {
      // Every other failure (wrong password, disabled user, too many
      // requests) surfaces on the password field instead, matching Figma's
      // edge-case screens exactly.
      setEmailError(result.message)
    } else {
      setPasswordError(result.message)
    }

    setIsSubmitting(false)
  }

  return (
    <div className="auth-screen">
      <Background />
      <div className="auth-screen__content">
        <img src={logo} alt="Virtual Latinos" className="auth-screen__logo" />
        <Form>
          <h1 className="auth-screen__title">Login to your account</h1>
          <div className="auth-screen__fields">
            <FormField label="Email Address" errorMessage={emailError}>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={Boolean(emailError)}
              />
            </FormField>
            <FormField label="Password" errorMessage={passwordError}>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={Boolean(passwordError)}
                rightIcon={showPassword ? 'eye-slash' : 'eye'}
                rightIconLabel={showPassword ? 'Hide password' : 'Show password'}
                onRightIconClick={() => setShowPassword((prev) => !prev)}
              />
            </FormField>
          </div>
          <div className="auth-screen__buttons">
            <Button type="ghost" buttonText="Forgot your password?" onClick={onForgotPassword} />
            <Button
              buttonText={isSubmitting ? 'Logging in...' : 'Log in'}
              disabled={!canSubmit}
              onClick={handleSubmit}
              style={{ width: '100%' }}
            />
          </div>
        </Form>
      </div>
    </div>
  )
}
