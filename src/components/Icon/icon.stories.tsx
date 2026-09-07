import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Icon } from './icon';
import { iconRegistry, type IconName, type IconVariant } from './icon-data.generated';

const meta = {
  component: Icon,
  tags: ['ai-generated'],
  args: {
    name: 'circle-info',
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Bold: Story = {
  args: {
    name: 'circle-info',
    variant: 'bold',
  },
};

export const CustomSize: Story = {
  args: {
    name: 'circle-info',
    size: 40,
  },
};

export const WithAccessibleLabel: Story = {
  args: {
    name: 'triangle-exclamation',
    title: 'Warning',
  },
};

const ALL_ICON_NAMES = Object.keys(iconRegistry) as IconName[];
const VARIANTS: IconVariant[] = ['regular', 'bold'];

/**
 * Visual catalog of every icon in the design system, in both variants.
 * A couple of names (`money-bills-simple`, `money-bills`) only ship one
 * variant each — that cell falls back to the available variant, which
 * is the intended, defensive behavior of `Icon`.
 */
export const AllIcons: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
        gap: '16px',
        maxWidth: '960px',
      }}
    >
      {ALL_ICON_NAMES.map((name) =>
        VARIANTS.map((variant) => (
          <div
            key={`${name}-${variant}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px',
              border: '1px solid #e2e2e2',
              borderRadius: '8px',
            }}
          >
            <Icon name={name} variant={variant} size={24} />
            <span style={{ fontSize: '10px', textAlign: 'center', lineHeight: 1.2 }}>
              {name}
              <br />
              {variant}
            </span>
          </div>
        )),
      )}
    </div>
  ),
};

export const CircleInfoHasExpectedViewBox: Story = {
  args: {
    name: 'circle-info',
    variant: 'regular',
  },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg');
    await expect(svg).toBeTruthy();
    await expect(svg?.getAttribute('viewBox')).toBe(iconRegistry['circle-info'].regular?.viewBox);
    await expect(svg?.getAttribute('fill')).toBe('currentColor');
  },
};

export const ChangingVariantChangesRenderedMarkup: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <Icon name="eye" variant="regular" />
      <Icon name="eye" variant="bold" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const svgs = canvasElement.querySelectorAll('svg');
    await expect(svgs.length).toBe(2);
    const [regularSvg, boldSvg] = Array.from(svgs);
    await expect(regularSvg.getAttribute('viewBox')).toBe(iconRegistry['eye'].regular?.viewBox);
    await expect(boldSvg.getAttribute('viewBox')).toBe(iconRegistry['eye'].bold?.viewBox);
    // The two variants share a canvas size but differ in path data —
    // that's the actual visual difference between "regular" and "bold".
    await expect(regularSvg.innerHTML).not.toBe(boldSvg.innerHTML);
  },
};

export const FallsBackToAvailableVariantWhenMissing: Story = {
  args: {
    // `money-bills-simple` only ships a `regular` variant in the source
    // Figma file — requesting `bold` should gracefully fall back to it
    // instead of rendering nothing.
    name: 'money-bills-simple',
    variant: 'bold',
  },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg');
    await expect(svg).toBeTruthy();
    await expect(svg?.getAttribute('viewBox')).toBe(
      iconRegistry['money-bills-simple'].regular?.viewBox,
    );
  },
};
