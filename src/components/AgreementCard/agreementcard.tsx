import { Icon } from '../Icon';
import { Chip, type ChipTone } from '../Chip';
import { Week, type WeekDayData } from '../Week';
import './agreementcard.css';

export interface AgreementCardProps {
  /** e.g. "The Matian Firm @ $8.00". */
  title: string;
  statusLabel: string;
  statusTone?: ChipTone;
  hoursPerWeek: string;
  vaRate: string;
  clientRate?: string;
  dateStart: string;
  dateEnd?: string;
  /** The agreement's working schedule. Omit to hide the Week row entirely (e.g. a terminated agreement). */
  week?: WeekDayData[];
  onEdit?: () => void;
  className?: string;
}

/**
 * A single agreement summary (Figma's "Agreement Card") — meant to sit
 * inside a `ProfileCard`'s content area, one per agreement. Uses the same
 * white/bordered/rounded look as `ProfileCard`, just smaller and without
 * a shadow, since several of these stack inside one ProfileCard.
 */
export const AgreementCard = ({
  title,
  statusLabel,
  statusTone = 'blue',
  hoursPerWeek,
  vaRate,
  clientRate,
  dateStart,
  dateEnd,
  week,
  onEdit,
  className,
}: AgreementCardProps) => {
  const classNames = ['agreement-card', className].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      <p className="agreement-card__title">{title}</p>
      <div className="agreement-card__chip-row">
        <Chip label={statusLabel} tone={statusTone} />
        {onEdit && (
          <button type="button" className="agreement-card__edit" onClick={onEdit} aria-label="Edit agreement">
            <Icon name="pen-to-square" size={12} />
          </button>
        )}
      </div>
      <div className="agreement-card__divider" />
      <div className="agreement-card__item">
        <Icon name="clock" size={16} className="agreement-card__item-icon" />
        <span>{hoursPerWeek}</span>
      </div>
      <div className="agreement-card__item">
        <Icon name="circle-dollar" size={20} className="agreement-card__item-icon" />
        <span>{vaRate}</span>
      </div>
      {clientRate && (
        <div className="agreement-card__item">
          <Icon name="circle-dollar" size={20} className="agreement-card__item-icon" />
          <span>{clientRate}</span>
        </div>
      )}
      <div className="agreement-card__item">
        <Icon name="calendar" size={20} className="agreement-card__item-icon" />
        <span>{dateStart}</span>
      </div>
      {dateEnd && (
        <div className="agreement-card__item">
          <Icon name="calendar" size={20} className="agreement-card__item-icon" />
          <span>{dateEnd}</span>
        </div>
      )}
      {week && <Week days={week} />}
    </div>
  );
};
