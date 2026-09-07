import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Background } from './background';

const meta = {
  component: Background,
  tags: ['ai-generated'],
} satisfies Meta<typeof Background>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: '600px', height: '300px', overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * The intended real-world usage: the screen's own container is
 * `position: relative` and holds both the Background (which pins itself to
 * the bottom and stretches to 100% width) and the screen's real content on
 * top of it.
 */
export const InScreenContainer: Story = {
  render: () => (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '900px',
        height: '400px',
        overflow: 'hidden',
        background: '#1c1d22',
        color: 'white',
      }}
    >
      <Background />
      <div style={{ position: 'relative', padding: '24px' }}>
        <h2 style={{ margin: 0 }}>Screen content</h2>
        <p>This sits above the background shapes, which are pinned to the bottom.</p>
      </div>
    </div>
  ),
};

export const ScalesToContainerWidth: Story = {
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: '600px', height: '300px', overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg.background');
    if (!svg) throw new globalThis.Error('Expected the background svg to render');
    const cs = getComputedStyle(svg);
    // Stretches to 100% of its positioned container's width...
    await expect(cs.width).toBe('600px');
    // ...and pins itself to the bottom-left of that container.
    await expect(cs.position).toBe('absolute');
    await expect(cs.bottom).toBe('0px');
    await expect(cs.left).toBe('0px');
  },
};
