import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CardRow } from './cardRow';

const meta = {
  component: CardRow,
  tags: ['ai-generated'],
  args: {
    title: 'Rate:',
    value: '$12.50/hr',
  },
} satisfies Meta<typeof CardRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PlainValue: Story = {};

export const LinkValue: Story = {
  args: { title: 'Telegram:', value: '@juan.gomez', link: true, onValueClick: fn() },
};

export const ClickingALinkInvokesHandler: Story = {
  args: { title: 'Telegram:', value: '@juan.gomez', link: true, onValueClick: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '@juan.gomez' }));
    await expect(args.onValueClick).toHaveBeenCalledTimes(1);
  },
};
