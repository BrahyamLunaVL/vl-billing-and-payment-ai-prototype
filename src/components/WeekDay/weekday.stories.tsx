import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { WeekDay } from './weekday';

const meta = {
  component: WeekDay,
  tags: ['ai-generated'],
  args: {
    dayLetter: 'M',
    value: '8 hrs',
  },
} satisfies Meta<typeof WeekDay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('.week-day');
    if (!el) throw new globalThis.Error('Expected the week day to render');
    await expect(getComputedStyle(el).backgroundColor).toBe('rgb(246, 222, 230)');
  },
};

export const Disabled: Story = {
  args: { value: '0 hrs', disabled: true },
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('.week-day');
    if (!el) throw new globalThis.Error('Expected the week day to render');
    await expect(getComputedStyle(el).backgroundColor).toBe('rgb(246, 246, 247)');
  },
};
