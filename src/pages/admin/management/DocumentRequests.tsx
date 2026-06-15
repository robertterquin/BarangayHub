import { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ActionGroup, DetailField, FilterBar, StatusBadge } from '../../../components/admin';
import {
  Button,
  Modal,
  Select,
  Spinner,
  TableEmptyRow,
  TableHeader,
  TableShell,
} from '../../../components/ui';
import {
  useDocumentRequests,
  type DocumentRequestFilters,
} from '../../../hooks/useDocumentRequests';
import { AdminLayout } from '../../../layouts/AdminLayout';
import type {
  DocumentRequest,
  DocumentRequestUpdate,
  DocumentType,
  RequestStatus,
} from '../../../types/database';
import { formatDate } from '../../../utils/formatters';

const PAGE_SIZE = 5;

const DOC_LABELS: Record<DocumentType, string> = {
  barangay_clearance: 'Brgy. Clearance',
  certificate_of_residency: 'Cert. of Residency',
  certificate_of_indigency: 'Cert. of Indigency',
  business_clearance: 'Business Clearance',
  other: 'Other',
};

const DOC_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: 'barangay_clearance', label: 'Brgy. Clearance' },
  { value: 'certificate_of_residency', label: 'Cert. of Residency' },
  { value: 'certificate_of_indigency', label: 'Cert. of Indigency' },
  { value: 'business_clearance', label: 'Business Clearance' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS: RequestStatus[] = [
  'pending',
  'processing',
  'ready_for_pickup',
  'completed',
  'rejected',
];

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  ready_for_pickup: 'Ready for Pickup',
  completed: 'Completed',
  rejected: 'Rejected',
};

const STATUS_TONES: Record<
  RequestStatus,
  'orange' | 'blue' | 'green' | 'gray' | 'red'
> = {
  pending: 'orange',
  processing: 'blue',
  ready_for_pickup: 'green',
  completed: 'gray',
  rejected: 'red',
};

interface StatusTransition {
  label: string;
  status: RequestStatus;
  variant: 'success' | 'danger' | 'warning' | 'primary';
}

function getStatusTransition(status: RequestStatus): StatusTransition | null {
  const transitions: Record<RequestStatus, StatusTransition | null> = {
    pending: { label: 'Process', status: 'processing', variant: 'primary' },
    processing: {
      label: 'Mark Ready',
      status: 'ready_for_pickup',
      variant: 'success',
    },
    ready_for_pickup: { label: 'Complete', status: 'completed', variant: 'success' },
    completed: null,
    rejected: { label: 'Reopen', status: 'pending', variant: 'warning' },
  };
  return transitions[status];
}

