import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getFeedback,
  getPendingFeedbackCount,
  updateFeedback,
} from '../services/adminService';
import { getServiceErrorMessage } from '../services/serviceError';
import type {
  Feedback,
  FeedbackCategory,
  FeedbackStatus,
} from '../types/database';

export interface FeedbackFilters {
  search: string;
  category: FeedbackCategory | '';
  status: FeedbackStatus | '';
}

interface UseFeedbackOptions {
  page: number;
  pageSize: number;
  filters: FeedbackFilters;
}

export function useFeedback({
  page,
  pageSize,
  filters,
}: UseFeedbackOptions) {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [count, setCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);

    const [feedbackResult, pendingResult] = await Promise.all([
      getFeedback({
        page: page - 1,
        pageSize,
        search: filters.search,
        category: filters.category || undefined,
        status: filters.status || undefined,
      }),
      getPendingFeedbackCount(),
    ]);

    if (currentRequest !== requestId.current) return;

    setFeedback(feedbackResult.data ?? []);
    setCount(feedbackResult.count ?? 0);
    setPendingCount(pendingResult.count ?? 0);

    const queryError = feedbackResult.error ?? pendingResult.error;
    setError(
      queryError
        ? getServiceErrorMessage(queryError, 'Unable to load resident feedback.')
        : null
    );
    setLoading(false);
  }, [
    filters.category,
    filters.search,
    filters.status,
    page,
    pageSize,
  ]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [refresh]);

  const changeStatus = useCallback(
    async (id: string, status: FeedbackStatus) => {
      setSavingId(id);
      setError(null);

      const result = await updateFeedback(id, { status });
      setSavingId(null);

      if (result.error || !result.data) {
        const message = getServiceErrorMessage(
          result.error,
          'Unable to update the feedback status.'
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
    feedback,
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
