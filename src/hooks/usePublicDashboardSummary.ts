import { useCallback, useEffect, useState } from 'react';
import { getPublicDashboardSummary } from '../services/publicService';
import { getServiceErrorMessage } from '../services/serviceError';
import type { PublicDashboardSummary } from '../types/database';

const currentYear = new Date().getFullYear();

export const PUBLIC_DASHBOARD_FALLBACK: PublicDashboardSummary = {
  total_residents: 0,
  documents_issued: 0,
  published_announcements: 0,
  online_services: 6,
  year: currentYear,
  residents_by_purok: [
    { purok: 'Purok 1', residents: 0 },
    { purok: 'Purok 2', residents: 0 },
    { purok: 'Purok 3', residents: 0 },
    { purok: 'Purok 4', residents: 0 },
    { purok: 'Purok 5', residents: 0 },
    { purok: 'Purok 6', residents: 0 },
  ],
  monthly_document_requests: [
    { month: 'Jan', requests: 0 },
    { month: 'Feb', requests: 0 },
    { month: 'Mar', requests: 0 },
    { month: 'Apr', requests: 0 },
    { month: 'May', requests: 0 },
    { month: 'Jun', requests: 0 },
    { month: 'Jul', requests: 0 },
    { month: 'Aug', requests: 0 },
    { month: 'Sep', requests: 0 },
    { month: 'Oct', requests: 0 },
    { month: 'Nov', requests: 0 },
    { month: 'Dec', requests: 0 },
  ],
  generated_at: new Date().toISOString(),
};

export function usePublicDashboardSummary() {
  const [summary, setSummary] = useState<PublicDashboardSummary>(PUBLIC_DASHBOARD_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const result = await getPublicDashboardSummary();

      setSummary(result.data ?? PUBLIC_DASHBOARD_FALLBACK);
      setError(
        result.error
          ? getServiceErrorMessage(result.error, 'Unable to load public dashboard data.')
          : null
      );
    } catch (requestError) {
      setSummary(PUBLIC_DASHBOARD_FALLBACK);
      setError(getServiceErrorMessage(requestError, 'Unable to load public dashboard data.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refresh]);

  return {
    summary,
    loading,
    error,
    refresh,
  };
}
