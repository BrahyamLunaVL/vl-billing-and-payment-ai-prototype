import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Notification } from './notification';

const meta = {
  component: Notification,
  tags: ['ai-generated'],
  args: {
    message: 'Email sent — click to continue',
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ background: '#1c1d22', padding: '24px', width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Notification>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ClickingFiresOnClick: Story = {
  play: async ({ canvas, args, userEvent }) => {
    const button = canvas.getByRole('button', { name: /email sent/i });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
