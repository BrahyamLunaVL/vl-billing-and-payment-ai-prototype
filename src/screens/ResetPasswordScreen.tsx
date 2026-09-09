import { useEffect, useState } from 'react'
import { Background, Form, FormField, Input, Button, Alert, Logo } from '../components'
import { resetPassword } from '../services/auth'
import './AuthScreen.css'

export interface ResetPasswordScreenProps {
  /** The email that requested the reset — shown read-only, never edited here. */
  email: string
  onPasswordReset: () => void
}

// How long the success alert stays up before auto-navigating back to login,
// matching the alert's own copy ("You will now be redirected to login").
const REDIRECT_TO_LOGIN_DELAY_MS = 2000

export const ResetPasswordScreen = ({ email, onPasswordReset }: ResetPasswordScreenProps) => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [newPasswordError, setNewPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordUpdated, setPasswordUpdated] = useState(false)

  const canSubmit = newPassword.trim() !== '' && confirmPassword.trim() !== '' && !isSubmitting

  const handleSubmit = async () => {
    if (!canSubmit) return

    setIsSubmitting(true)
    setNewPasswordError('')
    setConfirmPasswordError('')

    const result = await resetPassword(email, newPassword, confirmPassword)

    if (result.success) {
      setPasswordUpdated(true)
    } else if (result.code === 'PASSWORD_TOO_SHORT') {
      setNewPasswordError(result.message)
    } else {
      setConfirmPasswordError(result.message)
    }

    setIsSubmitting(false)
  }

  useEffect(() => {
    if (!passwordUpdated) return
    const timeoutId = window.setTimeout(onPasswordReset, REDIRECT_TO_LOGIN_DELAY_MS)
    return () => window.clearTimeout(timeoutId)
  }, [passwordUpdated, onPasswordReset])

  return (
    <div className="auth-screen">
      <Background />
      <div className="auth-screen__content">
        <Logo />
        <Form>
          <h1 className="auth-screen__title">Reset Password</h1>
          <div className="auth-screen__fields">
            <FormField label="Email Address">
              <Input type="email" value={email} disabled onChange={() => {}} />
            </FormField>
            <FormField label="New Password" errorMessage={newPasswordError}>
              <Input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                error={Boolean(newPasswordError)}
                rightIcon={showNewPassword ? 'eye-slash' : 'eye'}
                rightIconLabel={showNewPassword ? 'Hide password' : 'Show password'}
                onRightIconClick={() => setShowNewPassword((prev) => !prev)}
              />
            </FormField>
            <FormField label="Confirm Your New Password" errorMessage={confirmPasswordError}>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                error={Boolean(confirmPasswordError)}
                rightIcon={showConfirmPassword ? 'eye-slash' : 'eye'}
                rightIconLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                onRightIconClick={() => setShowConfirmPassword((prev) => !prev)}
              />
            </FormField>
          </div>
          {passwordUpdated && (
            <Alert message="Password successfully updated. You will now be redirected to login." />
          )}
          <div className="auth-screen__buttons">
            <Button
              buttonText={isSubmitting ? 'Resetting...' : 'Reset password'}
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
