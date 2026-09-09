import { Icon } from '../Icon';
import './alert.css';

export type AlertType = 'success' | 'warning' | 'error';

export interface AlertProps {
  /** Which color treatment to use. Defaults to 'success'. */
  type?: AlertType;
  /** Message shown next to the icon. */
  message: string;
  className?: string;
}

/**
 * A static, full-width status banner (Figma's "Table Alerts" component,
 * Small size) — e.g. the "Password successfully updated" message shown
 * inline on the Reset Password screen. Unlike Notification, this is never
 * clickable: it just reports a result in place.
 */
export const Alert = ({ type = 'success', message, className }: AlertProps) => {
  const classNames = ['alert', `alert--${type}`, className].filter(Boolean).join(' ');

  return (
    <div className={classNames} role="status">
      <Icon name="circle-check" variant="bold" size={20} className="alert__icon" />
      <span className="alert__message">{message}</span>
    </div>
  );
};
