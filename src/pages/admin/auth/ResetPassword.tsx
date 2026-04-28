import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../services/supabase';
import heroImg from '../../../assets/hero.png';

// ── Password requirement helpers ──────────────────────────────────────────────

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Minimum 8 characters',          test: (pw) => pw.length >= 8 },
  { label: 'At least one uppercase letter',  test: (pw) => /[A-Z]/.test(pw) },
  { label: 'At least one lowercase letter',  test: (pw) => /[a-z]/.test(pw) },
  { label: 'At least one number',            test: (pw) => /[0-9]/.test(pw) },
  { label: 'At least one special character', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function ResetPassword() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  const [ready, setReady] = useState(false);          // Supabase recovery session active
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Supabase fires PASSWORD_RECOVERY when the user lands via the email link
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    // If the user is already in a recovery session (page refresh), mark ready
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(newPassword));
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!allRulesPassed) {
      setError('Password does not meet all requirements.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await updatePassword(newPassword);
    setLoading(false);

    if (updateError) {
      setError(updateError.message ?? 'Failed to update password. Try again.');
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate('/admin/login', { replace: true }), 2500);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#0052cc]"
    >
      {/* Line grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Radial vignette to darken corners and lift center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(0,30,100,0.45) 100%)' }}
      />
      {/* Glowing accent blob — top right */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Card bottom glow for floating feel */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-10 bg-black/25 blur-2xl rounded-full pointer-events-none" />
        {/* Card */}
        <div
          className="bg-white rounded-2xl px-9 py-10 ring-1 ring-white/10"
          style={{ boxShadow: '0 8px 16px rgba(0,0,0,0.25), 0 32px 64px rgba(0,0,0,0.30), 0 0 0 1px rgba(255,255,255,0.08)' }}
        >

          {/* Branding */}
          <div className="flex items-center gap-3 mb-7">
            <img
              src={heroImg}
              alt="Barangay Daine II seal"
              className="w-12 h-12 rounded-full object-cover shrink-0 border border-gray-200"
            />
            <div>
              <p className="text-[#0052cc] font-bold text-lg leading-tight">BarangayHub</p>
              <p className="text-gray-400 text-xs tracking-wide">Brgy. Daine II · Indang, Cavite</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl" aria-hidden>🔒</span>
              <h1 className="text-gray-900 text-2xl font-bold">Reset Password</h1>
            </div>
            <p className="text-gray-500 text-sm">
              Enter your admin email and a new password that meets security requirements.
            </p>
          </div>

          {/* Success state */}
          {success && (
            <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-5">
              <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" />
              <p className="text-green-700 text-sm font-medium">
                Password updated! Redirecting to login…
              </p>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Invalid-link state */}
          {!ready && !success && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5">
              <p className="text-amber-700 text-sm">
                This page is only accessible via the password reset link sent to your email.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* New Password */}
            <div className="mb-4">
              <label
                htmlFor="new-password"
                className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  disabled={!ready || success}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-[#e8f0fe] border border-transparent rounded-lg px-4 py-3 pr-11 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc]/40 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Live requirements checklist */}
              {newPassword.length > 0 && (
                <div className="mt-3 bg-gray-50 rounded-lg px-4 py-3 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Password must have:</p>
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(newPassword);
                    return (
                      <div key={rule.label} className="flex items-center gap-2">
                        {passed
                          ? <CheckCircle2 size={14} className="text-[#0052cc] shrink-0" />
                          : <Circle size={14} className="text-gray-300 shrink-0" />
                        }
                        <span className={`text-xs ${passed ? 'text-[#0052cc]' : 'text-gray-400'}`}>
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="mb-6">
              <label
                htmlFor="confirm-password"
                className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  disabled={!ready || success}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={`w-full bg-[#e8f0fe] border rounded-lg px-4 py-3 pr-11 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 ${
                    confirmPassword.length > 0 && !passwordsMatch
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-300/40'
                      : 'border-transparent focus:border-[#0052cc] focus:ring-[#0052cc]/40'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-red-500 text-xs mt-1.5">Passwords do not match.</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !ready || success}
              className="w-full bg-[#1a3db8] hover:bg-[#1535a0] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating…
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Cancel */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-white/50 text-xs mt-5">
          BarangayHub · Barangay Daine II Management System
        </p>
      </div>
    </div>
  );
}
