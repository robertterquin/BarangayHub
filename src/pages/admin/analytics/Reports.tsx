import { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  FileBarChart,
  FileText,
  RefreshCw,
  Users,
} from 'lucide-react';
import { PageHeader, ReportCard, StatCard } from '../../../components/admin';
import { Button, Select, Spinner } from '../../../components/ui';
import { useReports } from '../../../hooks/useReports';
import { AdminLayout } from '../../../layouts/AdminLayout';
import type { ReportId } from '../../../services/reportService';
import { formatDateTime } from '../../../utils/formatters';

interface ReportItem {
  id: ReportId;
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, index) => CURRENT_YEAR - index);

const REPORT_CARDS: ReportItem[] = [
  {
    id: 'monthly-documents',
    title: 'Monthly Document Report',
    description: 'Document requests summarized by month and completion status.',
    icon: <FileText size={18} />,
    accent: 'text-blue-600 bg-blue-100',
  },
  {
    id: 'resident-census',
    title: 'Resident Census Report',
    description: 'Complete resident census including purok, demographics, and voter status.',
    icon: <Users size={18} />,
    accent: 'text-green-600 bg-green-100',
  },
  {
    id: 'complaints-blotter',
    title: 'Complaints & Blotter Log',
    description: 'Filed complaints for the selected year with urgency and resolution status.',
    icon: <AlertTriangle size={18} />,
    accent: 'text-red-600 bg-red-100',
  },
  {
    id: 'annual-summary',
    title: 'Annual Barangay Summary',
    description: 'Consolidated MIS totals and category breakdowns for LGU reporting.',
    icon: <Building2 size={18} />,
    accent: 'text-amber-600 bg-amber-100',
  },
];

export function Reports() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const {
    snapshot,
    loading,
    exportingId,
    error,
    refresh,
    exportReport,
  } = useReports(year);

  function getMetric(reportId: ReportId): string {
    if (!snapshot) return 'Loading data';
    const metrics: Record<ReportId, string> = {
      'monthly-documents': `${snapshot.totals.documentRequests.toLocaleString()} requests in ${year}`,
      'resident-census': `${snapshot.totals.residents.toLocaleString()} residents`,
      'complaints-blotter': `${snapshot.totals.complaints.toLocaleString()} complaints in ${year}`,
      'annual-summary': `${snapshot.totals.completedRequests.toLocaleString()} completed documents`,
    };
    return metrics[reportId];
  }

  async function handleDownload(report: ReportItem) {
    const result = await exportReport(report.id);
    if (!result.data) return;
    setDownloadNotice(
      `${report.title} downloaded as ${result.data.fileName} (${result.data.rowCount.toLocaleString()} rows).`
    );
  }

  return (
    <AdminLayout title="Reports">
      <section className="space-y-5">
        <PageHeader
          title="Reports & Analytics"
          subtitle="Generate live CSV reports from the BarangayHub database."
          meta={<FileBarChart size={20} className="text-blue-700" />}
        />

        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <Select
            label="Reporting Year"
            value={year}
            disabled={loading}
            onChange={(event) => {
              setYear(Number(event.target.value));
              setDownloadNotice(null);
            }}
            containerClassName="w-full sm:w-52"
          >
            {YEAR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => void refresh()}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh Reports
          </Button>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-bold text-red-700">
                Report data could not be fully loaded
              </p>
              <p className="text-xs font-medium text-red-600">{error}</p>
            </div>
          </div>
        )}

        {loading && !snapshot ? (
          <div className="rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
            <Spinner label="Loading report data from Supabase..." />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total Residents"
                value={(snapshot?.totals.residents ?? 0).toLocaleString()}
                sub={`${(snapshot?.totals.registeredVoters ?? 0).toLocaleString()} registered voters`}
                accentColor="border-l-blue-600"
                subColor="text-blue-600"
              />
              <StatCard
                label={`${year} Requests`}
                value={(snapshot?.totals.documentRequests ?? 0).toLocaleString()}
                sub={`${(snapshot?.totals.completedRequests ?? 0).toLocaleString()} completed`}
                accentColor="border-l-green-500"
                subColor="text-green-600"
              />
              <StatCard
                label={`${year} Complaints`}
                value={(snapshot?.totals.complaints ?? 0).toLocaleString()}
                sub={`${(snapshot?.totals.resolvedComplaints ?? 0).toLocaleString()} resolved`}
                accentColor="border-l-red-500"
                subColor="text-red-600"
              />
              <StatCard
                label="Census Puroks"
                value={(snapshot?.residentsByPurok.length ?? 0).toLocaleString()}
                sub={`Data generated for ${year}`}
                accentColor="border-l-amber-500"
                subColor="text-amber-600"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {REPORT_CARDS.map((report) => (
                <ReportCard
                  key={report.id}
                  title={report.title}
                  description={report.description}
                  icon={report.icon}
                  accent={report.accent}
                  metric={getMetric(report.id)}
                  actionLabel={
                    exportingId === report.id
                      ? 'Generating...'
                      : 'Download CSV'
                  }
                  disabled={loading || !snapshot || exportingId !== null}
                  onDownload={() => void handleDownload(report)}
                />
              ))}
            </div>
          </>
        )}

        {downloadNotice && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-extrabold text-green-800">
                  Report generated successfully
                </p>
                <p className="text-xs font-medium text-green-700">
                  {downloadNotice}
                </p>
                {snapshot && (
                  <p className="mt-1 text-[11px] font-medium text-green-600">
                    Data refreshed {formatDateTime(snapshot.generatedAt)}
                  </p>
                )}
              </div>
              <Button
                type="button"
                onClick={() => setDownloadNotice(null)}
                variant="ghost"
                size="sm"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
