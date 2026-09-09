import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Sidebar } from './sidebar';

const meta = {
  component: Sidebar,
  tags: ['ai-generated'],
  args: {
    userName: 'Jane Doe',
    userEmail: 'jane.doe@virtuallatinos.com',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '900px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Admin: Story = {
  args: { user: 'admin' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /agreements & work hrs/i })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /^users$/i })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /notifications/i })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /collapse sidebar/i })).toBeVisible();
    await expect(canvas.getByText('Jane Doe')).toBeVisible();
  },
};

export const Client: Story = {
  args: { user: 'client' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /my account/i })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /my va/i })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: /^users$/i })).not.toBeInTheDocument();
  },
};

export const VA: Story = {
  args: { user: 'va' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /^invoices$/i })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /invoice claims/i })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: /^client invoice$/i })).not.toBeInTheDocument();
  },
};

/**
 * `Sidebar` never tracks its own selection — `selectedItem` is always a prop
 * the caller controls (a static story with a static `selectedItem` and no
 * `onSelectItem` would make clicking look broken — the same lesson learned
 * from `DropdownOption`/`Select`). This wires up real local state so
 * clicking a nav item actually selects it.
 */
function ControlledSidebar() {
  const [selectedItem, setSelectedItem] = useState('agreements');
  return (
    <Sidebar
      user="admin"
      userName="Jane Doe"
      userEmail="jane.doe@virtuallatinos.com"
      selectedItem={selectedItem}
      onSelectItem={setSelectedItem}
    />
  );
}

export const ClickingAnItemSelectsIt: Story = {
  args: { user: 'admin' },
  render: () => <ControlledSidebar />,
  play: async ({ canvas, userEvent }) => {
    const agreements = canvas.getByRole('button', { name: /agreements & work hrs/i });
    const users = canvas.getByRole('button', { name: /^users$/i });
    await expect(agreements).toHaveAttribute('aria-current', 'page');
    await expect(users).not.toHaveAttribute('aria-current');

    await userEvent.click(users);
    await expect(users).toHaveAttribute('aria-current', 'page');
    await expect(agreements).not.toHaveAttribute('aria-current');
  },
};

export const ClickingCollapseFiresOnCollapse: Story = {
  args: { user: 'admin', onCollapse: fn() },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /collapse sidebar/i }));
    await expect(args.onCollapse).toHaveBeenCalledTimes(1);
  },
};
