import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn } from 'storybook/test';
import { MultiSelect, type MultiSelectOption } from './multiselect';
import { FormField } from '../FormField';

const OPTIONS: MultiSelectOption[] = [
  { value: 'usd', label: 'US Dollar' },
  { value: 'eur', label: 'Euro' },
  { value: 'gbp', label: 'British Pound' },
  { value: 'mxn', label: 'Mexican Peso' },
  { value: 'cad', label: 'Canadian Dollar' },
];

const meta = {
  component: MultiSelect,
  tags: ['ai-generated'],
  args: {
    options: OPTIONS,
    value: [],
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '24px', width: '320px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

// `Default`/`WithSelectedValues` render through the stateful `Controlled`
// wrapper (declared further down, hoisted by function declaration) instead
// of the static `onChange: fn()` from `meta.args` — a mock that doesn't
// update anything makes manually testing in Storybook's UI look broken
// (picking or unchecking an option appears to do nothing), even though the
// component itself already works correctly (proven by the `play`-based
// stories further down).

export const Default: Story = {
  render: () => <Controlled />,
};

export const WithSelectedValues: Story = {
  render: () => <Controlled initialValue={['usd', 'eur']} />,
};

export const Error: Story = {
  args: { error: true, value: ['usd'], onChange: fn() },
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('.multiselect');
    if (!box) throw new globalThis.Error('Expected multiselect box to render');
    await expect(getComputedStyle(box).borderColor).toBe('rgb(245, 174, 174)');
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: ['usd'], onChange: fn() },
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('.multiselect');
    if (!box) throw new globalThis.Error('Expected multiselect box to render');
    await expect(getComputedStyle(box).backgroundColor).toBe('rgb(236, 236, 239)');
    await expect(box.getAttribute('aria-disabled')).toBe('true');
  },
};

function Controlled({ initialValue = [] as string[] }: { initialValue?: string[] }) {
  const [value, setValue] = useState<string[]>(initialValue);
  return <MultiSelect options={OPTIONS} value={value} onChange={setValue} placeholder="Select currencies" />;
}

export const InsideFormField: Story = {
  render: () => (
    <FormField label="Currencies" helpText="Choose one or more">
      <Controlled />
    </FormField>
  ),
};

export const OpeningShowsCheckedState: Story = {
  render: () => <Controlled initialValue={['usd']} />,
  play: async ({ canvas, userEvent }) => {
    // The trigger is the only element exposing aria-expanded — chip remove
    // buttons don't — so this uniquely targets it even with a chip present.
    const trigger = canvas.getByRole('button', { expanded: false });
    await userEvent.click(trigger);

    const usdOption = await canvas.findByRole('option', { name: /US Dollar/i });
    const eurOption = await canvas.findByRole('option', { name: /Euro/i });
    await expect(usdOption.getAttribute('aria-selected')).toBe('true');
    await expect(eurOption.getAttribute('aria-selected')).toBe('false');
  },
};

export const PickingOptionAddsChipAndStaysOpen: Story = {
  render: () => <Controlled initialValue={['usd']} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole('button', { expanded: false });
    await userEvent.click(trigger);

    const eurOption = await canvas.findByRole('option', { name: /Euro/i });
    await userEvent.click(eurOption);

    // A new chip for Euro appears in the trigger (queried by class, since
    // "Euro" also appears as dropdown-option text and would be ambiguous
    // for a plain text query).
    const chipLabels = await canvas.findAllByText('Euro');
    const hasEuroChip = Array.from(chipLabels).some((el) =>
      el.className === 'multiselect-chip__label',
    );
    await expect(hasEuroChip).toBe(true);

    // The dropdown stayed open — other options are still queryable.
    await expect(await canvas.findByRole('option', { name: /British Pound/i })).toBeInTheDocument();
    await expect(canvasElement.querySelector('.multiselect--open')).not.toBeNull();
  },
};

export const RemovingChipDoesNotToggleDropdown: Story = {
  render: () => <Controlled initialValue={['usd']} />,
  play: async ({ canvas, userEvent }) => {
    const removeButton = await canvas.findByRole('button', { name: /remove us dollar/i });
    await userEvent.click(removeButton);

    // The chip is gone...
    await expect(canvas.queryByText('US Dollar')).not.toBeInTheDocument();
    // ...and clicking it never opened the dropdown as a side effect.
    await expect(canvas.queryByRole('option')).not.toBeInTheDocument();
  },
};

export const EscapeClosesDropdown: Story = {
  render: () => <Controlled initialValue={['usd']} />,
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { expanded: false });
    await userEvent.click(trigger);
    await canvas.findByRole('option', { name: /Euro/i });

    await userEvent.keyboard('{Escape}');

    await expect(canvas.queryByRole('option')).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { expanded: false })).toBe(trigger);
  },
};
