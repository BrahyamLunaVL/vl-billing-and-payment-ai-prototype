import type { InputHTMLAttributes } from 'react';
import './radio.css';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  className?: string;
}

/**
 * A single radio option: a real `<input type="radio">` (visually hidden but
 * still keyboard/screen-reader operable) plus a custom white circle that
 * fills with a brand/primary dot when checked — the native browser radio
 * renders solid black in some browsers, which doesn't match the design.
 */
export const Radio = ({ label, className, ...rest }: RadioProps) => {
  const classNames = ['radio', className].filter(Boolean).join(' ');

  return (
    <label className={classNames}>
      <input type="radio" className="radio__input" {...rest} />
      <span className="radio__circle" aria-hidden="true" />
      <span className="radio__label">{label}</span>
    </label>
  );
};
