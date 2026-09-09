import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Step } from './step';

const meta = {
  component: Step,
  tags: ['ai-generated'],
  args: {
    step: 1,
    title: 'Choose Request for Changes',
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Step>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const circle = canvasElement.querySelector('.step__circle');
    const title = canvasElement.querySelector('.step__title');
    if (!circle || !title) throw new globalThis.Error('Expected the step to render');
    await expect(circle.textContent).toBe('1');
    await expect(getComputedStyle(circle).backgroundColor).toBe('rgb(236, 236, 239)');
    await expect(getComputedStyle(title).color).toBe('rgb(187, 187, 187)');
  },
};

// Hovering a default step only darkens its title (gray/400 -> gray/500),
// and pressing/holding it down (real CSS `:active`) renders like Selected
// (fucsia/200 circle + brand/primary text) — both are real CSS pseudo-
// classes that `userEvent.hover`/synthetic press don't reliably trigger in
// this test runner, so they're exercised visually in Storybook's UI instead
// of asserted here (same limitation noted throughout this project).

export const Selected: Story = {
  args: { status: 'selected' },
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('button');
    const circle = canvasElement.querySelector('.step__circle');
    if (!button || !circle) throw new globalThis.Error('Expected the step to render');
    await expect(button).toHaveAttribute('aria-current', 'step');
    await expect(getComputedStyle(circle).backgroundColor).toBe('rgb(246, 222, 230)');
    await expect(getComputedStyle(circle).color).toBe('rgb(195, 32, 89)');
  },
};

export const Completed: Story = {
  args: { status: 'completed' },
  play: async ({ canvasElement }) => {
    const circle = canvasElement.querySelector('.step__circle');
    if (!circle) throw new globalThis.Error('Expected the step to render');
    await expect(getComputedStyle(circle).backgroundColor).toBe('rgb(195, 32, 89)');
    // A checkmark replaces the step number once completed.
    await expect(circle.querySelector('svg')).not.toBeNull();
    await expect(circle.textContent?.trim()).toBe('');
  },
};

export const Disabled: Story = {
  args: { status: 'disabled' },
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    const button = canvasElement.querySelector('button');
    if (!button) throw new globalThis.Error('Expected the step to render');
    await expect(button).toBeDisabled();

    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const ClickingStepFiresOnClick: Story = {
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/**
 * Visual catalog of every position/status combination.
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <Step step={1} title="Left, Default" position="left" />
      <Step step={2} title="Middle, Selected" position="middle" status="selected" />
      <Step step={3} title="Right, Completed" position="right" status="completed" />
      <Step step={4} title="Middle, Disabled" position="middle" status="disabled" />
    </div>
  ),
};
