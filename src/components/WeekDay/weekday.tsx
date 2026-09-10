import './weekday.css';

export interface WeekDayProps {
  /** Single-letter day label, e.g. "M". */
  dayLetter: string;
  /** e.g. "8 hrs". */
  value: string;
  /** Whether this day is a non-working day (weekends, typically). */
  disabled?: boolean;
  className?: string;
}

/**
 * A single day pill inside a `Week` row: a letter over an hours value,
 * used to show a VA's working schedule for one agreement.
 */
export const WeekDay = ({ dayLetter, value, disabled = false, className }: WeekDayProps) => {
  const classNames = ['week-day', disabled && 'week-day--disabled', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      <span className="week-day__letter">{dayLetter}</span>
      <span className="week-day__value">{value}</span>
    </div>
  );
};
