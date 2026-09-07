import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Dropdown } from './dropdown';
import { DropdownOption } from '../DropdownOption';

const meta = {
  component: Dropdown,
  tags: ['ai-generated'],
  args: {
    children: null,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '260px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dropdown>
      <DropdownOption text="Option one" />
      <DropdownOption text="Option two" selected />
      <DropdownOption text="Option three" />
    </Dropdown>
  ),
  play: async ({ canvasElement }) => {
    const options = canvasElement.querySelectorAll('.dropdown-option');
    await expect(options.length).toBe(3);
    await expect(options[1]?.getAttribute('aria-selected')).toBe('true');
  },
};

export const WithIcons: Story = {
  render: () => (
    <Dropdown>
      <DropdownOption text="Profile" leftIcon="circle-user" />
      <DropdownOption text="Settings" leftIcon="gear" />
      <DropdownOption text="Log out" leftIcon="arrow-left" />
    </Dropdown>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Dropdown footer={<DropdownOption text="Clear selection" />}>
      <DropdownOption text="Option one" />
      <DropdownOption text="Option two" selected />
      <DropdownOption text="Option three" />
    </Dropdown>
  ),
  play: async ({ canvasElement }) => {
    const divider = canvasElement.querySelector('.dropdown__divider');
    const footer = canvasElement.querySelector('.dropdown__footer');
    if (!divider || !footer) throw new globalThis.Error('Expected divider and footer to render');
    await expect(footer.querySelector('.dropdown-option')).not.toBeNull();
  },
};

const MANY_OPTIONS = Array.from({ length: 20 }, (_, i) => `Option ${i + 1}`);

export const ScrollsWhenListOverflows: Story = {
  render: () => (
    <Dropdown>
      {MANY_OPTIONS.map((label) => (
        <DropdownOption key={label} text={label} />
      ))}
    </Dropdown>
  ),
  play: async ({ canvasElement }) => {
    const list = canvasElement.querySelector('.dropdown__list');
    if (!list) throw new globalThis.Error('Expected list container to render');
    await expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
  },
};
