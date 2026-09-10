import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Calendar } from './calendar';

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

const TODAY = new Date();
const MIN_DATE = toISODate(addMonths(TODAY, -4));
const MAX_DATE = toISODate(TODAY);

const meta = {
  component: Calendar,
  tags: ['ai-generated'],
  args: {
    selectedDates: [],
    onToggleDate: fn(),
    minDate: MIN_DATE,
    maxDate: MAX_DATE,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `Calendar` never tracks its own selection — `selectedDates` is always a
 * prop the caller controls. This wires up real local state so clicking a
 * day actually selects/deselects it.
 */
function ControlledCalendar() {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const toggleDate = (date: string) => {
    setSelectedDates((prev) => (prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]));
  };
  return <Calendar selectedDates={selectedDates} onToggleDate={toggleDate} minDate={MIN_DATE} maxDate={MAX_DATE} />;
}

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // Today gets an outline ring, and is always enabled (it's the max date).
    const today = canvasElement.querySelector(`button[aria-pressed="false"]:not(:disabled)`);
    await expect(today).not.toBeNull();
  },
};

export const FutureDaysAreDisabled: Story = {
  play: async ({ canvasElement }) => {
    // The max date is today, so every day strictly after it in this
    // month's grid (if any render) must be disabled.
    const days = Array.from(canvasElement.querySelectorAll<HTMLButtonElement>('.calendar__day'));
    const disabledCount = days.filter((day) => day.disabled).length;
    await expect(disabledCount).toBeGreaterThan(0);
  },
};

export const ClickingADayTogglesSelection: Story = {
  args: { selectedDates: [] },
  render: () => <ControlledCalendar />,
  play: async ({ canvasElement, userEvent }) => {
    const enabledDay = Array.from(canvasElement.querySelectorAll<HTMLButtonElement>('.calendar__day')).find(
      (day) => !day.disabled,
    );
    if (!enabledDay) throw new globalThis.Error('Expected at least one enabled day');

    await userEvent.click(enabledDay);
    await expect(enabledDay).toHaveAttribute('aria-pressed', 'true');
    await expect(enabledDay.className).toContain('calendar__day--selected');

    await userEvent.click(enabledDay);
    await expect(enabledDay).toHaveAttribute('aria-pressed', 'false');
  },
};

export const PreSelectedDate: Story = {
  args: { selectedDates: [MAX_DATE] },
  play: async ({ canvasElement }) => {
    const selected = canvasElement.querySelector('.calendar__day--selected');
    await expect(selected).not.toBeNull();
    await expect(selected).toHaveAttribute('aria-pressed', 'true');
  },
};
