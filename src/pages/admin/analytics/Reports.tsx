import { useState } from 'react';
import { Download, FileBarChart, FileText, Users, AlertTriangle, Building2 } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  fileName: string;
  lastGenerated: string;
  icon: React.ReactNode;
  accent: string;
}

const REPORT_CARDS: ReportCard[] = [
  {
    id: 'monthly-documents',
    title: 'Monthly Document Report',
    description: 'Summary of all documents issued per type and per month.',
    fileName: 'monthly-document-report.pdf',
    lastGenerated: 'Apr 9, 2026',
    icon: <FileText size={18} />,
    accent: 'text-blue-600 bg-blue-100',
  },
  {
    id: 'resident-census',
    title: 'Resident Census Report',
    description: 'Full census by purok, gender, civil status, and voter status.',
    fileName: 'resident-census-report.pdf',
    lastGenerated: 'Apr 7, 2026',
    icon: <Users size={18} />,
    accent: 'text-green-600 bg-green-100',
  },
  {
    id: 'complaints-blotter',
    title: 'Complaints & Blotter Log',
    description: 'All filed complaints for the period with resolution status.',
    fileName: 'complaints-blotter-log.pdf',
    lastGenerated: 'Apr 6, 2026',
    icon: <AlertTriangle size={18} />,
    accent: 'text-red-600 bg-red-100',
  },
  {
    id: 'annual-summary',
    title: 'Annual Barangay Summary',
    description: 'Comprehensive annual report for LGU submission covering all MIS data.',
    fileName: 'annual-barangay-summary.pdf',
    lastGenerated: 'Mar 31, 2026',
    icon: <Building2 size={18} />,
    accent: 'text-amber-600 bg-amber-100',
  },
];

function ReportCardItem({
  report,
  onDownload,
}: {
  report: ReportCard;
  onDownload: (report: ReportCard) => void;
}) {
  return (
    <article className="flex min-h-40 flex-col rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${report.accent}`}>
          {report.icon}
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-500">
          PDF
        </span>
      </div>

      <h2 className="text-sm font-extrabold text-blue-900">{report.title}</h2>
      <p className="mt-1 flex-1 text-sm font-medium leading-relaxed text-slate-600">
        {report.description}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          onClick={() => onDownload(report)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-blue-800"
        >
          <Download size={13} />
          Download PDF
        </button>
      </div>
    </article>
  );
}

export function Reports() {
  const [selectedReport, setSelectedReport] = useState<ReportCard | null>(null);

  function handleMockDownload(report: ReportCard) {
    setSelectedReport(report);
  }

  return (
    <AdminLayout title="Reports">
      <section className="space-y-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <FileBarChart size={20} className="text-blue-700" />
            <h1 className="text-xl font-extrabold tracking-tight text-gray-950">Reports & Analytics</h1>
          </div>
          <p className="text-sm font-medium text-gray-400">
            Generate mock report cards first, then connect these actions to Supabase and PDF export later.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {REPORT_CARDS.map((report) => (
            <ReportCardItem
              key={report.id}
              report={report}
              onDownload={handleMockDownload}
            />
          ))}
        </div>

        {selectedReport && (
          <div className="rounded-xl border border-blue-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-extrabold text-gray-900">
                  Mock download prepared: {selectedReport.title}
                </p>
                <p className="text-xs font-medium text-gray-400">
                  File: {selectedReport.fileName} · Last generated {selectedReport.lastGenerated}
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-50"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
