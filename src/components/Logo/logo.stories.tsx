import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Logo } from './logo';

const meta = {
  component: Logo,
  tags: ['ai-generated'],
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Wordmark: Story = {};

export const WordmarkLarge: Story = {
  args: { size: 'large' },
};

export const Mark: Story = {
  args: { rounded: true },
  play: async ({ canvasElement }) => {
    const img = canvasElement.querySelector('img');
    if (!img) throw new globalThis.Error('Expected the logo image to render');
    await expect(getComputedStyle(img).borderRadius).toBe('50%');
  },
};

export const MarkLarge: Story = {
  args: { rounded: true, size: 'large' },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-start' }}>
      <Logo />
      <Logo size="large" />
      <Logo rounded />
      <Logo rounded size="large" />
    </div>
  ),
};
