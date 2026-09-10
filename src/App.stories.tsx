import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import App from './App';
import { resetLoginRateLimit, resetMockUsers } from './services/auth';

const meta = {
  component: App,
  tags: ['ai-generated'],
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Login screen -----------------------------------------------------

export const Default: Story = {
  play: async ({ canvas }) => {
    resetLoginRateLimit();
    const button = canvas.getByRole('button', { name: /^log in$/i });
    await expect(button).toBeDisabled();
  },
};

export const ButtonEnablesWhenBothFieldsAreFilled: Story = {
  play: async ({ canvas, userEvent }) => {
    resetLoginRateLimit();
    const button = canvas.getByRole('button', { name: /^log in$/i });
    const emailField = canvas.getByPlaceholderText('Enter your email address');
    const passwordField = canvas.getByPlaceholderText('Enter your password');

    await userEvent.type(emailField, 'admin@virtuallatinos.com');
    await expect(button).toBeDisabled();

    await userEvent.type(passwordField, 'VL-Testing-2026');
    await expect(button).toBeEnabled();
  },
};

export const UnregisteredEmailShowsError: Story = {
  play: async ({ canvas, userEvent }) => {
    resetLoginRateLimit();
    const emailField = canvas.getByPlaceholderText('Enter your email address');
    const passwordField = canvas.getByPlaceholderText('Enter your password');
    const button = canvas.getByRole('button', { name: /^log in$/i });

    await userEvent.type(emailField, 'nobody@virtuallatinos.com');
    await userEvent.type(passwordField, 'VL-Testing-2026');
    await userEvent.click(button);

    await expect(
      await canvas.findByText('The email address you entered is not registered'),
    ).toBeVisible();
    await expect(canvas.queryByText('The password you entered is incorrect')).not.toBeInTheDocument();
  },
};

export const InvalidEmailFormatShowsError: Story = {
  play: async ({ canvas, userEvent }) => {
    resetLoginRateLimit();
    const emailField = canvas.getByPlaceholderText('Enter your email address');
    const passwordField = canvas.getByPlaceholderText('Enter your password');
    const button = canvas.getByRole('button', { name: /^log in$/i });

    // Missing "@" and "." — this can never be a registered email, so it
    // should be flagged as an invalid format instead of "not registered".
    await userEvent.type(emailField, 'not-an-email');
    await userEvent.type(passwordField, 'VL-Testing-2026');
    await userEvent.click(button);

    await expect(await canvas.findByText('Please enter a valid email address')).toBeVisible();
    await expect(
      canvas.queryByText('The email address you entered is not registered'),
    ).not.toBeInTheDocument();
  },
};

export const WrongPasswordShowsError: Story = {
  play: async ({ canvas, userEvent }) => {
    resetLoginRateLimit();
    const emailField = canvas.getByPlaceholderText('Enter your email address');
    const passwordField = canvas.getByPlaceholderText('Enter your password');
    const button = canvas.getByRole('button', { name: /^log in$/i });

    await userEvent.type(emailField, 'admin@virtuallatinos.com');
    await userEvent.type(passwordField, 'wrong-password');
    await userEvent.click(button);

    await expect(await canvas.findByText('The password you entered is incorrect')).toBeVisible();
  },
};

export const DisabledUserShowsError: Story = {
  play: async ({ canvas, userEvent }) => {
    resetLoginRateLimit();
    const emailField = canvas.getByPlaceholderText('Enter your email address');
    const passwordField = canvas.getByPlaceholderText('Enter your password');
    const button = canvas.getByRole('button', { name: /^log in$/i });

    await userEvent.type(emailField, 'va2@virtuallatinos.com');
    await userEvent.type(passwordField, 'VL-Testing-2026');
    await userEvent.click(button);

    await expect(
      await canvas.findByText('User is currently disabled. Please contact system administrator.'),
    ).toBeVisible();
  },
};

export const CorrectCredentialsLogIn: Story = {
  play: async ({ canvas, userEvent }) => {
    resetLoginRateLimit();
    const emailField = canvas.getByPlaceholderText('Enter your email address');
    const passwordField = canvas.getByPlaceholderText('Enter your password');
    const button = canvas.getByRole('button', { name: /^log in$/i });

    await userEvent.type(emailField, 'client@virtuallatinos.com');
    await userEvent.type(passwordField, 'VL-Testing-2026');
    await userEvent.click(button);

    // A successful login navigates to the Home screen, whose Sidebar shows
    // the signed-in user's own name and role-specific nav (Client, not
    // Admin/VA).
    await expect(await canvas.findByText('Welcome, Sofia Martinez')).toBeVisible();
    await expect(canvas.getByRole('button', { name: /my account/i })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: /^users$/i })).not.toBeInTheDocument();
  },
};