function formatRequestTime(value: string): string {
  return new Date(value).toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getPickupDate(request: DocumentRequest): string {
  const value = request.picked_up_at ?? request.completed_at;
  return value ? formatDate(value) : '-';
}

function getDocumentLabel(request: DocumentRequest): string {
  if (request.document_type === 'other' && request.other_document_type) {
    return request.other_document_type;
  }
  return DOC_LABELS[request.document_type];
}

function getStatusNotes(
  status: RequestStatus
): Pick<
  DocumentRequestUpdate,
  'admin_notes' | 'public_status_note' | 'rejection_reason'
> {
  const notes: Record<
    RequestStatus,
    Pick<
      DocumentRequestUpdate,
      'admin_notes' | 'public_status_note' | 'rejection_reason'
    >
  > = {
    pending: {
      admin_notes: 'Request reopened for review.',
      public_status_note: 'Your request is pending review.',
      rejection_reason: null,
    },
    processing: {
      admin_notes: 'Request approved and moved to processing.',
      public_status_note: 'Your request is currently being processed.',
      rejection_reason: null,
    },
    ready_for_pickup: {
      admin_notes: 'Document prepared and ready for pickup.',
      public_status_note: 'Your document is ready for pickup at the barangay hall.',
      rejection_reason: null,
    },
    completed: {
      admin_notes: 'Document request completed.',
      public_status_note: 'Your document request has been completed.',
      rejection_reason: null,
    },
    rejected: {
      admin_notes: 'Request rejected during admin review.',
      public_status_note: 'Your request was rejected. Please contact the barangay office.',
      rejection_reason: 'Rejected during barangay review.',
    },
  };
  return notes[status];
}

function ActionButtons({
  request,
  saving,
  onStatusChange,
  onView,
}: {
  request: DocumentRequest;
  saving: boolean;
  onStatusChange: (status: RequestStatus) => void;
  onView: () => void;
}) {
  const transition = getStatusTransition(request.status);

  return (
    <ActionGroup className="gap-1.5">
      {transition && (
        <Button
          onClick={() => onStatusChange(transition.status)}
          variant={transition.variant}
          size="sm"
          className="rounded"
          disabled={saving}
        >
          {saving ? 'Saving...' : transition.label}
        </Button>
      )}
      {request.status === 'pending' && (
        <Button
          onClick={() => onStatusChange('rejected')}
          variant="danger"
          size="sm"
          className="rounded"
          disabled={saving}
        >
          Reject
        </Button>
      )}
      <Button onClick={onView} variant="secondary" size="sm" className="rounded">
        View
      </Button>
    </ActionGroup>
  );
}

function RequestViewModal({
  request,
  onClose,
}: {
  request: DocumentRequest;
  onClose: () => void;
}) {
  return (
    <Modal
      title="Request Details"
      subtitle={request.tracking_code}
      width="lg"
      onClose={onClose}
      footer={
        <Button onClick={onClose} variant="ghost" fullWidth>
          Close
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        <DetailField label="Reference No." value={request.tracking_code} />
        <div>
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-600">
            Status
          </p>
          <StatusBadge
            label={STATUS_LABELS[request.status]}
            tone={STATUS_TONES[request.status]}
          />
        </div>
        <DetailField label="Requester" value={request.requester_name} />
        <DetailField label="Document Type" value={getDocumentLabel(request)} />
        <DetailField label="Birthdate" value={formatDate(request.birthdate)} />
        <DetailField label="Contact Number" value={request.contact_number} />
        <DetailField label="Purok" value={request.purok} />
        <DetailField label="Email" value={request.email || 'Not provided'} />
        <DetailField label="Date Requested" value={formatDate(request.requested_at)} />
        <DetailField label="Time Requested" value={formatRequestTime(request.requested_at)} />
        <DetailField label="Ready Date" value={request.ready_at ? formatDate(request.ready_at) : '-'} />
        <DetailField label="Picked Up / Completed" value={getPickupDate(request)} />
        <div className="sm:col-span-2">
          <DetailField label="Address" value={request.address} />
        </div>
        <div className="sm:col-span-2">
          <DetailField label="Purpose" value={request.purpose} />
        </div>
        <div className="sm:col-span-2">
          <DetailField label="Admin Notes" value={request.admin_notes || 'No admin notes'} />
        </div>
        <div className="sm:col-span-2">
          <DetailField
            label="Public Status Note"
            value={request.public_status_note || 'No public status note'}
          />
        </div>
        {request.rejection_reason && (
          <div className="sm:col-span-2">
            <DetailField label="Rejection Reason" value={request.rejection_reason} />
          </div>
        )}
      </div>
    </Modal>
  );
}

export function DocumentRequests() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocumentType | ''>('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewRequest, setViewRequest] = useState<DocumentRequest | null>(null);

  const filters: DocumentRequestFilters = {
    search,
    documentType: typeFilter,
    status: statusFilter,
  };
  const {
    requests,
    count,
    pendingCount,
    loading,
    savingId,
    error,
    clearError,
    refresh,
    changeStatus,
  } = useDocumentRequests({ page: currentPage, pageSize: PAGE_SIZE, filters });

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const displayStart = count === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const displayEnd = Math.min(safePage * PAGE_SIZE, count);

  async function handleStatusChange(request: DocumentRequest, status: RequestStatus) {
    const result = await changeStatus(request.id, status, getStatusNotes(status));
    if (result.data && viewRequest?.id === request.id) {
      setViewRequest(result.data);
    }
  }

  return (
    <>
      <AdminLayout title="Document Requests">
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-red-700">Document request operation failed</p>
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

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 pb-4 pt-5">
            <h2 className="text-base font-bold text-gray-900">Document Requests</h2>
            <span className="text-sm font-medium text-gray-500">
              <span className="font-bold text-orange-400">{pendingCount}</span> pending
            </span>
          </div>

          <FilterBar
            searchValue={search}
            searchPlaceholder="Search by name or ref no..."
            onSearchChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            className="mb-0 border-b border-gray-100 px-6 py-4"
          >
            <Select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value as DocumentType | '');
                setCurrentPage(1);
              }}
              className="min-w-36 border-gray-200 py-2"
            >
              <option value="">All Types</option>
              {DOC_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as RequestStatus | '');
                setCurrentPage(1);
              }}
              className="min-w-40 border-gray-200 py-2"
            >
              <option value="">All Status</option>
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
              aria-label="Refresh document requests"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
            </button>
          </FilterBar>

          <TableShell className="rounded-none border-0 shadow-none">
            <table className="w-full text-sm">
              <TableHeader
                columns={[
                  'REF NO.',
                  'RESIDENT',
                  'DOCUMENT',
                  'DATE REQUESTED',
                  'TIME',
                  'STATUS',
                  'PICKED UP',
                  'ACTIONS',
                ]}
              />
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16">
                      <Spinner label="Loading document requests..." />
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <TableEmptyRow colSpan={8} message="No requests match the selected filters." />
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="transition-colors hover:bg-blue-50">
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-blue-600">
                          {request.tracking_code}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="font-medium text-gray-800">{request.requester_name}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                        {getDocumentLabel(request)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        {formatDate(request.requested_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        {formatRequestTime(request.requested_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <StatusBadge
                          label={STATUS_LABELS[request.status]}
                          tone={STATUS_TONES[request.status]}
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                        {getPickupDate(request)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <ActionButtons
                          request={request}
                          saving={savingId === request.id}
                          onStatusChange={(status) =>
                            void handleStatusChange(request, status)
                          }
                          onView={() => setViewRequest(request)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableShell>

          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
            <p className="text-xs text-gray-400">
              Showing {displayStart}-{displayEnd} of {count.toLocaleString()} requests
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage === 1 || loading}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-1 text-xs text-gray-500">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage >= totalPages || loading}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>

      {viewRequest && (
        <RequestViewModal request={viewRequest} onClose={() => setViewRequest(null)} />
      )}
    </>
  );
}
