import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  FileText,
  LayoutDashboard,
  Megaphone,
  Menu,
  MessageSquare,
  Search,
  Users,
  X,
} from 'lucide-react';
import { AppLogo } from '../components/ui';
import { usePublicSystemSettings } from '../hooks/usePublicSystemSettings';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: <LayoutDashboard size={18} /> },
  { label: 'Barangay Officials', to: '/officials', icon: <Users size={18} /> },
  { label: 'Document Requests', to: '/request-document', icon: <FileText size={18} /> },
  { label: 'Track Requests', to: '/track-status', icon: <Search size={18} /> },
  { label: 'Announcements', to: '/announcements', icon: <Megaphone size={18} /> },
  { label: 'Submit Complaint', to: '/submit-complaint', icon: <MessageSquare size={18} /> },
];

function formatClock(date: Date) {
  return date.toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-PH', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const { publicSettings } = usePublicSystemSettings();

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <header className="relative z-50 bg-white shadow-sm">
        <div className="flex h-21.5 w-full items-center justify-between px-5 sm:px-7 lg:px-12">
          <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setMenuOpen(false)}>
            <AppLogo className="h-14.5 w-14.5 shrink-0 border border-slate-200 shadow-sm" />
            <span className="min-w-0">
              <span className="block truncate text-xl font-black leading-tight text-slate-950 sm:text-2xl">
                BarangayHub
              </span>
              <span className="block truncate font-mono text-xs font-bold tracking-wide text-slate-400 sm:text-sm">
                {publicSettings.locationLine}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden text-right font-mono sm:block">
              <p className="text-sm font-black tracking-[0.2em] text-blue-700">{formatClock(now)} PH</p>
              <p className="mt-1 text-xs font-bold tracking-wide text-slate-400">{formatDate(now)}</p>
            </div>

            <button
              type="button"
              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm transition-colors hover:bg-slate-100"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={30} /> : <Menu size={32} />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/35" onClick={() => setMenuOpen(false)}>
          <aside
            className="ml-auto h-full w-full max-w-sm bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-linear-to-br from-blue-700 to-blue-500 px-6 py-6 text-white">
              <div className="flex items-center gap-3">
                <AppLogo className="h-14 w-14 border-2 border-white/80 shadow-sm" />
                <div>
                  <p className="text-xl font-black">BarangayHub</p>
                  <p className="mt-1 font-mono text-xs font-bold text-blue-100">
                    {publicSettings.locationLine}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-full bg-white/15 p-2 text-white transition-colors hover:bg-white/25"
                aria-label="Close menu"
              >
                <X size={28} />
              </button>
            </div>

            <div className="bg-slate-50 px-6 py-4">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Navigation</p>
            </div>

            <nav className="py-2">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-4 border-l-4 px-7 py-4 text-lg font-black transition-colors',
                      isActive
                        ? 'border-blue-700 bg-blue-50 text-blue-700'
                        : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-blue-700',
                    ].join(' ')
                  }
                >
                  <span className="text-current">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-4 px-7">
              <Link
                to="/feedback"
                onClick={() => setMenuOpen(false)}
                className="block rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-center text-sm font-black text-blue-700"
              >
                Send Feedback
              </Link>
              <Link
                to="/admin/login"
                onClick={() => setMenuOpen(false)}
                className="mt-3 block rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-500"
              >
                Admin Login
              </Link>
            </div>
          </aside>
        </div>
      )}

      <main>{children}</main>

      <footer className="bg-[#163b91] px-4 py-10 text-blue-100 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Contact Us</h2>
            <div className="mt-4 space-y-2 text-sm font-semibold">
              <p>
                <span className="font-black text-white">Address:</span>{' '}
                {publicSettings.completeAddress}
              </p>
              <p>
                <span className="font-black text-white">Contact:</span>{' '}
                {publicSettings.contactNumber}
              </p>
              <p>
                <span className="font-black text-white">Email:</span>{' '}
                {publicSettings.publicEmail}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Quick Links</h2>
            <div className="mt-4 grid gap-2 text-sm font-semibold">
              <Link to="/officials" className="hover:text-white">Barangay Officials</Link>
              <Link to="/request-document" className="hover:text-white">Document Requests</Link>
              <Link to="/track-status" className="hover:text-white">Track Requests</Link>
              <Link to="/announcements" className="hover:text-white">Announcements</Link>
              <Link to="/submit-complaint" className="hover:text-white">Submit Complaint</Link>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Other Links</h2>
            <div className="mt-4 grid gap-2 text-sm font-semibold">
              <a href="https://indang-cavite.gov.ph/" className="hover:text-white">Indang, Cavite Website</a>
              <a href="https://cavite.gov.ph/" className="hover:text-white">Province of Cavite</a>
              <a href="https://www.gov.ph/" className="hover:text-white">GOVPH - Official Portal</a>
              <a href="https://dilg.gov.ph/" className="hover:text-white">DILG Philippines</a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-2 border-t border-white/10 pt-5 text-xs font-semibold text-blue-200 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright 2026 Barangay {publicSettings.barangayName}. All rights reserved.</p>
          <p>Public Portal - {publicSettings.systemVersion}</p>
        </div>
      </footer>
    </div>
  );
}
