import { useState } from 'react'
import logo from '../assets/logo.png'
import { Background, Form, FormField, Input, Button, Notification } from '../components'
import { resetPassword } from '../services/auth'
import './AuthScreen.css'

export interface ResetPasswordScreenProps {
  /** The email that requested the reset — shown read-only, never edited here. */
  email: string
  onPasswordReset: () => void
}

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

  return (
    <div className="auth-screen">
      <Background />
      <div className="auth-screen__content">
        <img src={logo} alt="Virtual Latinos" className="auth-screen__logo" />
        <Form>
          <h1 className="auth-screen__title">Reset Password</h1>
          {passwordUpdated ? (
            <Notification message="Password updated — click to continue" onClick={onPasswordReset} />
          ) : (
            <>
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
              <div className="auth-screen__buttons">
                <Button
                  buttonText={isSubmitting ? 'Resetting...' : 'Reset password'}
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}
        </Form>
      </div>
    </div>
  )
}
