import { useCallback, useEffect, useState } from 'react';
import {
  getDashboardStats,
  subscribeToDashboardChanges,
  type DashboardStats,
} from '../services/adminService';
import { getServiceErrorMessage } from '../services/serviceError';

const INITIAL_STATS: DashboardStats = {
  totalResidents: 0,
  residentsThisMonth: 0,
  registeredVoters: 0,
  completedRequests: 0,
  completedThisMonth: 0,
  pendingRequests: 0,
  processingRequests: 0,
  readyRequests: 0,
  requestsToday: 0,
  openComplaints: 0,
};

export interface StatsState extends DashboardStats {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useStats(): StatsState {
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data, error: statsError } = await getDashboardStats();
    setStats(data);
    setError(statsError ? getServiceErrorMessage(statsError, 'Unable to load dashboard counts.') : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      const { data, error: statsError } = await getDashboardStats();
      if (!isActive) return;
      setStats(data);
      setError(statsError ? getServiceErrorMessage(statsError, 'Unable to load dashboard counts.') : null);
      setLoading(false);
    };

    void load();
    const unsubscribe = subscribeToDashboardChanges(() => {
      if (isActive) void load();
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  return { ...stats, loading, error, refresh };
}
