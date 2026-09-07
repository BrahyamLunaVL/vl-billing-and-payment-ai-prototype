import './icon.css';
import { iconRegistry, type IconDef, type IconName, type IconVariant } from './icon-data.generated';

export interface IconProps {
  /** Which icon from the design system to render. */
  name: IconName;
  /** Visual weight of the icon. Defaults to 'regular'. */
  variant?: IconVariant;
  /** Width and height, in pixels. Defaults to 20. */
  size?: number;
  /** Optional class name applied to the rendered <svg>. */
  className?: string;
  /**
   * Optional accessible label. When provided, the icon is exposed to
   * assistive tech as an image with this label. When omitted, the icon
   * is treated as decorative and hidden from assistive tech.
   */
  title?: string;
}

/**
 * Resolves the icon definition for a given name/variant pair, falling back
 * to whichever variant IS available when the requested one is missing
 * (e.g. `money-bills` only ships a `bold` variant, `money-bills-simple`
 * only ships `regular` — an inconsistency in the source Figma file).
 */
function resolveIconDef(name: IconName, variant: IconVariant): IconDef | undefined {
  const variants = iconRegistry[name] as Partial<Record<IconVariant, IconDef>> | undefined;
  if (!variants) return undefined;
  return variants[variant] ?? variants.regular ?? variants.bold;
}

/**
 * Renders one of the design system's UI icons as an inline, real `<svg>`
 * element that inherits its color from `currentColor` — so a single icon
 * asset can be reused in any color context via CSS.
 */
export const Icon = ({ name, variant = 'regular', size = 20, className, title }: IconProps) => {
  const def = resolveIconDef(name, variant);

  if (!def) {
    return null;
  }

  return (
    <svg
      viewBox={def.viewBox}
      width={size}
      height={size}
      fill="currentColor"
      role={title ? 'img' : undefined}
      aria-hidden={!title}
      aria-label={title}
      className={className ? `icon ${className}` : 'icon'}
      // The inner markup is our own generated, build-time-static data (see
      // icon-data.generated.ts) — never user input — so this is safe.
      dangerouslySetInnerHTML={{ __html: def.innerSvg }}
    />
  );
};
