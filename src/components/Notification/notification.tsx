import type { ButtonHTMLAttributes } from 'react';
import { Icon } from '../Icon';
import './notification.css';

export interface NotificationProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Message shown next to the icon. */
  message: string;
  className?: string;
}

/**
 * A clickable confirmation banner (e.g. "Email sent — click to continue")
 * used to move a multi-step flow forward after an action succeeds. Renders
 * as a real `<button>` since it's always meant to be acted on, not just
 * read — there's no non-interactive/decorative variant.
 */
export const Notification = ({ message, className, ...rest }: NotificationProps) => {
  return (
    <button type="button" className={className ? `notification ${className}` : 'notification'} {...rest}>
      <Icon name="circle-check" variant="bold" size={20} className="notification__icon" />
      <span className="notification__message">{message}</span>
    </button>
  );
};
