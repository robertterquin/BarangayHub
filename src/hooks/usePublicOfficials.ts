import { useCallback, useEffect, useState } from 'react';
import { getPublicOfficials } from '../services/publicService';
import { getServiceErrorMessage } from '../services/serviceError';
import type { Official } from '../types/database';

export function usePublicOfficials() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const result = await getPublicOfficials();

      setOfficials((result.data ?? []) as Official[]);
      setError(
        result.error
          ? getServiceErrorMessage(result.error, 'Unable to load barangay officials.')
          : null
      );
    } catch (requestError) {
      setOfficials([]);
      setError(getServiceErrorMessage(requestError, 'Unable to load barangay officials.'));
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
    officials,
    loading,
    error,
    refresh,
  };
}
