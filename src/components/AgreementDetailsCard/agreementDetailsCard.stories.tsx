import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AgreementDetailsCard } from './agreementDetailsCard';

const meta = {
  component: AgreementDetailsCard,
  tags: ['ai-generated'],
  args: {
    title: 'Andrea Lucia Mondonedo Edwards | 40 Hours per week @ $18.00/hr',
    statusLabel: 'Active',
    statusTone: 'blue',
    hoursPerWeek: '40 Hours per week',
    billingType: 'Post Pay',
    dateStart: 'Date Start 2025-04-28',
    vaName: 'Andrea Lucia Mondonedo Edwards',
    vaHiredStatus: 'hired',
    vaTelegramHandle: '@AndreaMondonedoE',
    vaCountry: 'Peru',
    vaAka: 'Juan Diego Gomez',
    onEditAgreement: fn(),
    onRequestChanges: fn(),
  },
} satisfies Meta<typeof AgreementDetailsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {};

export const Terminated: Story = {
  args: { statusLabel: 'Terminated', statusTone: 'red', vaHiredStatus: 'inactive' },
};

export const ClickingActionsInvokesHandlers: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Agreement' }));
    await expect(args.onEditAgreement).toHaveBeenCalledTimes(1);

    await userEvent.click(canvas.getByRole('button', { name: 'Request Changes' }));
    await expect(args.onRequestChanges).toHaveBeenCalledTimes(1);
  },
};
