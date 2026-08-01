import { useState } from 'react';
import { AlertCircle, Paperclip, RefreshCw, UserRoundCheck } from 'lucide-react';
import { ActionGroup, DetailField, FilterBar, StatusBadge } from '../../../components/admin';
import { Button, Modal, Select, Spinner } from '../../../components/ui';
import { useComplaints, type ComplaintFilters } from '../../../hooks/useComplaints';
import { AdminLayout } from '../../../layouts/AdminLayout';
import type {
  Complaint,
  ComplaintStatus,
  ComplaintUpdate,
  Official,
  UrgencyLevel,
} from '../../../types/database';
import { formatDate } from '../../../utils/formatters';

const PAGE_SIZE = 5;

const STATUS_LABELS: Record<ComplaintStatus, string> = {
  open: 'Active',
  under_review: 'Under Investigation',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
};

const STATUS_TONES: Record<ComplaintStatus, 'red' | 'yellow' | 'green' | 'gray'> = {
  open: 'red',
  under_review: 'yellow',
  resolved: 'green',
  dismissed: 'gray',
};

const STATUS_BORDER: Record<ComplaintStatus, string> = {
  open: 'border-l-red-500',
  under_review: 'border-l-yellow-400',
  resolved: 'border-l-green-500',
  dismissed: 'border-l-gray-400',
};

const URGENCY_DOT: Record<UrgencyLevel, string> = {
  low: 'bg-blue-400',
  medium: 'bg-yellow-400',
  high: 'bg-red-500',
};

const URGENCY_LABEL: Record<UrgencyLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const STATUS_OPTIONS: ComplaintStatus[] = [
  'open',
  'under_review',
  'resolved',
  'dismissed',
];
const URGENCY_OPTIONS: UrgencyLevel[] = ['low', 'medium', 'high'];

function getOfficialName(
  officialId: string | null,
  officials: Official[]
): string {
  if (!officialId) return 'Unassigned';
  const official = officials.find((item) => item.id === officialId);
  return official
    ? `${official.full_name} - ${official.position}`
    : 'Assigned official unavailable';
}

