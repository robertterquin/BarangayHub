import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createAnnouncement,
  deleteAnnouncement,
  deleteAnnouncementImage,
  getAnnouncements,
  subscribeToAnnouncementChanges,
  updateAnnouncement,
  uploadAnnouncementImage,
} from '../services/adminService';
import { getServiceErrorMessage } from '../services/serviceError';
import type {
  Announcement,
  AnnouncementInsert,
  AnnouncementStatus,
  AnnouncementUpdate,
} from '../types/database';

export interface AnnouncementFilters {
  search: string;
  status: AnnouncementStatus | '';
}

interface UseAnnouncementsOptions {
  page: number;
  pageSize: number;
  filters: AnnouncementFilters;
}

interface AnnouncementMutation {
  values: AnnouncementInsert | AnnouncementUpdate;
  imageFile?: File | null;
  removeImage?: boolean;
}

export function useAnnouncements({
  page,
  pageSize,
  filters,
}: UseAnnouncementsOptions) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);

    const result = await getAnnouncements({
      page: page - 1,
      pageSize,
      search: filters.search,
      status: filters.status || undefined,
    });

    if (currentRequest !== requestId.current) return;
    setAnnouncements(result.data ?? []);
    setCount(result.count ?? 0);
    setError(
      result.error
        ? getServiceErrorMessage(result.error, 'Unable to load announcements.')
        : null
    );
    setLoading(false);
  }, [filters.search, filters.status, page, pageSize]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 250);

    const unsubscribe = subscribeToAnnouncementChanges(() => {
      void refresh();
    });

    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [refresh]);

  const uploadImage = useCallback(async (file: File) => {
    const result = await uploadAnnouncementImage(file);
    if (result.error || !result.data) {
      return {
        url: null,
        error: getServiceErrorMessage(
          result.error,
          'Unable to upload the announcement image.'
        ),
      };
    }
    return { url: result.data.publicUrl, error: null };
  }, []);

  const addAnnouncement = useCallback(
    async ({ values, imageFile }: AnnouncementMutation) => {
      setSaving(true);
      setError(null);

      let uploadedImageUrl: string | null = null;
      if (imageFile) {
        const upload = await uploadImage(imageFile);
        if (upload.error) {
          setSaving(false);
          setError(upload.error);
          return { data: null, error: upload.error };
        }
        uploadedImageUrl = upload.url;
      }

      const result = await createAnnouncement({
        ...(values as AnnouncementInsert),
        image_url: uploadedImageUrl,
      });

      if (result.error) {
        if (uploadedImageUrl) await deleteAnnouncementImage(uploadedImageUrl);
        const message = getServiceErrorMessage(
          result.error,
          'Unable to create the announcement.'
        );
        setSaving(false);
        setError(message);
        return { data: null, error: message };
      }

      setSaving(false);
      await refresh();
      return { data: result.data, error: null };
    },
    [refresh, uploadImage]
  );

  const editAnnouncement = useCallback(
    async (
      announcement: Announcement,
      { values, imageFile, removeImage }: AnnouncementMutation
    ) => {
      setSaving(true);
      setError(null);

      let nextImageUrl = removeImage ? null : announcement.image_url;
      let uploadedImageUrl: string | null = null;

      if (imageFile) {
        const upload = await uploadImage(imageFile);
        if (upload.error) {
          setSaving(false);
          setError(upload.error);
          return { data: null, error: upload.error };
        }
        uploadedImageUrl = upload.url;
        nextImageUrl = upload.url;
      }

      const result = await updateAnnouncement(announcement.id, {
        ...(values as AnnouncementUpdate),
        image_url: nextImageUrl,
      });

      if (result.error) {
        if (uploadedImageUrl) await deleteAnnouncementImage(uploadedImageUrl);
        const message = getServiceErrorMessage(
          result.error,
          'Unable to update the announcement.'
        );
        setSaving(false);
        setError(message);
        return { data: null, error: message };
      }

      if (
        announcement.image_url &&
        announcement.image_url !== nextImageUrl
      ) {
        await deleteAnnouncementImage(announcement.image_url);
      }

      setSaving(false);
      await refresh();
      return { data: result.data, error: null };
    },
    [refresh, uploadImage]
  );

  const changeStatus = useCallback(
    async (announcement: Announcement, status: AnnouncementStatus) => {
      setSaving(true);
      setError(null);

      const updates: AnnouncementUpdate = {
        status,
        published_at: status === 'published' ? new Date().toISOString() : announcement.published_at,
        scheduled_for: status === 'scheduled' ? announcement.scheduled_for : null,
      };
      const result = await updateAnnouncement(announcement.id, updates);
      setSaving(false);

      if (result.error) {
        const message = getServiceErrorMessage(
          result.error,
          'Unable to update the announcement status.'
        );
        setError(message);
        return { data: null, error: message };
      }

      await refresh();
      return { data: result.data, error: null };
    },
    [refresh]
  );

  const removeAnnouncement = useCallback(
    async (announcement: Announcement) => {
      setDeletingId(announcement.id);
      setError(null);

      const result = await deleteAnnouncement(announcement.id);
      if (result.error) {
        const message = getServiceErrorMessage(
          result.error,
          'Unable to delete the announcement.'
        );
        setDeletingId(null);
        setError(message);
        return { error: message };
      }

      if (announcement.image_url) {
        await deleteAnnouncementImage(announcement.image_url);
      }

      setDeletingId(null);
      await refresh();
      return { error: null };
    },
    [refresh]
  );

  return {
    announcements,
    count,
    loading,
    saving,
    deletingId,
    error,
    clearError: () => setError(null),
    refresh,
    addAnnouncement,
    editAnnouncement,
    changeStatus,
    removeAnnouncement,
  };
}
