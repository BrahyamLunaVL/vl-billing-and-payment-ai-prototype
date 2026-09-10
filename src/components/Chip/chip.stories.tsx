import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Chip } from './chip';

const meta = {
  component: Chip,
  tags: ['ai-generated'],
  args: {
    label: 'Active',
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gray: Story = {};

export const Blue: Story = {
  args: { tone: 'blue' },
  play: async ({ canvasElement }) => {
    const chip = canvasElement.querySelector('.chip');
    if (!chip) throw new globalThis.Error('Expected the chip to render');
    // Text is always brand/black regardless of tone — only the dot/bg change.
    const label = canvasElement.querySelector('.chip__label');
    await expect(getComputedStyle(label!).color).toBe('rgb(38, 50, 56)');
    await expect(getComputedStyle(chip).backgroundColor).toBe('rgb(235, 251, 252)');
  },
};

export const Green: Story = {
  args: { label: 'Enabled', tone: 'green' },
};

export const Red: Story = {
  args: { label: 'Disabled', tone: 'red' },
};

export const Orange: Story = {
  args: { label: 'Hired', tone: 'orange' },
};

export const Purple: Story = {
  args: { label: 'New', tone: 'purple' },
};

/**
 * Visual catalog of every tone.
 */
export const AllTones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Chip label="Gray" tone="gray" />
      <Chip label="Red" tone="red" />
      <Chip label="Green" tone="green" />
      <Chip label="Blue" tone="blue" />
      <Chip label="Orange" tone="orange" />
      <Chip label="Purple" tone="purple" />
    </div>
  ),
};