function ComplaintViewModal({
  complaint,
  officials,
  openingAttachment,
  onOpenAttachment,
  onClose,
}: {
  complaint: Complaint;
  officials: Official[];
  openingAttachment: boolean;
  onOpenAttachment: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      title="Complaint Details"
      subtitle={complaint.reference_id}
      width="lg"
      onClose={onClose}
      footer={
        <Button onClick={onClose} variant="ghost" fullWidth>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-600">
            Complaint Title
          </p>
          <p className="text-base font-bold text-gray-900">{complaint.title}</p>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <DetailField label="Date Filed" value={formatDate(complaint.submitted_at)} />
          <DetailField label="Purok" value={complaint.purok} />
          <DetailField label="Complainant" value={complaint.complainant_name} />
          <DetailField label="Respondent" value={complaint.respondent_name || 'Not provided'} />
          <DetailField label="Contact Number" value={complaint.complainant_contact} />
          <DetailField
            label="Assigned Official"
            value={getOfficialName(complaint.assigned_official_id, officials)}
          />
          <DetailField
            label="Incident Date"
            value={complaint.incident_date ? formatDate(complaint.incident_date) : 'Not provided'}
          />
          <DetailField
            label="Incident Location"
            value={complaint.incident_location || 'Not provided'}
          />
          <div>
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-600">
              Urgency
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${URGENCY_DOT[complaint.urgency]}`} />
              <span className="text-sm font-semibold text-gray-800">
                {URGENCY_LABEL[complaint.urgency]}
              </span>
            </div>
          </div>
          <div>
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-600">
              Status
            </p>
            <StatusBadge
              label={STATUS_LABELS[complaint.status]}
              tone={STATUS_TONES[complaint.status]}
            />
          </div>
          <div className="sm:col-span-2">
            <DetailField label="Complainant Address" value={complaint.complainant_address} />
          </div>
        </div>

        <div>
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-600">
            Description
          </p>
          <p className="text-sm leading-relaxed text-gray-700">{complaint.description}</p>
        </div>

        {complaint.resolution_notes && (
          <div>
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-600">
              Resolution Notes
            </p>
            <p className="text-sm leading-relaxed text-gray-700">
              {complaint.resolution_notes}
            </p>
          </div>
        )}

        {complaint.attachment_url && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={openingAttachment}
            onClick={onOpenAttachment}
          >
            <Paperclip size={13} />
            {openingAttachment ? 'Opening Attachment...' : 'Open Attachment'}
          </Button>
        )}
      </div>
    </Modal>
  );
}

function AssignOfficialModal({
  complaint,
  officials,
  saving,
  onAssign,
  onClose,
}: {
  complaint: Complaint;
  officials: Official[];
  saving: boolean;
  onAssign: (officialId: string) => void;
  onClose: () => void;
}) {
  const [officialId, setOfficialId] = useState(complaint.assigned_official_id ?? '');

  return (
    <Modal
      title="Assign Barangay Official"
      subtitle={complaint.reference_id}
      width="sm"
      onClose={onClose}
    >
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
          <UserRoundCheck size={22} />
        </div>
        <p className="mb-4 text-sm text-gray-500">
          Select the official responsible for reviewing this complaint.
        </p>
        <Select
          label="Barangay Official"
          value={officialId}
          onChange={(event) => setOfficialId(event.target.value)}
          disabled={saving}
        >
          <option value="">Select an official</option>
          {officials.map((official) => (
            <option key={official.id} value={official.id}>
              {official.full_name} - {official.position}
            </option>
          ))}
        </Select>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            fullWidth
            disabled={saving || !officialId}
            onClick={() => onAssign(officialId)}
          >
            {saving ? 'Assigning...' : 'Assign Official'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ComplaintCard({
  complaint,
  officials,
  saving,
  onView,
  onAssign,
  onStatusChange,
  onUrgencyChange,
}: {
  complaint: Complaint;
  officials: Official[];
  saving: boolean;
  onView: () => void;
  onAssign: () => void;
  onStatusChange: (status: ComplaintStatus) => void;
  onUrgencyChange: (urgency: UrgencyLevel) => void;
}) {
  const assignedOfficial = getOfficialName(complaint.assigned_official_id, officials);

  return (
    <div
      className={`rounded-xl border border-l-4 border-gray-200 ${STATUS_BORDER[complaint.status]} bg-white p-5 shadow-sm`}
    >
      <p className="mb-1.5 text-xs font-medium tracking-wide text-gray-400">
        {complaint.reference_id}
        <span className="mx-2">-</span>
        {formatDate(complaint.submitted_at)}
        <span className="mx-2">-</span>
        {complaint.purok}
      </p>

      <h3 className="mb-1.5 text-base font-bold leading-snug text-gray-900">
        {complaint.title}
      </h3>
      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-500">
        {complaint.description}
      </p>

      <ActionGroup>
        <StatusBadge
          label={STATUS_LABELS[complaint.status]}
          tone={STATUS_TONES[complaint.status]}
          className="py-1"
        />

        <Select
          value={complaint.urgency}
          onChange={(event) => onUrgencyChange(event.target.value as UrgencyLevel)}
          className="min-w-32 border-gray-200 px-2 py-1 text-xs text-gray-500"
          disabled={saving}
          aria-label={`Urgency for ${complaint.reference_id}`}
        >
          {URGENCY_OPTIONS.map((urgency) => (
            <option key={urgency} value={urgency}>
              {URGENCY_LABEL[urgency]} Priority
            </option>
          ))}
        </Select>

        {complaint.assigned_official_id && (
          <span className="max-w-52 truncate text-xs font-medium text-gray-400">
            {assignedOfficial}
          </span>
        )}

        {complaint.attachment_url && (
          <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
            <Paperclip size={11} />
            Attachment
          </span>
        )}

        <div className="flex-1" />

        <Button
          onClick={onView}
          variant="primary"
          size="sm"
          className="bg-blue-50 text-blue-600 hover:bg-blue-100"
        >
          View
        </Button>
        {complaint.status !== 'resolved' && complaint.status !== 'dismissed' && (
          <Button onClick={onAssign} variant="secondary" size="sm" disabled={saving}>
            {complaint.assigned_official_id ? 'Reassign' : 'Assign Officer'}
          </Button>
        )}
        {complaint.status === 'open' && (
          <Button
            onClick={() => onStatusChange('under_review')}
            variant="warning"
            size="sm"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Review'}
          </Button>
        )}
        {complaint.status === 'under_review' && (
          <Button
            onClick={() => onStatusChange('resolved')}
            variant="success"
            size="sm"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Resolve'}
          </Button>
        )}
        {complaint.status !== 'dismissed' && complaint.status !== 'resolved' && (
          <Button
            onClick={() => onStatusChange('dismissed')}
            variant="danger"
            size="sm"
            disabled={saving}
          >
            Dismiss
          </Button>
        )}
      </ActionGroup>
    </div>
  );
}

function getStatusUpdate(status: ComplaintStatus): ComplaintUpdate {
  const notes: Record<ComplaintStatus, string | null> = {
    open: null,
    under_review: null,
    resolved: 'Complaint reviewed and marked as resolved by the barangay office.',
    dismissed: 'Complaint dismissed after barangay review.',
  };
  return { status, resolution_notes: notes[status] };
}

export function Complaints() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | ''>('');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewComplaint, setViewComplaint] = useState<Complaint | null>(null);
  const [assignComplaint, setAssignComplaint] = useState<Complaint | null>(null);
  const [openingAttachment, setOpeningAttachment] = useState(false);

  const filters: ComplaintFilters = {
    search,
    status: statusFilter,
    urgency: urgencyFilter,
  };
  const {
    complaints,
    officials,
    count,
    activeCount,
    loading,
    savingId,
    error,
    clearError,
    refresh,
    saveComplaint,
    openAttachment,
  } = useComplaints({ page: currentPage, pageSize: PAGE_SIZE, filters });

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const displayStart = count === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const displayEnd = Math.min(safePage * PAGE_SIZE, count);

  async function handleUpdate(complaint: Complaint, updates: ComplaintUpdate) {
    const result = await saveComplaint(complaint.id, updates);
    if (!result.data) return;
    if (viewComplaint?.id === complaint.id) setViewComplaint(result.data);
    if (assignComplaint?.id === complaint.id) setAssignComplaint(null);
  }

  async function handleOpenAttachment(complaint: Complaint) {
    if (!complaint.attachment_url) return;
    setOpeningAttachment(true);
    await openAttachment(complaint.attachment_url);
    setOpeningAttachment(false);
  }

  return (
    <>
      <AdminLayout title="Complaints / Blotter">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Complaints / Blotter</h1>
          <span className="text-sm font-medium text-gray-500">
            <span className="font-bold text-red-500">{activeCount}</span> active
          </span>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-red-700">Complaint operation failed</p>
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

        <FilterBar
          searchValue={search}
          searchPlaceholder="Search by title, blotter no., or complainant..."
          onSearchChange={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
        >
          <Select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as ComplaintStatus | '');
              setCurrentPage(1);
            }}
            className="min-w-36 border-gray-200 py-2"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </Select>

          <Select
            value={urgencyFilter}
            onChange={(event) => {
              setUrgencyFilter(event.target.value as UrgencyLevel | '');
              setCurrentPage(1);
            }}
            className="min-w-36 border-gray-200 py-2"
          >
            <option value="">All Urgency</option>
            {URGENCY_OPTIONS.map((urgency) => (
              <option key={urgency} value={urgency}>
                {URGENCY_LABEL[urgency]} Priority
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
            aria-label="Refresh complaints"
          >
            <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
          </button>
        </FilterBar>

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
            <Spinner label="Loading complaints..." />
          </div>
        ) : complaints.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-400 shadow-sm">
            No complaints match the selected filters.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {complaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                officials={officials}
                saving={savingId === complaint.id}
                onView={() => setViewComplaint(complaint)}
                onAssign={() => {
                  clearError();
                  setAssignComplaint(complaint);
                }}
                onStatusChange={(status) =>
                  void handleUpdate(complaint, getStatusUpdate(status))
                }
                onUrgencyChange={(urgency) =>
                  void handleUpdate(complaint, { urgency })
                }
              />
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing {displayStart}-{displayEnd} of {count.toLocaleString()} complaints
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safePage === 1 || loading}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-1 text-xs text-gray-500">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage >= totalPages || loading}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </AdminLayout>

      {viewComplaint && (
        <ComplaintViewModal
          complaint={viewComplaint}
          officials={officials}
          openingAttachment={openingAttachment}
          onOpenAttachment={() => void handleOpenAttachment(viewComplaint)}
          onClose={() => setViewComplaint(null)}
        />
      )}

      {assignComplaint && (
        <AssignOfficialModal
          key={assignComplaint.id}
          complaint={assignComplaint}
          officials={officials}
          saving={savingId === assignComplaint.id}
          onAssign={(officialId) =>
            void handleUpdate(assignComplaint, {
              assigned_official_id: officialId,
              status:
                assignComplaint.status === 'open'
                  ? 'under_review'
                  : assignComplaint.status,
            })
          }
          onClose={() => {
            if (!savingId) setAssignComplaint(null);
          }}
        />
      )}
    </>
  );
}
