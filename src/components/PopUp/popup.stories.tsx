import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { PopUp } from './popup';
import { Button } from '../Button';

const meta = {
  component: PopUp,
  tags: ['ai-generated'],
} satisfies Meta<typeof PopUp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div style={{ background: 'white', padding: '24px', borderRadius: '12px' }}>Pop up content</div>,
  },
};

/**
 * A realistic modal composed from the design system's own Button, to prove
 * PopUp centers arbitrary content of any size, not just the placeholder box.
 */
export const WithCardContent: Story = {
  render: () => (
    <PopUp>
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          width: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0 }}>Confirm action</h2>
        <p style={{ margin: 0, textAlign: 'center' }}>Are you sure you want to continue?</p>
        <Button type="primary" buttonText="Confirm" />
      </div>
    </PopUp>
  ),
};

export const CoversFullScreenAndCentersContent: Story = {
  args: {
    children: <div data-testid="popup-content">Content</div>,
  },
  play: async ({ canvasElement }) => {
    const overlay = canvasElement.querySelector('.popup');
    if (!overlay) throw new globalThis.Error('Expected the popup overlay to render');
    const cs = getComputedStyle(overlay);
    await expect(cs.position).toBe('fixed');
    await expect(cs.inset).toBe('0px');
    await expect(cs.width).toBe(`${window.innerWidth}px`);
    await expect(cs.height).toBe(`${window.innerHeight}px`);
    await expect(cs.backgroundColor).toBe('rgba(38, 50, 56, 0.3)');
    await expect(cs.display).toBe('flex');
    await expect(cs.alignItems).toBe('center');
    await expect(cs.justifyContent).toBe('center');
  },
};
