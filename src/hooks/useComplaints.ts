import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getActiveComplaintCount,
  getComplaintAttachmentUrl,
  getComplaints,
  getOfficials,
  subscribeToComplaintChanges,
  updateComplaint,
} from '../services/adminService';
import { getServiceErrorMessage } from '../services/serviceError';
import type {
  Complaint,
  ComplaintStatus,
  ComplaintUpdate,
  Official,
  UrgencyLevel,
} from '../types/database';

export interface ComplaintFilters {
  search: string;
  status: ComplaintStatus | '';
  urgency: UrgencyLevel | '';
}

interface UseComplaintsOptions {
  page: number;
  pageSize: number;
  filters: ComplaintFilters;
}

export function useComplaints({
  page,
  pageSize,
  filters,
}: UseComplaintsOptions) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [count, setCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);

    const [complaintsResult, activeResult, officialsResult] = await Promise.all([
      getComplaints({
        page: page - 1,
        pageSize,
        search: filters.search,
        status: filters.status || undefined,
        urgency: filters.urgency || undefined,
      }),
      getActiveComplaintCount(),
      getOfficials({ page: 0, pageSize: 100, activeOnly: true }),
    ]);

    if (currentRequest !== requestId.current) return;

    setComplaints(complaintsResult.data ?? []);
    setCount(complaintsResult.count ?? 0);
    setActiveCount(activeResult.count ?? 0);
    setOfficials(officialsResult.data ?? []);

    const queryError =
      complaintsResult.error ?? activeResult.error ?? officialsResult.error;
    setError(
      queryError
        ? getServiceErrorMessage(queryError, 'Unable to load complaints.')
        : null
    );
    setLoading(false);
  }, [filters.search, filters.status, filters.urgency, page, pageSize]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 250);

    const unsubscribe = subscribeToComplaintChanges(() => {
      void refresh();
    });

    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [refresh]);

  const saveComplaint = useCallback(
    async (id: string, updates: ComplaintUpdate) => {
      setSavingId(id);
      setError(null);

      const { data, error: mutationError } = await updateComplaint(id, updates);
      setSavingId(null);

      if (mutationError) {
        const message = getServiceErrorMessage(
          mutationError,
          'Unable to update the complaint.'
        );
        setError(message);
        return { data: null, error: message };
      }

      await refresh();
      return { data, error: null };
    },
    [refresh]
  );

  const openAttachment = useCallback(async (path: string) => {
    setError(null);

    if (/^https?:\/\//i.test(path)) {
      window.open(path, '_blank', 'noopener,noreferrer');
      return { error: null };
    }

    const { data, error: attachmentError } = await getComplaintAttachmentUrl(path);
    if (attachmentError || !data?.signedUrl) {
      const message = getServiceErrorMessage(
        attachmentError,
        'Unable to open the complaint attachment.'
      );
      setError(message);
      return { error: message };
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    return { error: null };
  }, []);

  return {
    complaints,
    officials,
    count,
    activeCount,
    loading,
    savingId,
    error,
    clearError: () => setError(null),
    refresh,
    saveComplaint,
    openAttachment,
  };
}
