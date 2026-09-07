import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Brand } from './brand';

const meta = {
  component: Brand,
  tags: ['ai-generated'],
  args: {
    name: 'telegram',
  },
} satisfies Meta<typeof Brand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomSize: Story = {
  args: {
    size: 40,
  },
};

export const RendersTelegramLogoAtGivenSize: Story = {
  args: {
    name: 'telegram',
    size: 32,
  },
  play: async ({ canvas }) => {
    const img = canvas.getByRole('img', { name: /telegram logo/i }) as HTMLImageElement;
    await expect(img).toBeVisible();
    // Vite inlines small SVGs as data URIs, so assert on the decoded markup instead of the file name.
    await expect(decodeURIComponent(img.src)).toContain('<svg');
    await expect(img.getAttribute('alt')).toBe('telegram logo');
    await expect(img.width).toBe(32);
    await expect(img.height).toBe(32);
  },
};
