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
};

export const WithIcons: Story = {
  args: {
    leftIcon: 'chevron-left',
    rightIcon: 'chevron-right',
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
