import { useState } from 'react';
import { Icon } from '../Icon';
import './cadaygroups.css';

export interface CADayGroup {
  /** e.g. "Week from Apr 6 to Apr 12, 2026". */
  weekLabel: string;
  /** e.g. "Wednesday 04-08-2026 (4 Hours)". */
  days: string[];
}

export interface CADayGroupsProps {
  groups: CADayGroup[];
  className?: string;
}

/**
 * The "Days Selected (with hours/day)" detail's collapsible per-week list —
 * every week starts expanded, and each one's header (week label + chevron on
 * the far right) toggles independently.
 */
export const CADayGroups = ({ groups, className }: CADayGroupsProps) => {
  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<string>>(new Set());

  const toggleWeek = (weekLabel: string) => {
    setCollapsedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekLabel)) next.delete(weekLabel);
      else next.add(weekLabel);
      return next;
    });
  };

  return (
    <div className={['ca-day-groups', className].filter(Boolean).join(' ')}>
      {groups.map((group) => {
        const isExpanded = !collapsedWeeks.has(group.weekLabel);
        return (
          <div key={group.weekLabel} className="ca-day-groups__group">
            <button
              type="button"
              className="ca-day-groups__header"
              onClick={() => toggleWeek(group.weekLabel)}
              aria-expanded={isExpanded}
            >
              <span className="ca-day-groups__week-label">{group.weekLabel}</span>
              <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} />
            </button>
            {isExpanded && (
              <ul className="ca-day-groups__days">
                {group.days.map((day) => (
                  <li key={day} className="ca-day-groups__day">
                    {day}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};
