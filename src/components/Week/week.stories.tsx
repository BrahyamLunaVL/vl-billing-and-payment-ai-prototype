import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Week } from './week';

const meta = {
  component: Week,
  tags: ['ai-generated'],
} satisfies Meta<typeof Week>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const days = canvasElement.querySelectorAll('.week-day');
    await expect(days.length).toBe(7);
    // Mon-Fri enabled, Sat-Sun disabled by default.
    await expect(days[4].classList.contains('week-day--disabled')).toBe(false);
    await expect(days[5].classList.contains('week-day--disabled')).toBe(true);
    await expect(days[6].classList.contains('week-day--disabled')).toBe(true);
  },
};

export const CustomSchedule: Story = {
  args: {
    days: [
      { key: 'mon', dayLetter: 'M', value: '4 hrs' },
      { key: 'tue', dayLetter: 'T', value: '4 hrs' },
      { key: 'wed', dayLetter: 'W', value: '4 hrs' },
      { key: 'thu', dayLetter: 'T', value: '4 hrs' },
      { key: 'fri', dayLetter: 'F', value: '4 hrs' },
      { key: 'sat', dayLetter: 'S', value: '4 hrs' },
      { key: 'sun', dayLetter: 'S', value: '0 hrs', disabled: true },
    ],
  },
  play: async ({ canvasElement }) => {
    const days = canvasElement.querySelectorAll('.week-day');
    // A VA who works Saturdays isn't disabled just because it's the weekend.
    await expect(days[5].classList.contains('week-day--disabled')).toBe(false);
  },
};
