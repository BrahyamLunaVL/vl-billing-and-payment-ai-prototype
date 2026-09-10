import { Icon } from '../Icon';
import './filterchip.css';

export interface FilterChipProps {
  /** e.g. "VA Name: Maria Belen Di Stefano" */
  label: string;
  onRemove?: () => void;
  className?: string;
}

/**
 * A removable filter tag shown above a filtered list (e.g. "VA Name: ...").
 * Unlike `Chip` (a read-only status pill), this always has a close action
 * and never represents a status — it's Figma's distinct "Filter Chip"
 * variant: pill-shaped, colored text instead of a dot, no status meaning.
 */
export const FilterChip = ({ label, onRemove, className }: FilterChipProps) => {
  const classNames = ['filter-chip', className].filter(Boolean).join(' ');

  return (
    <span className={classNames}>
      <span className="filter-chip__label">{label}</span>
      <button
        type="button"
        className="filter-chip__remove"
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
      >
        <Icon name="xmark" variant="bold" size={12} />
      </button>
    </span>
  );
};
