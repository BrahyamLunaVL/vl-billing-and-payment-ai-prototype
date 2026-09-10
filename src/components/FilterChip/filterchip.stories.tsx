import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { FilterChip } from './filterchip';

const meta = {
  component: FilterChip,
  tags: ['ai-generated'],
  args: {
    label: 'VA Name: Maria Belen Di Stefano',
    onRemove: fn(),
  },
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ClickingRemoveFiresOnRemove: Story = {
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /remove filter/i }));
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
  },
};
