import type { ButtonHTMLAttributes } from 'react';
import { Icon } from '../Icon';
import './notification.css';

export interface NotificationProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Message shown next to the icon. */
  message: string;
  /**
   * Renders as a toast pinned to the top-right of the viewport instead of a
   * plain inline block. Use this for "action succeeded, click to continue"
   * moments that aren't part of the page's own content flow.
   */
  floating?: boolean;
  className?: string;
}

/**
 * A clickable confirmation banner (e.g. "Email sent — click to continue")
 * used to move a multi-step flow forward after an action succeeds. Renders
 * as a real `<button>` since it's always meant to be acted on, not just
 * read — there's no non-interactive/decorative variant.
 */
export const Notification = ({ message, floating = false, className, ...rest }: NotificationProps) => {
  const classNames = ['notification', floating && 'notification--floating', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classNames} {...rest}>
      <Icon name="circle-check" variant="bold" size={20} className="notification__icon" />
      <span className="notification__message">{message}</span>
    </button>
  );
};
