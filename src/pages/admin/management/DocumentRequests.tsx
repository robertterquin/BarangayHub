import { useState } from 'react';
import { ActionGroup, DetailField, FilterBar, StatusBadge } from '../../../components/admin';
import { Button, Modal, Select, TableEmptyRow, TableHeader, TableShell } from '../../../components/ui';
import { AdminLayout } from '../../../layouts/AdminLayout';

type RequestStatus = 'pending' | 'processing' | 'completed' | 'rejected';

type DocumentType =
  | 'barangay_clearance'
  | 'certificate_of_residency'
  | 'certificate_of_indigency'
  | 'business_clearance'
  | 'other';

interface DocumentRequestRow {
  id: string;
  ref_no: string;
  resident_name: string;
  document_type: DocumentType;
  date_requested: string;
  time_requested: string;
  status: RequestStatus;
  picked_up_date: string | null;
  purpose: string;
  notes: string;
}

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

const STATUS_OPTIONS: RequestStatus[] = ['pending', 'processing', 'completed', 'rejected'];

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  rejected: 'Rejected',
};

const PAGE_SIZE = 5;

const MOCK_REQUESTS: DocumentRequestRow[] = [
  {
    id: '1',
    ref_no: 'BD2-2026-0318',
    resident_name: 'Maria L. Santos',
    document_type: 'barangay_clearance',
    date_requested: 'Apr 4, 2026',
    time_requested: '9:02 AM',
    status: 'pending',
    picked_up_date: null,
    purpose: 'Employment requirement',
    notes: 'Waiting for barangay clearance validation.',
  },
  {
    id: '2',
    ref_no: 'BD2-2026-0317',
    resident_name: 'Juan B. dela Cruz',
    document_type: 'certificate_of_indigency',
    date_requested: 'Apr 4, 2026',
    time_requested: '10:15 AM',
    status: 'processing',
    picked_up_date: null,
    purpose: 'Hospital / medical assistance',
    notes: 'Verifying residency details.',
  },
  {
    id: '3',
    ref_no: 'BD2-2026-0316',
    resident_name: 'Ana C. Reyes',
    document_type: 'barangay_clearance',
    date_requested: 'Apr 3, 2026',
    time_requested: '8:45 AM',
    status: 'completed',
    picked_up_date: 'Apr 5, 2026',
    purpose: 'NBI clearance requirement',
    notes: 'Released at barangay hall.',
  },
  {
    id: '4',
    ref_no: 'BD2-2026-0315',
    resident_name: 'Pedro M. Flores',
    document_type: 'certificate_of_indigency',
    date_requested: 'Apr 3, 2026',
    time_requested: '2:30 PM',
    status: 'completed',
    picked_up_date: 'Apr 4, 2026',
    purpose: 'Scholarship requirement',
    notes: 'Released to resident.',
  },
  {
    id: '5',
    ref_no: 'BD2-2026-0314',
    resident_name: 'Rosa T. Lim',
    document_type: 'business_clearance',
    date_requested: 'Apr 2, 2026',
    time_requested: '11:00 AM',
    status: 'rejected',
    picked_up_date: null,
    purpose: 'Business permit application',
    notes: 'Missing supporting documents.',
  },
];

const STATUS_TONES: Record<RequestStatus, 'orange' | 'blue' | 'green' | 'red'> = {
  pending: 'orange',
  processing: 'blue',
  completed: 'green',
  rejected: 'red',
};

