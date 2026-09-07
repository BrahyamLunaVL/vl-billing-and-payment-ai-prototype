import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { FormField } from './formfield';

const Placeholder = () => (
  <div
    style={{
      width: '100%',
      height: '40px',
      border: '1px solid #d5d7dd',
      borderRadius: '8px',
      boxSizing: 'border-box',
    }}
  />
);

const meta = {
  component: FormField,
  tags: ['ai-generated'],
  args: {
    label: 'Label',
    badge: '(Optional)',
    description: 'Description',
    helpText: 'Help Text',
    children: <Placeholder />,
  },
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '24px', width: '379px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLinkAndAction: Story = {
  args: {
    linkText: 'Link',
    actionText: 'Action Button Text',
  },
};

export const WithError: Story = {
  args: {
    errorMessage: 'Error Message',
  },
};

export const WithInfoTooltip: Story = {
  args: {
    info: 'This explains what the field is for.',
  },
  play: async ({ canvasElement, canvas, userEvent }) => {
    const tooltip = canvasElement.querySelector('.form-field__tooltip');
    if (!tooltip) throw new globalThis.Error('Expected tooltip element to render');
    await expect(tooltip).toHaveAttribute('hidden');
    const trigger = canvas.getByRole('button', { name: '' });
    await userEvent.hover(trigger);
    await expect(tooltip).not.toHaveAttribute('hidden');
    await expect(tooltip).toHaveTextContent('This explains what the field is for.');
    await userEvent.unhover(trigger);
    await expect(tooltip).toHaveAttribute('hidden');
  },
};

export const WithoutLabel: Story = {
  args: {
    label: undefined,
    badge: undefined,
    description: undefined,
    helpText: 'Just a help text, no label row at all.',
  },
};
