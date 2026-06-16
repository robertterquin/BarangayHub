import { useState } from 'react';
import {
  AlertCircle,
  Bell,
  ClipboardList,
  FileText,
  ListChecks,
  Megaphone,
  RefreshCw,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  DetailField,
  FilterBar,
  StatusBadge,
} from '../../../components/admin';
import { Button, Modal, Select, Spinner } from '../../../components/ui';
import {
  useActivityLogs,
  type ActivityLogFilters,
} from '../../../hooks/useActivityLogs';
import { AdminLayout } from '../../../layouts/AdminLayout';
import type { ActivityLog, Json, LogType } from '../../../types/database';
import { formatDateTime, formatTimeAgo } from '../../../utils/formatters';

const PAGE_SIZE = 20;

type ActivityView = 'timeline' | 'audit';

const LOG_TYPES: LogType[] = [
  'login',
  'approval',
  'rejection',
  'edit',
  'complaint',
  'system',
];

const LOG_LABELS: Record<LogType, string> = {
  login: 'Login',
  approval: 'Approval',
  rejection: 'Rejection',
  edit: 'Edit',
  complaint: 'Complaint',
  system: 'System',
};

const LOG_TONES: Record<
  LogType,
  'blue' | 'green' | 'red' | 'yellow' | 'orange' | 'gray'
> = {
  login: 'blue',
  approval: 'green',
  rejection: 'red',
  edit: 'yellow',
  complaint: 'orange',
  system: 'gray',
};

const LOG_DOT_STYLES: Record<LogType, string> = {
  login: 'bg-blue-600',
  approval: 'bg-green-600',
  rejection: 'bg-red-500',
  edit: 'bg-yellow-400',
  complaint: 'bg-orange-500',
  system: 'bg-gray-500',
};

interface HistorySectionData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  entries: ActivityLog[];
}

function getSectionId(entry: ActivityLog): string {
  if (entry.entity_type === 'document_requests') return 'document-requests';
  if (entry.entity_type === 'complaints') return 'complaints';
  if (entry.entity_type === 'announcements') return 'announcements';
  if (entry.entity_type === 'residents') return 'residents';
  if (entry.entity_type === 'notifications') return 'notifications';
  return 'system';
}

function buildSections(logs: ActivityLog[]): HistorySectionData[] {
  const sectionTemplate: HistorySectionData[] = [
    {
      id: 'document-requests',
      title: 'Document Request History',
      description: 'Approvals, rejections, and workflow updates.',
      icon: <FileText size={16} />,
      entries: [],
    },
    {
      id: 'complaints',
      title: 'Complaints & Blotter History',
      description: 'Complaint review, assignment, and resolution activity.',
      icon: <ClipboardList size={16} />,
      entries: [],
    },
    {
      id: 'announcements',
      title: 'Announcement History',
      description: 'Published, edited, archived, and scheduled announcements.',
      icon: <Megaphone size={16} />,
      entries: [],
    },
    {
      id: 'residents',
      title: 'Resident Record History',
      description: 'Resident profile creation, edits, and removals.',
      icon: <Users size={16} />,
      entries: [],
    },
    {
      id: 'notifications',
      title: 'Notification History',
      description: 'Admin notification updates and read-state changes.',
      icon: <Bell size={16} />,
      entries: [],
    },
    {
      id: 'system',
      title: 'System & Account History',
      description: 'Settings, reports, logins, and admin account updates.',
      icon: <Settings size={16} />,
      entries: [],
    },
  ];

  const sections = new Map<string, HistorySectionData>(
    sectionTemplate.map((section) => [
      section.id,
      { ...section, entries: [] as ActivityLog[] },
    ])
  );

  logs.forEach((entry) => {
    const section = sections.get(getSectionId(entry));
    section?.entries.push(entry);
  });

  return [...sections.values()].filter((section) => section.entries.length > 0);
}

function formatDetails(details: Json): string {
  if (
    details &&
    typeof details === 'object' &&
    !Array.isArray(details) &&
    Object.keys(details).length === 0
  ) {
    return 'No additional details';
  }
  return JSON.stringify(details, null, 2);
}

function ActivityLogRow({
  entry,
  onView,
}: {
  entry: ActivityLog;
  onView: () => void;
}) {
  return (
    <li className="flex items-start gap-4 border-b border-gray-100 px-6 py-4 last:border-b-0 hover:bg-blue-50/50">
      <span
        className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${LOG_DOT_STYLES[entry.log_type]}`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold leading-snug text-gray-800">
            {entry.action}
          </p>
          <StatusBadge
            label={LOG_LABELS[entry.log_type]}
            tone={LOG_TONES[entry.log_type]}
          />
        </div>
        <p className="mt-1 text-xs font-medium text-gray-500">
          {entry.admin_email || 'System'} - {entry.entity_type}
        </p>
        <p className="mt-1 text-xs font-semibold text-gray-400">
          {formatDateTime(entry.created_at)}
        </p>
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={onView}>
        Details
      </Button>
    </li>
  );
}

function TimelineRow({
  entry,
  onView,
}: {
  entry: ActivityLog;
  onView: () => void;
}) {
  return (
    <li className="flex items-start gap-3 border-b border-gray-100 px-5 py-4 last:border-b-0 hover:bg-blue-50/50">
      <span
        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${LOG_DOT_STYLES[entry.log_type]}`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-extrabold leading-snug text-gray-900">
            {entry.action}
          </p>
          <StatusBadge
            label={LOG_LABELS[entry.log_type]}
            tone={LOG_TONES[entry.log_type]}
          />
        </div>
        <p className="mt-1 text-xs font-semibold text-gray-400">
          {entry.admin_email || 'System'} - {formatTimeAgo(entry.created_at)} -{' '}
          {formatDateTime(entry.created_at)}
        </p>
      </div>
      <Button type="button" onClick={onView} variant="secondary" size="sm">
        Details
      </Button>
    </li>
  );
}

