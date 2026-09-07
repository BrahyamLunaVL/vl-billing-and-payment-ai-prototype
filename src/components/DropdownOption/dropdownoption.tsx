import './dropdownoption.css';
import type { ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from '../Icon';

export interface DropdownOptionProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Row label. Truncates with an ellipsis if it overflows. */
  text: string;
  /** Icon rendered at the start of the row, before the text. */
  leftIcon?: IconName;
  /** Icon rendered at the end of the row, after the text. */
  rightIcon?: IconName;
  /**
   * Renders an empty 16x16 checkbox affordance before the text/left icon.
   * This is a visual slot only — it does not track a checked state. A real
   * Checkbox component can replace it once one exists in the system.
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
 * Hover comes from real CSS `:hover`; `selected` is a prop-driven data state
 * that takes priority over hover styling (see dropdownoption.css).
 */
export const DropdownOption = ({
  text,
  leftIcon,
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
        {showCheckbox && <span className="dropdown-option__checkbox" aria-hidden="true" />}
        {leftIcon && (
          <Icon name={leftIcon} size={16} className="dropdown-option__icon" />
        )}
        <span className="dropdown-option__text">{text}</span>
      </span>
      {rightIcon && (
        <Icon name={rightIcon} size={16} className="dropdown-option__icon dropdown-option__icon--right" />
      )}
    </button>
  );
};
