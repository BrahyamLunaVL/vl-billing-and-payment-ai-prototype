import './brand.css';
import telegramLogo from './svgs/telegram.svg';

/**
 * Union of supported third-party brand/social-network logos.
 * Add a new brand by extending this union AND adding an entry to `brandMap` below.
 */
export type BrandName = 'telegram';

/**
 * Lookup map from brand name to its logo asset URL.
 * Keep this in sync with `BrandName` — one entry per union member.
 */
const brandMap: Record<BrandName, string> = {
  telegram: telegramLogo,
};

export interface BrandProps {
  /** Which third-party brand/social logo to render. */
  name: BrandName;
  /** Width and height, in pixels. Defaults to 20. */
  size?: number;
  /** Optional class name applied to the rendered <img>. */
  className?: string;
}

/**
 * Renders a third-party brand/social-network logo (e.g. Telegram).
 *
 * Unlike the generic `Icon` component, `Brand` always renders the logo's
 * original colors — it never strips fills or applies `currentColor`.
 */
export const Brand = ({ name, size = 20, className }: BrandProps) => {
  return (
    <img
      src={brandMap[name]}
      width={size}
      height={size}
      alt={`${name} logo`}
      className={className ? `brand ${className}` : 'brand'}
    />
  );
};
