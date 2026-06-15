import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getActivityLogs,
  subscribeToActivityLogChanges,
} from '../services/adminService';
import { getServiceErrorMessage } from '../services/serviceError';
import type { ActivityLog, LogType } from '../types/database';

export interface ActivityLogFilters {
  search: string;
  logType: LogType | '';
}

interface UseActivityLogsOptions {
  page: number;
  pageSize: number;
  filters: ActivityLogFilters;
}

export function useActivityLogs({
  page,
  pageSize,
  filters,
}: UseActivityLogsOptions) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);

    const result = await getActivityLogs({
      page: page - 1,
      pageSize,
      search: filters.search,
      logType: filters.logType || undefined,
    });

    if (currentRequest !== requestId.current) return;
    setLogs(result.data ?? []);
    setCount(result.count ?? 0);
    setError(
      result.error
        ? getServiceErrorMessage(result.error, 'Unable to load activity logs.')
        : null
    );
    setLoading(false);
  }, [filters.logType, filters.search, page, pageSize]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 250);

    const unsubscribe = subscribeToActivityLogChanges(() => {
      void refresh();
    });

    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [refresh]);

  return {
    logs,
    count,
    loading,
    error,
    refresh,
  };
}
