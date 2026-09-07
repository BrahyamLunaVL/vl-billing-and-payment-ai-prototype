import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn } from 'storybook/test';
import { Select, type SelectOption } from './select';
import { FormField } from '../FormField';

const OPTIONS: SelectOption[] = [
  { value: 'mx', label: 'Mexico' },
  { value: 'co', label: 'Colombia' },
  { value: 'ar', label: 'Argentina' },
  { value: 'br', label: 'Brazil' },
];

const meta = {
  component: Select,
  tags: ['ai-generated'],
  args: {
    options: OPTIONS,
    value: null,
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '24px', width: '320px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// `Default`/`WithValueSelected` render through the stateful `Controlled`
// wrapper below (declared further down, hoisted by function declaration)
// rather than the static `onChange: fn()` from `meta.args` — a mock that
// doesn't update anything makes manually testing in Storybook's UI look
// broken (picking an option appears to do nothing), even though the
// component itself already works correctly (proven by the `play`-based
// stories further down).

export const Default: Story = {
  render: () => <Controlled />,
};

export const WithValueSelected: Story = {
  render: () => <Controlled initialValue="co" />,
};

export const Error: Story = {
  args: { error: true, value: 'ar' },
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('.select');
    if (!box) throw new globalThis.Error('Expected select trigger to render');
    await expect(getComputedStyle(box).borderColor).toBe('rgb(245, 174, 174)');
    await expect(getComputedStyle(box).backgroundColor).toBe('rgb(255, 255, 255)');
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'br' },
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('.select') as HTMLButtonElement | null;
    if (!box) throw new globalThis.Error('Expected select trigger to render');
    await expect(getComputedStyle(box).borderColor).toBe('rgb(213, 215, 221)');
    await expect(getComputedStyle(box).backgroundColor).toBe('rgb(236, 236, 239)');
    await expect(box).toBeDisabled();
  },
};

function Controlled({ initialValue = null }: { initialValue?: string | null } = {}) {
  const [value, setValue] = useState<string | null>(initialValue);
  return <Select options={OPTIONS} value={value} onChange={setValue} placeholder="Choose a country" />;
}

export const ControlledSelecting: Story = {
  render: () => <Controlled />,
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /choose a country/i });
    await userEvent.click(trigger);

    const option = await canvas.findByText('Colombia');
    await userEvent.click(option);

    await expect(await canvas.findByRole('button', { name: /colombia/i })).toBeInTheDocument();
  },
};

export const InsideFormField: Story = {
  render: () => {
    function ControlledInFormField() {
      const [value, setValue] = useState<string | null>(null);
      return (
        <FormField label="Country" helpText="Where you currently live">
          <Select options={OPTIONS} value={value} onChange={setValue} />
        </FormField>
      );
    }
    return <ControlledInFormField />;
  },
};

export const ClickingTriggerOpensDropdownWithOptions: Story = {
  render: () => <Controlled />,
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /choose a country/i });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(await canvas.findByText('Mexico')).toBeInTheDocument();
    await expect(await canvas.findByText('Colombia')).toBeInTheDocument();
    await expect(await canvas.findByText('Argentina')).toBeInTheDocument();
    await expect(await canvas.findByText('Brazil')).toBeInTheDocument();
  },
};

export const ClickingOptionCallsOnChangeAndCloses: Story = {
  args: { value: null },
  play: async ({ canvas, args, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /select an option/i });
    await userEvent.click(trigger);

    const option = await canvas.findByText('Argentina');
    await userEvent.click(option);

    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenCalledWith('ar');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const EscapeKeyClosesDropdown: Story = {
  render: () => <Controlled />,
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /choose a country/i });
    await userEvent.click(trigger);
    await expect(await canvas.findByText('Mexico')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText('Mexico')).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

export const ClickingOutsideClosesDropdown: Story = {
  render: () => (
    <div>
      <Controlled />
      <button type="button">Outside element</button>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /choose a country/i });
    await userEvent.click(trigger);
    await expect(await canvas.findByText('Mexico')).toBeInTheDocument();

    const outside = canvas.getByRole('button', { name: /outside element/i });
    await userEvent.click(outside);

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText('Mexico')).not.toBeInTheDocument();
  },
};