export const AdminLoginShowsAdminSidebar: Story = {
  play: async ({ canvas, userEvent }) => {
    resetLoginRateLimit();
    await userEvent.type(canvas.getByPlaceholderText('Enter your email address'), 'admin@virtuallatinos.com');
    await userEvent.type(canvas.getByPlaceholderText('Enter your password'), 'VL-Testing-2026');
    await userEvent.click(canvas.getByRole('button', { name: /^log in$/i }));

    await expect(await canvas.findByText('Welcome, James Carter')).toBeVisible();
    await expect(canvas.getByRole('button', { name: /^users$/i })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /clients/i })).toBeVisible();
  },
};

export const VaLoginShowsVaSidebar: Story = {
  play: async ({ canvas, userEvent }) => {
    resetLoginRateLimit();
    await userEvent.type(canvas.getByPlaceholderText('Enter your email address'), 'va@virtuallatinos.com');
    await userEvent.type(canvas.getByPlaceholderText('Enter your password'), 'VL-Testing-2026');
    await userEvent.click(canvas.getByRole('button', { name: /^log in$/i }));

    // VAs land on "My Account" (not the generic Home screen), whose
    // Sidebar shows the VA's own nav.
    await expect(await canvas.findByText('My Account', { selector: 'h1' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /^invoices$/i })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: /^client invoice$/i })).not.toBeInTheDocument();

    // The profile card, an active agreement with its weekly schedule, a
    // C&A request, and an invoice all render from the VA's own mock data.
    await expect(canvas.getAllByText('Elena Ruiz')[0]).toBeVisible();
    await expect(canvas.getAllByText('The Matian Firm @ $8.00')[0]).toBeVisible();
    await expect(canvas.getByText('Request approval for short time off')).toBeVisible();
    await expect(canvas.getByText('Invoice Preview #1940-3326')).toBeVisible();
  },
};

export const PasswordVisibilityToggle: Story = {
  play: async ({ canvas, userEvent }) => {
    resetLoginRateLimit();
    const passwordField = canvas.getByPlaceholderText('Enter your password') as HTMLInputElement;
    await userEvent.type(passwordField, 'secret');
    await expect(passwordField.type).toBe('password');

    await userEvent.click(canvas.getByRole('button', { name: /show password/i }));
    await expect(passwordField.type).toBe('text');

    await userEvent.click(canvas.getByRole('button', { name: /hide password/i }));
    await expect(passwordField.type).toBe('password');
  },
};

export const FifthConsecutiveFailureStillShowsItsOwnError: Story = {
  play: async ({ canvas, userEvent }) => {
    resetLoginRateLimit();
    const emailField = canvas.getByPlaceholderText('Enter your email address');
    const passwordField = canvas.getByPlaceholderText('Enter your password');
    const button = canvas.getByRole('button', { name: /^log in$/i });

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      await userEvent.clear(emailField);
      await userEvent.clear(passwordField);
      await userEvent.type(emailField, 'admin@virtuallatinos.com');
      await userEvent.type(passwordField, 'wrong-password');
      await userEvent.click(button);
      await expect(await canvas.findByText('The password you entered is incorrect')).toBeVisible();
    }
  },
};

export const SixthConsecutiveFailureShowsTooManyRequests: Story = {
  play: async ({ canvas, userEvent }) => {
    resetLoginRateLimit();
    const emailField = canvas.getByPlaceholderText('Enter your email address');
    const passwordField = canvas.getByPlaceholderText('Enter your password');
    const button = canvas.getByRole('button', { name: /^log in$/i });

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      await userEvent.clear(emailField);
      await userEvent.clear(passwordField);
      await userEvent.type(emailField, 'admin@virtuallatinos.com');
      await userEvent.type(passwordField, 'wrong-password');
      await userEvent.click(button);
      await canvas.findByText('The password you entered is incorrect');
    }

    // A 6th attempt while locked out — even with correct credentials — is
    // rejected purely for having failed 5 times in a row already.
    await userEvent.clear(emailField);
    await userEvent.clear(passwordField);
    await userEvent.type(emailField, 'admin@virtuallatinos.com');
    await userEvent.type(passwordField, 'VL-Testing-2026');
    await userEvent.click(button);

    await expect(await canvas.findByText('Too many requests. Try again later')).toBeVisible();
  },
};

