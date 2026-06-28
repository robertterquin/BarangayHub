import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Megaphone,
  AlertTriangle,
  MessageSquare,
  UserCog,
  BarChart2,
  ScrollText,
  Settings,
  LogOut,
  Bell,
  Menu,
  Shield,
} from 'lucide-react';
import { AppLogo } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { usePublicSystemSettings } from '../hooks/usePublicSystemSettings';
import { useStats } from '../hooks/useStats';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotificationChanges,
} from '../services/adminService';
import type { Notification as AdminNotification, NotificationType } from '../types/database';
import { formatTimeAgo } from '../utils/formatters';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: number;
}

const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
];

const MANAGEMENT_NAV: NavItem[] = [
  { label: 'Resident Management', to: '/admin/residents', icon: <Users size={18} /> },
  { label: 'Document Requests', to: '/admin/document-requests', icon: <FileText size={18} /> },
  { label: 'Complaints / Blotter', to: '/admin/complaints', icon: <AlertTriangle size={18} /> },
  { label: 'Announcements', to: '/admin/announcements', icon: <Megaphone size={18} /> },
  { label: 'Barangay Officials', to: '/admin/officials', icon: <Shield size={18} /> },
];

const ANALYTICS_NAV: NavItem[] = [
  { label: 'Reports', to: '/admin/reports', icon: <BarChart2 size={18} /> },
];

const SYSTEM_NAV: NavItem[] = [
  { label: 'User Management', to: '/admin/users', icon: <UserCog size={18} /> },
  { label: 'Activity History', to: '/admin/activity-logs', icon: <ScrollText size={18} /> },
  { label: 'Feedback & Suggestions', to: '/admin/feedback', icon: <MessageSquare size={18} /> },
  { label: 'Settings', to: '/admin/settings', icon: <Settings size={18} /> },
];

const FOOTER_QUICK_LINKS = [
  { label: 'Resident Management', to: '/admin/residents' },
  { label: 'Document Requests', to: '/admin/document-requests' },
  { label: 'Complaints / Blotter', to: '/admin/complaints' },
  { label: 'Announcements', to: '/admin/announcements' },
  { label: 'Barangay Officials', to: '/admin/officials' },
  { label: 'Reports', to: '/admin/reports' },
];

const FOOTER_OTHER_LINKS = [
  'Indang, Cavite Website',
  'Province of Cavite',
  'GOVPH - Official Portal',
  'DILG Philippines',
];

