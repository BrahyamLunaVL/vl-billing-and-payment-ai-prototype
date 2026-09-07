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

export const FocusColor: Story = {
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('button') as HTMLButtonElement | null;
    if (!button) throw new globalThis.Error('Expected button to render');

    // Color is animated over 0.15s (see dropdownoption.css) — wait for the
    // transition to finish before reading the settled computed value.
    button.focus();
    await new Promise((resolve) => setTimeout(resolve, 200));
    await expect(getComputedStyle(button).color).toBe('rgb(111, 29, 93)'); // brand/secondary purple

    button.blur();
    await new Promise((resolve) => setTimeout(resolve, 200));
    await expect(getComputedStyle(button).color).toBe('rgb(38, 50, 56)'); // back to black
  },
};

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

export const WithCheckbox: Story = {
  args: {
    text: 'Option with checkbox',
    showCheckbox: true,
  },
  play: async ({ canvasElement }) => {
    const checkbox = canvasElement.querySelector('.dropdown-option__checkbox');
    if (!checkbox) throw new globalThis.Error('Expected checkbox affordance to render');
    await expect(checkbox.querySelector('svg')).toBeNull();
  },
};

export const WithCheckboxChecked: Story = {
  args: {
    text: 'Option with checkbox',
    showCheckbox: true,
    selected: true,
  },
  play: async ({ canvasElement }) => {
    const checkbox = canvasElement.querySelector('.dropdown-option__checkbox');
    if (!checkbox) throw new globalThis.Error('Expected checkbox affordance to render');
    await expect(checkbox.querySelector('svg')).not.toBeNull();
    await expect(getComputedStyle(checkbox).backgroundColor).toBe('rgb(195, 32, 89)');
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
