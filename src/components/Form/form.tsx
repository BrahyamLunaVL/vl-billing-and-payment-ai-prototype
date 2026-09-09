import type { ReactNode } from 'react';
import './form.css';

export interface FormProps {
  children: ReactNode;
  className?: string;
}

/**
 * The design system's card container for forms (login form, etc.): a white,
 * rounded, shadowed surface with a fixed gap between its direct children.
 * This is deliberately just the container — Figma's "Login Form" component
 * bundles a title/description header and content slots into one big
 * component with several boolean toggles (centered title vs. a left title
 * with a close button, optional description, etc.), but those are just
 * different arrangements of ordinary content. Rather than modeling every
 * arrangement as a prop, callers compose the title, fields, and buttons
 * themselves from the project's existing components (Icon, Input, FormField,
 * Button...) as `children`, the same way they'd build any other layout.
 */
export const Form = ({ children, className }: FormProps) => {
  return <div className={className ? `form ${className}` : 'form'}>{children}</div>;
};
