import { Chip, type ChipTone } from '../Chip';
import './cacard.css';

export interface CACardProps {
  title: string;
  date: string;
  statusLabel: string;
  statusTone?: ChipTone;
  /**
   * `'chip-left'` (the default) puts the status chip before the title/date;
   * `'chip-right'` puts it after — Figma's two "Style" variants.
   */
  layout?: 'chip-left' | 'chip-right';
  onClick?: () => void;
  className?: string;
}

/**
 * A single Changes & Approvals request row (Figma's "C&A Card"), meant to
 * be listed inside a `ProfileCard`'s content area. Renders as a button
 * when `onClick` is given (e.g. to open the request's details), or a
 * plain row otherwise.
 */
export const CACard = ({
  title,
  date,
  statusLabel,
  statusTone = 'blue',
  layout = 'chip-left',
  onClick,
  className,
}: CACardProps) => {
  const classNames = ['ca-card', className].filter(Boolean).join(' ');
  const chip = <Chip label={statusLabel} tone={statusTone} />;

  // The two Figma "Style" variants don't just swap the chip's side — the
  // title/date order inside the content block flips too (title-then-date
  // for chip-left, date-then-title for chip-right).
  const children =
    layout === 'chip-right' ? (
      <>
        <div className="ca-card__content">
          <p className="ca-card__date">{date}</p>
          <p className="ca-card__title">{title}</p>
        </div>
        {chip}
      </>
    ) : (
      <>
        {chip}
        <div className="ca-card__content">
          <p className="ca-card__title">{title}</p>
          <p className="ca-card__date">{date}</p>
        </div>
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
