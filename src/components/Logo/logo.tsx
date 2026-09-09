import wordmark from './images/wordmark.png';
import mark from './images/mark.png';
import './logo.css';

export type LogoSize = 'small' | 'large';

export interface LogoProps {
  /**
   * `false` (the default) renders the full "VirtualLatinos" wordmark, used
   * on full-screen surfaces like the auth screens. `true` renders the
   * circular gradient mark instead, used in compact spaces like the bottom
   * of the Sidebar.
   */
  rounded?: boolean;
  size?: LogoSize;
  className?: string;
}

/**
 * The app's logo, in the two forms Figma's "Logo" component ships (each in
 * a small/large size): the wordmark, and a circular mark for tight spaces.
 */
export const Logo = ({ rounded = false, size = 'small', className }: LogoProps) => {
  const classNames = [
    'logo',
    rounded ? 'logo--mark' : 'logo--wordmark',
    `logo--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <img src={rounded ? mark : wordmark} alt="Virtual Latinos" className={classNames} />;
};