// --- Forgot Password screen --------------------------------------------

export const NavigatesToForgotPasswordScreen: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /forgot your password/i }));

    await expect(await canvas.findByText('Forgot Password')).toBeVisible();
    const submitButton = canvas.getByRole('button', { name: /^reset password$/i });
    await expect(submitButton).toBeDisabled();
  },
};

export const ForgotPasswordUnregisteredEmailShowsError: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /forgot your password/i }));

    const emailField = await canvas.findByPlaceholderText('Enter your email address');
    await userEvent.type(emailField, 'nobody@virtuallatinos.com');
    await userEvent.click(canvas.getByRole('button', { name: /^reset password$/i }));

    await expect(
      await canvas.findByText('The email address you entered is not registered'),
    ).toBeVisible();
  },
};

export const ForgotPasswordInvalidEmailFormatShowsError: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /forgot your password/i }));

    const emailField = await canvas.findByPlaceholderText('Enter your email address');
    // Missing "@" and "." — this can never be a registered email, so it
    // should be flagged as an invalid format instead of "not registered".
    await userEvent.type(emailField, 'not-an-email');
    await userEvent.click(canvas.getByRole('button', { name: /^reset password$/i }));

    await expect(await canvas.findByText('Please enter a valid email address')).toBeVisible();
    await expect(
      canvas.queryByText('The email address you entered is not registered'),
    ).not.toBeInTheDocument();
  },
};

export const GoBackToLoginFromForgotPassword: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /forgot your password/i }));
    await canvas.findByText('Forgot Password');

    await userEvent.click(canvas.getByRole('button', { name: /go to login/i }));

    await expect(await canvas.findByText('Login to your account')).toBeVisible();
  },
};

export const ForgotPasswordSuccessShowsNotificationAndNavigatesToReset: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /forgot your password/i }));

    const emailField = await canvas.findByPlaceholderText('Enter your email address');
    await userEvent.type(emailField, 'admin@virtuallatinos.com');
    await userEvent.click(canvas.getByRole('button', { name: /^reset password$/i }));

    // The form itself swaps to Figma's "Email Sent" content...
    await expect(await canvas.findByText('Password reset email sent')).toBeVisible();
    await expect(
      canvas.getByText('Please check your email inbox and follow the steps to reset your password.'),
    ).toBeVisible();
    await expect(canvas.getByRole('button', { name: /^back to login$/i })).toBeVisible();

    // ...and a floating toast (not part of Figma's design) is the actual
    // way to continue to Reset Password.
    const notification = canvas.getByRole('button', { name: /email sent — click to continue/i });
    await expect(getComputedStyle(notification).position).toBe('fixed');
    await userEvent.click(notification);

    await expect(await canvas.findByText('Reset Password')).toBeVisible();
    const emailInReset = canvas.getByDisplayValue('admin@virtuallatinos.com') as HTMLInputElement;
    await expect(emailInReset).toBeDisabled();
  },
};

export const BackToLoginFromEmailSentConfirmation: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /forgot your password/i }));

    const emailField = await canvas.findByPlaceholderText('Enter your email address');
    await userEvent.type(emailField, 'admin@virtuallatinos.com');
    await userEvent.click(canvas.getByRole('button', { name: /^reset password$/i }));
    await canvas.findByText('Password reset email sent');

    // Distinct from clicking the floating toast — this goes straight back
    // to Login instead of continuing to Reset Password.
    await userEvent.click(canvas.getByRole('button', { name: /^back to login$/i }));

    await expect(await canvas.findByText('Login to your account')).toBeVisible();
  },
};

// --- Reset Password screen ---------------------------------------------

