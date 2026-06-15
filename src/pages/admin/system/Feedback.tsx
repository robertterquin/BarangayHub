import { useState } from 'react';
import {
  AlertCircle,
  Inbox,
  Mail,
  Phone,
  RefreshCw,
  UserRound,
} from 'lucide-react';
import {
  DetailField,
  FilterBar,
  StatusBadge,
} from '../../../components/admin';
import { Button, Modal, Select, Spinner } from '../../../components/ui';
import {
  useFeedback,
  type FeedbackFilters,
} from '../../../hooks/useFeedback';
import { AdminLayout } from '../../../layouts/AdminLayout';
import type {
  Feedback as FeedbackRecord,
  FeedbackCategory,
  FeedbackStatus,
} from '../../../types/database';
import { formatDateTime } from '../../../utils/formatters';

const PAGE_SIZE = 8;

const STATUS_OPTIONS: FeedbackStatus[] = [
  'pending',
  'under_review',
  'reviewed',
];

const CATEGORY_OPTIONS: FeedbackCategory[] = [
  'suggestion',
  'commendation',
  'bug_report',
  'feature_request',
  'other',
];

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  pending: 'Pending Review',
  reviewed: 'Reviewed',
  under_review: 'Under Review',
};

const STATUS_TONES: Record<
  FeedbackStatus,
  'orange' | 'green' | 'blue'
> = {
  pending: 'orange',
  reviewed: 'green',
  under_review: 'blue',
};

const STATUS_DOTS: Record<FeedbackStatus, string> = {
  pending: 'bg-orange-400',
  under_review: 'bg-blue-600',
  reviewed: 'bg-green-600',
};

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  suggestion: 'Suggestion',
  commendation: 'Commendation',
  bug_report: 'Bug Report',
  feature_request: 'Feature Request',
  other: 'Other',
};

function getResidentName(feedback: FeedbackRecord): string {
  return feedback.is_anonymous
    ? 'Anonymous'
    : feedback.resident_name || 'Unnamed Resident';
}

