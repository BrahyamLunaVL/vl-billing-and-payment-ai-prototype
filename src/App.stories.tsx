import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import App from './App';

const meta = {
  component: App,
  tags: ['ai-generated'],
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CounterIncrement: Story = {
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: /count is 0/i });
    await userEvent.click(button);
    await expect(canvas.getByRole('button', { name: /count is 1/i })).toBeVisible();
  },
};

export const CssCheck: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /count is/i });
    // .counter color: var(--accent) resolves to #aa3bff in light mode (src/index.css)
    await expect(getComputedStyle(button).color).toBe('rgb(170, 59, 255)');
  },
};
