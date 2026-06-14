import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { PageHeader, StatusBadge } from '../../../components/admin';
import { Button } from '../../../components/ui';
import { AdminLayout } from '../../../layouts/AdminLayout';

type HistoryStatus = 'completed' | 'rejected' | 'resolved' | 'published';
type HistoryTone = 'green' | 'red' | 'blue';

interface HistoryItem {
  id: string;
  title: string;
  detail: string;
  status: HistoryStatus;
  tone: HistoryTone;
}

interface HistorySectionData {
  id: string;
  title: string;
  items: HistoryItem[];
}

const INITIAL_HISTORY_SECTIONS: HistorySectionData[] = [
  {
    id: 'document-requests',
    title: 'Document Request History',
    items: [
      {
        id: 'doc-1',
        title: 'BD2-2026-0316 - Brgy. Clearance for Ana C. Reyes',
        detail: 'Apr 3, 2026 - 8:45 AM - Picked up: Apr 5, 2026',
        status: 'completed',
        tone: 'green',
      },
      {
        id: 'doc-2',
        title: 'BD2-2026-0315 - Cert. of Indigency for Pedro M. Flores',
        detail: 'Apr 3, 2026 - 2:30 PM - Picked up: Apr 4, 2026',
        status: 'completed',
        tone: 'green',
      },
      {
        id: 'doc-3',
        title: 'BD2-2026-0314 - Business Permit for Rosa T. Lim',
        detail: 'Apr 2, 2026 - 11:00 AM - Reason: Incomplete requirements',
        status: 'rejected',
        tone: 'red',
      },
      {
        id: 'doc-4',
        title: 'BD2-2026-0312 - Brgy. Clearance for Carlo Mendoza',
        detail: 'Apr 1, 2026 - 9:00 AM - Picked up: Apr 2, 2026',
        status: 'completed',
        tone: 'green',
      },
    ],
  },
  {
    id: 'complaints',
    title: 'Concern & Complaint History',
    items: [
      {
        id: 'complaint-1',
        title: 'BLOTTER-2026-005 - Boundary Dispute, Purok 1',
        detail: 'Mar 28, 2026 - Resolved via barangay mediation',
        status: 'resolved',
        tone: 'green',
      },
      {
        id: 'complaint-2',
        title: 'BLOTTER-2026-003 - Noise Disturbance, Purok 5',
        detail: 'Feb 14, 2026 - Warning issued to respondent',
        status: 'resolved',
        tone: 'green',
      },
    ],
  },
  {
    id: 'announcements',
    title: 'Announcement History',
    items: [
      {
        id: 'announcement-1',
        title: 'Community Clean-up Drive',
        detail: 'Mar 15, 2025 - Category: Event',
        status: 'published',
        tone: 'blue',
      },
      {
        id: 'announcement-2',
        title: 'Livelihood Skills Training - TESDA',
        detail: 'Jan 20, 2025 - Category: Program',
        status: 'published',
        tone: 'blue',
      },
      {
        id: 'announcement-3',
        title: 'Online Portal Now Live',
        detail: 'Nov 5, 2024 - Category: System',
        status: 'published',
        tone: 'blue',
      },
    ],
  },
];

const STATUS_LABELS: Record<HistoryStatus, string> = {
  completed: 'Completed',
  rejected: 'Rejected',
  resolved: 'Resolved',
  published: 'Published',
};

const STATUS_TONES: Record<HistoryStatus, 'green' | 'red'> = {
  completed: 'green',
  rejected: 'red',
  resolved: 'green',
  published: 'green',
};

const DOT_STYLES: Record<HistoryTone, string> = {
  green: 'bg-green-600',
  red: 'bg-red-500',
  blue: 'bg-blue-600',
};

function HistoryRow({ item }: { item: HistoryItem }) {
  return (
    <li className="flex items-start gap-3 border-b border-gray-100 px-5 py-4 last:border-b-0">
      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${DOT_STYLES[item.tone]}`} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-extrabold leading-snug text-gray-900">{item.title}</p>
          <StatusBadge label={STATUS_LABELS[item.status]} tone={STATUS_TONES[item.status]} />
        </div>
        <p className="mt-1 text-xs font-semibold text-gray-400">{item.detail}</p>
      </div>
    </li>
  );
}

function HistorySection({
  section,
  onDelete,
}: {
  section: HistorySectionData;
  onDelete: (sectionId: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-extrabold text-gray-950">{section.title}</h2>
        <Button
          onClick={() => onDelete(section.id)}
          variant="danger"
          size="sm"
        >
          <Trash2 size={12} />
          Delete History
        </Button>
      </div>

      {section.items.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm font-medium text-gray-400">
          No history records in this section.
        </div>
      ) : (
        <ul>
          {section.items.map((item) => (
            <HistoryRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}

export function History() {
  const [sections, setSections] = useState<HistorySectionData[]>(INITIAL_HISTORY_SECTIONS);

  function handleDeleteSection(sectionId: string) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId ? { ...section, items: [] } : section
      )
    );
  }

  return (
    <AdminLayout title="History">
      <PageHeader
        title="History"
        subtitle="Mock archive records grouped by module before Supabase history integration."
      />

      <div className="space-y-4">
        {sections.map((section) => (
          <HistorySection
            key={section.id}
            section={section}
            onDelete={handleDeleteSection}
          />
        ))}
      </div>
    </AdminLayout>
  );
}
