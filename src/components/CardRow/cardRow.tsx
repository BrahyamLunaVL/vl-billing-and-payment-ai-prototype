import './cardrow.css';

export interface CardRowProps {
  title: string;
  value: string;
  /** Renders `value` as a blue link instead of plain bold black text. */
  link?: boolean;
  onValueClick?: () => void;
  className?: string;
}

/**
 * A single label/value line (Figma's "Card Row") — used to list an
 * agreement's or VA's facts inside a `ProfileCard`, e.g. "Rate: $12.50/hr"
 * or "Telegram: @juan.gomez" as a link.
 */
export const CardRow = ({ title, value, link = false, onValueClick, className }: CardRowProps) => {
  const classNames = ['card-row', className].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      <span className="card-row__title">{title}</span>
      {link ? (
        <button type="button" className="card-row__value card-row__value--link" onClick={onValueClick}>
          {value}
        </button>
      ) : (
        <span className="card-row__value">{value}</span>
      )}
    </div>
  );
};
