import { Logo } from '../Logo';
import { Option } from '../Option';
import type { IconName } from '../Icon';
import sampleUserPhoto from '../../assets/users/sample-user.png';
import './sidebar.css';

export type SidebarUser = 'admin' | 'client' | 'va';

export interface SidebarNavItem {
  /** Stable identifier, passed to `onSelectItem`/compared against `selectedItem`. */
  key: string;
  label: string;
  icon: IconName;
}

/** The Sidebar's main nav list, one per user role, per Figma's 3 "User" variants. */
const NAV_ITEMS: Record<SidebarUser, SidebarNavItem[]> = {
  admin: [
    { key: 'agreements', label: 'Agreements & Work Hrs', icon: 'clipboard-list-check' },
    { key: 'users', label: 'Users', icon: 'users' },
    { key: 'vas', label: 'VAs', icon: 'clipboard-user' },
    { key: 'clients', label: 'Clients', icon: 'buildings' },
    { key: 'va-invoice', label: 'VA Invoice', icon: 'file-invoice-dollar' },
    { key: 'va-invoice-claims', label: 'VA Invoice Claims', icon: 'file-excel' },
    { key: 'client-invoice', label: 'Client Invoice', icon: 'circle-dollar' },
    { key: 'client-invoice-claims', label: 'Client Invoice Claims', icon: 'file-excel' },
    { key: 'changes-approvals-form', label: 'Changes & Approvals Form', icon: 'pen-to-square' },
    { key: 'ca-webhook', label: 'C&A Webhook', icon: 'pen-to-square' },
    { key: 'codes', label: 'Codes', icon: 'copy' },
    { key: 'deposits', label: 'Deposits', icon: 'money-bills-simple' },
    { key: 'resources', label: 'Resources', icon: 'circle-info' },
  ],
  client: [
    { key: 'my-account', label: 'My Account', icon: 'circle-user' },
    { key: 'my-va', label: 'My VA', icon: 'clipboard-user' },
    { key: 'agreements', label: 'Agreements & Work Hrs', icon: 'clipboard-list-check' },
    { key: 'client-invoice', label: 'Client Invoice', icon: 'circle-dollar' },
    { key: 'changes-approvals-form', label: 'Changes & Approvals Form', icon: 'pen-to-square' },
    { key: 'resources', label: 'Resources', icon: 'circle-info' },
  ],
  va: [
    { key: 'my-account', label: 'My Account', icon: 'circle-user' },
    { key: 'agreements', label: 'Agreements', icon: 'clipboard-list-check' },
    { key: 'invoices', label: 'Invoices', icon: 'file-invoice-dollar' },
    { key: 'invoice-claims', label: 'Invoice Claims', icon: 'file-excel' },
    { key: 'changes-approvals-form', label: 'Changes & Approvals Form', icon: 'pen-to-square' },
    { key: 'resources', label: 'Resources', icon: 'circle-info' },
  ],
};

/** The secondary list at the bottom of the scrollable area — the same for every user role. */
const ACTION_ITEMS: SidebarNavItem[] = [
  { key: 'notifications', label: 'Notifications', icon: 'bell' },
  { key: 'settings', label: 'Settings', icon: 'gear' },
];

export interface SidebarProps {
  /** Which of the 3 role-based nav lists to render. */
  user: SidebarUser;
  userName: string;
  userEmail: string;
  /** URL of the signed-in user's profile photo. Defaults to a sample photo. */
  userAvatarSrc?: string;
  /** Key of the currently active nav/action item, if any. */
  selectedItem?: string;
  onSelectItem?: (key: string) => void;
  onCollapse?: () => void;
  className?: string;
}

/**
 * The app's primary navigation surface: a role-based list of nav Options,
 * a secondary Notifications/Settings list, and a footer showing the signed
 * -in user plus a "Collapse Sidebar" action. Which nav items appear is
 * entirely determined by `user` — this mirrors Figma's 3 fixed "User"
 * variants (Admin/Client/VA) rather than taking an arbitrary items list, so
 * every screen renders the same nav for the same role.
 */
export const Sidebar = ({
  user,
  userName,
  userEmail,
  userAvatarSrc = sampleUserPhoto,
  selectedItem,
  onSelectItem,
  onCollapse,
  className,
}: SidebarProps) => {
  const classNames = ['sidebar', className].filter(Boolean).join(' ');

  return (
    <nav className={classNames} aria-label="Main">
      <div className="sidebar__top">
        <Logo />
        <div className="sidebar__divider" />
        <div className="sidebar__options">
          <div className="sidebar__options-group">
            {NAV_ITEMS[user].map((item) => (
              <Option
                key={item.key}
                text={item.label}
                leftIcon={item.icon}
                selected={selectedItem === item.key}
                onClick={() => onSelectItem?.(item.key)}
              />
            ))}
          </div>
          <div className="sidebar__options-group">
            {ACTION_ITEMS.map((item) => (
              <Option
                key={item.key}
                text={item.label}
                leftIcon={item.icon}
                selected={selectedItem === item.key}
                onClick={() => onSelectItem?.(item.key)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="sidebar__bottom">
        <div className="sidebar__divider" />
        <div className="sidebar__user">
          <img src={userAvatarSrc} alt="" className="sidebar__avatar" />
          <div className="sidebar__user-details">
            <p className="sidebar__user-name">{userName}</p>
            <p className="sidebar__user-email">{userEmail}</p>
          </div>
        </div>
        <div className="sidebar__divider" />
        <Option
          text="Collapse Sidebar"
          leftIcon="chevron-left"
          leftIconVariant="bold"
          onClick={onCollapse}
        />
      </div>
    </nav>
  );
};
