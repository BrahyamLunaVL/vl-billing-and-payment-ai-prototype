import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { InvoiceSummary, type InvoiceSummarySection } from './invoiceSummary';

const PER_VA_SECTIONS: InvoiceSummarySection[] = [
  {
    key: 'juan-diego-gomez',
    label: 'Juan Diego Gomez',
    totalAmount: '$682.50',
    sections: [
      {
        key: 'agreement',
        label: 'Agreement',
        totalAmount: '$640.00',
        items: [
          { key: '1', description: 'Weekly Service from 2023-09-18 to 2023-09-24, 40hs @ $10.00', amount: '$320.00' },
          { key: '2', description: 'Weekly Service from 2023-09-25 to 2023-10-01, 40hs @ $10.00', amount: '$320.00' },
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
  component: InvoiceSummary,
  tags: ['ai-generated'],
  args: {
    sections: PER_VA_SECTIONS,
    totalLabel: '(1) Invoice Total:',
    totalAmount: '$682.50',
  },
} satisfies Meta<typeof InvoiceSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PerVA: Story = {};

export const PerChargeType: Story = {
  args: {
    sections: [
      {
        key: 'agreement',
        label: 'Agreement',
        totalAmount: '$640.00',
        items: [
          { key: '1', description: 'Weekly Service from 2023-09-18 to 2023-09-24, 40hs @ $10.00', amount: '$320.00' },
          { key: '2', description: 'Weekly Service from 2023-09-25 to 2023-10-01, 40hs @ $10.00', amount: '$320.00' },
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
};

export const CollapsingASectionHidesItsChildren: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const agreementHeader = canvas.getByRole('button', { name: /agreement/i });
    await expect(canvas.getByText(/Weekly Service from 2023-09-18/)).toBeVisible();

    await userEvent.click(agreementHeader);
    await expect(canvas.queryByText(/Weekly Service from 2023-09-18/)).not.toBeInTheDocument();

    await userEvent.click(agreementHeader);
    await expect(canvas.getByText(/Weekly Service from 2023-09-18/)).toBeVisible();
  },
};
