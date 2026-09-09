import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Form } from './form';
import { Icon } from '../Icon';
import { FormField } from '../FormField';
import { Input } from '../Input';
import { Button } from '../Button';

const meta = {
  component: Form,
  tags: ['ai-generated'],
  args: {
    children: <div style={{ width: '100%', height: '40px' }} />,
  },
  decorators: [
    (Story) => (
      <div style={{ background: '#1c1d22', padding: '40px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A centered title + description header, composed manually the same way any
 * other content would be — Figma's "centered title" variant of Login Form,
 * built entirely from the project's existing components rather than a Form
 * prop.
 */
function LoginFormWithCenteredTitleDemo() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: '100%' }}>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: '#263238', textAlign: 'center' }}>
          Welcome back
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#263238', textAlign: 'center' }}>
          Sign in to continue to your account
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        <FormField label="Email">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormField>
        <FormField label="Password">
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </FormField>
      </div>
      <Button buttonText="Log in" style={{ width: '100%' }} />
    </Form>
  );
}

export const CenteredTitle: Story = {
  render: () => <LoginFormWithCenteredTitleDemo />,
};

/**
 * A left-aligned title with a close button on the right — Figma's other
 * Login Form variant — again composed manually from existing components
 * (the close button is just an `Icon` in a plain button).
 */
function LoginFormWithLeftTitleDemo() {
  return (
    <Form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: '#263238' }}>Reset password</h1>
          <button
            type="button"
            aria-label="Close"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#263238' }}
          >
            <Icon name="xmark" variant="bold" size={20} />
          </button>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: '#263238' }}>
          We'll send a recovery link to your email
        </p>
      </div>
      <FormField label="Email">
        <Input type="email" placeholder="you@example.com" value="" onChange={() => {}} />
      </FormField>
      <Button buttonText="Send link" style={{ width: '100%' }} />
    </Form>
  );
}

export const LeftTitleWithCloseButton: Story = {
  render: () => <LoginFormWithLeftTitleDemo />,
};

export const RendersContainerStyling: Story = {
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.form');
    if (!card) throw new globalThis.Error('Expected the form card to render');
    const cs = getComputedStyle(card);
    await expect(cs.backgroundColor).toBe('rgb(255, 255, 255)');
    await expect(cs.borderRadius).toBe('32px');
    await expect(cs.gap).toBe('40px');
  },
};
