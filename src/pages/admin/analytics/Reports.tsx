import { useState } from 'react';
import { FileBarChart, FileText, Users, AlertTriangle, Building2 } from 'lucide-react';
import { PageHeader, ReportCard } from '../../../components/admin';
import { Button } from '../../../components/ui';
import { AdminLayout } from '../../../layouts/AdminLayout';

interface ReportItem {
  id: string;
  title: string;
  description: string;
  fileName: string;
  lastGenerated: string;
  icon: React.ReactNode;
  accent: string;
}

const REPORT_CARDS: ReportItem[] = [
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

export function Reports() {
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  function handleMockDownload(report: ReportItem) {
    setSelectedReport(report);
  }

  return (
    <AdminLayout title="Reports">
      <section className="space-y-5">
        <PageHeader
          title="Reports & Analytics"
          subtitle="Generate mock report cards first, then connect these actions to Supabase and PDF export later."
          meta={<FileBarChart size={20} className="text-blue-700" />}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {REPORT_CARDS.map((report) => (
            <ReportCard
              key={report.id}
              title={report.title}
              description={report.description}
              icon={report.icon}
              accent={report.accent}
              onDownload={() => handleMockDownload(report)}
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
              <Button
                onClick={() => setSelectedReport(null)}
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
