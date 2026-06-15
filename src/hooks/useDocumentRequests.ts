import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getDocumentRequests,
  getPendingDocumentRequestCount,
  subscribeToDocumentRequestChanges,
  updateRequestStatus,
} from '../services/adminService';
import { getServiceErrorMessage } from '../services/serviceError';
import type {
  DocumentRequest,
  DocumentRequestUpdate,
  DocumentType,
  RequestStatus,
} from '../types/database';

export interface DocumentRequestFilters {
  search: string;
  documentType: DocumentType | '';
  status: RequestStatus | '';
}

interface UseDocumentRequestsOptions {
  page: number;
  pageSize: number;
  filters: DocumentRequestFilters;
}

export function useDocumentRequests({
  page,
  pageSize,
  filters,
}: UseDocumentRequestsOptions) {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [count, setCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);

    const [requestsResult, pendingResult] = await Promise.all([
      getDocumentRequests({
        page: page - 1,
        pageSize,
        search: filters.search,
        documentType: filters.documentType || undefined,
        status: filters.status || undefined,
      }),
      getPendingDocumentRequestCount(),
    ]);

    if (currentRequest !== requestId.current) return;

    setRequests(requestsResult.data ?? []);
    setCount(requestsResult.count ?? 0);
    setPendingCount(pendingResult.count ?? 0);
    setError(
      requestsResult.error || pendingResult.error
        ? getServiceErrorMessage(
            requestsResult.error ?? pendingResult.error,
            'Unable to load document requests.'
          )
        : null
    );
    setLoading(false);
  }, [filters.documentType, filters.search, filters.status, page, pageSize]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 250);

    const unsubscribe = subscribeToDocumentRequestChanges(() => {
      void refresh();
    });

    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [refresh]);

  const changeStatus = useCallback(
    async (
      id: string,
      status: RequestStatus,
      notes: Pick<
        DocumentRequestUpdate,
        'admin_notes' | 'public_status_note' | 'rejection_reason'
      > = {}
    ) => {
      setSavingId(id);
      setError(null);

      const { data, error: mutationError } = await updateRequestStatus(id, status, notes);
      setSavingId(null);

      if (mutationError) {
        const message = getServiceErrorMessage(
          mutationError,
          'Unable to update the document request.'
        );
        setError(message);
        return { data: null, error: message };
      }

      await refresh();
      return { data, error: null };
    },
    [refresh]
  );

  return {
    requests,
    count,
    pendingCount,
    loading,
    savingId,
    error,
    clearError: () => setError(null),
    refresh,
    changeStatus,
  };
}
