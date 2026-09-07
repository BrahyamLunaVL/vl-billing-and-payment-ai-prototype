import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { PhoneInput, type PhoneInputProps } from './phoneinput';
import type { FlagCountry } from '../Flag';
import { FormField } from '../FormField';

const meta = {
  component: PhoneInput,
  tags: ['ai-generated'],
  // Every story overrides rendering via `render` (see `Controlled` below),
  // so these are just placeholders to satisfy the required prop types.
  args: {
    country: 'mexico' as FlagCountry,
    value: '',
    onChange: fn(),
    onCountryChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '24px', width: '320px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PhoneInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Every story below renders through this stateful wrapper instead of a
 * static `onChange`/`onCountryChange` mock — a mock that doesn't update
 * anything makes manual testing in Storybook's UI look broken (the flag
 * appears to never change when you pick a different country), even though
 * the component itself is working correctly. Only `disabled` stories are
 * meant to look unresponsive.
 */
function Controlled({
  initialCountry = 'mexico',
  initialValue = '',
  ...rest
}: Partial<Omit<PhoneInputProps, 'country' | 'value' | 'onCountryChange' | 'onChange'>> & {
  initialCountry?: FlagCountry;
  initialValue?: string;
}) {
  const [country, setCountry] = useState<FlagCountry>(initialCountry);
  const [value, setValue] = useState(initialValue);
  return (
    <PhoneInput
      {...rest}
      country={country}
      onCountryChange={setCountry}
      value={value}
      onChange={setValue}
    />
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const WithValue: Story = {
  render: () => <Controlled initialValue="5512345678" />,
};

export const ErrorState: Story = {
  render: () => <Controlled initialValue="551234" error />,
};

export const Disabled: Story = {
  render: () => <Controlled initialValue="5512345678" disabled />,
};

export const OnlyDigitsAllowed: Story = {
  render: () => <Controlled />,
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByPlaceholderText('Phone number');
    await userEvent.type(field, 'abc123e4.5+6-7');
    await expect(field).toHaveValue('1234567');
  },
};

export const FlagUpdatesOnSelection: Story = {
  render: () => <Controlled />,
  play: async ({ canvas, userEvent }) => {
    const countryButton = canvas.getByRole('button', { name: /country: mexico/i });
    const flagBefore = countryButton.querySelector('img')?.getAttribute('src');

    await userEvent.click(countryButton);
    const argentinaOption = await canvas.findByRole('option', { name: 'Argentina' });
    await userEvent.click(argentinaOption);

    const updatedButton = await canvas.findByRole('button', { name: /country: argentina/i });
    const flagAfter = updatedButton.querySelector('img')?.getAttribute('src');
    await expect(flagAfter).not.toBe(flagBefore);
    await expect(flagAfter).toContain('argentina');
    await expect(canvas.queryByRole('option', { name: 'Argentina' })).not.toBeInTheDocument();
  },
};

export const ClosesOnEscape: Story = {
  render: () => <Controlled />,
  play: async ({ canvas, userEvent }) => {
    const countryButton = canvas.getByRole('button', { name: /country: mexico/i });
    await userEvent.click(countryButton);
    await canvas.findByRole('option', { name: 'Argentina' });
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('option', { name: 'Argentina' })).not.toBeInTheDocument();
  },
};

export const CountriesAreAlphabetical: Story = {
  render: () => <Controlled />,
  play: async ({ canvas, userEvent }) => {
    const countryButton = canvas.getByRole('button', { name: /country: mexico/i });
    await userEvent.click(countryButton);
    const options = await canvas.findAllByRole('option');
    const labels = options.map((option) => option.textContent);
    await expect(labels).toEqual([...labels].sort((a, b) => (a ?? '').localeCompare(b ?? '')));
    await expect(labels[0]).toBe('Argentina');
  },
};

export const InsideFormField: Story = {
  render: () => (
    <FormField label="Phone number" helpText="Include your country and number">
      <Controlled />
    </FormField>
  ),
};
