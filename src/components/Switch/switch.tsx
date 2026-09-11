import type { InputHTMLAttributes } from 'react';
import './switch.css';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible label — required since the switch never renders its own visible text (see FormField/Input). */
  'aria-label': string;
  className?: string;
}

/**
 * A boolean on/off toggle (Figma's "Switch Field") — e.g. Agreement
 * Settings' "Auto-Approval for Extra Hours Requests by VA". A real,
 * visually-hidden `<input type="checkbox">` plus a custom pill/handle,
 * same hidden-input approach as `Radio`. Unlike `Toggle` (a segmented
 * control for switching between several display modes), this is strictly
 * a 2-state on/off control and never renders its own label — callers
 * compose their own label/description next to it, same as `Input`/`Select`.
 */
export const Switch = ({ checked, onChange, className, disabled, ...rest }: SwitchProps) => {
  const classNames = ['switch', checked && 'switch--checked', className].filter(Boolean).join(' ');

  return (
    <label className={classNames}>
      <input
        type="checkbox"
        className="switch__input"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        {...rest}
      />
      <span className="switch__track" aria-hidden="true">
        <span className="switch__handle" />
      </span>
    </label>
  );
};
