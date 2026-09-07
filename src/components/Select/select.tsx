import './select.css';
import type { KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Icon, type IconName, type IconVariant } from '../Icon';
import { Dropdown } from '../Dropdown';
import { DropdownOption } from '../DropdownOption';

export interface SelectOption {
  /** Value passed to `onChange` when this option is picked. */
  value: string;
  /** Label shown in the trigger and in the dropdown row. */
  label: string;
  /** Icon rendered at the start of the option's row. */
  leftIcon?: IconName;
  /** Icon rendered at the end of the option's row. */
  rightIcon?: IconName;
}

export interface SelectProps {
  /** The list of options the dropdown offers. */
  options: SelectOption[];
  /** Currently selected value, or `null` when nothing is selected. Controlled. */
  value: string | null;
  /** Called with the newly picked option's value. */
  onChange: (value: string) => void;
  /** Text shown (muted) when `value` is `null`. Defaults to 'Select an option'. */
  placeholder?: string;
  /** Icon rendered at the start of the trigger, before the label/placeholder. */
  leftIcon?: IconName;
  /** Variant of `leftIcon`. Defaults to 'bold'. */
  leftIconVariant?: IconVariant;
  /** Validation error state. Does not by itself render any message — pair with FormField's `errorMessage`. */
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Design system single-select field: a trigger box styled exactly like
 * `Input` (same border/background colors per state, same left/right content
 * layout), but non-editable — clicking it toggles a `Dropdown` of
 * `DropdownOption`s below it instead of accepting typed text. Meant to be
 * passed as `FormField`'s `children`, same as `Input`.
 *
 * "Open" reuses the same visual treatment as Input's `:focus-within` ring
 * (applied via a prop-driven class instead, since the trigger is a `<button>`
 * that loses focus once the dropdown option is clicked). "Disabled" comes
 * from the native `disabled` attribute. "Error" is an explicit prop, same as
 * `Input`.
 */
export const Select = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  leftIcon,
  leftIconVariant = 'bold',
  error = false,
  disabled = false,
  className,
}: SelectProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((option) => option.value === value) ?? null;

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

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const classNames = [
    'select',
    open && 'select--open',
    error && 'select--error',
    disabled && 'select--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="select-container" ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        className={classNames}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="select__left">
          {leftIcon && <Icon name={leftIcon} variant={leftIconVariant} size={16} className="select__icon" />}
          {leftIcon && <span className="select__divider" />}
          <span className={selectedOption ? 'select__value' : 'select__placeholder'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <span className="select__right">
          <span className="select__divider" />
          <Icon name="chevron-down" variant="bold" size={12} className="select__chevron" />
        </span>
      </button>
      {open && (
        <div className="select__dropdown-wrapper">
          <Dropdown>
            {options.map((option) => (
              <DropdownOption
                key={option.value}
                text={option.label}
                leftIcon={option.leftIcon}
                rightIcon={option.rightIcon}
                selected={option.value === value}
                onClick={() => handleOptionClick(option.value)}
              />
            ))}
          </Dropdown>
        </div>
      )}
    </div>
  );
};
