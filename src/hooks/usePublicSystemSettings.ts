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

function toPublicView(settings: SystemSettings | null): PublicSystemSettingsView {
  if (!settings) return DEFAULT_SETTINGS;

  const barangayName = settings.barangay_name || DEFAULT_SETTINGS.barangayName;
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

export function usePublicSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const result = await getPublicSystemSettings();

      setSettings(result.data);
      setError(
        result.error
          ? getServiceErrorMessage(result.error, 'Unable to load barangay information.')
          : null
      );
    } catch (requestError) {
      setSettings(null);
      setError(getServiceErrorMessage(requestError, 'Unable to load barangay information.'));
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

  const publicSettings = useMemo(() => toPublicView(settings), [settings]);

  return {
    settings,
    publicSettings,
    loading,
    error,
    refresh,
  };
}
