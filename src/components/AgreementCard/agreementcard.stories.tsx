import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { AgreementCard } from './agreementcard';

const meta = {
  component: AgreementCard,
  tags: ['ai-generated'],
  args: {
    title: 'The Matian Firm @ $8.00',
    statusLabel: 'Active',
    statusTone: 'blue',
    hoursPerWeek: '40 Hours per week',
    vaRate: 'VA Rate: $11.00',
    dateStart: 'Date Start 2025-04-28',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AgreementCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    week: [
      { key: 'mon', dayLetter: 'M', value: '8 hrs' },
      { key: 'tue', dayLetter: 'T', value: '8 hrs' },
      { key: 'wed', dayLetter: 'W', value: '8 hrs' },
      { key: 'thu', dayLetter: 'T', value: '8 hrs' },
      { key: 'fri', dayLetter: 'F', value: '8 hrs' },
      { key: 'sat', dayLetter: 'S', value: '0 hrs', disabled: true },
      { key: 'sun', dayLetter: 'S', value: '0 hrs', disabled: true },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('The Matian Firm @ $8.00')).toBeVisible();
    await expect(canvas.getByText('Active')).toBeVisible();
    await expect(canvas.getByText('40 Hours per week')).toBeVisible();
  },
};

export const Terminated: Story = {
  args: {
    statusLabel: 'Terminated',
    statusTone: 'red',
    clientRate: 'Client Rate: $15.00',
    dateEnd: 'Date End: 2025-01-24',
    week: undefined,
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Terminated')).toBeVisible();
    await expect(canvas.getByText('Date End: 2025-01-24')).toBeVisible();
    await expect(canvasElement.querySelector('.week')).toBeNull();
  },
};

export const WithEditButton: Story = {
  args: { onEdit: fn() },
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /edit agreement/i }));
    await expect(args.onEdit).toHaveBeenCalledTimes(1);
  },
};
