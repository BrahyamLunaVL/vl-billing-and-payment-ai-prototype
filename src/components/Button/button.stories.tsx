import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Button } from './button';

const meta = {
  component: Button,
  tags: ['ai-generated'],
  args: {
    buttonText: 'Button Text',
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = {
  args: { type: 'primary' },
};

export const Secondary: Story = {
  args: { type: 'secondary' },
};

export const Tertiary: Story = {
  args: { type: 'tertiary' },
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('button');
    const inner = canvasElement.querySelector('.button__inner');
    if (!button || !inner) throw new globalThis.Error('Expected button and inner container to render');
    // Tertiary's border is the button's real outer border, always visible —
    // not the focus-only ring the other types show on .button__inner.
    await expect(getComputedStyle(button).borderColor).toBe('rgb(231, 166, 189)');
    await expect(getComputedStyle(inner).borderColor).toBe('rgba(0, 0, 0, 0)');
  },
};

export const Ghost: Story = {
  args: { type: 'ghost' },
};

export const Success: Story = {
  args: { type: 'success' },
};

export const Error: Story = {
  args: { type: 'error' },
};

export const Small: Story = {
  args: { size: 'small' },
};

export const MultipleText: Story = {
  args: {
    type: 'primary',
    multipleText: true,
    supportingText: 'Total:',
    actionText: '$120.00',
  },
  play: async ({ canvasElement }) => {
    const supporting = canvasElement.querySelector('.button__supporting-text');
    const action = canvasElement.querySelector('.button__action-text');
    if (!supporting || !action) throw new globalThis.Error('Expected both text nodes to render');
    // Every type except Ghost uses one color for both labels (the type's
    // normal single-text color) — only Ghost is two-tone.
    await expect(getComputedStyle(supporting).color).toBe(getComputedStyle(action).color);
  },
};

export const MultipleTextGhostIsTwoTone: Story = {
  args: {
    type: 'ghost',
    multipleText: true,
    supportingText: 'Total:',
    actionText: '$120.00',
  },
  play: async ({ canvasElement }) => {
    const supporting = canvasElement.querySelector('.button__supporting-text');
    const action = canvasElement.querySelector('.button__action-text');
    if (!supporting || !action) throw new globalThis.Error('Expected both text nodes to render');
    await expect(getComputedStyle(supporting).color).not.toBe(getComputedStyle(action).color);
  },
};

export const WithIcons: Story = {
  args: {
    leftIcon: 'chevron-left',
    rightIcon: 'chevron-right',
  },
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('button');
    const text = canvasElement.querySelector('.button__text');
    const icon = canvasElement.querySelector('.button__icon');
    if (!button || !text || !icon) throw new globalThis.Error('Expected button, text and icon to render');
    // Icons render via currentColor, so they must resolve to the exact same
    // computed color as the button's own text — this regressed once before
    // (icon color wasn't inheriting from the type's color at all).
    await expect(getComputedStyle(icon).color).toBe(getComputedStyle(text).color);
    await expect(getComputedStyle(button).color).toBe(getComputedStyle(text).color);
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

/**
 * Visual catalog of every combination of type and size, in both the
 * single-text and multiple-text layouts.
 */
const TYPES = ['primary', 'secondary', 'tertiary', 'ghost', 'success', 'error'] as const;
const SIZES = ['medium', 'small'] as const;

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {TYPES.map((type) => (
            <Button key={`${type}-${size}`} type={type} size={size} buttonText={`${type} ${size}`} />
          ))}
        </div>
      ))}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {TYPES.map((type) => (
          <Button
            key={`${type}-multiple`}
            type={type}
            multipleText
            supportingText="Total:"
            actionText="$120.00"
          />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {TYPES.map((type) => (
          <Button key={`${type}-disabled`} type={type} buttonText={`${type} disabled`} disabled />
        ))}
      </div>
    </div>
  ),
};

export const ClickingButtonFiresOnClick: Story = {
  args: {
    buttonText: 'Click me',
  },
  play: async ({ canvas, args, userEvent }) => {
    const button = canvas.getByRole('button', { name: /click me/i });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const DisabledButtonDoesNotFireOnClick: Story = {
  args: {
    buttonText: 'Click me',
    disabled: true,
  },
  play: async ({ canvas, args, userEvent }) => {
    const button = canvas.getByRole('button', { name: /click me/i });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
