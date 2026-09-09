import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Option } from './option';

const meta = {
  component: Option,
  tags: ['ai-generated'],
  args: {
    text: 'Option Text',
    leftIcon: 'eye',
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '220px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Option>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('button');
    if (!button) throw new globalThis.Error('Expected button to render');
    // Black, bold by default (navigation type) — only hover/pressed/selected
    // introduce color.
    await expect(getComputedStyle(button).color).toBe('rgb(38, 50, 56)');
    await expect(getComputedStyle(button).fontWeight).toBe('700');
  },
};

export const ActionsTypeIsRegularWeight: Story = {
  args: { type: 'actions' },
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('button');
    if (!button) throw new globalThis.Error('Expected button to render');
    await expect(getComputedStyle(button).fontWeight).toBe('400');
  },
};

// Hover (navigation: fucsia/50 bg + brand/primary text; actions: brand/
// primary text only, bg unchanged) is a real CSS `:hover` pseudo-class —
// `userEvent.hover` doesn't reliably register real browser `:hover` state in
// this test runner, so it's exercised visually in Storybook's UI instead of
// asserted here (same limitation noted throughout this project's other
// components, e.g. DropdownOption).

// Pressing/holding the option down (real CSS `:active`) renders identically
// to `selected` below — see option.css — and has the same test-runner
// limitation as hover, so it's exercised visually rather than asserted.

export const Selected: Story = {
  args: { selected: true },
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('button');
    if (!button) throw new globalThis.Error('Expected button to render');
    await expect(button.getAttribute('aria-current')).toBe('page');
    // Selected uses fucsia/200 bg + brand/secondary text for navigation
    // items, not the default white bg + black text.
    await expect(getComputedStyle(button).backgroundColor).toBe('rgb(246, 222, 230)');
    await expect(getComputedStyle(button).color).toBe('rgb(111, 29, 93)');
  },
};

export const SelectedActionsTypeKeepsWhiteBackground: Story = {
  args: { type: 'actions', selected: true },
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('button');
    if (!button) throw new globalThis.Error('Expected button to render');
    // Actions-type rows never tint their background, even when selected.
    await expect(getComputedStyle(button).backgroundColor).toBe('rgb(255, 255, 255)');
    await expect(getComputedStyle(button).color).toBe('rgb(111, 29, 93)');
    // aria-current is a page-navigation semantic, not applicable to an
    // actions/context-menu row.
    await expect(button.hasAttribute('aria-current')).toBe(false);
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    const button = canvasElement.querySelector('button');
    if (!button) throw new globalThis.Error('Expected button to render');
    await expect(button).toBeDisabled();
    await expect(getComputedStyle(button).color).toBe('rgb(187, 187, 187)');

    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const WithoutIcon: Story = {
  args: { leftIcon: undefined },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('svg')).toBeNull();
  },
};

export const LongTextTruncates: Story = {
  args: {
    text: 'A very long option label that should truncate with an ellipsis instead of wrapping or overflowing the row',
  },
  play: async ({ canvasElement }) => {
    const textEl = canvasElement.querySelector('.option__text');
    if (!textEl) throw new globalThis.Error('Expected text element to render');
    await expect(getComputedStyle(textEl).textOverflow).toBe('ellipsis');
  },
};

export const ClickingOptionFiresOnClick: Story = {
  play: async ({ canvas, args, userEvent }) => {
    const button = canvas.getByRole('button', { name: /option text/i });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/**
 * Visual catalog of every state, for both types.
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '220px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Option text="Default" leftIcon="eye" />
        <Option text="Selected" leftIcon="eye" selected />
        <Option text="Disabled" leftIcon="eye" disabled />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Option text="Default" leftIcon="eye" type="actions" />
        <Option text="Selected" leftIcon="eye" type="actions" selected />
        <Option text="Disabled" leftIcon="eye" type="actions" disabled />
      </div>
    </div>
  ),
};
