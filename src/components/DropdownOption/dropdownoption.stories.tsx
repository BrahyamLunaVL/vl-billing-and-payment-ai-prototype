import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { DropdownOption } from './dropdownoption';

const meta = {
  component: DropdownOption,
  tags: ['ai-generated'],
  args: {
    text: 'Option label',
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '220px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DropdownOption>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('button');
    if (!button) throw new globalThis.Error('Expected button to render');
    // Black by default — only hover/focus/selected introduce color.
    await expect(getComputedStyle(button).color).toBe('rgb(38, 50, 56)');
  },
};

// Hover is a real CSS `:hover` pseudo-class (fucsia/600 text, see
// dropdownoption.css) — `userEvent.hover` dispatches pointer events that
// trigger JS handlers but doesn't reliably register real browser `:hover`
// state in this test runner, so it's exercised visually in Storybook's UI
// instead of asserted here (same limitation noted for Button's hover in
// button.stories.tsx history).

// Pressing/holding the option down is real CSS `:active` (purple text,
// fucsia/200 bg — a bit darker than hover's fucsia/50, see
// dropdownoption.css). Like `:hover` above, neither `userEvent.hover` nor
// `userEvent.pointer`'s synthetic press reliably register real browser
// `:active` state in this test runner, so this is exercised visually in
// Storybook's UI (press and hold the mouse on a row) rather than asserted
// here.

export const Selected: Story = {
  args: { selected: true },
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('button');
    if (!button) throw new globalThis.Error('Expected button to render');
    await expect(button.getAttribute('aria-selected')).toBe('true');
    // Selected uses fucsia/200 bg + brand/secondary text, not the default
    // white bg + brand/primary text.
    await expect(getComputedStyle(button).backgroundColor).toBe('rgb(246, 222, 230)');
    await expect(getComputedStyle(button).color).toBe('rgb(111, 29, 93)');
  },
};

export const WithIcons: Story = {
  args: {
    text: 'Option with icons',
    leftIcon: 'circle-user',
    rightIcon: 'chevron-right',
  },
  play: async ({ canvasElement }) => {
    const icons = canvasElement.querySelectorAll('svg');
    await expect(icons.length).toBe(2);
  },
};

/**
 * `DropdownOption` itself never tracks its own checked state — `selected` is
 * always a prop the caller controls (see the component's own doc comment).
 * This story wires up real local state so clicking the row actually toggles
 * the checkbox, demonstrating the pattern `Select`/`MultiSelect` themselves
 * use (a static story with an uncontrolled `selected` prop and a no-op
 * `onClick` mock would make clicking look broken, so there's no such story
 * here — this stateful one covers both the checked and unchecked look).
 */
function ToggleableCheckboxDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <DropdownOption
      text="Click to toggle"
      showCheckbox
      selected={checked}
      onClick={() => setChecked((prev) => !prev)}
    />
  );
}

export const ToggleableCheckbox: Story = {
  render: () => <ToggleableCheckboxDemo />,
  play: async ({ canvas, userEvent }) => {
    const option = canvas.getByRole('option', { name: 'Click to toggle' });
    await expect(option).toHaveAttribute('aria-selected', 'false');

    await userEvent.click(option);
    await expect(option).toHaveAttribute('aria-selected', 'true');
    await expect(option.querySelector('.dropdown-option__checkbox svg')).not.toBeNull();

    await userEvent.click(option);
    await expect(option).toHaveAttribute('aria-selected', 'false');
    await expect(option.querySelector('.dropdown-option__checkbox svg')).toBeNull();
  },
};

export const LongTextTruncates: Story = {
  args: {
    text: 'A very long option label that should truncate with an ellipsis instead of wrapping or overflowing the row',
  },
  play: async ({ canvasElement }) => {
    const textEl = canvasElement.querySelector('.dropdown-option__text');
    if (!textEl) throw new globalThis.Error('Expected text element to render');
    await expect(getComputedStyle(textEl).textOverflow).toBe('ellipsis');
  },
};

export const ClickingOptionFiresOnClick: Story = {
  args: {
    text: 'Click me',
  },
  play: async ({ canvas, args, userEvent }) => {
    const button = canvas.getByRole('option', { name: /click me/i });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/**
 * Visual catalog of every state.
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '220px' }}>
      <DropdownOption text="Default" />
      <DropdownOption text="Selected" selected />
      <DropdownOption text="With left icon" leftIcon="circle-user" />
      <DropdownOption text="With right icon" rightIcon="chevron-right" />
      <DropdownOption text="With checkbox" showCheckbox />
      <DropdownOption text="Checkbox + selected" showCheckbox selected />
    </div>
  ),
};
