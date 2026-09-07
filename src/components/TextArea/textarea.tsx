import './textarea.css';
import type { TextareaHTMLAttributes } from 'react';

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'maxLength'> {
  /** Validation error state. Does not by itself render any message — pair with FormField's `errorMessage`. */
  error?: boolean;
  /** Maximum character count, used both as the real HTML `maxLength` and as the counter's denominator. Defaults to 750. */
  maxLength?: number;
  className?: string;
}

/**
 * Design system text area: a bordered box (default/hover/selected/error/
 * disabled) wrapping a real, controlled `<textarea>` plus a bottom-right
 * character counter. Meant to be passed as `FormField`'s `children` — it
 * does not render its own label, description, help text or error message.
 *
 * "Selected" is real `:focus-within` on the wrapper, and "Disabled" comes
 * from the native `disabled` attribute. "Error" is an explicit prop/class,
 * same reasoning as `Input`.
 */
export const TextArea = ({
  value,
  error = false,
  disabled,
  maxLength = 750,
  className,
  ...rest
}: TextAreaProps) => {
  const length = typeof value === 'string' ? value.length : 0;

  const classNames = [
    'textarea',
    error && 'textarea--error',
    disabled && 'textarea--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      <textarea className="textarea__field" value={value} disabled={disabled} maxLength={maxLength} {...rest} />
      <div className="textarea__counter-row">
        <span className="textarea__counter">
          {length}/{maxLength}
        </span>
      </div>
    </div>
  );
};
