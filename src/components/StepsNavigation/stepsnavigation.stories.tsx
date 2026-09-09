import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { StepsNavigation } from './stepsnavigation';
import { Step } from '../Step';

const meta = {
  component: StepsNavigation,
  tags: ['ai-generated'],
} satisfies Meta<typeof StepsNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: null },
  render: () => (
    <StepsNavigation>
      <Step step={1} title="Choose Request for Changes" position="left" status="completed" />
      <Step step={2} title="Fill request form" position="middle" status="selected" />
      <Step step={3} title="Preview" position="right" />
    </StepsNavigation>
  ),
  play: async ({ canvasElement }) => {
    const steps = canvasElement.querySelectorAll('.step');
    await expect(steps.length).toBe(3);
    // Consecutive steps overlap slightly so their chevrons nest — no gap.
    const [first, second] = Array.from(steps).map((el) => el.getBoundingClientRect());
    await expect(second.left).toBeLessThan(first.right);
  },
};

/**
 * A real multi-step wizard driving `Step`'s `status` from a single
 * "current step" index — completed for steps before it, selected for the
 * current one, default for steps still ahead. Clicking a step jumps to it,
 * the way a user might revisit an earlier step.
 */
function ControlledWizard() {
  const steps = ['Choose Request for Changes', 'Fill request form', 'Preview'];
  const [current, setCurrent] = useState(0);

  return (
    <StepsNavigation>
      {steps.map((title, index) => (
        <Step
          key={title}
          step={index + 1}
          title={title}
          position={index === 0 ? 'left' : index === steps.length - 1 ? 'right' : 'middle'}
          status={index < current ? 'completed' : index === current ? 'selected' : 'default'}
          onClick={() => setCurrent(index)}
        />
      ))}
    </StepsNavigation>
  );
}

export const ClickingAStepSelectsIt: Story = {
  args: { children: null },
  render: () => <ControlledWizard />,
  play: async ({ canvas, userEvent }) => {
    const preview = canvas.getByRole('button', { name: /preview/i });
    await expect(preview).not.toHaveAttribute('aria-current');

    await userEvent.click(preview);
    await expect(preview).toHaveAttribute('aria-current', 'step');

    const first = canvas.getByRole('button', { name: /choose request for changes/i });
    await expect(first).not.toHaveAttribute('aria-current');
  },
};
