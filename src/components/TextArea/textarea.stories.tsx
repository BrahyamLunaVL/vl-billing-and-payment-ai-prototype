import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn } from 'storybook/test';
import { TextArea } from './textarea';
import { FormField } from '../FormField';

const meta = {
  component: TextArea,
  tags: ['ai-generated'],
  args: {
    placeholder: 'Placeholder',
    value: '',
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '24px', width: '320px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: 'Some notes about this account.' },
};

export const Error: Story = {
  args: { error: true, value: 'Invalid value' },
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('.textarea');
    if (!box) throw new globalThis.Error('Expected textarea box to render');
    await expect(getComputedStyle(box).borderColor).toBe('rgb(245, 174, 174)');
    await expect(getComputedStyle(box).backgroundColor).toBe('rgb(255, 255, 255)');
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'Cannot edit' },
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('.textarea');
    const field = canvasElement.querySelector('.textarea__field');
    if (!box || !field) throw new globalThis.Error('Expected textarea box and field to render');
    await expect(getComputedStyle(box).borderColor).toBe('rgb(213, 215, 221)');
    await expect(getComputedStyle(box).backgroundColor).toBe('rgb(236, 236, 239)');
    await expect(getComputedStyle(field).color).toBe('rgb(187, 187, 187)');
    await expect(field).toBeDisabled();
  },
};

export const NearLimit: Story = {
  args: {
    value: 'x'.repeat(740),
    maxLength: 750,
  },
  play: async ({ canvasElement }) => {
    const counter = canvasElement.querySelector('.textarea__counter');
    if (!counter) throw new globalThis.Error('Expected counter to render');
    await expect(counter).toHaveTextContent('740/750');
  },
};

function Controlled() {
  const [value, setValue] = useState('');
  return <TextArea placeholder="Type something" value={value} onChange={(e) => setValue(e.target.value)} />;
}

export const ControlledTyping: Story = {
  render: () => <Controlled />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const field = canvas.getByPlaceholderText('Type something') as HTMLTextAreaElement;
    await userEvent.type(field, 'Hello');
    await expect(field.value).toBe('Hello');
    const counter = canvasElement.querySelector('.textarea__counter');
    await expect(counter).toHaveTextContent('5/750');
  },
};

export const InsideFormField: Story = {
  render: () => {
    function ControlledInFormField() {
      const [value, setValue] = useState('');
      return (
        <FormField label="Notes" helpText="Internal notes about this billing account">
          <TextArea placeholder="Write your notes here" value={value} onChange={(e) => setValue(e.target.value)} />
        </FormField>
      );
    }
    return <ControlledInFormField />;
  },
};

export const InsideFormFieldWithError: Story = {
  render: () => (
    <FormField label="Notes" errorMessage="Notes are required">
      <TextArea placeholder="Write your notes here" value="" error onChange={fn()} />
    </FormField>
  ),
};
