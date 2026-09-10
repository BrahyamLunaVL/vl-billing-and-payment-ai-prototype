import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Invoice } from './invoice';

const meta = {
  component: Invoice,
  tags: ['ai-generated'],
  args: {
    title: 'Invoice Preview #1940-3326',
    items: [
      { key: '1', description: '40hs @ $8.00 | Weekly Service from 2026-08-03 to 2026-08-09', amount: '$320.00' },
      { key: '2', description: '40hs @ $8.00 | Weekly Service from 2026-08-10 to 2026-08-16', amount: '$320.00' },
    ],
    totalLabel: 'Invoice Preview Total:',
    totalAmount: '$640.00',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '900px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Invoice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OutsideApprovalPeriod: Story = {
  args: {
    actions: [
      { key: 'view', label: 'View', onClick: fn() },
      { key: 'approve', label: 'Approve' },
      { key: 'upload', label: 'Upload Reports' },
      { key: 'claim', label: 'Request Invoice Review (Claim)' },
    ],
    warnings: [
      "Cannot approve invoice preview outside approval period.",
      'Cannot upload invoice reports outside approval period.',
      'Cannot request review outside review invoice period.',
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /^view$/i })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: /^approve$/i })).toBeDisabled();
    await expect(canvas.getByText(/cannot approve invoice preview/i)).toBeVisible();
  },
};

export const Approved: Story = {
  args: {
    actions: [{ key: 'view', label: 'View', onClick: fn() }],
    approvedMessage: 'Approved on: Friday, January 2, 2026 at 10:32 PM',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/approved on:/i)).toBeVisible();
  },
};

export const ClickingViewFiresOnClick: Story = {
  args: {
    actions: [{ key: 'view', label: 'View', onClick: fn() }],
  },
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^view$/i }));
    await expect(args.actions[0].onClick).toHaveBeenCalledTimes(1);
  },
};