function NavSection({
  label,
  items,
  collapsed,
  badges = {},
}: {
  label: string;
  items: NavItem[];
  collapsed: boolean;
  badges?: Record<string, number>;
}) {
  return (
    <div className="mb-4">
      {!collapsed && (
        <p className="px-3 mb-1 text-xs font-semibold tracking-widest text-gray-500 uppercase">
          {label}
        </p>
      )}
      {items.map((item) => {
        const badge = badges[item.to] ?? item.badge;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-[#2a2d35] hover:text-white'
              }`
            }
          >
            {item.icon}
            {!collapsed && <span className="flex-1">{item.label}</span>}
            {!collapsed && badge !== undefined && badge > 0 && (
              <span className="ml-auto min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-xs font-bold leading-none text-white">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </div>
  );
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AdminLayout({ children, title = 'Dashboard' }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [time, setTime] = useState(new Date());
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { publicSettings } = usePublicSystemSettings();
  const { pendingRequests, openComplaints } = useStats();

  const loadNotifications = useCallback(async () => {
    const { data, count } = await getNotifications({
      page: 0,
      pageSize: 6,
      unreadOnly: true,
    });
    setNotifications(data ?? []);
    setUnreadCount(count ?? 0);
    setNotificationsLoading(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadNotifications();
    });
    return subscribeToNotificationChanges(() => {
      void loadNotifications();
    });
  }, [loadNotifications]);

  async function handleLogout() {
    await signOut();
    navigate('/admin/login');
  }

  async function handleNotificationClick(notification: AdminNotification) {
    await markNotificationRead(notification.id);
    setNotifOpen(false);
    void loadNotifications();

    const routes: Partial<Record<string, string>> = {
      document_requests: '/admin/document-requests',
      complaints: '/admin/complaints',
      feedback: '/admin/feedback',
    };
    const route = notification.entity_type ? routes[notification.entity_type] : undefined;
    if (route) navigate(route);
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    void loadNotifications();
  }

  const clockStr = time.toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateStr = time.toLocaleDateString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const dotColor: Record<NotificationType, string> = {
    document_request: 'bg-blue-500',
    complaint: 'bg-red-500',
    feedback: 'bg-yellow-400',
    system: 'bg-gray-400',
  };
  const displayName = profile?.display_name || 'Admin';
  const email = profile?.email || 'Administrator';
  const initials =
    displayName
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'AD';
  const managementBadges = {
    '/admin/document-requests': pendingRequests,
    '/admin/complaints': openComplaints,
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-[#1a1c23] border-r border-[#2a2d35] transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center border-b border-[#2a2d35] ${collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-4'}`}>
          <AppLogo
            className={`${collapsed ? 'h-9 w-9' : 'h-11 w-11'} shrink-0 border-2 border-white/80 shadow-sm`}
          />
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-bold text-white text-lg tracking-tight block">
                Barangay<span className="text-blue-400">Hub</span>
              </span>
              <span className="text-gray-500 text-[10px] tracking-wide block truncate">
                {publicSettings.locationLine}
              </span>
            </div>
          )}
        </div>

        {/* Admin user */}
        {!collapsed ? (
          <div className="px-3 py-3 border-b border-[#2a2d35]">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1c23]" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{displayName}</p>
                <p className="text-gray-500 text-xs truncate">{email}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-3 border-b border-[#2a2d35]">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">{initials}</div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#1a1c23]" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          <NavSection label="Main" items={MAIN_NAV} collapsed={collapsed} />
          <NavSection label="Management" items={MANAGEMENT_NAV} collapsed={collapsed} badges={managementBadges} />
          <NavSection label="Analytics" items={ANALYTICS_NAV} collapsed={collapsed} />
          <NavSection label="System" items={SYSTEM_NAV} collapsed={collapsed} />
        </nav>

        {/* Logout */}
        <div className="px-2 py-4 border-t border-[#2a2d35]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Nav */}
        <header className="flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-200 shrink-0">
          {/* Left: hamburger + page title */}
          <div className="flex items-center gap-3 min-w-35">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              <Menu size={18} />
            </button>
            <span className="font-semibold text-gray-800 text-base">{title}</span>
          </div>

          {/* Center: search */}
          <div className="flex-1 flex justify-center">
            <input
              type="text"
              placeholder="Search..."
              className="text-sm bg-gray-100 border border-gray-200 text-gray-700 placeholder-gray-400 rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Right: clock + bell */}
          <div className="flex items-center gap-4 min-w-50 justify-end">
            {/* Clock */}
            <div className="text-right">
              <p className="text-gray-800 font-mono text-sm font-medium leading-tight">{clockStr}</p>
              <p className="text-gray-400 text-xs leading-tight">{dateStr}</p>
            </div>

            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="text-gray-800 font-semibold text-sm">Admin Notifications</span>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => void handleMarkAllRead()}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                        >
                          Mark all read
                        </button>
                      )}
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                        {unreadCount}
                      </span>
                    </div>
                  </div>
                  {notificationsLoading ? (
                    <p className="px-4 py-8 text-center text-xs font-medium text-gray-400">Loading notifications...</p>
                  ) : notifications.length > 0 ? (
                    <ul className="py-2">
                      {notifications.map((notification) => (
                        <li key={notification.id}>
                          <button
                            type="button"
                            onClick={() => void handleNotificationClick(notification)}
                            className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                          >
                            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotColor[notification.type]}`} />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold leading-snug text-gray-800">{notification.title}</p>
                              <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{notification.message}</p>
                              <p className="mt-1 text-[11px] font-medium text-gray-400">
                                {formatTimeAgo(notification.created_at)}
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-10 text-center">
                      <p className="text-sm font-semibold text-gray-600">You&apos;re all caught up</p>
                      <p className="mt-1 text-xs text-gray-400">New resident submissions will appear here.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 flex flex-col">
          <div className="flex-1 p-6">{children}</div>

          {/* Footer */}
          <footer className="bg-[#0f2045] shrink-0 mt-4">
            <div className="grid grid-cols-3 gap-8 px-8 py-6">
              <div>
                <h4 className="text-white font-bold text-xs tracking-widest uppercase mb-3">Contact</h4>
                <p className="text-blue-300 text-xs leading-relaxed">Address: {publicSettings.completeAddress}</p>
                <p className="text-blue-300 text-xs leading-relaxed">Contact: {publicSettings.contactNumber}</p>
                <p className="text-blue-300 text-xs leading-relaxed">Email: {publicSettings.publicEmail}</p>
              </div>
              <div>
                <h4 className="text-white font-bold text-xs tracking-widest uppercase mb-3">Quick Links</h4>
                <ul className="space-y-1">
                  {FOOTER_QUICK_LINKS.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-blue-300 text-xs transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold text-xs tracking-widest uppercase mb-3">Other Links</h4>
                <ul className="space-y-1">
                  {FOOTER_OTHER_LINKS.map((link) => (
                    <li key={link}>
                      <span className="text-blue-300 text-xs">{link}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-blue-900/60 px-8 py-3 flex items-center justify-between">
              <span className="text-blue-400/70 text-xs">
                Copyright 2026 Barangay {publicSettings.barangayName} - Admin MIS
              </span>
              <span className="text-blue-400/70 text-xs">{publicSettings.systemVersion}</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
