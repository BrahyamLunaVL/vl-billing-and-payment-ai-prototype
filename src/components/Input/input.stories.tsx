import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn } from 'storybook/test';
import { Input } from './input';
import { FormField } from '../FormField';

const meta = {
  component: Input,
  tags: ['ai-generated'],
  args: {
    placeholder: 'Placeholder',
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '24px', width: '320px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: 'Hello world', onChange: fn() },
};

export const Error: Story = {
  args: { error: true, value: 'Invalid value', onChange: fn() },
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('.input');
    if (!box) throw new globalThis.Error('Expected input box to render');
    await expect(getComputedStyle(box).borderColor).toBe('rgb(245, 174, 174)');
    await expect(getComputedStyle(box).backgroundColor).toBe('rgb(255, 255, 255)');
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'Cannot edit', onChange: fn() },
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('.input');
    const field = canvasElement.querySelector('.input__field');
    if (!box || !field) throw new globalThis.Error('Expected input box and field to render');
    await expect(getComputedStyle(box).borderColor).toBe('rgb(213, 215, 221)');
    await expect(getComputedStyle(box).backgroundColor).toBe('rgb(236, 236, 239)');
    await expect(getComputedStyle(field).color).toBe('rgb(187, 187, 187)');
    await expect(field).toBeDisabled();
  },
};

export const WithIconAndRightText: Story = {
  args: {
    leftIcon: 'circle-info',
    value: '120.00',
    rightText: 'USD',
    onChange: fn(),
  },
};

function Controlled() {
  const [value, setValue] = useState('');
  return <Input placeholder="Type something" value={value} onChange={(e) => setValue(e.target.value)} />;
}

export const ControlledTyping: Story = {
  render: () => <Controlled />,
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByPlaceholderText('Type something') as HTMLInputElement;
    await userEvent.type(field, 'Hello');
    await expect(field.value).toBe('Hello');
  },
};

export const InsideFormField: Story = {
  render: () => {
    function ControlledInFormField() {
      const [value, setValue] = useState('');
      return (
        <FormField label="Full name" helpText="As it appears on your ID">
          <Input placeholder="Jane Doe" value={value} onChange={(e) => setValue(e.target.value)} />
        </FormField>
      );
    }
    return <ControlledInFormField />;
  },
};

export const InsideFormFieldWithError: Story = {
  render: () => (
    <FormField label="Email" errorMessage="Please enter a valid email">
      <Input placeholder="jane@example.com" value="not-an-email" error onChange={fn()} />
    </FormField>
  ),
};
