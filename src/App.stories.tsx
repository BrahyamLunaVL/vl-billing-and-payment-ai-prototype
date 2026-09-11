import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import App from './App';
import { resetLoginRateLimit, resetMockUsers } from './services/auth';
import {
  updateAgreementSettings,
  getAgreementById,
  resetMockAgreements,
  resetMockCARequests,
} from './services/clientAccount';

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

    // A successful login navigates to the Client's own "My Account", whose
    // Sidebar shows the signed-in user's own name and role-specific nav
    // (Client, not Admin/VA).
    await expect(await canvas.findByText('My Account', { selector: 'h1' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /^my account$/i })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /^client invoice$/i })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: /^users$/i })).not.toBeInTheDocument();

    // The client's company profile, an agreement with its VA's info, and
    // the grouped invoice breakdown all render from the client's own mock
    // data.
    await expect(canvas.getByText('LTM Innovation')).toBeVisible();
    await expect(canvas.getAllByText(/Elena Ruiz/)[0]).toBeVisible();
    await expect(canvas.getByText('(1) Invoice Total:')).toBeVisible();
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

export const ClickingACARequestShowsItsDetails: Story = {
  play: async ({ canvas, userEvent }) => {
    resetLoginRateLimit();
    await userEvent.type(canvas.getByPlaceholderText('Enter your email address'), 'va@virtuallatinos.com');
    await userEvent.type(canvas.getByPlaceholderText('Enter your password'), 'VL-Testing-2026');
    await userEvent.click(canvas.getByRole('button', { name: /^log in$/i }));

    await userEvent.click(await canvas.findByRole('button', { name: /request approval for short time off/i }));

    // The dashboard grid/invoices are replaced by the request's details —
    // Figma's "My Account - C&A Details" — and the page title is hidden,
    // matching that frame exactly.
    await expect(await canvas.findByText('Time Off Dates')).toBeVisible();
    await expect(canvas.getByText('2025-12-10')).toBeVisible();
    await expect(canvas.getByText(/requested by/i)).toBeVisible();
    await expect(canvas.queryByText('My Account', { selector: 'h1' })).not.toBeInTheDocument();
    await expect(canvas.queryByText('Virtual Latinos Invoices')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: /back to changes & approvals/i }));

    await expect(await canvas.findByText('My Account', { selector: 'h1' })).toBeVisible();
    await expect(canvas.getByText('Virtual Latinos Invoices')).toBeVisible();
  },
};

async function loginAsVA(canvas: any, userEvent: any) {
  resetLoginRateLimit();
  await userEvent.type(canvas.getByPlaceholderText('Enter your email address'), 'va@virtuallatinos.com');
  await userEvent.type(canvas.getByPlaceholderText('Enter your password'), 'VL-Testing-2026');
  await userEvent.click(canvas.getByRole('button', { name: /^log in$/i }));
  await canvas.findByText('My Account', { selector: 'h1' });
}

export const NavigatingToChangesApprovalsAndBack: Story = {
  play: async ({ canvas, userEvent }) => {
    await loginAsVA(canvas, userEvent);

    await userEvent.click(canvas.getByRole('button', { name: /changes & approvals form/i }));

    // Sidebar navigation swaps the whole page — My Account's content is
    // gone, replaced by the full Changes & Approvals list/accordion.
    await expect(await canvas.findByText('Changes & Approvals Form', { selector: 'h1' })).toBeVisible();
    await expect(canvas.queryByText('Virtual Latinos Invoices')).not.toBeInTheDocument();

    // Clicking a list card expands it in place (an accordion, not a
    // navigation), showing its richer detail grid.
    await userEvent.click(canvas.getByRole('button', { name: /request approval for extra hours/i }));
    await expect(await canvas.findByText('Approval Type')).toBeVisible();
    await expect(canvas.getByText('Manual')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: /^my account$/i }));
    await expect(await canvas.findByText('My Account', { selector: 'h1' })).toBeVisible();
  },
};

export const CreatingAnExtraHoursRequest: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await loginAsVA(canvas, userEvent);
    await userEvent.click(canvas.getByRole('button', { name: /changes & approvals form/i }));
    await userEvent.click(await canvas.findByRole('button', { name: /^new request for changes$/i }));

    // Step 1: the type picker defaults to "extra hours" (matching Figma's
    // shown state) — Next moves to step 2's real form.
    await expect(await canvas.findByText('Choose Request for Changes')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: /^next$/i }));

    await expect(await canvas.findByText('No days selected')).toBeVisible();

    // Selecting a day on the calendar (today is always enabled — it's the
    // max date) replaces the empty state with an hour entry for that day.
    const enabledDay = canvasElement.querySelector<HTMLButtonElement>(
      '.calendar__day:not(:disabled):not(.calendar__day--outside)',
    );
    if (!enabledDay) throw new globalThis.Error('Expected at least one enabled calendar day');
    await userEvent.click(enabledDay);

    await expect(canvas.queryByText('No days selected')).not.toBeInTheDocument();
    await expect(await canvas.findByText('Extra Hours Worked')).toBeVisible();
    await expect(canvas.getByText('1 Hours')).toBeVisible(); // total starts at the new day's default 1 hour

    // Pushing that single day's hours to the 12/day cap surfaces the
    // per-field warning.
    const increaseButton = canvas.getByRole('button', { name: /increase hours/i });
    for (let i = 0; i < 11; i += 1) {
      await userEvent.click(increaseButton);
    }
    await expect(await canvas.findByText("You've reached the maximum of 12 extra hours per day")).toBeVisible();
  },
};

