import { TabContainer } from '../TabContainer';
import './tabbar.css';

export interface TabBarTab {
  /** Stable identifier, passed to `onSelectTab`/compared against `selectedKey`. */
  key: string;
  label: string;
  /** Optional counter chip shown after the label (e.g. an item count). */
  counter?: string;
  disabled?: boolean;
}

export interface TabBarProps {
  tabs: TabBarTab[];
  /** Key of the currently selected tab. */
  selectedKey: string;
  onSelectTab: (key: string) => void;
  className?: string;
}

/**
 * A simple row container for `TabContainer` tabs, with nothing more than a
 * bottom border of its own — Figma's literal "Tab Bar" component bundles a
 * fixed set of per-screen tab labels, but a real container just needs to
 * lay out whatever tabs the caller has for the current user/screen. Unlike
 * the Sidebar (which navigates between pages), selecting a tab here is
 * expected to only swap the content of a section on the same page — this
 * component doesn't do that itself, it just renders the tabs and reports
 * which one was clicked via `onSelectTab`.
 */
export const TabBar = ({ tabs, selectedKey, onSelectTab, className }: TabBarProps) => {
  const classNames = ['tab-bar', className].filter(Boolean).join(' ');

  return (
    <div className={classNames} role="tablist">
      {tabs.map((tab) => (
        <TabContainer
          key={tab.key}
          tabTitle={tab.label}
          counter={tab.counter}
          selected={tab.key === selectedKey}
          disabled={tab.disabled}
          onClick={() => onSelectTab(tab.key)}
        />
      ))}
    </div>
  );
};
