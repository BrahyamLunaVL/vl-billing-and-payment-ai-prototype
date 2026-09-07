import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { PhoneInput } from './phoneinput';
import type { FlagCountry } from '../Flag';
import { FormField } from '../FormField';

const meta = {
  component: PhoneInput,
  tags: ['ai-generated'],
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

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: '5512345678' },
};

export const Error: Story = {
  args: { value: '551234', error: true },
};

export const Disabled: Story = {
  args: { value: '5512345678', disabled: true },
};

function Controlled() {
  const [country, setCountry] = useState<FlagCountry>('mexico');
  const [value, setValue] = useState('');
  return <PhoneInput country={country} onCountryChange={setCountry} value={value} onChange={setValue} />;
}

export const OnlyDigitsAllowed: Story = {
  render: () => <Controlled />,
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByPlaceholderText('Phone number');
    await userEvent.type(field, 'abc123e4.5+6-7');
    await expect(field).toHaveValue('1234567');
  },
};

export const OpensCountryDropdownAndSelects: Story = {
  render: () => <Controlled />,
  play: async ({ canvas, userEvent }) => {
    const countryButton = canvas.getByRole('button', { name: /country: mexico/i });
    await userEvent.click(countryButton);
    const argentinaOption = await canvas.findByRole('option', { name: 'Argentina' });
    await userEvent.click(argentinaOption);
    await canvas.findByRole('button', { name: /country: argentina/i });
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
  render: (args) => (
    <FormField label="Phone number" helpText="Include your country and number">
      <PhoneInput {...args} />
    </FormField>
  ),
};