function ActionButtons({
  status,
  onStatusChange,
  onView,
}: {
  status: RequestStatus;
  onStatusChange: (status: RequestStatus) => void;
  onView: () => void;
}) {
  return (
    <ActionGroup className="gap-1.5">
      {status === 'pending' && (
        <>
          <Button onClick={() => onStatusChange('processing')} variant="success" size="sm" className="rounded">
            Approve
          </Button>
          <Button onClick={() => onStatusChange('rejected')} variant="danger" size="sm" className="rounded">
            Reject
          </Button>
        </>
      )}
      {status === 'processing' && (
        <Button onClick={() => onStatusChange('completed')} variant="success" size="sm" className="rounded">
          Complete
        </Button>
      )}
      {status === 'rejected' && (
        <Button onClick={() => onStatusChange('pending')} variant="warning" size="sm" className="rounded">
          Reopen
        </Button>
      )}
      {status === 'completed' && (
        <Button variant="primary" size="sm" className="rounded bg-blue-50 text-blue-700 hover:bg-blue-100">
          Print
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
  request: DocumentRequestRow;
  onClose: () => void;
}) {
  return (
    <Modal
      title="Request Details"
      subtitle={request.ref_no}
      width="sm"
      onClose={onClose}
      footer={(
        <Button onClick={onClose} variant="ghost" fullWidth>
          Close
        </Button>
      )}
    >
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <DetailField label="Reference No." value={request.ref_no} />
          <div>
            <p className="text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-0.5">Status</p>
            <StatusBadge label={STATUS_LABELS[request.status]} tone={STATUS_TONES[request.status]} />
          </div>
          <DetailField label="Resident" value={request.resident_name} />
          <DetailField label="Document Type" value={DOC_LABELS[request.document_type]} />
          <DetailField label="Date Requested" value={request.date_requested} />
          <DetailField label="Time" value={request.time_requested} />
          <DetailField label="Picked Up" value={request.picked_up_date ?? '-'} />
          <div />
          <div className="col-span-2">
            <DetailField label="Purpose" value={request.purpose} />
          </div>
          <div className="col-span-2">
            <DetailField label="Notes" value={request.notes} />
          </div>
        </div>
    </Modal>
  );
}

export function DocumentRequests() {
  const [requests, setRequests] = useState<DocumentRequestRow[]>(MOCK_REQUESTS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewRequest, setViewRequest] = useState<DocumentRequestRow | null>(null);

  const filtered = requests.filter((request) => {
    const matchSearch =
      search === '' ||
      request.resident_name.toLowerCase().includes(search.toLowerCase()) ||
      request.ref_no.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === '' || request.document_type === typeFilter;
    const matchStatus = statusFilter === '' || request.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const displayStart = filtered.length === 0 ? 0 : pageStart + 1;
  const displayEnd = Math.min(pageStart + PAGE_SIZE, filtered.length);
  const pendingCount = requests.filter((request) => request.status === 'pending').length;

  function handlePageChange(dir: 'prev' | 'next') {
    setCurrentPage((page) => (dir === 'prev' ? Math.max(1, page - 1) : Math.min(totalPages, page + 1)));
  }

  function handleStatusChange(requestId: string, status: RequestStatus) {
    setRequests((rows) =>
      rows.map((row) =>
        row.id === requestId
          ? {
              ...row,
              status,
              picked_up_date: status === 'completed' ? 'Apr 9, 2026' : null,
              notes:
                status === 'processing'
                  ? 'Approved and moved to processing.'
                  : status === 'completed'
                    ? 'Document completed and ready for release record.'
                    : status === 'rejected'
                      ? 'Rejected by admin review.'
                      : 'Request reopened for review.',
            }
          : row
      )
    );
    setViewRequest((current) => current && current.id === requestId ? { ...current, status } : current);
  }

  return (
    <>
      <AdminLayout title="Document Requests">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
            <h2 className="text-gray-900 font-bold text-base">Document Requests</h2>
            <span className="text-sm text-gray-500 font-medium">
              <span className="text-orange-400 font-bold">{pendingCount}</span> pending
            </span>
          </div>

          <FilterBar
            searchValue={search}
            searchPlaceholder="Search by name or ref no..."
            onSearchChange={(value) => { setSearch(value); setCurrentPage(1); }}
            className="mb-0 border-b border-gray-100 px-6 py-4"
          >
            <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }} className="min-w-36 border-gray-200 py-2">
              <option value="">All Types</option>
              {DOC_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>

            <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="min-w-36 border-gray-200 py-2">
              <option value="">All Status</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{STATUS_LABELS[status]}</option>
              ))}
            </Select>
          </FilterBar>

          <TableShell className="rounded-none border-0 shadow-none">
            <table className="w-full text-sm">
              <TableHeader columns={['REF NO.', 'RESIDENT', 'DOCUMENT', 'DATE REQUESTED', 'TIME', 'STATUS', 'PICKED UP', 'ACTIONS']} />
              <tbody className="divide-y divide-gray-200">
                {pageRows.length === 0 ? (
                  <TableEmptyRow colSpan={8} message="No requests match your search." />
                ) : (
                  pageRows.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-xs text-blue-600 font-semibold">{row.ref_no}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-gray-800 font-medium">{row.resident_name}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{DOC_LABELS[row.document_type]}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">{row.date_requested}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">{row.time_requested}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge label={STATUS_LABELS[row.status]} tone={STATUS_TONES[row.status]} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">{row.picked_up_date ?? '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <ActionButtons
                          status={row.status}
                          onStatusChange={(status) => handleStatusChange(row.id, status)}
                          onView={() => setViewRequest(row)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableShell>

          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {displayStart}-{displayEnd} of {filtered.length} requests
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange('prev')} disabled={safePage === 1} className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Previous
              </button>
              <span className="text-xs text-gray-500 px-1">{safePage} / {totalPages}</span>
              <button onClick={() => handlePageChange('next')} disabled={safePage === totalPages} className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
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
