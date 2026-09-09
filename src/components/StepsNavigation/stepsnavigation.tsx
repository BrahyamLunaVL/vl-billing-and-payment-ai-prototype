import type { ReactNode } from 'react';
import './stepsnavigation.css';

export interface StepsNavigationProps {
  /** `Step` elements, in order — the leftmost/rightmost should use `position="left"`/`"right"`. */
  children: ReactNode;
  className?: string;
}

/**
 * Lays out a sequence of `Step` buttons edge to edge so their chevron
 * points/notches nest into each other instead of leaving a visible seam.
 * `Step`'s point/notch always sit inside its own box (never overflow it),
 * so a small negative margin between steps is enough to close the hairline
 * gap where two boxes meet — this is the only thing this container does;
 * composing the actual `Step`s (their titles, statuses, click handlers) is
 * left entirely to the caller, the same way `Form` only owns shared layout.
 */
export const StepsNavigation = ({ children, className }: StepsNavigationProps) => {
  const classNames = ['steps-navigation', className].filter(Boolean).join(' ');

  return (
    <div className={classNames} role="group" aria-label="Steps">
      {children}
    </div>
  );
};
