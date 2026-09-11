import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Toggle, type ToggleOption } from './toggle';

const OPTIONS: ToggleOption[] = [
  { key: 'per-va', label: 'Per VA', icon: 'user-group' },
  { key: 'per-charge-type', label: 'Per Charge Type', icon: 'folders' },
];

const meta = {
  component: Toggle,
  tags: ['ai-generated'],
  args: {
    options: OPTIONS,
    selectedKey: 'per-va',
    onSelect: fn(),
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PerVASelected: Story = {};

export const PerChargeTypeSelected: Story = {
  args: { selectedKey: 'per-charge-type' },
};

export const WithCounts: Story = {
  args: {
    options: OPTIONS.map((option) => ({ ...option, count: option.key === 'per-va' ? 1 : 3 })),
  },
};

function ControlledToggle() {
  const [selectedKey, setSelectedKey] = useState('per-va');
  return <Toggle options={OPTIONS} selectedKey={selectedKey} onSelect={setSelectedKey} />;
}

export const ClickingATabSelectsIt: Story = {
  args: { onSelect: fn() },
  render: () => <ControlledToggle />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const perCharge = canvas.getByRole('tab', { name: /per charge type/i });
    const perVA = canvas.getByRole('tab', { name: /per va/i });
    await expect(perVA).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(perCharge);
    await expect(perCharge).toHaveAttribute('aria-selected', 'true');
    await expect(perVA).toHaveAttribute('aria-selected', 'false');
  },
};
