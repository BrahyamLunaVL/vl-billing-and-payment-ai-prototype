import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { TabContainer } from './tabcontainer';

const meta = {
  component: TabContainer,
  tags: ['ai-generated'],
  args: {
    tabTitle: 'Tab Title',
    counter: '1',
    onClick: fn(),
  },
} satisfies Meta<typeof TabContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const title = canvasElement.querySelector('.tab-container__title');
    if (!title) throw new globalThis.Error('Expected the tab title to render');
    await expect(getComputedStyle(title).color).toBe('rgb(122, 122, 122)');
  },
};

// Hover (black text, gray/400 border) and pressed (real CSS `:active` —
// brand/secondary text + border, purple counter chip) come from real CSS
// pseudo-classes — `userEvent.hover`/synthetic press don't reliably register
// real browser `:hover`/`:active` state in this test runner, so both are
// exercised visually in Storybook's UI instead of asserted here (same
// limitation noted throughout this project's other components).

export const Selected: Story = {
  args: { selected: true },
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('button');
    const title = canvasElement.querySelector('.tab-container__title');
    const counter = canvasElement.querySelector('.tab-container__counter');
    if (!button || !title || !counter) throw new globalThis.Error('Expected the tab to render');
    await expect(button).toHaveAttribute('aria-selected', 'true');
    await expect(getComputedStyle(button).borderBottomColor).toBe('rgb(195, 32, 89)');
    await expect(getComputedStyle(title).color).toBe('rgb(195, 32, 89)');
    await expect(getComputedStyle(counter).backgroundColor).toBe('rgb(195, 32, 89)');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    const button = canvasElement.querySelector('button');
    if (!button) throw new globalThis.Error('Expected the tab to render');
    await expect(button).toBeDisabled();

    await userEvent.click(canvas.getByRole('tab'));
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const WithoutCounter: Story = {
  args: { counter: undefined },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.tab-container__counter')).toBeNull();
  },
};

export const ClickingTabFiresOnClick: Story = {
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole('tab'));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/**
 * Visual catalog of every state, rendered side by side the way tabs would
 * sit inside a `TabBar`.
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex' }}>
      <TabContainer tabTitle="Default" counter="1" />
      <TabContainer tabTitle="Selected" counter="2" selected />
      <TabContainer tabTitle="Disabled" counter="3" disabled />
      <TabContainer tabTitle="No counter" />
    </div>
  ),
};