function FeedbackDetailsModal({
  feedback,
  saving,
  onStatusChange,
  onClose,
}: {
  feedback: FeedbackRecord;
  saving: boolean;
  onStatusChange: (status: FeedbackStatus) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      title="Resident Feedback"
      subtitle={CATEGORY_LABELS[feedback.category]}
      width="lg"
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row">
          {feedback.status !== 'under_review' && (
            <Button
              type="button"
              variant="primary"
              fullWidth
              disabled={saving}
              onClick={() => onStatusChange('under_review')}
            >
              {saving ? 'Saving...' : 'Mark Under Review'}
            </Button>
          )}
          {feedback.status !== 'reviewed' && (
            <Button
              type="button"
              variant="success"
              fullWidth
              disabled={saving}
              onClick={() => onStatusChange('reviewed')}
            >
              {saving ? 'Saving...' : 'Mark Reviewed'}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            fullWidth
            disabled={saving}
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailField label="Resident" value={getResidentName(feedback)} />
          <div>
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-600">
              Status
            </p>
            <StatusBadge
              label={STATUS_LABELS[feedback.status]}
              tone={STATUS_TONES[feedback.status]}
            />
          </div>
          <DetailField
            label="Submitted"
            value={formatDateTime(feedback.submitted_at)}
          />
          <DetailField
            label="Reviewed"
            value={
              feedback.reviewed_at
                ? formatDateTime(feedback.reviewed_at)
                : 'Not yet reviewed'
            }
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-blue-600">
            Message
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {feedback.message}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
            <Phone size={16} className="shrink-0 text-gray-400" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                Contact Number
              </p>
              <p className="truncate text-sm font-semibold text-gray-700">
                {feedback.is_anonymous
                  ? 'Hidden for anonymous feedback'
                  : feedback.contact_number || 'Not provided'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
            <Mail size={16} className="shrink-0 text-gray-400" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                Email
              </p>
              <p className="truncate text-sm font-semibold text-gray-700">
                {feedback.is_anonymous
                  ? 'Hidden for anonymous feedback'
                  : feedback.email || 'Not provided'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function FeedbackRow({
  feedback,
  saving,
  onView,
  onStatusChange,
}: {
  feedback: FeedbackRecord;
  saving: boolean;
  onView: () => void;
  onStatusChange: (status: FeedbackStatus) => void;
}) {
  return (
    <li className="flex items-start gap-4 border-b border-gray-100 px-5 py-5 last:border-b-0 sm:px-6">
      <span
        className={`mt-2 h-3 w-3 shrink-0 rounded-full ${STATUS_DOTS[feedback.status]}`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-extrabold text-gray-900">
                {getResidentName(feedback)}
              </p>
              {feedback.is_anonymous && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  Anonymous
                </span>
              )}
            </div>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-blue-600">
              {CATEGORY_LABELS[feedback.category]}
            </p>
          </div>
          <StatusBadge
            label={STATUS_LABELS[feedback.status]}
            tone={STATUS_TONES[feedback.status]}
          />
        </div>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">
          {feedback.message}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-gray-400">
          <span>{formatDateTime(feedback.submitted_at)}</span>
          {!feedback.is_anonymous && feedback.contact_number && (
            <span className="flex items-center gap-1">
              <Phone size={12} />
              {feedback.contact_number}
            </span>
          )}
          {!feedback.is_anonymous && feedback.email && (
            <span className="flex items-center gap-1">
              <Mail size={12} />
              {feedback.email}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={onView}
            variant="secondary"
            size="sm"
          >
            View Details
          </Button>
          {feedback.status !== 'under_review' && (
            <Button
              type="button"
              onClick={() => onStatusChange('under_review')}
              variant="primary"
              size="sm"
              disabled={saving}
              className="bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              {saving ? 'Saving...' : 'Mark Under Review'}
            </Button>
          )}
          {feedback.status !== 'reviewed' && (
            <Button
              type="button"
              onClick={() => onStatusChange('reviewed')}
              variant="success"
              size="sm"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Mark Reviewed'}
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

export function Feedback() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | ''>(
    ''
  );
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewFeedback, setViewFeedback] = useState<FeedbackRecord | null>(null);

  const filters: FeedbackFilters = {
    search,
    category: categoryFilter,
    status: statusFilter,
  };
  const {
    feedback,
    count,
    pendingCount,
    loading,
    savingId,
    error,
    clearError,
    refresh,
    changeStatus,
  } = useFeedback({ page: currentPage, pageSize: PAGE_SIZE, filters });

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const displayStart = count === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const displayEnd = Math.min(safePage * PAGE_SIZE, count);

  async function handleStatusChange(
    record: FeedbackRecord,
    status: FeedbackStatus
  ) {
    const result = await changeStatus(record.id, status);
    if (result.data && viewFeedback?.id === record.id) {
      setViewFeedback(result.data);
    }
  }

  return (
    <>
      <AdminLayout title="Feedback & Suggestions">
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-red-500"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-red-700">
                Feedback operation failed
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
          <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <Inbox size={18} className="text-blue-700" />
                <h1 className="text-xl font-extrabold tracking-tight text-gray-950">
                  Received from Residents
                </h1>
              </div>
              <p className="mt-1 text-sm font-medium text-gray-400">
                Review suggestions, bug reports, and commendations from the
                public portal.
              </p>
            </div>

            <span className="text-sm font-semibold text-gray-500">
              <span className="font-extrabold text-orange-500">
                {pendingCount}
              </span>{' '}
              pending review
            </span>
          </div>

          <FilterBar
            searchValue={search}
            searchPlaceholder="Search resident, message, email, or contact..."
            onSearchChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            className="mb-0 border-b border-gray-100 px-5 py-4 sm:px-6"
          >
            <Select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(
                  event.target.value as FeedbackCategory | ''
                );
                setCurrentPage(1);
              }}
              className="min-w-40 border-gray-200 py-2"
            >
              <option value="">All Categories</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
            </Select>

            <Select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as FeedbackStatus | '');
                setCurrentPage(1);
              }}
              className="min-w-40 border-gray-200 py-2"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </Select>

            <button
              type="button"
              onClick={() => {
                clearError();
                void refresh();
              }}
              disabled={loading}
              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600 disabled:opacity-50"
              aria-label="Refresh feedback"
            >
              <RefreshCw
                size={17}
                className={loading ? 'animate-spin' : ''}
              />
            </button>
          </FilterBar>

          {loading ? (
            <div className="py-16">
              <Spinner label="Loading resident feedback..." />
            </div>
          ) : feedback.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <UserRound size={32} className="mb-3 text-gray-300" />
              <p className="text-sm font-bold text-gray-500">
                No feedback matches the selected filters.
              </p>
            </div>
          ) : (
            <ul>
              {feedback.map((record) => (
                <FeedbackRow
                  key={record.id}
                  feedback={record}
                  saving={savingId === record.id}
                  onView={() => setViewFeedback(record)}
                  onStatusChange={(status) =>
                    void handleStatusChange(record, status)
                  }
                />
              ))}
            </ul>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 sm:px-6">
            <p className="text-xs text-gray-400">
              Showing {displayStart}-{displayEnd} of {count.toLocaleString()}{' '}
              entries
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
                disabled={safePage === 1 || loading}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-1 text-xs text-gray-500">
                {safePage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, safePage + 1))
                }
                disabled={safePage >= totalPages || loading}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </AdminLayout>

      {viewFeedback && (
        <FeedbackDetailsModal
          feedback={viewFeedback}
          saving={savingId === viewFeedback.id}
          onStatusChange={(status) =>
            void handleStatusChange(viewFeedback, status)
          }
          onClose={() => {
            if (!savingId) setViewFeedback(null);
          }}
        />
      )}
    </>
  );
}
