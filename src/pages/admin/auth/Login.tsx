import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { logLoginActivity } from '../../../services/adminService';
import { supabase } from '../../../services/supabase';
import heroImg from '../../../assets/hero.png';

export function AdminLogin() {
  const navigate = useNavigate();
  const { signIn, sendPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await signIn(email.trim(), password);

    if (authError) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }

    // Log the login activity — we need the user id from the session
    const { data } = await supabase.auth.getSession();
    if (data.session?.user.id) {
      await logLoginActivity(data.session.user.id);
    }

    navigate('/admin/dashboard', { replace: true });
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError('Enter your email address above, then click Forgot Password.');
      return;
    }
    setResetLoading(true);
    setError(null);
    const { error: resetError } = await sendPasswordReset(email.trim());
    setResetLoading(false);
    if (resetError) {
      setError('Could not send reset email. Check the address and try again.');
    } else {
      setResetSent(true);
    }
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
            <h1 className="text-gray-900 text-2xl font-bold">Administrator Login</h1>
            <p className="text-gray-400 text-sm mt-1">Authorized personnel only</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Reset success banner */}
          {resetSent && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-5">
              <p className="text-green-700 text-sm">Password reset email sent. Check your inbox.</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5"
              >
                Username / Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@brgy.daine2.gov"
                className="w-full bg-[#e8f0fe] border border-transparent rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc]/40 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full bg-[#e8f0fe] border border-transparent rounded-lg px-4 py-3 pr-11 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc]/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a3db8] hover:bg-[#1535a0] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="text-[#0052cc] hover:text-[#1535a0] text-sm underline underline-offset-2 transition-colors disabled:opacity-50 font-medium"
            >
              {resetLoading ? 'Sending…' : 'Forgot Password?'}
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
