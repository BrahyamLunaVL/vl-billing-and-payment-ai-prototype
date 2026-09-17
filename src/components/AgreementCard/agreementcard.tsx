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
  /** The VA's own rate — this card is only ever shown to the VA (or Admin), never the Client, so it never shows a Client Rate. */
  vaRate: string;
  dateStart: string;
  dateEnd?: string;
  /** The agreement's working schedule. Omit to hide the Week row entirely (e.g. a terminated agreement). */
  week?: WeekDayData[];
  /** Opens the agreement's own detail page. Renders the whole card as a button when given, a plain row otherwise. */
  onClick?: () => void;
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
  dateStart,
  dateEnd,
  week,
  onClick,
  className,
}: AgreementCardProps) => {
  const classNames = ['agreement-card', className].filter(Boolean).join(' ');

  const children = (
    <>
      <p className="agreement-card__title">{title}</p>
      <div className="agreement-card__chip-row">
        <Chip label={statusLabel} tone={statusTone} />
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
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={classNames} onClick={onClick}>
        {children}
      </button>
    );
  }

  return <div className={classNames}>{children}</div>;
};
