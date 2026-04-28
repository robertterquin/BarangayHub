import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AdminLogin } from './pages/admin/auth/Login';
import { ResetPassword } from './pages/admin/auth/ResetPassword';

// ── Add page imports here as you build them ─────────────────────────────────
// Public:      import { LandingPage }        from './pages/public/LandingPage';
import { Dashboard } from './pages/admin/main/Dashboard';
import { Residents } from './pages/admin/management/Residents';
import { DocumentRequests } from './pages/admin/management/DocumentRequests';
import { Complaints } from './pages/admin/management/Complaints';
//              import { Announcements }      from './pages/admin/management/Announcements';
//              import { Officials }          from './pages/admin/management/Officials';
// Analytics:   import { Reports }            from './pages/admin/analytics/Reports';
// System:      import { UserManagement }     from './pages/admin/system/UserManagement';
//              import { ActivityLogs }       from './pages/admin/system/ActivityLogs';
//              import { History }            from './pages/admin/system/History';
//              import { Feedback }           from './pages/admin/system/Feedback';
//              import { Settings }           from './pages/admin/system/Settings';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // TODO: Remove DEV_BYPASS when Supabase backend is connected
  const DEV_BYPASS = true;
  const { user, loading } = useAuth();
  if (DEV_BYPASS) return <>{children}</>;
  if (loading) return <div className="min-h-screen bg-[#121417] flex items-center justify-center text-gray-400">Loading...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      {/* ── Public routes ─────────────────────────────── */}
      {/* <Route path="/" element={<LandingPage />} /> */}

      {/* ── Admin auth ────────────────────────────────── */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/reset-password" element={<ResetPassword />} />

      {/* ── Admin protected routes ────────────────────── */}
      <Route path="/admin/residents" element={<ProtectedRoute><Residents /></ProtectedRoute>} />
      <Route path="/admin/document-requests" element={<ProtectedRoute><DocumentRequests /></ProtectedRoute>} />
      <Route path="/admin/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      {/* Default redirect — points to dashboard during dev */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

export default App;
