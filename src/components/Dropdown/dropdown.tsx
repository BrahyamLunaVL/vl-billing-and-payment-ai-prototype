import './dropdown.css';
import type { ReactNode } from 'react';

export interface DropdownProps {
  /** The list of `DropdownOption`s (or any option-like content) to render inside the scrollable list. */
  children: ReactNode;
  /**
   * Optional content rendered below a divider, under the main list — e.g. a
   * single extra `DropdownOption` such as "Clear selection". Renders
   * nothing (no divider either) when omitted, since not every dropdown
   * needs this section.
   */
  footer?: ReactNode;
  className?: string;
}

/**
 * The floating panel a Select/MultiSelect opens below itself, listing its
 * `DropdownOption`s. This is presentational only: it does not manage its
 * own open/closed state and does not position itself relative to a trigger
 * — whatever renders it decides when to mount it and where (typically
 * `position: absolute; top: 100%; left: 0; width: 100%;` on a wrapper the
 * trigger owns).
 *
 * The list container uses native `overflow-y: auto` rather than a custom
 * scrollbar, capped at a max-height matching the Figma mock.
 */
export const Dropdown = ({ children, footer, className }: DropdownProps) => {
  const classNames = ['dropdown', className].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      <div className="dropdown__list">{children}</div>
      {footer && (
        <div className="dropdown__footer">
          <hr className="dropdown__divider" />
          {footer}
        </div>
      )}
    </div>
  );
};
