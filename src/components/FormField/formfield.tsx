import type { ReactNode } from 'react';
import { useId, useState } from 'react';
import { Icon } from '../Icon';
import './formfield.css';

export interface FormFieldProps {
  /** Field label. Omit to render the field without a label row at all. */
  label?: string;
  /** Small muted text after the label, e.g. "(Optional)". */
  badge?: string;
  /** Tooltip text. Presence renders an info icon that reveals it on hover/focus. */
  info?: string;
  /** Blue bold link shown after the label/badge/info group. */
  linkText?: string;
  onLinkClick?: () => void;
  /** Bold, primary-colored action shown at the far right of the label row. */
  actionText?: string;
  onActionClick?: () => void;
  /** Muted text under the label row. */
  description?: string;
  /** Muted text under the field. Hidden while `errorMessage` is set. */
  helpText?: string;
  /** Red error text (with an icon) shown under the field instead of `helpText`. */
  errorMessage?: string;
  /** The actual input/select/textarea control. */
  children: ReactNode;
  className?: string;
}

/**
 * Shared structure for the design system's field-type components (text
 * input, select, multiselect, text area): a label row (label + optional
 * badge, info tooltip, link and a right-aligned action), a description, a
 * slot for the field control itself, and a help/error message underneath.
 * This component only owns that chrome — the field control's own visual
 * states (default/hover/selected/error/disabled) live on whatever is
 * passed as `children`.
 */
export const FormField = ({
  label,
  badge,
  info,
  linkText,
  onLinkClick,
  actionText,
  onActionClick,
  description,
  helpText,
  errorMessage,
  children,
  className,
}: FormFieldProps) => {
  const tooltipId = useId();
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <div className={className ? `form-field ${className}` : 'form-field'}>
      {label && (
        <div className="form-field__label-row">
          <div className="form-field__label-details">
            <span className="form-field__label">{label}</span>
            {badge && <span className="form-field__badge">{badge}</span>}
            {info && (
              <span
                className="form-field__info"
                onMouseEnter={() => setTooltipOpen(true)}
                onMouseLeave={() => setTooltipOpen(false)}
                onFocus={() => setTooltipOpen(true)}
                onBlur={() => setTooltipOpen(false)}
              >
                <button
                  type="button"
                  className="form-field__info-trigger"
                  aria-describedby={tooltipId}
                  tabIndex={0}
                >
                  <Icon name="circle-info" variant="bold" size={12} />
                </button>
                <span role="tooltip" id={tooltipId} className="form-field__tooltip" hidden={!tooltipOpen}>
                  {info}
                </span>
              </span>
            )}
            {linkText && (
              <button type="button" className="form-field__link" onClick={onLinkClick}>
                {linkText}
              </button>
            )}
          </div>
          {actionText && (
            <button type="button" className="form-field__action" onClick={onActionClick}>
              {actionText}
            </button>
          )}
        </div>
      )}
      {description && <p className="form-field__description">{description}</p>}
      {children}
      {errorMessage ? (
        <div className="form-field__error">
          <Icon name="triangle-exclamation" variant="bold" size={12} className="form-field__error-icon" />
          <span>{errorMessage}</span>
        </div>
      ) : (
        helpText && <p className="form-field__help-text">{helpText}</p>
      )}
    </div>
  );
};
