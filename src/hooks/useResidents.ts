import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createResident,
  deleteResident,
  getResidents,
  subscribeToResidentChanges,
  updateResident,
} from '../services/adminService';
import { getServiceErrorMessage } from '../services/serviceError';
import type {
  GenderType,
  Resident,
  ResidentInsert,
  ResidentUpdate,
} from '../types/database';

export interface ResidentFilters {
  search: string;
  purok: string;
  gender: GenderType | '';
  voterStatus: 'voter' | 'non_voter' | '';
}

interface UseResidentsOptions {
  page: number;
  pageSize: number;
  filters: ResidentFilters;
}

function residentErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
    return 'A resident with the same name and birthdate already exists.';
  }
  return getServiceErrorMessage(error, fallback);
}

export function useResidents({ page, pageSize, filters }: UseResidentsOptions) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);

    const { data, count: resultCount, error: queryError } = await getResidents({
      page: page - 1,
      pageSize,
      search: filters.search,
      purok: filters.purok || undefined,
      gender: filters.gender || undefined,
      isVoter:
        filters.voterStatus === 'voter'
          ? true
          : filters.voterStatus === 'non_voter'
            ? false
            : undefined,
    });

    if (currentRequest !== requestId.current) return;
    setResidents(data ?? []);
    setCount(resultCount ?? 0);
    setError(queryError ? residentErrorMessage(queryError, 'Unable to load residents.') : null);
    setLoading(false);
  }, [filters.gender, filters.purok, filters.search, filters.voterStatus, page, pageSize]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 250);

    const unsubscribe = subscribeToResidentChanges(() => {
      void refresh();
    });

    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [refresh]);

  const addResident = useCallback(async (resident: Omit<ResidentInsert, 'reference_id'>) => {
    setSaving(true);
    setError(null);
    const { data, error: mutationError } = await createResident(resident);
    setSaving(false);

    if (mutationError) {
      const message = residentErrorMessage(mutationError, 'Unable to add resident.');
      setError(message);
      return { data: null, error: message };
    }

    await refresh();
    return { data, error: null };
  }, [refresh]);

  const editResident = useCallback(async (id: string, updates: ResidentUpdate) => {
    setSaving(true);
    setError(null);
    const { data, error: mutationError } = await updateResident(id, updates);
    setSaving(false);

    if (mutationError) {
      const message = residentErrorMessage(mutationError, 'Unable to update resident.');
      setError(message);
      return { data: null, error: message };
    }

    await refresh();
    return { data, error: null };
  }, [refresh]);

  const removeResident = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);
    const { error: mutationError } = await deleteResident(id);
    setSaving(false);

    if (mutationError) {
      const message = residentErrorMessage(mutationError, 'Unable to delete resident.');
      setError(message);
      return { error: message };
    }

    await refresh();
    return { error: null };
  }, [refresh]);

  return {
    residents,
    count,
    loading,
    saving,
    error,
    clearError: () => setError(null),
    refresh,
    addResident,
    editResident,
    removeResident,
  };
}
