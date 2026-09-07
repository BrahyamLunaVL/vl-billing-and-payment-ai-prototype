import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import App from './App';

const meta = {
  component: App,
  tags: ['ai-generated'],
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /log in/i });
    await expect(button).toBeDisabled();
  },
};

export const ButtonEnablesWhenBothFieldsAreFilled: Story = {
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: /log in/i });
    const emailField = canvas.getByPlaceholderText('you@example.com');
    const passwordField = canvas.getByPlaceholderText('Enter your password');

    await userEvent.type(emailField, 'test@vl.com');
    await expect(button).toBeDisabled();

    await userEvent.type(passwordField, '123');
    await expect(button).toBeEnabled();
  },
};

export const WrongEmailShowsError: Story = {
  play: async ({ canvas, userEvent }) => {
    const emailField = canvas.getByPlaceholderText('you@example.com');
    const passwordField = canvas.getByPlaceholderText('Enter your password');
    const button = canvas.getByRole('button', { name: /log in/i });

    await userEvent.type(emailField, 'wrong@vl.com');
    await userEvent.type(passwordField, '123');
    await userEvent.click(button);

    await expect(await canvas.findByText('Invalid email')).toBeVisible();
    await expect(canvas.queryByText('Invalid password')).not.toBeInTheDocument();
  },
};

export const WrongPasswordShowsError: Story = {
  play: async ({ canvas, userEvent }) => {
    const emailField = canvas.getByPlaceholderText('you@example.com');
    const passwordField = canvas.getByPlaceholderText('Enter your password');
    const button = canvas.getByRole('button', { name: /log in/i });

    await userEvent.type(emailField, 'test@vl.com');
    await userEvent.type(passwordField, 'wrong-password');
    await userEvent.click(button);

    await expect(await canvas.findByText('Invalid password')).toBeVisible();
    await expect(canvas.queryByText('Invalid email')).not.toBeInTheDocument();
  },
};

export const CorrectCredentialsShowSuccessAlert: Story = {
  play: async ({ canvas, userEvent }) => {
    const alertSpy = fn();
    const originalAlert = window.alert;
    window.alert = alertSpy;

    try {
      const emailField = canvas.getByPlaceholderText('you@example.com');
      const passwordField = canvas.getByPlaceholderText('Enter your password');
      const button = canvas.getByRole('button', { name: /log in/i });

      await userEvent.type(emailField, 'test@vl.com');
      await userEvent.type(passwordField, '123');
      await userEvent.click(button);

      await expect(alertSpy).toHaveBeenCalledTimes(1);
      await expect(alertSpy).toHaveBeenCalledWith('Success');
      await expect(canvas.queryByText('Invalid email')).not.toBeInTheDocument();
      await expect(canvas.queryByText('Invalid password')).not.toBeInTheDocument();
    } finally {
      window.alert = originalAlert;
    }
  },
};
