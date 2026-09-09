import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import App from './App';
import { resetLoginRateLimit } from './services/auth';

const meta = {
  component: App,
  tags: ['ai-generated'],
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

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
    const alertCalls: unknown[] = [];
    const originalAlert = window.alert;
    window.alert = (message?: unknown) => {
      alertCalls.push(message);
    };

    try {
      const emailField = canvas.getByPlaceholderText('Enter your email address');
      const passwordField = canvas.getByPlaceholderText('Enter your password');
      const button = canvas.getByRole('button', { name: /^log in$/i });

      await userEvent.type(emailField, 'client@virtuallatinos.com');
      await userEvent.type(passwordField, 'VL-Testing-2026');
      await userEvent.click(button);

      await waitFor(() => expect(alertCalls).toHaveLength(1));
      await expect(alertCalls[0]).toBe('Welcome, client@virtuallatinos.com');
      await expect(canvas.queryByText('The password you entered is incorrect')).not.toBeInTheDocument();
    } finally {
      window.alert = originalAlert;
    }
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
