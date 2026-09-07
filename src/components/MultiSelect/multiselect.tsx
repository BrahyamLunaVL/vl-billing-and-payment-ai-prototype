import './multiselect.css';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { Icon, type IconName, type IconVariant } from '../Icon';
import { Dropdown } from '../Dropdown';
import { DropdownOption } from '../DropdownOption';

export interface MultiSelectOption {
  /** Value passed in the `value`/`onChange` array when this option is picked. */
  value: string;
  /** Label shown in a chip and in the dropdown row. */
  label: string;
  /** Icon rendered at the start of the option's row in the dropdown. */
  leftIcon?: IconName;
  /** Icon rendered at the end of the option's row in the dropdown. */
  rightIcon?: IconName;
}

export interface MultiSelectProps {
  /** The list of options the dropdown offers. */
  options: MultiSelectOption[];
  /** Currently selected values. Controlled. */
  value: string[];
  /** Called with the full, updated array of selected values whenever a pick or removal happens. */
  onChange: (values: string[]) => void;
  /** Text shown (muted) when nothing is selected. Defaults to 'Select options'. */
  placeholder?: string;
  disabled?: boolean;
  /** Validation error state. Does not by itself render any message — pair with FormField's `errorMessage`. */
  error?: boolean;
  /** Icon rendered at the start of the trigger, before the placeholder/chips. */
  leftIcon?: IconName;
  /** Variant of `leftIcon`. Defaults to 'bold'. */
  leftIconVariant?: IconVariant;
  className?: string;
}

interface ChipProps {
  label: string;
  disabled?: boolean;
  onRemove: () => void;
}

/**
 * Removable pill shown inside the trigger for each selected value. Rendered
 * as `<span>` + a real `<button>` for the remove control — the trigger itself
 * is a non-button clickable container specifically so this inner `<button>`
 * stays valid HTML (see MultiSelect's own doc comment).
 */
const Chip = ({ label, disabled, onRemove }: ChipProps) => {
  const handleRemoveClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    // Removing a chip must not also toggle the dropdown open/closed, since
    // the chip lives inside the trigger's clickable area.
    event.stopPropagation();
    if (disabled) return;
    onRemove();
  };

  return (
    <span className="multiselect-chip">
      <span className="multiselect-chip__label">{label}</span>
      <button
        type="button"
        className="multiselect-chip__remove"
        onClick={handleRemoveClick}
        disabled={disabled}
        aria-label={`Remove ${label}`}
      >
        <Icon name="xmark" variant="bold" size={12} />
      </button>
    </span>
  );
};

/**
 * Design system multi-select field: a trigger box styled exactly like
 * `Input`/`Select` (same border/background colors per state), but instead of
 * a single value it holds a wrapping row of removable `Chip`s, one per
 * selected value, plus a trailing "N selected" count. Clicking the trigger
 * toggles a `Dropdown` of `DropdownOption`s (with `showCheckbox`) below it;
 * unlike `Select`, picking an option does not close the dropdown, since
 * multi-selection benefits from picking several options in a row.
 *
 * Trigger structure deviates from `Input`/`Select`'s plain `<button>`
 * approach on purpose: each chip renders its own real `<button>` for its
 * remove control, and a `<button>` cannot contain another interactive
 * `<button>` per the HTML spec. So the trigger is a `<div role="button"
 * tabIndex={0}>` with manual `onKeyDown` handling for Enter/Space instead.
 *
 * Layout also deviates from `Input`'s single-line box: the left content area
 * wraps (`flex-wrap: wrap`) so chips flow onto multiple lines and the box
 * grows taller as more values are selected, rather than clipping to a fixed
 * height.
 */
export const MultiSelect = ({
  options,
  value,
  onChange,
  placeholder = 'Select options',
  disabled = false,
  error = false,
  leftIcon,
  leftIconVariant = 'bold',
  className,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const selectedOptions = value
    .map((selectedValue) => options.find((option) => option.value === selectedValue))
    .filter((option): option is MultiSelectOption => Boolean(option));

  // Close on outside pointer-down, only while open, cleaned up on close/unmount.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  // Close on Escape regardless of which element inside currently has focus
  // (after picking an option, focus sits on that DropdownOption's button,
  // not on the trigger), then return focus to the trigger.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleTriggerClick = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    // Ignore keys bubbling up from nested interactive elements (a chip's
    // remove button) — only react to keys pressed on the trigger itself.
    if (event.target !== event.currentTarget) return;
    if (disabled) return;

    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      setOpen((prev) => !prev);
    }
  };

  const handleOptionClick = (optionValue: string) => {
    const isSelected = value.includes(optionValue);
    const nextValue = isSelected
      ? value.filter((selectedValue) => selectedValue !== optionValue)
      : [...value, optionValue];
    onChange(nextValue);
    // Dropdown intentionally stays open after a pick.
  };

  const handleRemoveValue = (optionValue: string) => {
    onChange(value.filter((selectedValue) => selectedValue !== optionValue));
  };

  const classNames = [
    'multiselect',
    open && 'multiselect--open',
    error && 'multiselect--error',
    disabled && 'multiselect--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="multiselect-container" ref={containerRef}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-disabled={disabled || undefined}
        ref={triggerRef}
        className={classNames}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        <div className="multiselect__left">
          {leftIcon && <Icon name={leftIcon} variant={leftIconVariant} size={16} className="multiselect__icon" />}
          {leftIcon && <span className="multiselect__divider" />}
          {selectedOptions.length === 0 ? (
            <span className="multiselect__placeholder">{placeholder}</span>
          ) : (
            selectedOptions.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                disabled={disabled}
                onRemove={() => handleRemoveValue(option.value)}
              />
            ))
          )}
        </div>
        <div className="multiselect__right">
          <span className="multiselect__divider" />
          {selectedOptions.length > 0 && (
            <span className="multiselect__count">{selectedOptions.length} selected</span>
          )}
          <span className="multiselect__divider" />
          <Icon
            name="chevron-down"
            variant="bold"
            size={12}
            className={open ? 'multiselect__chevron multiselect__chevron--open' : 'multiselect__chevron'}
          />
        </div>
      </div>
      {open && (
        <div className="multiselect__dropdown-wrapper">
          <Dropdown>
            {options.map((option) => (
              <DropdownOption
                key={option.value}
                text={option.label}
                leftIcon={option.leftIcon}
                rightIcon={option.rightIcon}
                showCheckbox
                selected={value.includes(option.value)}
                onClick={() => handleOptionClick(option.value)}
              />
            ))}
          </Dropdown>
        </div>
      )}
    </div>
  );
};
