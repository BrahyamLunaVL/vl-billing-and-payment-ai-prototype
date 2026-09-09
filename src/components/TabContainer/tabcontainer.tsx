import type { ButtonHTMLAttributes } from 'react';
import './tabcontainer.css';

export interface TabContainerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Tab label. */
  tabTitle: string;
  /** Optional counter chip shown after the title (e.g. an item count). */
  counter?: string;
  /**
   * Whether this is the currently active tab. This is data state, not a
   * mouse/interaction state, so it's a prop rather than derived from CSS
   * like `:hover` is, and it takes priority over hover/pressed.
   */
  selected?: boolean;
  className?: string;
}

/**
 * A single tab button (Figma's "Tab Container"), meant to be composed
 * inside a `TabBar`. Renders as a real `<button role="tab">`. Hover (black
 * text) and pressed (real CSS `:active` — the user holding the tab down,
 * shown in brand/secondary) come from CSS over a default gray look;
 * `selected` is a prop-driven data state (shown in brand/primary) that
 * takes priority over both — see tabcontainer.css.
 */
export const TabContainer = ({
  tabTitle,
  counter,
  selected = false,
  className,
  disabled,
  ...rest
}: TabContainerProps) => {
  const classNames = ['tab-container', selected && 'tab-container--selected', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={classNames}
      disabled={disabled}
      {...rest}
    >
      <span className="tab-container__title">{tabTitle}</span>
      {counter !== undefined && <span className="tab-container__counter">{counter}</span>}
    </button>
  );
};
