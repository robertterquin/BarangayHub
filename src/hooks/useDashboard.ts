import { useCallback, useEffect, useState } from 'react';
import {
  getDashboardSnapshot,
  subscribeToDashboardChanges,
  type DashboardSnapshot,
} from '../services/adminService';
import { getServiceErrorMessage } from '../services/serviceError';

const INITIAL_SNAPSHOT: DashboardSnapshot = {
  year: new Date().getFullYear(),
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
  residentsByPurok: [],
  monthlyRequests: [],
  recentActivity: [],
};

export function useDashboard() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(INITIAL_SNAPSHOT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data, error: dashboardError } = await getDashboardSnapshot();
    setSnapshot(data);
    setError(
      dashboardError
        ? getServiceErrorMessage(dashboardError, 'Some dashboard data could not be loaded.')
        : null
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
    const unsubscribe = subscribeToDashboardChanges(() => {
      void refresh();
    });
    return unsubscribe;
  }, [refresh]);

  return { snapshot, loading, error, refresh };
}
