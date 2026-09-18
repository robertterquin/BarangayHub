import { useCallback, useEffect, useMemo, useState } from 'react';
import { getPublicSystemSettings } from '../services/publicService';
import { getServiceErrorMessage } from '../services/serviceError';
import type { SystemSettings } from '../types/database';

const DEFAULT_SETTINGS: PublicSystemSettingsView = {
  barangayName: 'Daine II',
  locationLine: 'Brgy. Daine II - Indang, Cavite',
  completeAddress: 'Barangay Daine II, Indang, Cavite',
  contactNumber: 'Contact number unavailable',
  publicEmail: 'brgy.daineii@indang.gov.ph',
  systemVersion: 'v1.0',
};

export interface PublicSystemSettingsView {
  barangayName: string;
  locationLine: string;
  completeAddress: string;
  contactNumber: string;
  publicEmail: string;
  systemVersion: string;
}

function normalizeBarangayName(name: string): string {
  return name
    .replace(/\bIl\b/g, 'II')
    .replace(/\bIL\b/g, 'II')
    .replace(/\b11\b/g, 'II')
    .replace(/\bll\b/g, 'II');
}

function toPublicView(settings: SystemSettings | null): PublicSystemSettingsView {
  if (!settings) return DEFAULT_SETTINGS;

  const rawBarangayName = settings.barangay_name || DEFAULT_SETTINGS.barangayName;
  const barangayName = normalizeBarangayName(rawBarangayName);
  const municipality = settings.municipality || 'Indang';
  const province = settings.province || 'Cavite';

  return {
    barangayName,
    locationLine: `Brgy. ${barangayName} - ${municipality}, ${province}`,
    completeAddress:
      settings.complete_address || `Barangay ${barangayName}, ${municipality}, ${province}`,
    contactNumber: settings.contact_number || DEFAULT_SETTINGS.contactNumber,
    publicEmail: settings.public_email || DEFAULT_SETTINGS.publicEmail,
    systemVersion: settings.system_version || DEFAULT_SETTINGS.systemVersion,
  };
}

let cachedSettings: SystemSettings | null = null;
let settingsFetchPromise: Promise<{ data: SystemSettings | null; error: unknown }> | null = null;

export function setCachedPublicSystemSettings(newSettings: SystemSettings | null) {
  cachedSettings = newSettings;
}

export function usePublicSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (force = false) => {
    if (!cachedSettings) {
      setLoading(true);
    }

    try {
      if (!settingsFetchPromise || force) {
        settingsFetchPromise = getPublicSystemSettings();
      }
      const result = await settingsFetchPromise;
      if (result.data) {
        cachedSettings = result.data;
      }
      setSettings(result.data);
      setError(
        result.error
          ? getServiceErrorMessage(result.error, 'Unable to load barangay information.')
          : null
      );
    } catch (requestError) {
      if (!cachedSettings) {
        setSettings(null);
      }
      setError(getServiceErrorMessage(requestError, 'Unable to load barangay information.'));
    } finally {
      settingsFetchPromise = null;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cachedSettings) {
      const timer = window.setTimeout(() => {
        void refresh();
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [refresh]);

  const publicSettings = useMemo(() => toPublicView(settings), [settings]);

  return {
    settings,
    publicSettings,
    loading,
    error,
    refresh,
  };
}
