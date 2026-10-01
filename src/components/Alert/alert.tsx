import { Icon, type IconName } from '../Icon';
import './alert.css';

export type AlertType = 'success' | 'warning' | 'error' | 'info';

export interface AlertProps {
  /** Which color treatment to use. Defaults to 'success'. */
  type?: AlertType;
  /** Message shown next to the icon. */
  message: string;
  className?: string;
}

const ICON_BY_TYPE: Record<AlertType, IconName> = {
  success: 'circle-check',
  info: 'circle-info',
  warning: 'triangle-exclamation',
  error: 'triangle-exclamation',
};

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
      <Icon name={ICON_BY_TYPE[type]} variant="regular" size={20} className="alert__icon" />
      <span className="alert__message">{message}</span>
    </div>
  );
};
