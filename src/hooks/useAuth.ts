import { useCallback, useEffect, useState } from 'react';
import type { AuthError, User } from '@supabase/supabase-js';
import { getCurrentAdminProfile, isCurrentUserActiveAdmin, recordAdminLogin } from '../services/adminService';
import { supabase } from '../services/supabase';
import type { AdminProfile } from '../types/database';

type AuthOperationError = AuthError | Error | null;

interface UseAuthReturn {
  user: User | null;
  profile: AdminProfile | null;
  isActiveAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthOperationError }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string, redirectTo?: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isActiveAdmin, setIsActiveAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAuthorizedUser = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setUser(null);
      setProfile(null);
      setIsActiveAdmin(false);
      setLoading(false);
      return false;
    }

    const [{ data: activeAdmin, error: adminError }, { data: adminProfile, error: profileError }] =
      await Promise.all([isCurrentUserActiveAdmin(), getCurrentAdminProfile()]);

    const authorized =
      !adminError &&
      !profileError &&
      activeAdmin === true &&
      adminProfile?.status === 'active' &&
      adminProfile.role === 'admin';

    setUser(authorized ? nextUser : null);
    setProfile(authorized ? adminProfile : null);
    setIsActiveAdmin(authorized);
    setLoading(false);
    return authorized;
  }, []);

  useEffect(() => {
    let isMounted = true;

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!isMounted) return;
      await loadAuthorizedUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => {
        if (isMounted) void loadAuthorizedUser(session?.user ?? null);
      });
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadAuthorizedUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        setLoading(false);
        return { error };
      }

      const authorized = await loadAuthorizedUser(data.user);
      if (!authorized) {
        await supabase.auth.signOut();
        return { error: new Error('This account is not an active BarangayHub administrator.') };
      }

      const { error: loginError } = await recordAdminLogin();
      return { error: loginError ? new Error(loginError.message) : null };
    },
    [loadAuthorizedUser]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsActiveAdmin(false);
  }, []);

  const sendPasswordReset = useCallback(async (email: string, redirectTo?: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      redirectTo ? { redirectTo } : undefined
    );
    return { error };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  }, []);

  return {
    user,
    profile,
    isActiveAdmin,
    loading,
    signIn,
    signOut,
    sendPasswordReset,
    updatePassword,
  };
}
