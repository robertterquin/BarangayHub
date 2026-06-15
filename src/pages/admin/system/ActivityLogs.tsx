import { useState } from 'react';
import { AlertCircle, RefreshCw, ScrollText, ShieldCheck } from 'lucide-react';
import { DetailField, FilterBar, StatusBadge } from '../../../components/admin';
import { Button, Modal, Select, Spinner } from '../../../components/ui';
import {
  useActivityLogs,
  type ActivityLogFilters,
} from '../../../hooks/useActivityLogs';
import { AdminLayout } from '../../../layouts/AdminLayout';
import type { ActivityLog, Json, LogType } from '../../../types/database';
import { formatDateTime } from '../../../utils/formatters';

const PAGE_SIZE = 10;

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
          {entry.admin_email || 'System'} · {entry.entity_type}
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
            Log Type
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
  const [currentPage, setCurrentPage] = useState(1);
  const [viewEntry, setViewEntry] = useState<ActivityLog | null>(null);

  const filters: ActivityLogFilters = { search, logType };
  const { logs, count, loading, error, refresh } = useActivityLogs({
    page: currentPage,
    pageSize: PAGE_SIZE,
    filters,
  });

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const displayStart = count === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const displayEnd = Math.min(safePage * PAGE_SIZE, count);

  return (
    <>
      <AdminLayout title="Activity Logs">
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-red-700">
                Activity logs could not be loaded
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
                  Activity Logs
                </h1>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-gray-400">
                <ShieldCheck size={13} className="text-green-600" />
                Immutable audit trail of authenticated administrative activity.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {count.toLocaleString()} records
            </span>
          </div>

          <FilterBar
            searchValue={search}
            searchPlaceholder="Search action, admin email, or entity..."
            onSearchChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            className="mb-0 border-b border-gray-100 px-6 py-4"
          >
            <Select
              value={logType}
              onChange={(event) => {
                setLogType(event.target.value as LogType | '');
                setCurrentPage(1);
              }}
              className="min-w-36 border-gray-200 py-2"
            >
              <option value="">All Log Types</option>
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
              aria-label="Refresh activity logs"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
            </button>
          </FilterBar>

          {loading ? (
            <div className="py-16">
              <Spinner label="Loading activity logs..." />
            </div>
          ) : logs.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm font-medium text-gray-400">
              No activity logs match the selected filters.
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
