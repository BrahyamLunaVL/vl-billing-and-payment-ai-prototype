import type { ReactNode } from 'react';
import './profilecard.css';

export interface ProfileCardProps {
  /**
   * Composed manually by the caller (an icon, title, description, chips,
   * a button — whatever the section needs), separated from `children` by
   * a divider line. Omit it for a card with no header at all.
   */
  header?: ReactNode;
  children?: ReactNode;
  /** An optional bottom bar, visually set off from the content (e.g. a running total). */
  footer?: ReactNode;
  /** A left accent border, used to draw extra attention to a card. */
  leftBorder?: boolean;
  className?: string;
}

/**
 * The dashboard card container used throughout "My Account" and similar
 * screens (Figma's "Profile Card"): a white, rounded, bordered, shadowed
 * box with an optional header/divider and an optional footer bar. This is
 * deliberately just the container — like `Form`, every section composes
 * its own header/content as plain children rather than this component
 * modeling every possible header arrangement as props.
 */
export const ProfileCard = ({ header, children, footer, leftBorder = false, className }: ProfileCardProps) => {
  const classNames = ['profile-card', leftBorder && 'profile-card--left-border', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      <div className="profile-card__body">
        {header && (
          <>
            <div className="profile-card__header">{header}</div>
            <div className="profile-card__divider" />
          </>
        )}
        {children && <div className="profile-card__content">{children}</div>}
      </div>
      {footer && <div className="profile-card__footer">{footer}</div>}
    </div>
  );
};
