import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { ProfileCard } from './profilecard';
import { Chip } from '../Chip';
import { Icon } from '../Icon';

const meta = {
  component: ProfileCard,
  tags: ['ai-generated'],
  decorators: [
    (Story) => (
      <div style={{ width: '600px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProfileCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    header: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon name="clipboard-user" size={40} />
        <div>
          <h3 style={{ margin: 0, fontSize: '20px' }}>Juan Diego Gomez</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>VA since Friday, June 30, 2023</p>
        </div>
      </div>
    ),
    children: <p style={{ margin: 0 }}>Card content goes here.</p>,
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Juan Diego Gomez')).toBeVisible();
    await expect(canvasElement.querySelector('.profile-card__divider')).not.toBeNull();
  },
};

export const WithChipAndFooter: Story = {
  args: {
    header: (
      <>
        <span style={{ fontWeight: 700, fontSize: '20px' }}>Agreements</span>
        <Chip label="Hired" tone="orange" />
      </>
    ),
    children: <p style={{ margin: 0 }}>Agreement rows go here.</p>,
    footer: <span>UPCOMING TOTAL: $780.00</span>,
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.profile-card__footer')).not.toBeNull();
  },
};

export const LeftBorder: Story = {
  args: {
    leftBorder: true,
    header: <span style={{ fontWeight: 700, fontSize: '20px' }}>Highlighted</span>,
    children: <p style={{ margin: 0 }}>Content</p>,
  },
};

export const NoHeader: Story = {
  args: {
    children: <p style={{ margin: 0 }}>Just content, no header/divider.</p>,
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.profile-card__divider')).toBeNull();
  },
};
