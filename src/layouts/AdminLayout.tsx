import { useState } from 'react';
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
} from 'lucide-react';
import { supabase } from '../services/supabase';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
];

const MANAGEMENT_NAV: NavItem[] = [
  { label: 'Residents', to: '/admin/residents', icon: <Users size={18} /> },
  { label: 'Document Requests', to: '/admin/requests', icon: <FileText size={18} /> },
  { label: 'Announcements', to: '/admin/announcements', icon: <Megaphone size={18} /> },
  { label: 'Complaints', to: '/admin/complaints', icon: <AlertTriangle size={18} /> },
  { label: 'Feedback', to: '/admin/feedback', icon: <MessageSquare size={18} /> },
];

const ANALYTICS_NAV: NavItem[] = [
  { label: 'Reports', to: '/admin/reports', icon: <BarChart2 size={18} /> },
  { label: 'Activity Logs', to: '/admin/activity-logs', icon: <ScrollText size={18} /> },
];

const SYSTEM_NAV: NavItem[] = [
  { label: 'User Management', to: '/admin/users', icon: <UserCog size={18} /> },
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
          {!collapsed && <span>{item.label}</span>}
        </NavLink>
      ))}
    </div>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  // Live clock
  useState(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  });

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
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

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
        <header className="flex items-center justify-between px-6 py-3 bg-[#1a1c23] border-b border-[#2a2d35] shrink-0">
          {/* Clock */}
          <div className="text-sm">
            <span className="text-white font-mono font-medium">{clockStr}</span>
            <span className="ml-2 text-gray-500 text-xs">{dateStr}</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search..."
              className="text-sm bg-[#2a2d35] border border-[#3a3d45] text-gray-300 placeholder-gray-500 rounded-lg px-3 py-1.5 w-48 focus:outline-none focus:border-blue-500"
            />

            {/* Notification bell */}
            <button className="relative p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a2d35] transition-colors">
              <Bell size={18} />
            </button>
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
