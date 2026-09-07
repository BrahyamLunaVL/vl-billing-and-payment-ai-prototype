import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Flag, type FlagCountry } from './flag';

const meta = {
  component: Flag,
  tags: ['ai-generated'],
  args: {
    country: 'costa-rica',
  },
} satisfies Meta<typeof Flag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomSize: Story = {
  args: {
    size: 40,
  },
};

const ALL_COUNTRIES: FlagCountry[] = [
  'argentina',
  'bolivia',
  'brasil',
  'chile',
  'colombia',
  'costa-rica',
  'dominican-republic',
  'ecuador',
  'el-salvador',
  'guatemala',
  'honduras',
  'mexico',
  'nicaragua',
  'panama',
  'paraguay',
  'peru',
  'spain',
  'united-states',
  'uruguay',
  'venezuela',
];

export const AllFlags: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        maxWidth: '480px',
      }}
    >
      {ALL_COUNTRIES.map((country) => (
        <div
          key={country}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            width: '80px',
          }}
        >
          <Flag country={country} size={32} />
          <span style={{ fontSize: '11px', textAlign: 'center' }}>{country}</span>
        </div>
      ))}
    </div>
  ),
};

export const RendersCostaRicaFlagAtGivenSize: Story = {
  args: {
    country: 'costa-rica',
    size: 32,
  },
  play: async ({ canvas }) => {
    const img = canvas.getByRole('img', { name: /costa-rica flag/i }) as HTMLImageElement;
    await expect(img).toBeVisible();
    await expect(img.src).toContain('costa-rica');
    await expect(img.getAttribute('alt')).toBe('costa-rica flag');
    await expect(img.width).toBe(32);
    await expect(img.height).toBe(32);
  },
};
