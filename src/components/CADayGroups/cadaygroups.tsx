import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon';
import './cadaygroups.css';

export interface CADayGroupHoursTooltip {
  /** Same value as the "Pre-approved Hours per week" detail. */
  preApprovedHoursPerWeek: number;
  /** Hours this VA's OTHER requests already reported in this week — the tooltip omits this row when 0. */
  takenByOtherRequests: number;
  /** This request's own reported hours falling in this week. */
  reportedInThisRequest: number;
}

export interface CADayGroup {
  /** e.g. "Week from Apr 6 to Apr 12, 2026". */
  weekLabel: string;
  /** e.g. "Wednesday 04-08-2026 (4 Hours)". */
  days: string[];
  /** Present when the agreement has pre-approved hours — shown as a tooltip on the week header. */
  hoursTooltip?: CADayGroupHoursTooltip;
}

export interface CADayGroupsProps {
  groups: CADayGroup[];
  /**
   * The parent request's current status — read live on every render (not
   * baked into `hoursTooltip`) so the "Pre-approved Hours Remaining" row
   * updates immediately when a pending request is approved/rejected: only
   * an approved request's own hours actually count against the balance.
   */
  requestStatus: 'new' | 'approved' | 'rejected' | 'expired';
  className?: string;
}

/**
 * The "Days Selected (with hours/day)" detail's collapsible per-week list —
 * every week starts expanded, and each one's header (week label, with a
 * chevron on the far right) toggles independently. A week with
 * `hoursTooltip` also gets an info icon right next to the week label whose
 * hover/focus tooltip breaks down the pre-approved-hours balance for that
 * week: the weekly allowance, what other requests already reported (when
 * any), what this request reports, and what's left of the allowance — plus,
 * while the request is still pending, a projected balance if it's approved.
 */
export const CADayGroups = ({ groups, requestStatus, className }: CADayGroupsProps) => {
  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<string>>(new Set());
  const [openTooltipWeek, setOpenTooltipWeek] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const infoTriggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const baseTooltipId = useId();

  useEffect(() => {
    if (!openTooltipWeek) return;
    // The tooltip's fixed position is only computed once, on open — rather
    // than track it, just close on any scroll so it never goes stale.
    const handleScroll = () => setOpenTooltipWeek(null);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [openTooltipWeek]);

  const toggleWeek = (weekLabel: string) => {
    setCollapsedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekLabel)) next.delete(weekLabel);
      else next.add(weekLabel);
      return next;
    });
  };

  const handleTooltipOpen = (weekLabel: string) => {
    const trigger = infoTriggerRefs.current.get(weekLabel);
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      setTooltipPosition({ top: rect.top - 6, left: rect.left + rect.width / 2 });
    }
    setOpenTooltipWeek(weekLabel);
  };

  const handleTooltipClose = () => setOpenTooltipWeek(null);

  return (
    <div className={['ca-day-groups', className].filter(Boolean).join(' ')}>
      {groups.map((group, index) => {
        const isExpanded = !collapsedWeeks.has(group.weekLabel);
        const tooltipId = `${baseTooltipId}-${index}`;
        const isTooltipOpen = openTooltipWeek === group.weekLabel;
        const isPending = requestStatus === 'new';
        const hoursTooltip = group.hoursTooltip;
        const remainingHours = hoursTooltip
          ? Math.max(
              0,
              hoursTooltip.preApprovedHoursPerWeek -
                hoursTooltip.takenByOtherRequests -
                (requestStatus === 'approved' ? hoursTooltip.reportedInThisRequest : 0),
            )
          : 0;
        const estimatedRemainingIfApproved =
          hoursTooltip && isPending
            ? Math.max(0, hoursTooltip.preApprovedHoursPerWeek - hoursTooltip.takenByOtherRequests - hoursTooltip.reportedInThisRequest)
            : undefined;
        return (
          <div key={group.weekLabel} className="ca-day-groups__group">
            <div className="ca-day-groups__header">
              <button
                type="button"
                className="ca-day-groups__header-toggle"
                onClick={() => toggleWeek(group.weekLabel)}
                aria-expanded={isExpanded}
              >
                <span className="ca-day-groups__week-label">{group.weekLabel}</span>
              </button>
              {hoursTooltip && (
                <span
                  className="ca-day-groups__info"
                  onMouseEnter={() => handleTooltipOpen(group.weekLabel)}
                  onMouseLeave={handleTooltipClose}
                >
                  <button
                    ref={(node) => {
                      if (node) infoTriggerRefs.current.set(group.weekLabel, node);
                      else infoTriggerRefs.current.delete(group.weekLabel);
                    }}
                    type="button"
                    className="ca-day-groups__info-trigger"
                    aria-describedby={tooltipId}
                    tabIndex={0}
                    onFocus={() => handleTooltipOpen(group.weekLabel)}
                    onBlur={handleTooltipClose}
                  >
                    <Icon name="circle-info" variant="bold" size={12} />
                  </button>
                  {isTooltipOpen &&
                    tooltipPosition &&
                    createPortal(
                      <span
                        role="tooltip"
                        id={tooltipId}
                        className="ca-day-groups__tooltip"
                        style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
                      >
                        <span className="ca-day-groups__tooltip-row">
                          <span>Pre-approved Hours per week</span>
                          <span>{hoursTooltip.preApprovedHoursPerWeek} Hours</span>
                        </span>
                        {hoursTooltip.takenByOtherRequests > 0 && (
                          <span className="ca-day-groups__tooltip-row">
                            <span>Hours Reported in Other Requests</span>
                            <span>{hoursTooltip.takenByOtherRequests} Hours</span>
                          </span>
                        )}
                        <span className="ca-day-groups__tooltip-row">
                          <span>Hours Reported in This Request</span>
                          <span>{hoursTooltip.reportedInThisRequest} Hours</span>
                        </span>
                        <span className="ca-day-groups__tooltip-row">
                          <span>
                            {isPending ? 'Pre-approved Hours Remaining at Request Time' : 'Pre-approved Hours Remaining'}
                          </span>
                          <span>{remainingHours} Hours</span>
                        </span>
                        {estimatedRemainingIfApproved !== undefined && (
                          <span className="ca-day-groups__tooltip-row">
                            <span>Estimated Remaining if Approved</span>
                            <span>{estimatedRemainingIfApproved} Hours</span>
                          </span>
                        )}
                      </span>,
                      document.body,
                    )}
                </span>
              )}
              <button
                type="button"
                className="ca-day-groups__header-chevron"
                onClick={() => toggleWeek(group.weekLabel)}
                aria-hidden="true"
                tabIndex={-1}
              >
                <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} />
              </button>
            </div>
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
