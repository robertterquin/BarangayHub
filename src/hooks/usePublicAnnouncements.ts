import { useCallback, useEffect, useState } from 'react';
import { getPublishedAnnouncements } from '../services/publicService';
import { getServiceErrorMessage } from '../services/serviceError';
import type { Announcement } from '../types/database';

export function usePublicAnnouncements(limit = 20) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await getPublishedAnnouncements(limit);

    setAnnouncements((result.data ?? []) as Announcement[]);
    setError(
      result.error
        ? getServiceErrorMessage(result.error, 'Unable to load announcements.')
        : null
    );
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refresh]);

  return {
    announcements,
    loading,
    error,
    refresh,
  };
}