export const ClientAgreementSettingsDriveTheVAWizard: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    try {
      // The client's Agreement Settings are the single source of truth for
      // the VA's Extra Hours wizard — a change saved on one side must show
      // up on the other, since both read the same underlying Agreement
      // record (agr-1, the VA's active agreement).
      updateAgreementSettings('agr-1', { ...getAgreementById('agr-1')!.settings, preApprovedHoursPerWeek: 8 });

      await loginAsVA(canvas, userEvent);
      await userEvent.click(canvas.getByRole('button', { name: /changes & approvals form/i }));
      await userEvent.click(await canvas.findByRole('button', { name: /^new request for changes$/i }));
      await userEvent.click(canvas.getByRole('button', { name: /^next$/i }));

      await waitFor(() => {
        const metricValue = canvasElement.querySelector('.ca-wizard__metric-value');
        if (!metricValue) throw new globalThis.Error('Expected the pre-approved hours metric to render');
        expect(metricValue.textContent).toContain('8');
      });
    } finally {
      // Mutates the shared mock "database" — restore it so later
      // stories/tests don't inherit this session's edit.
      resetMockAgreements();
    }
  },
};

async function loginAsClient(canvas: any, userEvent: any) {
  resetLoginRateLimit();
  await userEvent.type(canvas.getByPlaceholderText('Enter your email address'), 'client@virtuallatinos.com');
  await userEvent.type(canvas.getByPlaceholderText('Enter your password'), 'VL-Testing-2026');
  await userEvent.click(canvas.getByRole('button', { name: /^log in$/i }));
  await canvas.findByText('My Account', { selector: 'h1' });
}

export const ClientReviewingASingleRequest: Story = {
  play: async ({ canvas, userEvent }) => {
    try {
      await loginAsClient(canvas, userEvent);
      await userEvent.click(canvas.getByRole('button', { name: /changes & approvals form/i }));

      await expect(await canvas.findByText('Changes & Approvals Form', { selector: 'h1' })).toBeVisible();
      await expect(canvas.getByText('Request approval for short time off')).toBeVisible();

      // The pending ("New") request's View modal offers Reject/Approve —
      // approving it updates the table in place, from the same underlying
      // mock the "View" modal itself reads.
      const viewButtons = canvas.getAllByRole('button', { name: /^view$/i });
      await userEvent.click(viewButtons[0]);

      await expect(await canvas.findByText('VA Name')).toBeVisible();
      const approveButton = canvas.getByRole('button', { name: /^approve$/i });
      await userEvent.click(approveButton);

      await expect(canvas.queryByRole('button', { name: /^approve$/i })).not.toBeInTheDocument();
      await expect(await canvas.findAllByText('Approved')).not.toHaveLength(0);
    } finally {
      resetMockCARequests();
    }
  },
};

export const ClientBulkApprovingSelectedRequests: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    try {
      await loginAsClient(canvas, userEvent);
      await userEvent.click(canvas.getByRole('button', { name: /changes & approvals form/i }));
      await canvas.findByText('Changes & Approvals Form', { selector: 'h1' });

      // "Review Request" starts disabled until at least one row is selected.
      const reviewRequestButton = canvas.getByRole('button', { name: /^review request$/i });
      await expect(reviewRequestButton).toBeDisabled();

      const rowCheckboxes = canvasElement.querySelectorAll('.table__checkbox');
      // rowCheckboxes[0] is the header's "select all" — select the first 2 data rows.
      await userEvent.click(rowCheckboxes[1]);
      await userEvent.click(rowCheckboxes[2]);
      await expect(reviewRequestButton).toBeEnabled();

      await userEvent.click(reviewRequestButton);
      await expect(await canvas.findByText(/review 2 selected requests/i)).toBeVisible();

      await userEvent.click(canvas.getByRole('button', { name: /^approve all$/i }));

      // The modal closes and selection clears — "Review Request" is
      // disabled again — once the bulk action resolves both requests.
      await expect(canvas.queryByText(/review 2 selected requests/i)).not.toBeInTheDocument();
      await expect(reviewRequestButton).toBeDisabled();
    } finally {
      resetMockCARequests();
    }
  },
};

export const ViewingAnInvoiceFromMyAccount: Story = {
  play: async ({ canvas, userEvent }) => {
    await loginAsVA(canvas, userEvent);

    await userEvent.click(await canvas.findByRole('button', { name: /^view$/i }));

    await expect(await canvas.findByText('Invoice #9')).toBeVisible();
    await expect(canvas.getByText('Bloominari, LLC')).toBeVisible();
    await expect(canvas.getAllByText(/invoice preview total/i).length).toBeGreaterThan(0);

    await userEvent.click(canvas.getByRole('button', { name: /back to my account/i }));
    await expect(await canvas.findByText('My Account', { selector: 'h1' })).toBeVisible();
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
