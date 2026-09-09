import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName, type IconVariant } from '../Icon';
import './option.css';

export type OptionType = 'navigation' | 'actions';

export interface OptionProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> {
  /** Row label. */
  text: string;
  /** Icon rendered at the start of the row, before the text. */
  leftIcon?: IconName;
  /**
   * Arbitrary content rendered at the start of the row instead of
   * `leftIcon`, for options that need something other than one of `Icon`'s
   * named icons. Takes priority over `leftIcon` when both are given.
   */
  leftIconImage?: ReactNode;
  /** Visual weight of `leftIcon`. Defaults to 'regular'. */
  leftIconVariant?: IconVariant;
  /**
   * `'navigation'` (the default) is a Sidebar nav item — bold text, and its
   * hover/selected states tint the whole row. `'actions'` is an item inside
   * a context menu's dropdown of actions — regular-weight text, and its
   * hover/selected states only recolor the icon/text, never the row's
   * background.
   */
  type?: OptionType;
  /**
   * Whether this is the currently active item (e.g. the Sidebar's current
   * page). This is data state, not a mouse/interaction state, so it's a
   * prop rather than derived from CSS like `:hover` is — but it renders
   * identically to the user pressing/holding the option down.
   */
  selected?: boolean;
  className?: string;
}

/**
 * A single row used by navigation surfaces (the Sidebar) and by contextual
 * action menus. Renders as a real `<button>` so it's keyboard-operable.
 * Hover and "pressed" (real CSS `:active` — the user holding the option
 * down) come from CSS over a default look; `selected` is a prop-driven data
 * state that renders the same as pressed and takes priority over hover
 * (see option.css).
 */
export const Option = ({
  text,
  leftIcon,
  leftIconImage,
  leftIconVariant = 'regular',
  type = 'navigation',
  selected = false,
  className,
  disabled,
  ...rest
}: OptionProps) => {
  const classNames = ['option', `option--${type}`, selected && 'option--selected', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classNames}
      disabled={disabled}
      aria-current={type === 'navigation' && selected ? 'page' : undefined}
      {...rest}
    >
      {leftIconImage ??
        (leftIcon && (
          <Icon name={leftIcon} variant={leftIconVariant} size={20} className="option__icon" />
        ))}
      <span className="option__text">{text}</span>
    </button>
  );
};
