import type { ButtonHTMLAttributes } from 'react';
import { Icon } from '../Icon';
import './step.css';

export type StepPosition = 'left' | 'middle' | 'right';
export type StepStatus = 'default' | 'selected' | 'completed' | 'disabled';

export interface StepProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Step number shown in the circle — replaced by a checkmark once `status` is 'completed'. */
  step: number;
  title: string;
  /**
   * Where this button sits in the sequence — controls its chevron shape's
   * flat vs. notched edges (flat left/pointed right for 'left', notched on
   * both sides for 'middle', notched left/flat right for 'right'). Defaults
   * to 'middle'.
   */
  position?: StepPosition;
  /**
   * `'default'` is a not-yet-reached but reachable step (its hover/pressed
   * look come from real CSS). `'selected'` is the current step — a data
   * state that renders the same as pressing a default step down, and takes
   * priority over hover. `'completed'` shows a checkmark instead of the
   * step number. `'disabled'` is an unreachable step.
   */
  status?: StepStatus;
  className?: string;
}

/**
 * A single button in a multi-step wizard (Figma's "Step"), shaped like a
 * chevron/ticket stub so consecutive steps can nest into each other inside
 * a `StepsNavigation` container. Renders as a real `<button>`.
 */
export const Step = ({
  step,
  title,
  position = 'middle',
  status = 'default',
  className,
  disabled,
  ...rest
}: StepProps) => {
  const isDisabled = disabled || status === 'disabled';
  const classNames = ['step', `step--${position}`, `step--${status}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classNames}
      disabled={isDisabled}
      aria-current={status === 'selected' ? 'step' : undefined}
      {...rest}
    >
      <span className="step__circle">
        {status === 'completed' ? (
          <Icon name="check" variant="bold" size={20} className="step__check" />
        ) : (
          step
        )}
      </span>
      <span className="step__title">{title}</span>
    </button>
  );
};
