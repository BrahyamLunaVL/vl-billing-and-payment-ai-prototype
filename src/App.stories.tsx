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

    // Admin's home page is the Agreements & Work Hrs table — every
    // agreement platform-wide, not a dashboard/home screen.
    await expect(await canvas.findByText('Agreements', { selector: 'h1' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /^users$/i })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /clients/i })).toBeVisible();
    await expect(canvas.getAllByText('LTM Innovation').length).toBeGreaterThan(0);
    await expect(canvas.getAllByText('Elena Ruiz').length).toBeGreaterThan(0);
  },
};

export const AdminOpeningAnAgreementAndRequestingChanges: Story = {
  play: async ({ canvas, userEvent }) => {
    resetLoginRateLimit();
    await userEvent.type(canvas.getByPlaceholderText('Enter your email address'), 'admin@virtuallatinos.com');
    await userEvent.type(canvas.getByPlaceholderText('Enter your password'), 'VL-Testing-2026');
    await userEvent.click(canvas.getByRole('button', { name: /^log in$/i }));

    // Admin reaches an agreement's detail screen through the table's
    // per-row "Select Action" menu, not a direct row click.
    await userEvent.click((await canvas.findAllByRole('button', { name: /select action/i }))[0]);
    await userEvent.click(await canvas.findByRole('option', { name: /^view$/i }));

    await expect(await canvas.findByText('LTM Innovation - Elena Ruiz (40 Hours)')).toBeVisible();
    await expect(canvas.getByRole('button', { name: /view client details/i })).toBeVisible();

    // The detail screen's "Request Changes" button opens the wizard, whose
    // step 1 gets an Admin-only "Request on behalf of" selector Figma adds
    // on top of the VA's own request-type list — unlike the sidebar's own
    // "Changes & Approvals Form" item, which opens the platform-wide table.
    await userEvent.click(canvas.getByRole('button', { name: /^request changes$/i }));
    await expect(await canvas.findByText('Request on behalf of')).toBeVisible();
    await expect(canvas.getByText('Main Changes Requested from the Virtual Assistant (VA)')).toBeVisible();

    await userEvent.click(canvas.getByRole('radio', { name: /^client$/i }));
    await expect(canvas.getByText('Main Changes Requested from the Client')).toBeVisible();
  },
};

export const AdminViewingAVAInvoice: Story = {
  play: async ({ canvas, userEvent }) => {
    resetLoginRateLimit();
    await userEvent.type(canvas.getByPlaceholderText('Enter your email address'), 'admin@virtuallatinos.com');
    await userEvent.type(canvas.getByPlaceholderText('Enter your password'), 'VL-Testing-2026');
    await userEvent.click(canvas.getByRole('button', { name: /^log in$/i }));

    await userEvent.click(await canvas.findByRole('button', { name: /^va invoice$/i }));

    // Admin's View Invoice adds an "Invoice Status" chip, a "Payment Data"
    // card, and — only while the invoice is still unauthorized ("Due") —
    // a warning banner, none of which the VA's own View Invoice shows.
    await expect(await canvas.findByText('Invoice #9')).toBeVisible();
    await expect(canvas.getByText('Due')).toBeVisible();
    await expect(canvas.getByText('Payment Data')).toBeVisible();
    await expect(canvas.getByText('Payment data not found.')).toBeVisible();
    await expect(
      canvas.getByText(/you cannot add payment data before invoice has been authorized for payment/i),
    ).toBeVisible();
    await expect(canvas.getByText('Work Report')).toBeVisible();
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
    await expect(canvas.getAllByText('Bloominari dba Virtual Latinos @ $11.00')[0]).toBeVisible();
    await expect(canvas.getByText('Request approval for short time off')).toBeVisible();
    await expect(canvas.getByText('Invoice Preview #1940-3326')).toBeVisible();
  },
};

export const VaOpeningAnAgreementFromMyAccount: Story = {
  play: async ({ canvas, userEvent }) => {
    resetLoginRateLimit();
    await userEvent.type(canvas.getByPlaceholderText('Enter your email address'), 'va@virtuallatinos.com');
    await userEvent.type(canvas.getByPlaceholderText('Enter your password'), 'VL-Testing-2026');
    await userEvent.click(canvas.getByRole('button', { name: /^log in$/i }));

    // Each Agreement Card is itself a button — clicking it opens that
    // agreement's own detail screen (shared with Client/Admin, driven by
    // viewerRole="va" here).
    await userEvent.click(await canvas.findByRole('button', { name: /bloominari dba virtual latinos/i }));

    // The detail page's title matches the exact name the VA clicked, not
    // the client account's own (unrelated) company name.
    await expect(await canvas.findByText('Bloominari dba Virtual Latinos - Elena Ruiz (40 Hours)')).toBeVisible();
    // The VA sees their own rate on their own card...
    await expect(canvas.getByText('$11.00/hr')).toBeVisible();
    // ...but never the Client's rate, which only appears on the Client
    // card for Client/Admin viewers.
    await expect(canvas.queryByText('$8.00/hr')).not.toBeInTheDocument();
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

    await userEvent.click(canvas.getByRole('button', { name: /back to your account/i }));

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

    // Typing directly into that day's hour input (clamped to the 12/day
    // cap) updates the totals below.
    const hourInput = canvasElement.querySelector<HTMLInputElement>('.ca-wizard__date-rows input[type="number"]');
    if (!hourInput) throw new globalThis.Error('Expected the day hour input to render');
    await userEvent.clear(hourInput);
    await userEvent.type(hourInput, '12');
    await expect(await canvas.findByText('12 Hours')).toBeVisible();
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
    await expect(canvas.getAllByText('Bloominari, LLC').length).toBeGreaterThan(0);
    await expect(canvas.getAllByText(/invoice preview total/i).length).toBeGreaterThan(0);

    // The full "View Invoice" page has no back button of its own (matching
    // Figma) — the sidebar's own "My Account" nav item is the way back.
    await userEvent.click(canvas.getByRole('button', { name: /^my account$/i }));
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