async function navigateToResetPassword(canvas: any, userEvent: any, email = 'admin@virtuallatinos.com') {
  await userEvent.click(canvas.getByRole('button', { name: /forgot your password/i }));
  const emailField = await canvas.findByPlaceholderText('Enter your email address');
  await userEvent.type(emailField, email);
  await userEvent.click(canvas.getByRole('button', { name: /^reset password$/i }));
  const notification = await canvas.findByRole('button', { name: /email sent/i });
  await userEvent.click(notification);
  await canvas.findByText('Reset Password');
}

export const ResetPasswordButtonDisabledUntilBothFieldsFilled: Story = {
  play: async ({ canvas, userEvent }) => {
    await navigateToResetPassword(canvas, userEvent);

    const submitButton = canvas.getByRole('button', { name: /^reset password$/i });
    await expect(submitButton).toBeDisabled();

    const [newPasswordField, confirmPasswordField] = canvas.getAllByPlaceholderText(
      'Enter your new password',
    );
    await userEvent.type(newPasswordField, 'ANewPassword123');
    await expect(submitButton).toBeDisabled();

    await userEvent.type(confirmPasswordField, 'ANewPassword123');
    await expect(submitButton).toBeEnabled();
  },
};

export const ResetPasswordTooShortShowsError: Story = {
  play: async ({ canvas, userEvent }) => {
    await navigateToResetPassword(canvas, userEvent);

    const [newPasswordField, confirmPasswordField] = canvas.getAllByPlaceholderText(
      'Enter your new password',
    );
    await userEvent.type(newPasswordField, 'short1');
    await userEvent.type(confirmPasswordField, 'short1');
    await userEvent.click(canvas.getByRole('button', { name: /^reset password$/i }));

    await expect(
      await canvas.findByText('The password must contain at least 12 characters'),
    ).toBeVisible();
  },
};

export const ResetPasswordMismatchShowsError: Story = {
  play: async ({ canvas, userEvent }) => {
    await navigateToResetPassword(canvas, userEvent);

    const [newPasswordField, confirmPasswordField] = canvas.getAllByPlaceholderText(
      'Enter your new password',
    );
    await userEvent.type(newPasswordField, 'ANewPassword123');
    await userEvent.type(confirmPasswordField, 'ADifferentPassword456');
    await userEvent.click(canvas.getByRole('button', { name: /^reset password$/i }));

    await expect(await canvas.findByText("Passwords don't match")).toBeVisible();
  },
};

export const ResetPasswordSuccessUpdatesPasswordAndReturnsToLogin: Story = {
  play: async ({ canvas, userEvent }) => {
    resetLoginRateLimit();
    try {
      await navigateToResetPassword(canvas, userEvent);

      const [newPasswordField, confirmPasswordField] = canvas.getAllByPlaceholderText(
        'Enter your new password',
      );
      await userEvent.type(newPasswordField, 'ANewPassword123');
      await userEvent.type(confirmPasswordField, 'ANewPassword123');
      await userEvent.click(canvas.getByRole('button', { name: /^reset password$/i }));

      await expect(
        await canvas.findByText('Password successfully updated. You will now be redirected to login.'),
      ).toBeVisible();

      // No click needed — the screen auto-redirects back to login on its own.
      await expect(await canvas.findByText('Login to your account', {}, { timeout: 3000 })).toBeVisible();

      // The mock "database" was actually mutated — the old password no
      // longer works, and the new one does.
      const emailField = canvas.getByPlaceholderText('Enter your email address');
      const passwordField = canvas.getByPlaceholderText('Enter your password');
      const loginButton = canvas.getByRole('button', { name: /^log in$/i });

      await userEvent.type(emailField, 'admin@virtuallatinos.com');
      await userEvent.type(passwordField, 'VL-Testing-2026');
      await userEvent.click(loginButton);
      await expect(await canvas.findByText('The password you entered is incorrect')).toBeVisible();

      await userEvent.clear(passwordField);
      await userEvent.type(passwordField, 'ANewPassword123');
      await userEvent.click(loginButton);
      await waitFor(() =>
        expect(canvas.queryByText('The password you entered is incorrect')).not.toBeInTheDocument(),
      );
    } finally {
      // This test is the only one that actually mutates the mock "database"
      // — restore it so every other story/test keeps seeing the original
      // seed data regardless of run order.
      resetMockUsers();
    }
  },
};
