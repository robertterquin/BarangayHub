import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// ── Add page imports here as you build them ─────────────────────────────────
// Public:  import { LandingPage } from './pages/public/LandingPage';
// Admin:   import { AdminLogin } from './pages/admin/Login';

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
      {/* <Route path="/admin/login" element={<AdminLogin />} /> */}

      {/* ── Admin protected routes ────────────────────── */}
      {/* <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> */}

      {/* Placeholder — remove once first page is built */}
      <Route path="*" element={
        <div className="min-h-screen bg-[#121417] flex items-center justify-center text-gray-400 font-mono text-sm">
          BarangayHub — Foundation ready. Start building your pages.
        </div>
      } />
    </Routes>
  );
}

export default App;
