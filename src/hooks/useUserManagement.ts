import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getActiveAdminProfileCount,
  getAdminProfiles,
  subscribeToAdminProfileChanges,
  updateAdminProfile,
} from '../services/adminService';
import { getServiceErrorMessage } from '../services/serviceError';
import type {
  AccountStatus,
  AdminProfile,
  AdminProfileUpdate,
} from '../types/database';

export interface UserManagementFilters {
  search: string;
  status: AccountStatus | '';
}

interface UseUserManagementOptions {
  page: number;
  pageSize: number;
  filters: UserManagementFilters;
}

export function useUserManagement({
  page,
  pageSize,
  filters,
}: UseUserManagementOptions) {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [count, setCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);

    const [profilesResult, activeResult] = await Promise.all([
      getAdminProfiles({
        page: page - 1,
        pageSize,
        search: filters.search,
        status: filters.status || undefined,
      }),
      getActiveAdminProfileCount(),
    ]);

    if (currentRequest !== requestId.current) return;

    setProfiles(profilesResult.data ?? []);
    setCount(profilesResult.count ?? 0);
    setActiveCount(activeResult.count ?? 0);

    const queryError = profilesResult.error ?? activeResult.error;
    setError(
      queryError
        ? getServiceErrorMessage(queryError, 'Unable to load admin accounts.')
        : null
    );
    setLoading(false);
  }, [filters.search, filters.status, page, pageSize]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 250);

    const unsubscribe = subscribeToAdminProfileChanges(() => {
      void refresh();
    });

    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [refresh]);

  const saveProfile = useCallback(
    async (id: string, updates: AdminProfileUpdate) => {
      setSavingId(id);
      setError(null);

      const result = await updateAdminProfile(id, updates);
      setSavingId(null);

      if (result.error || !result.data) {
        const message = getServiceErrorMessage(
          result.error,
          'Unable to update the admin account.'
        );
        setError(message);
        return { data: null, error: message };
      }

      await refresh();
      return { data: result.data, error: null };
    },
    [refresh]
  );

  return {
    profiles,
    count,
    activeCount,
    loading,
    savingId,
    error,
    clearError: () => setError(null),
    refresh,
    saveProfile,
  };
}
