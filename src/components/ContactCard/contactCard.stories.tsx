import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ContactCard } from './contactCard';

const meta = {
  component: ContactCard,
  tags: ['ai-generated'],
  args: {
    name: 'Manusha Chereddy',
    accessTypeLabel: 'Access Type (Admin):',
    description: 'Access to billing information and Approvals.',
    onCall: fn(),
    onSendEmail: fn(),
  },
} satisfies Meta<typeof ContactCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutDivider: Story = {
  args: { hideDivider: true },
};

export const ClickingCallInvokesHandler: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Call' }));
    await expect(args.onCall).toHaveBeenCalledTimes(1);

    await userEvent.click(canvas.getByRole('button', { name: 'Send Email' }));
    await expect(args.onSendEmail).toHaveBeenCalledTimes(1);
  },
};
