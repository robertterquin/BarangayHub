import { useCallback, useEffect, useState } from 'react';
import {
  changeCurrentAdminEmail,
  changeCurrentAdminPassword,
  getCurrentAdminProfile,
  getSystemSettings,
  updateSystemSettings,
} from '../services/adminService';
import { getServiceErrorMessage } from '../services/serviceError';
import type {
  AdminProfile,
  SystemSettings,
  SystemSettingsUpdate,
} from '../types/database';

type SettingsSavingSection = 'information' | 'email' | 'password' | null;

export function useSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] =
    useState<SettingsSavingSection>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    const [settingsResult, profileResult] = await Promise.all([
      getSystemSettings(),
      getCurrentAdminProfile(),
    ]);

    setSettings(settingsResult.data);
    setProfile(profileResult.data);

    const queryError = settingsResult.error ?? profileResult.error;
    setError(
      queryError
        ? getServiceErrorMessage(queryError, 'Unable to load system settings.')
        : null
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [refresh]);

  const saveInformation = useCallback(
    async (updates: SystemSettingsUpdate) => {
      setSavingSection('information');
      setError(null);

      const result = await updateSystemSettings(updates);
      setSavingSection(null);

      if (result.error || !result.data) {
        const message = getServiceErrorMessage(
          result.error,
          'Unable to update barangay information.'
        );
        setError(message);
        return { data: null, error: message };
      }

      setSettings(result.data);
      return { data: result.data, error: null };
    },
    []
  );

  const saveEmail = useCallback(
    async (currentPassword: string, newEmail: string) => {
      setSavingSection('email');
      setError(null);

      const result = await changeCurrentAdminEmail(currentPassword, newEmail);
      setSavingSection(null);

      if (result.error || !result.data) {
        const message = getServiceErrorMessage(
          result.error,
          'Unable to update the admin email.'
        );
        setError(message);
        return { data: null, error: message };
      }

      setProfile((current) =>
        current ? { ...current, email: newEmail.trim().toLowerCase() } : current
      );
      return { data: result.data, error: null };
    },
    []
  );

  const savePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      setSavingSection('password');
      setError(null);

      const result = await changeCurrentAdminPassword(
        currentPassword,
        newPassword
      );
      setSavingSection(null);

      if (result.error || !result.data) {
        const message = getServiceErrorMessage(
          result.error,
          'Unable to update the admin password.'
        );
        setError(message);
        return { error: message };
      }

      return { error: null };
    },
    []
  );

  return {
    settings,
    profile,
    loading,
    savingSection,
    error,
    clearError: () => setError(null),
    refresh,
    saveInformation,
    saveEmail,
    savePassword,
  };
}
