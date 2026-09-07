import './phoneinput.css';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, InputHTMLAttributes } from 'react';
import { Icon } from '../Icon';
import { Flag, type FlagCountry } from '../Flag';
import { Dropdown } from '../Dropdown';
import { DropdownOption } from '../DropdownOption';
import { COUNTRIES, COUNTRY_NAMES } from './countries';

export interface PhoneInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'value' | 'onChange' | 'type' | 'inputMode' | 'pattern'
  > {
  /** Currently selected country, controlling which flag is shown. */
  country: FlagCountry;
  onCountryChange: (country: FlagCountry) => void;
  /** Phone number value. Always digits only — non-digit input is stripped. */
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  className?: string;
}

/**
 * Phone number field: a country-flag button (opens a dropdown of every
 * country, alphabetically by name, with its flag) followed by a numeric-only
 * value. This is a dedicated component, not a generic feature of `Input` —
 * the flag here is an interactive control, not decoration.
 *
 * The number field uses `type="tel"` rather than `type="number"` and strips
 * any non-digit character on every change, so it never exhibits a native
 * number input's quirks (typing "e" for scientific notation, "+"/"-", the
 * scroll-to-increment behavior, etc.) — only digits 0-9 ever land in `value`.
 */
export const PhoneInput = ({
  country,
  onCountryChange,
  value,
  onChange,
  placeholder = 'Phone number',
  error = false,
  disabled,
  className,
  ...rest
}: PhoneInputProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const countryButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        countryButtonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value.replace(/\D/g, ''));
  };

  const selectCountry = (next: FlagCountry) => {
    onCountryChange(next);
    setOpen(false);
  };

  const classNames = [
    'phone-input',
    error && 'phone-input--error',
    disabled && 'phone-input--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} ref={containerRef}>
      <button
        ref={countryButtonRef}
        type="button"
        className="phone-input__country-button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Country: ${COUNTRY_NAMES[country]}`}
      >
        <Flag country={country} size={16} />
        <Icon
          name="chevron-down"
          variant="bold"
          size={10}
          className={open ? 'phone-input__chevron phone-input__chevron--open' : 'phone-input__chevron'}
        />
      </button>
      <span className="phone-input__divider" />
      <input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        className="phone-input__field"
        value={value}
        onChange={handleNumberChange}
        placeholder={placeholder}
        disabled={disabled}
        {...rest}
      />
      {open && (
        <div className="phone-input__dropdown-wrapper">
          <Dropdown>
            {COUNTRIES.map((key) => (
              <DropdownOption
                key={key}
                text={COUNTRY_NAMES[key]}
                leftIconImage={
                  <span aria-hidden="true">
                    <Flag country={key} size={16} />
                  </span>
                }
                selected={key === country}
                onClick={() => selectCountry(key)}
              />
            ))}
          </Dropdown>
        </div>
      )}
    </div>
  );
};
