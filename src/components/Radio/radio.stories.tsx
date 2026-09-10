import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Radio } from './radio';

const meta = {
  component: Radio,
  tags: ['ai-generated'],
  args: {
    label: 'Request approval for extra hours',
    name: 'demo',
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  play: async ({ canvasElement }) => {
    const circle = canvasElement.querySelector('.radio__circle');
    if (!circle) throw new globalThis.Error('Expected the radio circle to render');
    await expect(getComputedStyle(circle).backgroundColor).toBe('rgb(255, 255, 255)');
  },
};

export const Checked: Story = {
  args: { checked: true, onChange: () => {} },
  play: async ({ canvasElement }) => {
    const circle = canvasElement.querySelector('.radio__circle');
    if (!circle) throw new globalThis.Error('Expected the radio circle to render');
    await expect(getComputedStyle(circle).borderColor).toBe('rgb(195, 32, 89)');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

/**
 * `Radio` never tracks its own checked state — it's always a prop the
 * caller controls. This wires up a real group so clicking an option
 * actually selects it.
 */
function ControlledGroup() {
  const [value, setValue] = useState('extra-hours');
  const options = [
    { value: 'time-off', label: 'Request approval for time off' },
    { value: 'extra-hours', label: 'Request approval for extra hours' },
    { value: 'raise', label: 'Request approval for a bonus or commission' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {options.map((option) => (
        <Radio
          key={option.value}
          name="group-demo"
          label={option.label}
          checked={value === option.value}
          onChange={() => setValue(option.value)}
        />
      ))}
    </div>
  );
}

export const ClickingAnOptionSelectsIt: Story = {
  args: { label: 'unused' },
  render: () => <ControlledGroup />,
  play: async ({ canvas, userEvent }) => {
    const timeOff = canvas.getByRole('radio', { name: /time off/i });
    const extraHours = canvas.getByRole('radio', { name: /extra hours/i });
    await expect(extraHours).toBeChecked();

    await userEvent.click(timeOff);
    await expect(timeOff).toBeChecked();
    await expect(extraHours).not.toBeChecked();
  },
};
