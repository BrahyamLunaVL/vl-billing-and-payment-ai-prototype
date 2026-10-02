import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '../Input';
import { Calendar } from '../Calendar';
import './datepickerfield.css';

export interface DatePickerFieldProps {
  /** ISO 'YYYY-MM-DD', or '' for no selection. */
  value: string;
  onChange: (date: string) => void;
  /** ISO date, inclusive lower bound for selectable days. */
  minDate: string;
  /** ISO date, inclusive upper bound for selectable days. */
  maxDate: string;
  /** Extra per-day disable check beyond `minDate`/`maxDate`, e.g. "Mondays only". */
  isDayDisabled?: (date: string) => boolean;
  /** ISO date for the month initially shown when opened. Defaults to `minDate`'s month. */
  initialViewDate?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** '2026-11-09' -> '11/09/2026', matching this app's other bare-date displays. */
function formatDisplayDate(iso: string): string {
  if (!iso) return '';
  const date = parseISODate(iso);
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
}

/**
 * A single-date field that opens the shared `Calendar` widget in a popover
 * instead of relying on the browser's own `<input type="date">` picker —
 * needed wherever only a narrow, non-contiguous subset of days should be
 * pickable (e.g. "Mondays only"), which a native date input's `min`/`max`
 * can't express on its own. Portaled to `document.body` and positioned from
 * the trigger's own `getBoundingClientRect()`, same convention as
 * `Select`/`PhoneInput`'s own dropdowns.
 */
export const DatePickerField = ({
  value,
  onChange,
  minDate,
  maxDate,
  isDayDisabled,
  initialViewDate,
  placeholder = 'mm/dd/yyyy',
  disabled = false,
  error = false,
  className,
}: DatePickerFieldProps) => {
  const [open, setOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<
    ({ left: number } & ({ top: number; bottom?: undefined } | { bottom: number; top?: undefined })) | null
  >(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const inTrigger = containerRef.current?.contains(target);
      const inPopover = popoverRef.current?.contains(target);
      if (!inTrigger && !inPopover) setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleScroll = () => setOpen(false);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [open]);

  const handleToggle = () => {
    if (disabled) return;
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // The calendar itself is a fixed ~300px tall widget (plus the
      // popover's own padding) — open it upward instead whenever the field
      // sits too close to the bottom of the viewport for it to fit below
      // (e.g. the last field on a long form), so its days stay clickable
      // instead of running off-screen.
      const estimatedPopoverHeight = 360;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < estimatedPopoverHeight;
      setPopoverPosition(
        openUpward
          ? { bottom: window.innerHeight - rect.top + 4, left: rect.left }
          : { top: rect.bottom + 4, left: rect.left },
      );
    }
    setOpen((prev) => !prev);
  };

  const handleSelectDate = (date: string) => {
    onChange(date);
    setOpen(false);
  };

  const classNames = ['date-picker-field', className].filter(Boolean).join(' ');

  return (
    <div className={classNames} ref={containerRef}>
      <Input
        readOnly
        value={formatDisplayDate(value)}
        placeholder={placeholder}
        onClick={handleToggle}
        rightIcon="calendar"
        rightIconLabel="Open date picker"
        onRightIconClick={handleToggle}
        disabled={disabled}
        error={error}
        className="input--muted-icon"
      />
      {open &&
        popoverPosition &&
        createPortal(
          <div
            ref={popoverRef}
            className="date-picker-field__popover"
            style={{
              left: popoverPosition.left,
              ...(popoverPosition.top !== undefined ? { top: popoverPosition.top } : { bottom: popoverPosition.bottom }),
            }}
          >
            <Calendar
              selectedDates={value ? [value] : []}
              onToggleDate={handleSelectDate}
              minDate={minDate}
              maxDate={maxDate}
              isDayDisabled={isDayDisabled}
              initialViewDate={initialViewDate ?? minDate}
            />
          </div>,
          document.body,
        )}
    </div>
  );
};
