import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { InvoiceCard } from './invoiceCard';

const SECTIONS = [
  {
    key: 'client',
    label: 'Bloominari dba Virtual Latinos',
    totalAmount: '$682.50',
    sections: [
      {
        key: 'agreement',
        label: 'Agreement',
        totalAmount: '$640.00',
        items: [
          { key: '1', description: '40hs @ $8.00 | Weekly Service from 2026-08-03 to 2026-08-09', amount: '$320.00' },
          { key: '2', description: '40hs @ $8.00 | Weekly Service from 2026-08-10 to 2026-08-16', amount: '$320.00' },
        ],
      },
      {
        key: 'extra-hours',
        label: 'Extra Hours',
        totalAmount: '$42.50',
        items: [{ key: '3', description: '5 Extra Hours, rate $8.50', amount: '$42.50' }],
      },
    ],
  },
];

const meta = {
  component: InvoiceCard,
  tags: ['ai-generated'],
  args: {
    title: 'Invoice preview #1940-3326',
    sections: SECTIONS,
    totalLabel: 'Invoice Preview Total:',
    totalAmount: '$682.50',
  },
} satisfies Meta<typeof InvoiceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithActions: Story = {
  args: {
    actions: [
      { key: 'view', label: 'View', onClick: fn() },
      { key: 'approve', label: 'Approve' },
      { key: 'upload', label: 'Upload Reports' },
      { key: 'claim', label: 'Request Invoice Review (Claim)' },
    ],
    warnings: [
      'Cannot approve invoice preview outside approval period.',
      'Cannot upload invoice reports outside approval period.',
      'Cannot request review outside review invoice period.',
    ],
  },
};

export const WithoutActions: Story = {};

export const Approved: Story = {
  args: {
    actions: [{ key: 'view', label: 'View', onClick: fn() }],
    approvedMessage: 'Approved on: October 5, 2023',
  },
};

export const ClickingViewInvokesHandler: Story = {
  args: {
    actions: [{ key: 'view', label: 'View', onClick: fn() }],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'View' }));
    await expect(args.actions![0].onClick).toHaveBeenCalledTimes(1);
  },
};
