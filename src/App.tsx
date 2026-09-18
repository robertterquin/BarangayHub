import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminLogin } from './pages/admin/auth/Login';
import { ResetPassword } from './pages/admin/auth/ResetPassword';
import { Dashboard } from './pages/admin/main/Dashboard';
import { Residents } from './pages/admin/management/Residents';
import { DocumentRequests } from './pages/admin/management/DocumentRequests';
import { Complaints } from './pages/admin/management/Complaints';
import { Announcements } from './pages/admin/management/Announcements';
import { Officials } from './pages/admin/management/Officials';
import { Reports } from './pages/admin/analytics/Reports';
import { UserManagement } from './pages/admin/system/UserManagement';
import { ActivityLogs } from './pages/admin/system/ActivityLogs';
import { Feedback } from './pages/admin/system/Feedback';
import { Settings } from './pages/admin/system/Settings';
import {
  LandingPage,
  PublicAnnouncements,
  PublicFeedback,
  PublicOfficials,
  RequestDocument,
  SelectService,
  SubmissionSuccess,
  SubmitComplaint,
  TrackStatus,
} from './pages/public';

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { user, isActiveAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121417] text-gray-400">
        Loading...
      </div>
    );
  }
  if (!user || !isActiveAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children ?? <Outlet />}</>;
}

function App() {
  return (
    <Routes>
      {/* Public Pages with Persistent PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/select-service" element={<SelectService />} />
        <Route path="/request-document" element={<RequestDocument />} />
        <Route path="/submission-success" element={<SubmissionSuccess />} />
        <Route path="/track-status" element={<TrackStatus />} />
        <Route path="/submit-complaint" element={<SubmitComplaint />} />
        <Route path="/announcements" element={<PublicAnnouncements />} />
        <Route path="/officials" element={<PublicOfficials />} />
        <Route path="/feedback" element={<PublicFeedback />} />
      </Route>

      {/* Standalone Admin Auth Pages */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/reset-password" element={<ResetPassword />} />

      {/* Admin Pages with Persistent AdminLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/residents" element={<Residents />} />
        <Route path="/admin/document-requests" element={<DocumentRequests />} />
        <Route path="/admin/complaints" element={<Complaints />} />
        <Route path="/admin/announcements" element={<Announcements />} />
        <Route path="/admin/officials" element={<Officials />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/activity-logs" element={<ActivityLogs />} />
        <Route path="/admin/history" element={<Navigate to="/admin/activity-logs" replace />} />
        <Route path="/admin/feedback" element={<Feedback />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
