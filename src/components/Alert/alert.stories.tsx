import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Alert } from './alert';

const meta = {
  component: Alert,
  tags: ['ai-generated'],
  args: {
    message: 'Password successfully updated. You will now be redirected to login.',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '520px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {};

export const Warning: Story = {
  args: {
    type: 'warning',
    message: 'You have added too few hours. Make sure the hours match the weekly hours on your agreement.',
  },
};

export const ErrorAlert: Story = {
  args: {
    type: 'error',
    message: 'You have added too many hours. Make sure the hours match the weekly hours on your agreement.',
  },
};

export const UsesTypeColorForIconAndText: Story = {
  args: {
    type: 'error',
  },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('.alert');
    if (!root) throw new globalThis.Error('Expected the alert to render');
    const cs = getComputedStyle(root);
    await expect(cs.color).toBe('rgb(222, 21, 21)');
    await expect(cs.backgroundColor).toBe('rgb(250, 220, 220)');
  },
};
