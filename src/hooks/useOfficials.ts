import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createOfficial,
  deleteOfficialPhoto,
  deleteOfficial,
  getActiveOfficialCount,
  getOfficials,
  uploadOfficialPhoto,
  updateOfficial,
} from '../services/adminService';
import { getServiceErrorMessage } from '../services/serviceError';
import type { Official, OfficialInsert, OfficialUpdate } from '../types/database';

interface UseOfficialsOptions {
  page: number;
  pageSize: number;
  search: string;
}

export function useOfficials({ page, pageSize, search }: UseOfficialsOptions) {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [count, setCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);

    const [officialsResult, activeResult] = await Promise.all([
      getOfficials({ page: page - 1, pageSize, search }),
      getActiveOfficialCount(),
    ]);

    if (currentRequest !== requestId.current) return;
    setOfficials(officialsResult.data ?? []);
    setCount(officialsResult.count ?? 0);
    setActiveCount(activeResult.count ?? 0);

    const queryError = officialsResult.error ?? activeResult.error;
    setError(
      queryError
        ? getServiceErrorMessage(queryError, 'Unable to load barangay officials.')
        : null
    );
    setLoading(false);
  }, [page, pageSize, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [refresh]);

  const uploadPhoto = useCallback(async (file: File) => {
    const result = await uploadOfficialPhoto(file);
    if (result.error || !result.data) {
      return {
        url: null,
        error: getServiceErrorMessage(
          result.error,
          'Unable to upload the official photo.'
        ),
      };
    }
    return { url: result.data.publicUrl, error: null };
  }, []);

  const addOfficial = useCallback(
    async (values: OfficialInsert, photoFile?: File | null) => {
      setSaving(true);
      setError(null);

      let uploadedPhotoUrl: string | null = null;
      if (photoFile) {
        const upload = await uploadPhoto(photoFile);
        if (upload.error) {
          setSaving(false);
          setError(upload.error);
          return { data: null, error: upload.error };
        }
        uploadedPhotoUrl = upload.url;
      }

      const result = await createOfficial({
        ...values,
        photo_url: uploadedPhotoUrl,
      });

      if (result.error) {
        if (uploadedPhotoUrl) await deleteOfficialPhoto(uploadedPhotoUrl);
        const message = getServiceErrorMessage(
          result.error,
          'Unable to add the barangay official.'
        );
        setSaving(false);
        setError(message);
        return { data: null, error: message };
      }

      setSaving(false);
      await refresh();
      return { data: result.data, error: null };
    },
    [refresh, uploadPhoto]
  );

  const editOfficial = useCallback(
    async (
      official: Official,
      values: OfficialUpdate,
      photoFile?: File | null,
      removePhoto = false
    ) => {
      setSaving(true);
      setError(null);

      let nextPhotoUrl = removePhoto ? null : official.photo_url;
      let uploadedPhotoUrl: string | null = null;

      if (photoFile) {
        const upload = await uploadPhoto(photoFile);
        if (upload.error) {
          setSaving(false);
          setError(upload.error);
          return { data: null, error: upload.error };
        }
        uploadedPhotoUrl = upload.url;
        nextPhotoUrl = upload.url;
      }

      const result = await updateOfficial(official.id, {
        ...values,
        photo_url: nextPhotoUrl,
      });

      if (result.error) {
        if (uploadedPhotoUrl) await deleteOfficialPhoto(uploadedPhotoUrl);
        const message = getServiceErrorMessage(
          result.error,
          'Unable to update the barangay official.'
        );
        setSaving(false);
        setError(message);
        return { data: null, error: message };
      }

      if (official.photo_url && official.photo_url !== nextPhotoUrl) {
        await deleteOfficialPhoto(official.photo_url);
      }

      setSaving(false);
      await refresh();
      return { data: result.data, error: null };
    },
    [refresh, uploadPhoto]
  );

  const removeOfficial = useCallback(
    async (official: Official) => {
      setDeletingId(official.id);
      setError(null);
      const result = await deleteOfficial(official.id);

      if (result.error) {
        const message = getServiceErrorMessage(
          result.error,
          'Unable to delete the barangay official.'
        );
        setDeletingId(null);
        setError(message);
        return { error: message };
      }

      if (official.photo_url) {
        await deleteOfficialPhoto(official.photo_url);
      }

      setDeletingId(null);
      await refresh();
      return { error: null };
    },
    [refresh]
  );

  return {
    officials,
    count,
    activeCount,
    loading,
    saving,
    deletingId,
    error,
    clearError: () => setError(null),
    refresh,
    addOfficial,
    editOfficial,
    removeOfficial,
  };
}
