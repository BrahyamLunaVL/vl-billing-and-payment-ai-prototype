import './dropdownoption.css';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';

export interface DropdownOptionProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Row label. Truncates with an ellipsis if it overflows. */
  text: string;
  /** Icon rendered at the start of the row, before the text. */
  leftIcon?: IconName;
  /**
   * Arbitrary content (e.g. a `Flag`/`Brand`) rendered at the start of the
   * row instead of `leftIcon`, for options that need something other than
   * one of `Icon`'s named icons. Takes priority over `leftIcon` when both
   * are given.
   */
  leftIconImage?: ReactNode;
  /** Icon rendered at the end of the row, after the text. */
  rightIcon?: IconName;
  /**
   * Renders a 16x16 checkbox affordance before the text/left icon, filled
   * with a checkmark whenever `selected` is true. A real Checkbox component
   * can replace this once one exists in the system — for now it's this
   * component's own minimal rendering of the checked/unchecked look.
   */
  showCheckbox?: boolean;
  /**
   * Whether this option is the currently selected item in the list. This is
   * data state (which item is chosen), not a mouse/interaction state, so it
   * is a prop rather than being derived from CSS like `:hover` is.
   */
  selected?: boolean;
  className?: string;
}

/**
 * A single selectable row inside a `Dropdown` list. Renders as a real
 * `<button>` (with `role="option"`, matching how it is used inside a
 * listbox-like `Dropdown`) so it is keyboard-operable and clickable, and so
 * `aria-selected` is valid ARIA usage rather than sitting on a plain button.
 * Hover (fucsia text) and focus (purple text) come from real CSS `:hover`/
 * `:focus-visible` over a black default; `selected` is a prop-driven data
 * state that takes priority over both (see dropdownoption.css).
 */
export const DropdownOption = ({
  text,
  leftIcon,
  leftIconImage,
  rightIcon,
  showCheckbox = false,
  selected = false,
  className,
  ...rest
}: DropdownOptionProps) => {
  const classNames = [
    'dropdown-option',
    selected && 'dropdown-option--selected',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      className={classNames}
      {...rest}
    >
      <span className="dropdown-option__left">
        {showCheckbox && (
          <span
            className={
              selected ? 'dropdown-option__checkbox dropdown-option__checkbox--checked' : 'dropdown-option__checkbox'
            }
            aria-hidden="true"
          >
            {selected && <Icon name="check" variant="bold" size={10} />}
          </span>
        )}
        {leftIconImage ??
          (leftIcon && <Icon name={leftIcon} size={16} className="dropdown-option__icon" />)}
        <span className="dropdown-option__text">{text}</span>
      </span>
      {rightIcon && (
        <Icon name={rightIcon} size={16} className="dropdown-option__icon dropdown-option__icon--right" />
      )}
    </button>
  );
};
