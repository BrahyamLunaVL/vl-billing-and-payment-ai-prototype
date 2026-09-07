import './button.css';
import type { ButtonHTMLAttributes } from 'react';
import { Icon, type IconName, type IconVariant } from '../Icon';

export type ButtonType = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'success' | 'error';
export type ButtonSize = 'medium' | 'small';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> {
  /** Visual style of the button. Defaults to 'primary'. */
  type?: ButtonType;
  /** Size of the button. Defaults to 'medium'. */
  size?: ButtonSize;
  /** When true, renders `supportingText` + `actionText` instead of `buttonText`. Defaults to false. */
  multipleText?: boolean;
  /** Label text. Used when `multipleText` is false. */
  buttonText?: string;
  /** Bold, type-colored text shown after `supportingText` when `multipleText` is true. */
  actionText?: string;
  /** Regular-weight, always brand/black text shown before `actionText` when `multipleText` is true. */
  supportingText?: string;
  /** Icon rendered before the text. */
  leftIcon?: IconName;
  /** Variant of `leftIcon`. Defaults to 'bold', matching the design system's buttons. */
  leftIconVariant?: IconVariant;
  /** Size, in pixels, of `leftIcon`. Defaults to 16 (medium) / 12 (small). */
  leftIconSize?: number;
  /** Icon rendered after the text. */
  rightIcon?: IconName;
  /** Variant of `rightIcon`. Defaults to 'bold', matching the design system's buttons. */
  rightIconVariant?: IconVariant;
  /** Size, in pixels, of `rightIcon`. Defaults to 16 (medium) / 12 (small). */
  rightIconSize?: number;
  className?: string;
}

const DEFAULT_ICON_SIZE: Record<ButtonSize, number> = {
  medium: 16,
  small: 12,
};

/**
 * Design system button. Renders a real `<button>` so hover, focus and
 * disabled states come from actual CSS (`:hover`, `:focus-visible`,
 * `:disabled`) and the native `disabled` attribute, rather than being
 * modeled as separate props the way Figma's static variants do.
 */
export const Button = ({
  type = 'primary',
  size = 'medium',
  multipleText = false,
  buttonText = 'Button Text',
  actionText,
  supportingText,
  leftIcon,
  leftIconVariant = 'bold',
  leftIconSize,
  rightIcon,
  rightIconVariant = 'bold',
  rightIconSize,
  className,
  disabled,
  ...rest
}: ButtonProps) => {
  const iconSize = DEFAULT_ICON_SIZE[size];

  const classNames = [
    'button',
    `button--${type}`,
    `button--${size}`,
    multipleText && 'button--multiple-text',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" disabled={disabled} className={classNames} {...rest}>
      <span className="button__inner">
        {leftIcon && (
          <Icon
            name={leftIcon}
            variant={leftIconVariant}
            size={leftIconSize ?? iconSize}
            className="button__icon"
          />
        )}
        {multipleText ? (
          <>
            <span className="button__supporting-text">{supportingText}</span>
            <span className="button__action-text">{actionText}</span>
          </>
        ) : (
          <span className="button__text">{buttonText}</span>
        )}
        {rightIcon && (
          <Icon
            name={rightIcon}
            variant={rightIconVariant}
            size={rightIconSize ?? iconSize}
            className="button__icon"
          />
        )}
      </span>
    </button>
  );
};
