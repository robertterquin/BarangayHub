import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  Bell,
  Menu,
  Shield,
  FileCheck,
  History,
} from 'lucide-react';
import { supabase } from '../services/supabase';

interface Notification {
  id: string;
  message: string;
  sub: string;
  time: string;
  color: 'red' | 'yellow' | 'blue';
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', message: 'New request – Maria Santos (BD2-2026-0318)', sub: 'Today, 9:02 AM', time: '9:02 AM', color: 'red' },
  { id: '2', message: 'New complaint – Noise Disturbance, Purok 3', sub: 'Today, 10:01 AM', time: '10:01 AM', color: 'yellow' },
  { id: '3', message: 'New resident registered – Eduardo Garcia, Purok 3', sub: 'Today, 2:00 PM', time: '2:00 PM', color: 'blue' },
];

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
  { label: 'Document Requests', to: '/admin/requests', icon: <FileText size={18} />, badge: 42 },
  { label: 'Complaints / Blotter', to: '/admin/complaints', icon: <AlertTriangle size={18} />, badge: 7 },
  { label: 'Announcements', to: '/admin/announcements', icon: <Megaphone size={18} /> },
  { label: 'Barangay Officials', to: '/admin/officials', icon: <Shield size={18} /> },
];

const ANALYTICS_NAV: NavItem[] = [
  { label: 'Reports', to: '/admin/reports', icon: <BarChart2 size={18} /> },
];

const SYSTEM_NAV: NavItem[] = [
  { label: 'User Management', to: '/admin/users', icon: <UserCog size={18} /> },
  { label: 'Activity Logs', to: '/admin/activity-logs', icon: <ScrollText size={18} /> },
  { label: 'History', to: '/admin/history', icon: <History size={18} /> },
  { label: 'Feedback & Suggestions', to: '/admin/feedback', icon: <MessageSquare size={18} /> },
  { label: 'Settings', to: '/admin/settings', icon: <Settings size={18} /> },
];

function NavSection({ label, items, collapsed }: { label: string; items: NavItem[]; collapsed: boolean }) {
  return (
    <div className="mb-4">
      {!collapsed && (
        <p className="px-3 mb-1 text-xs font-semibold tracking-widest text-gray-500 uppercase">
          {label}
        </p>
      )}
      {items.map((item) => (
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
          {!collapsed && (
            <span className="flex-1">{item.label}</span>
          )}
          {!collapsed && item.badge !== undefined && (
            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center leading-none">
              {item.badge}
            </span>
          )}
        </NavLink>
      ))}
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
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin/login');
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

  const dotColor: Record<'red' | 'yellow' | 'blue', string> = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-400',
    blue: 'bg-blue-500',
  };

  return (
    <div className="flex h-screen bg-[#121417] text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-[#1a1c23] border-r border-[#2a2d35] transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-[#2a2d35]">
          {!collapsed && (
            <span className="font-bold text-white text-lg tracking-tight">
              Barangay<span className="text-blue-400">Hub</span>
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#2a2d35] transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          <NavSection label="Main" items={MAIN_NAV} collapsed={collapsed} />
          <NavSection label="Management" items={MANAGEMENT_NAV} collapsed={collapsed} />
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
        <header className="flex items-center gap-4 px-6 py-3 bg-[#1a1c23] border-b border-[#2a2d35] shrink-0">
          {/* Left: hamburger + page title */}
          <div className="flex items-center gap-3 min-w-35">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a2d35] transition-colors"
            >
              <Menu size={18} />
            </button>
            <span className="font-semibold text-white text-base">{title}</span>
          </div>

          {/* Center: search */}
          <div className="flex-1 flex justify-center">
            <input
              type="text"
              placeholder="Search..."
              className="text-sm bg-[#2a2d35] border border-[#3a3d45] text-gray-300 placeholder-gray-500 rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Right: clock + MFA + bell */}
          <div className="flex items-center gap-4 min-w-50 justify-end">
            {/* Clock */}
            <div className="text-right">
              <p className="text-white font-mono text-sm font-medium leading-tight">{clockStr}</p>
              <p className="text-gray-500 text-xs leading-tight">{dateStr}</p>
            </div>

            {/* MFA badge */}
            <span className="flex items-center gap-1 bg-green-500/15 text-green-400 border border-green-500/30 text-xs font-semibold px-2 py-1 rounded-full">
              <FileCheck size={11} />
              MFA
            </span>

            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a2d35] transition-colors"
              >
                <Bell size={18} />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {MOCK_NOTIFICATIONS.length}
                </span>
              </button>

              {/* Notification dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 bg-[#1e2028] border border-[#2a2d35] rounded-xl shadow-2xl z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2d35]">
                    <span className="text-white font-semibold text-sm">Admin Notifications</span>
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {MOCK_NOTIFICATIONS.length}
                    </span>
                  </div>
                  <ul className="py-2">
                    {MOCK_NOTIFICATIONS.map((n) => (
                      <li key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#2a2d35] cursor-pointer transition-colors">
                        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dotColor[n.color]}`} />
                        <div>
                          <p className="text-white text-xs font-medium leading-snug">{n.message}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{n.sub}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#121417]">
          {children}
        </main>
      </div>
    </div>
  );
}
