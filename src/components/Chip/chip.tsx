import './chip.css';

export type ChipTone = 'gray' | 'red' | 'green' | 'blue' | 'orange' | 'purple';

export interface ChipProps {
  label: string;
  /**
   * Figma's Chip catalog reuses the same 6 background colors across ~10
   * entity types, but the mapping from status word to color is NOT
   * consistent between types (e.g. "Paid" is green for invoices but blue
   * for deposits) — so this is named after the color itself rather than a
   * semantic tone like "success"/"warning". Callers own the status ->
   * color mapping for their own entity (see e.g. AgreementCard's own
   * lookup). Defaults to 'gray'.
   */
  tone?: ChipTone;
  className?: string;
}

/**
 * A small status pill: a colored dot plus a bold label. Text is always
 * brand/black — only the background (and the dot) change with `tone`.
 */
export const Chip = ({ label, tone = 'gray', className }: ChipProps) => {
  const classNames = ['chip', `chip--${tone}`, className].filter(Boolean).join(' ');

  return (
    <span className={classNames}>
      <span className="chip__dot" aria-hidden="true" />
      <span className="chip__label">{label}</span>
    </span>
  );
};
