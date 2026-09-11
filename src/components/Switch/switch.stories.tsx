import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Switch } from './switch';

const meta = {
  component: Switch,
  tags: ['ai-generated'],
  args: {
    checked: false,
    onChange: fn(),
    'aria-label': 'Auto-Approval for Extra Hours Requests by VA',
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = {
  args: { checked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

function ControlledSwitch() {
  const [checked, setChecked] = useState(false);
  return <Switch checked={checked} onChange={setChecked} aria-label="Notify me" />;
}

export const ClickingTogglesIt: Story = {
  render: () => <ControlledSwitch />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('checkbox') as HTMLInputElement;
    await expect(input.checked).toBe(false);

    await userEvent.click(input);
    await expect(input.checked).toBe(true);
  },
};
