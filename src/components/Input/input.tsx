import './input.css';
import type { InputHTMLAttributes } from 'react';
import { Icon, type IconName, type IconVariant } from '../Icon';
import { Flag, type FlagCountry } from '../Flag';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Icon rendered at the start of the field, before the value/placeholder. */
  leftIcon?: IconName;
  /** Variant of `leftIcon`. Defaults to 'bold'. */
  leftIconVariant?: IconVariant;
  /** Country flag rendered at the start of the field, before `leftIcon`. */
  flag?: FlagCountry;
  /** Icon rendered at the end of the field, after `rightText`. */
  rightIcon?: IconName;
  /** Variant of `rightIcon`. Defaults to 'bold'. */
  rightIconVariant?: IconVariant;
  /** Bold, muted text rendered at the end of the field, e.g. a currency code. */
  rightText?: string;
  /** Validation error state. Does not by itself render any message — pair with FormField's `errorMessage`. */
  error?: boolean;
  className?: string;
}

/**
 * Design system text input: a bordered box (default/hover/selected/error/
 * disabled) wrapping a real, controlled `<input>`, plus optional leading
 * flag/icon and trailing icon/text content. Meant to be passed as
 * `FormField`'s `children` — it does not render its own label, description,
 * help text or error message.
 *
 * "Selected" is real `:focus-within` on the wrapper (so clicking anywhere in
 * the box focuses the input and shows the ring), and "Disabled" comes from
 * the native `disabled` attribute. "Error" can't come from a pseudo-class —
 * it's an external validation state — so it's an explicit prop/class instead,
 * same as `disabled`.
 */
export const Input = ({
  leftIcon,
  leftIconVariant = 'bold',
  flag,
  rightIcon,
  rightIconVariant = 'bold',
  rightText,
  error = false,
  disabled,
  className,
  ...rest
}: InputProps) => {
  const hasLeftContent = Boolean(flag || leftIcon);
  const hasRightIcon = Boolean(rightIcon);
  const hasRightText = Boolean(rightText);

  const classNames = [
    'input',
    error && 'input--error',
    disabled && 'input--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      <div className="input__left">
        {flag && <Flag country={flag} size={16} className="input__flag" />}
        {leftIcon && <Icon name={leftIcon} variant={leftIconVariant} size={16} className="input__icon" />}
        {hasLeftContent && <span className="input__divider" />}
        <input className="input__field" disabled={disabled} {...rest} />
      </div>
      {(hasRightIcon || hasRightText) && (
        <div className="input__right">
          <span className="input__divider" />
          {rightText && <span className="input__right-text">{rightText}</span>}
          {rightIcon && <Icon name={rightIcon} variant={rightIconVariant} size={12} className="input__icon" />}
        </div>
      )}
    </div>
  );
};
