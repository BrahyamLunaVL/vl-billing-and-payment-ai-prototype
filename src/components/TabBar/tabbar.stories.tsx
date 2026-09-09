import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { TabBar } from './tabbar';

const TABS = [
  { key: 'all', label: 'All Agreements' },
  { key: 'mine', label: 'My Agreements' },
];

const meta = {
  component: TabBar,
  tags: ['ai-generated'],
  args: {
    tabs: TABS,
    selectedKey: 'all',
    onSelectTab: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px', background: '#1c1d22', padding: '16px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const allTab = canvas.getByRole('tab', { name: 'All Agreements' });
    const mineTab = canvas.getByRole('tab', { name: 'My Agreements' });
    await expect(allTab).toHaveAttribute('aria-selected', 'true');
    await expect(mineTab).toHaveAttribute('aria-selected', 'false');
  },
};

export const ClickingATabFiresOnSelectTab: Story = {
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole('tab', { name: 'My Agreements' }));
    await expect(args.onSelectTab).toHaveBeenCalledWith('mine');
  },
};

export const WithCounters: Story = {
  args: {
    tabs: [
      { key: 'all', label: 'All Agreements', counter: '12' },
      { key: 'mine', label: 'My Agreements', counter: '3' },
    ],
  },
};

export const WithDisabledTab: Story = {
  args: {
    tabs: [
      { key: 'all', label: 'All Agreements' },
      { key: 'mine', label: 'My Agreements', disabled: true },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('tab', { name: 'My Agreements' })).toBeDisabled();
  },
};

/**
 * `TabBar` never tracks its own selection — `selectedKey` is always a prop
 * the caller controls, matching the same pattern used throughout this
 * project (`DropdownOption`/`Select`/`Sidebar`). This wires up real local
 * state so clicking a tab actually switches which one is selected, the way
 * it would drive a content section on a real screen.
 */
function ControlledTabBar() {
  const [selectedKey, setSelectedKey] = useState('all');
  return <TabBar tabs={TABS} selectedKey={selectedKey} onSelectTab={setSelectedKey} />;
}

export const ClickingATabSelectsIt: Story = {
  render: () => <ControlledTabBar />,
  play: async ({ canvas, userEvent }) => {
    const allTab = canvas.getByRole('tab', { name: 'All Agreements' });
    const mineTab = canvas.getByRole('tab', { name: 'My Agreements' });
    await expect(allTab).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(mineTab);
    await expect(mineTab).toHaveAttribute('aria-selected', 'true');
    await expect(allTab).toHaveAttribute('aria-selected', 'false');
  },
};