function TimelineSection({
  section,
  onView,
}: {
  section: HistorySectionData;
  onView: (entry: ActivityLog) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            {section.icon}
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-gray-950">
              {section.title}
            </h2>
            <p className="mt-0.5 text-xs font-medium text-gray-400">
              {section.description}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
          {section.entries.length} event{section.entries.length === 1 ? '' : 's'}
        </span>
      </div>

      <ul>
        {section.entries.map((entry) => (
          <TimelineRow
            key={entry.id}
            entry={entry}
            onView={() => onView(entry)}
          />
        ))}
      </ul>
    </section>
  );
}

function ActivityLogModal({
  entry,
  onClose,
}: {
  entry: ActivityLog;
  onClose: () => void;
}) {
  return (
    <Modal
      title="Activity Log Details"
      subtitle={formatDateTime(entry.created_at)}
      width="lg"
      onClose={onClose}
      footer={
        <Button type="button" variant="ghost" fullWidth onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        <DetailField label="Action" value={entry.action} />
        <div>
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-600">
            Event Type
          </p>
          <StatusBadge
            label={LOG_LABELS[entry.log_type]}
            tone={LOG_TONES[entry.log_type]}
          />
        </div>
        <DetailField label="Admin Email" value={entry.admin_email || 'System'} />
        <DetailField label="Admin ID" value={entry.admin_id || 'Not applicable'} />
        <DetailField label="Entity Type" value={entry.entity_type} />
        <DetailField label="Entity ID" value={entry.entity_id || 'Not applicable'} />
        <div className="sm:col-span-2">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-600">
            Details
          </p>
          <pre className="max-h-64 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs leading-5 text-gray-700">
            {formatDetails(entry.details)}
          </pre>
        </div>
      </div>
    </Modal>
  );
}

export function ActivityLogs() {
  const [search, setSearch] = useState('');
  const [logType, setLogType] = useState<LogType | ''>('');
  const [activeView, setActiveView] = useState<ActivityView>('timeline');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewEntry, setViewEntry] = useState<ActivityLog | null>(null);

  const filters: ActivityLogFilters = { search, logType };
  const { logs, count, loading, error, refresh } = useActivityLogs({
    page: currentPage,
    pageSize: PAGE_SIZE,
    filters,
  });

  const sections = buildSections(logs);
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const displayStart = count === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const displayEnd = Math.min(safePage * PAGE_SIZE, count);

  return (
    <>
      <AdminLayout title="Activity History">
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-red-700">
                Activity history could not be loaded
              </p>
              <p className="text-xs font-medium text-red-600">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => void refresh()}
              className="text-xs font-bold text-red-700 underline"
            >
              Retry
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
            <div>
              <div className="flex items-center gap-2">
                <ScrollText size={18} className="text-blue-700" />
                <h1 className="text-base font-extrabold text-gray-950">
                  Activity History
                </h1>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-gray-400">
                <ShieldCheck size={13} className="text-green-600" />
                One immutable audit trail, shown as either a timeline or raw log list.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {count.toLocaleString()} records
            </span>
          </div>

          <div className="border-b border-gray-100 px-6 py-4">
            <div className="mb-4 inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setActiveView('timeline')}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                  activeView === 'timeline'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <ScrollText size={14} />
                Timeline
              </button>
              <button
                type="button"
                onClick={() => setActiveView('audit')}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                  activeView === 'audit'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <ListChecks size={14} />
                Audit Details
              </button>
            </div>

            <FilterBar
              searchValue={search}
              searchPlaceholder="Search action, admin email, or entity..."
              onSearchChange={(value) => {
                setSearch(value);
                setCurrentPage(1);
              }}
              className="mb-0"
            >
              <Select
                value={logType}
                onChange={(event) => {
                  setLogType(event.target.value as LogType | '');
                  setCurrentPage(1);
                }}
                className="min-w-36 border-gray-200 py-2"
              >
                <option value="">All Event Types</option>
                {LOG_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {LOG_LABELS[type]}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => void refresh()}
                disabled={loading}
                className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600 disabled:opacity-50"
                aria-label="Refresh activity history"
              >
                <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
              </button>
            </FilterBar>
          </div>

          {loading ? (
            <div className="py-16">
              <Spinner label="Loading activity history..." />
            </div>
          ) : logs.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm font-medium text-gray-400">
              No activity records match the selected filters.
            </div>
          ) : activeView === 'timeline' ? (
            <div className="space-y-4 bg-gray-50/60 p-5">
              {sections.map((section) => (
                <TimelineSection
                  key={section.id}
                  section={section}
                  onView={setViewEntry}
                />
              ))}
            </div>
          ) : (
            <ul>
              {logs.map((entry) => (
                <ActivityLogRow
                  key={entry.id}
                  entry={entry}
                  onView={() => setViewEntry(entry)}
                />
              ))}
            </ul>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
            <p className="text-xs text-gray-400">
              Showing {displayStart}-{displayEnd} of {count.toLocaleString()} records
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage === 1 || loading}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-xs font-medium text-gray-400">
                Page {safePage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage >= totalPages || loading}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </AdminLayout>

      {viewEntry && (
        <ActivityLogModal entry={viewEntry} onClose={() => setViewEntry(null)} />
      )}
    </>
  );
}
