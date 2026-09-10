import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { CACard } from './cacard';

const meta = {
  component: CACard,
  tags: ['ai-generated'],
  args: {
    title: 'Request approval for short time off',
    date: 'December 10, 2025',
    statusLabel: 'Active',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CACard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ChipLeft: Story = {};

export const ChipRight: Story = {
  args: { layout: 'chip-right' },
};

export const ClickableCardFiresOnClick: Story = {
  args: { onClick: fn() },
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <CACard title="Request approval for short time off" date="December 10, 2025" statusLabel="New" statusTone="purple" />
      <CACard
        title="Request approval for short time off"
        date="December 10, 2025"
        statusLabel="Approved"
        statusTone="blue"
        layout="chip-right"
      />
      <CACard title="Request approval for short time off" date="December 10, 2025" statusLabel="Rejected" statusTone="red" />
    </div>
  ),
};
