import { useState } from 'react';
import { Icon } from '../Icon';
import './calendar.css';

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export interface CalendarProps {
  /** ISO 'YYYY-MM-DD' dates currently selected — rendered as solid filled days. */
  selectedDates: string[];
  onToggleDate: (date: string) => void;
  /** ISO date, inclusive lower bound for selectable days. */
  minDate: string;
  /** ISO date, inclusive upper bound for selectable days. */
  maxDate: string;
  /**
   * ISO dates strictly between a selected range's two endpoints — rendered
   * with a light fill instead of `selectedDates`' solid one (e.g. the days
   * "inside" a Time Off date range, as opposed to its start/end days).
   */
  inRangeDates?: string[];
  /** Extra per-day disable check beyond `minDate`/`maxDate`, e.g. a VA's non-working weekdays. */
  isDayDisabled?: (date: string) => boolean;
  /** ISO date for the month initially shown. Defaults to `maxDate`'s month (right for a past-only range like Extra Hours, where that's the most relevant month) — pass today's date for a range that also extends into the future. */
  initialViewDate?: string;
  className?: string;
}

function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * A month-grid, multi-select date picker — used by the Extra Hours request
 * form to pick which past days extra hours were worked on. Days outside
 * `minDate`/`maxDate` (or outside the viewed month) are disabled; clicking
 * an enabled day toggles it in `selectedDates` via `onToggleDate` (the
 * caller owns selection state, same pattern as every other control in this
 * library).
 */
export const Calendar = ({
  selectedDates,
  onToggleDate,
  minDate,
  maxDate,
  inRangeDates,
  isDayDisabled,
  initialViewDate,
  className,
}: CalendarProps) => {
  const min = parseISODate(minDate);
  const max = parseISODate(maxDate);
  const initialView = initialViewDate ? parseISODate(initialViewDate) : max;
  const [viewedYear, setViewedYear] = useState(initialView.getFullYear());
  const [viewedMonth, setViewedMonth] = useState(initialView.getMonth());

  const todayISO = toISODate(new Date());
  const minMonthStart = new Date(min.getFullYear(), min.getMonth(), 1);
  const maxMonthStart = new Date(max.getFullYear(), max.getMonth(), 1);
  const viewedMonthStart = new Date(viewedYear, viewedMonth, 1);

  // Monday-first offset: Date#getDay() is 0=Sun..6=Sat.
  const startOffset = (viewedMonthStart.getDay() + 6) % 7;
  const gridStart = new Date(viewedYear, viewedMonth, 1 - startOffset);
  const days: Date[] = Array.from(
    { length: 42 },
    (_, index) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index),
  );

  const canGoPrev = viewedMonthStart > minMonthStart;
  const canGoNext = viewedMonthStart < maxMonthStart;

  const goToMonth = (year: number, month: number) => {
    setViewedYear(year);
    setViewedMonth(month);
  };

  const yearOptions: number[] = [];
  for (let year = min.getFullYear(); year <= max.getFullYear(); year += 1) yearOptions.push(year);

  const classNames = ['calendar', className].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      <div className="calendar__header">
        <button
          type="button"
          className="calendar__nav"
          onClick={() => goToMonth(viewedYear, viewedMonth - 1)}
          disabled={!canGoPrev}
          aria-label="Previous month"
        >
          <Icon name="chevron-left" size={12} />
        </button>
        <select
          className="calendar__select"
          value={viewedMonth}
          onChange={(event) => goToMonth(viewedYear, Number(event.target.value))}
          aria-label="Month"
        >
          {MONTH_LABELS.map((label, index) => {
            const monthStart = new Date(viewedYear, index, 1);
            return (
              <option key={label} value={index} disabled={monthStart < minMonthStart || monthStart > maxMonthStart}>
                {label}
              </option>
            );
          })}
        </select>
        <select
          className="calendar__select"
          value={viewedYear}
          onChange={(event) => goToMonth(Number(event.target.value), viewedMonth)}
          aria-label="Year"
        >
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="calendar__nav"
          onClick={() => goToMonth(viewedYear, viewedMonth + 1)}
          disabled={!canGoNext}
          aria-label="Next month"
        >
          <Icon name="chevron-right" size={12} />
        </button>
      </div>
      <div className="calendar__weekdays">
        {WEEKDAY_LABELS.map((label, index) => (
          <span key={index} className="calendar__weekday">
            {label}
          </span>
        ))}
      </div>
      <div className="calendar__grid">
        {days.map((day) => {
          const iso = toISODate(day);
          const inMonth = day.getMonth() === viewedMonth;
          const disabled = !inMonth || iso < minDate || iso > maxDate || (isDayDisabled?.(iso) ?? false);
          const selected = selectedDates.includes(iso);
          const inRange = !selected && (inRangeDates?.includes(iso) ?? false);
          const dayClassNames = [
            'calendar__day',
            !inMonth && 'calendar__day--outside',
            selected && 'calendar__day--selected',
            inRange && 'calendar__day--in-range',
            iso === todayISO && 'calendar__day--today',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={iso}
              type="button"
              className={dayClassNames}
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onToggleDate(iso)}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};
