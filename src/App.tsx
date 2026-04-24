import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AdminLogin } from './pages/admin/Login';
import { ResetPassword } from './pages/admin/ResetPassword';

// ── Add page imports here as you build them ─────────────────────────────────
// Public:  import { LandingPage } from './pages/public/LandingPage';
// Admin:   import { Dashboard } from './pages/admin/Dashboard';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
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
      {/* <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> */}

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

export default App;
