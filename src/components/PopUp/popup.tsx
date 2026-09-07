import type { ReactNode } from 'react';
import './popup.css';

export interface PopUpProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Full-screen modal backdrop. Fixed over the entire viewport — regardless
 * of where it's mounted in the tree or the page's scroll position — filled
 * with the design system's translucent backdrop color, and centers its
 * content both horizontally and vertically. Renders unconditionally: the
 * caller decides whether to mount it (e.g. `{isOpen && <PopUp>...}`).
 */
export const PopUp = ({ children, className }: PopUpProps) => {
  return <div className={className ? `popup ${className}` : 'popup'}>{children}</div>;
};
