import { useState } from 'react'
import logo from '../assets/logo.png'
import { Background, Form, FormField, Input, Button, Notification } from '../components'
import { requestPasswordReset } from '../services/auth'
import './AuthScreen.css'

export interface ForgotPasswordScreenProps {
  onBackToLogin: () => void
  /** Called once the user continues past the "email sent" confirmation, with the email to carry over to Reset Password. */
  onEmailSent: (email: string) => void
}

export const ForgotPasswordScreen = ({ onBackToLogin, onEmailSent }: ForgotPasswordScreenProps) => {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const canSubmit = email.trim() !== '' && !isSubmitting

  const handleSubmit = async () => {
    if (!canSubmit) return

    setIsSubmitting(true)
    setEmailError('')

    const result = await requestPasswordReset(email)

    if (result.success) {
      setEmailSent(true)
    } else {
      setEmailError(result.message)
    }

    setIsSubmitting(false)
  }

  return (
    <div className="auth-screen">
      <Background />
      {/* Floating toast — not part of Figma's "Email Sent" frame, added on
          top of it as the actual way to continue to Reset Password. */}
      {emailSent && (
        <Notification
          floating
          message="Email sent — click to continue"
          onClick={() => onEmailSent(email)}
        />
      )}
      <div className="auth-screen__content">
        <img src={logo} alt="Virtual Latinos" className="auth-screen__logo" />
        {emailSent ? (
          // Matches Figma's "Forgot Password - Email Sent" frame exactly.
          <Form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: '100%' }}>
              <h1 className="auth-screen__title">Password reset email sent</h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                <p className="auth-screen__description">
                  Please check your email inbox and follow the steps to reset your password.
                </p>
                <p className="auth-screen__description">If you did not receive the email, check your Spam folder</p>
              </div>
            </div>
            <div className="auth-screen__buttons">
              <Button buttonText="Back to login" onClick={onBackToLogin} style={{ width: '100%' }} />
            </div>
          </Form>
        ) : (
          <Form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: '100%' }}>
              <h1 className="auth-screen__title">Forgot Password</h1>
              <p className="auth-screen__description">Please enter your email to reset your password.</p>
            </div>
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
            </div>
            <div className="auth-screen__buttons">
              <Button
                buttonText={isSubmitting ? 'Sending...' : 'Reset password'}
                disabled={!canSubmit}
                onClick={handleSubmit}
                style={{ width: '100%' }}
              />
              <Button type="ghost" buttonText="Go to login" onClick={onBackToLogin} />
            </div>
          </Form>
        )}
      </div>
    </div>
  )
}
