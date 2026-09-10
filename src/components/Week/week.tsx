import { WeekDay } from '../WeekDay';
import './week.css';

export interface WeekDayData {
  /** Stable key for the list render. */
  key: string;
  dayLetter: string;
  value: string;
  disabled?: boolean;
}

/** Monday-Sunday, weekends disabled by default — most VAs don't work weekends. */
const DEFAULT_WEEK: WeekDayData[] = [
  { key: 'mon', dayLetter: 'M', value: '8 hrs' },
  { key: 'tue', dayLetter: 'T', value: '8 hrs' },
  { key: 'wed', dayLetter: 'W', value: '8 hrs' },
  { key: 'thu', dayLetter: 'T', value: '8 hrs' },
  { key: 'fri', dayLetter: 'F', value: '8 hrs' },
  { key: 'sat', dayLetter: 'S', value: '0 hrs', disabled: true },
  { key: 'sun', dayLetter: 'S', value: '0 hrs', disabled: true },
];

export interface WeekProps {
  /** Defaults to Mon-Fri enabled (8 hrs) / Sat-Sun disabled (0 hrs). */
  days?: WeekDayData[];
  className?: string;
}

/** A row of 7 `WeekDay`s, Monday through Sunday. */
export const Week = ({ days = DEFAULT_WEEK, className }: WeekProps) => {
  const classNames = ['week', className].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      {days.map((day) => (
        <WeekDay key={day.key} dayLetter={day.dayLetter} value={day.value} disabled={day.disabled} />
      ))}
    </div>
  );
};
