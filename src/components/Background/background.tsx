import './background.css';

export interface BackgroundProps {
  className?: string;
}

/**
 * Decorative background shapes from the design system, meant to sit behind
 * a screen's real content. Renders as an absolutely positioned layer pinned
 * to the bottom of its nearest positioned ancestor and stretched to 100% of
 * that ancestor's width — wrap it together with the screen's content in a
 * `position: relative` container (add `overflow: hidden` if the screen is
 * shorter than the shape's natural aspect ratio).
 */
export const Background = ({ className }: BackgroundProps) => {
  return (
    <svg
      className={className ? `background ${className}` : 'background'}
      viewBox="0 0 1920 661"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M1920 116L1106.698 348.389L0 661H1920V116Z" fill="#6F1D5D" fillOpacity="0.04" />
      <path d="M0 0L504.92 281.852L1192 661H0V0Z" fill="#C32059" fillOpacity="0.04" />
    </svg>
  );
};
