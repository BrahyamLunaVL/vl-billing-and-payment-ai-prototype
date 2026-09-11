import type { InputHTMLAttributes, ReactNode } from 'react';
import { Icon } from '../Icon';
import './checkbox.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** The clickable label content next to the box — plain text or richer markup (e.g. a "(Optional)" suffix). */
  label: ReactNode;
  className?: string;
}

/**
 * A single checkbox option (Figma's "Checkbox"): a real, visually-hidden
 * `<input type="checkbox">` plus a custom white/bordered square that shows
 * a check mark when checked — same hidden-input approach as `Radio`.
 */
export const Checkbox = ({ label, className, ...rest }: CheckboxProps) => {
  const classNames = ['checkbox', className].filter(Boolean).join(' ');

  return (
    <label className={classNames}>
      <input type="checkbox" className="checkbox__input" {...rest} />
      <span className="checkbox__box" aria-hidden="true">
        <Icon name="check" variant="bold" size={10} className="checkbox__check" />
      </span>
      <span className="checkbox__label">{label}</span>
    </label>
  );
};
