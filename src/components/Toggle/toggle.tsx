import { Icon, type IconName } from '../Icon';
import './toggle.css';

export interface ToggleOption {
  key: string;
  label: string;
  icon: IconName;
  /** Optional count badge shown after the label, e.g. a result count. */
  count?: number;
}

export interface ToggleProps {
  options: ToggleOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
  className?: string;
}

/**
 * A pill-shaped segmented control (Figma's "Toggle") — e.g. My Account's
 * "Per VA" / "Per Charge Type" invoice view switch. Unlike `TabBar` (an
 * underlined tab list for swapping a whole section), this is a compact,
 * self-contained switch between 2-3 display modes of the same content.
 */
export const Toggle = ({ options, selectedKey, onSelect, className }: ToggleProps) => {
  const classNames = ['toggle', className].filter(Boolean).join(' ');

  return (
    <div className={classNames} role="tablist">
      {options.map((option) => {
        const selected = option.key === selectedKey;
        return (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={selected}
            className={selected ? 'toggle__tab toggle__tab--selected' : 'toggle__tab'}
            onClick={() => onSelect(option.key)}
          >
            <Icon name={option.icon} variant="regular" size={20} className="toggle__icon" />
            <span className="toggle__label">{option.label}</span>
            {option.count !== undefined && (
              <span className={selected ? 'toggle__count toggle__count--selected' : 'toggle__count'}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
