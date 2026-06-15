import { useCallback, useEffect, useState } from 'react';
import {
  downloadReport,
  getReportsSnapshot,
  type ReportDownload,
  type ReportId,
  type ReportsSnapshot,
} from '../services/reportService';
import { getServiceErrorMessage } from '../services/serviceError';

export function useReports(year: number) {
  const [snapshot, setSnapshot] = useState<ReportsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingId, setExportingId] = useState<ReportId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await getReportsSnapshot(year);
    setSnapshot(result.data);
    setError(
      result.error
        ? getServiceErrorMessage(
            result.error,
            'Some report data could not be loaded.'
          )
        : null
    );
    setLoading(false);
  }, [year]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [refresh]);

  const exportReport = useCallback(
    async (
      reportId: ReportId
    ): Promise<{ data: ReportDownload | null; error: string | null }> => {
      if (!snapshot) {
        return { data: null, error: 'Report data is not available yet.' };
      }

      setExportingId(reportId);
      setError(null);
      const result = await downloadReport(reportId, snapshot);
      setExportingId(null);

      if (result.error || !result.data) {
        const message = getServiceErrorMessage(
          result.error,
          'Unable to generate the report.'
        );
        setError(message);
        return { data: null, error: message };
      }

      return { data: result.data, error: null };
    },
    [snapshot]
  );

  return {
    snapshot,
    loading,
    exportingId,
    error,
    refresh,
    exportReport,
  };
}
