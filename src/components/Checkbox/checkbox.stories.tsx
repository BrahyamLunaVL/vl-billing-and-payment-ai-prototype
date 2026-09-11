import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Checkbox } from './checkbox';

const meta = {
  component: Checkbox,
  tags: ['ai-generated'],
  args: {
    label: 'Email me when my VA reports pre-approved extra hours',
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = {
  args: { checked: true, onChange: () => {} },
};

export const Disabled: Story = {
  args: { disabled: true },
};

function ControlledCheckbox() {
  const [checked, setChecked] = useState(false);
  return <Checkbox label="Notify me" checked={checked} onChange={(event) => setChecked(event.target.checked)} />;
}

export const ClickingTogglesIt: Story = {
  render: () => <ControlledCheckbox />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('checkbox') as HTMLInputElement;
    await expect(input.checked).toBe(false);

    await userEvent.click(canvas.getByText('Notify me'));
    await expect(input.checked).toBe(true);
  },
};
