import { useState } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';

// ── Types ─────────────────────────────────────────────────────────────────────

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
}

// ── Constants ─────────────────────────────────────────────────────────────────

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
const TOTAL_PENDING = 42;

// ── Mock data ─────────────────────────────────────────────────────────────────

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
  },
];

// ── FilterSelect ──────────────────────────────────────────────────────────────

function FilterSelect({
  value,
  onChange,
  placeholder,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 cursor-pointer min-w-36"
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────

const STATUS_BG: Record<RequestStatus, string> = {
  pending: 'bg-orange-50 text-orange-600 border border-orange-200',
  processing: 'bg-blue-50 text-blue-600 border border-blue-200',
  completed: 'bg-green-50 text-green-600 border border-green-200',
  rejected: 'bg-red-50 text-red-600 border border-red-200',
};

function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${STATUS_BG[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

// ── ActionButtons ─────────────────────────────────────────────────────────────

function ActionButtons({
  status,
  onView,
}: {
  status: RequestStatus;
  onView: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {status === 'pending' && (
        <>
          <button className="px-2.5 py-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors">
            Approve
          </button>
          <button className="px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors">
            Reject
          </button>
        </>
      )}
      {status === 'processing' && (
        <button className="px-2.5 py-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors">
          Complete
        </button>
      )}
      {status === 'completed' && (
        <button className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors">
          Print
        </button>
      )}
      {status === 'rejected' && (
        <button className="px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors">
          Reject
        </button>
      )}
      <button
        onClick={onView}
        className="px-2.5 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded hover:bg-gray-200 transition-colors"
      >
        View
      </button>
    </div>
  );
}

// ── View Modal ────────────────────────────────────────────────────────────────

function RequestViewModal({
  request,
  onClose,
}: {
  request: DocumentRequestRow;
  onClose: () => void;
}) {
  function DetailField({ label, value }: { label: string; value: string }) {
    return (
      <div>
        <p className="text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-gray-900 font-semibold text-sm">{value || '—'}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Blue gradient header */}
        <div className="bg-linear-to-r from-blue-800 to-blue-600 px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">Request Details</h2>
            <p className="text-blue-200 text-xs mt-0.5">Full document request information</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 grid grid-cols-2 gap-x-8 gap-y-4">
          <DetailField label="Reference No." value={request.ref_no} />
          <DetailField label="Status" value={STATUS_LABELS[request.status]} />
          <DetailField label="Resident" value={request.resident_name} />
          <DetailField label="Document Type" value={DOC_LABELS[request.document_type]} />
          <DetailField label="Date Requested" value={request.date_requested} />
          <DetailField label="Time" value={request.time_requested} />
          <DetailField label="Picked Up" value={request.picked_up_date ?? '—'} />
          <div />
          <div className="col-span-2">
            <DetailField label="Purpose" value={request.purpose} />
          </div>
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function DocumentRequests() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewRequest, setViewRequest] = useState<DocumentRequestRow | null>(null);

  const filtered = MOCK_REQUESTS.filter((r) => {
    const matchSearch =
      search === '' ||
      r.resident_name.toLowerCase().includes(search.toLowerCase()) ||
      r.ref_no.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === '' || r.document_type === typeFilter;
    const matchStatus = statusFilter === '' || r.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const displayStart = filtered.length === 0 ? 0 : pageStart + 1;
  const displayEnd = Math.min(pageStart + PAGE_SIZE, filtered.length);

  function handlePageChange(dir: 'prev' | 'next') {
    setCurrentPage((p) => (dir === 'prev' ? Math.max(1, p - 1) : Math.min(totalPages, p + 1)));
  }

  return (
    <>
      <AdminLayout title="Document Requests">
        {/* Page card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Card header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
            <h2 className="text-gray-900 font-bold text-base">Document Requests</h2>
            <span className="text-sm text-gray-500 font-medium">
              <span className="text-orange-400 font-bold">{TOTAL_PENDING}</span> pending
            </span>
          </div>

          {/* Search + filters */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search by name or ref no..."
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Type filter */}
            <FilterSelect
              value={typeFilter}
              onChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}
              placeholder="All Types"
            >
              {DOC_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </FilterSelect>

            {/* Status filter */}
            <FilterSelect
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
              placeholder="All Status"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </FilterSelect>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  {['REF NO.', 'RESIDENT', 'DOCUMENT', 'DATE REQUESTED', 'TIME', 'STATUS', 'PICKED UP', 'ACTIONS'].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">
                      No requests match your search.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50 transition-colors">
                      {/* Ref No */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-xs text-blue-600 font-semibold">{row.ref_no}</span>
                      </td>

                      {/* Resident */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-gray-800 font-medium">{row.resident_name}</span>
                      </td>

                      {/* Document */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                        {DOC_LABELS[row.document_type]}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                        {row.date_requested}
                      </td>

                      {/* Time */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                        {row.time_requested}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={row.status} />
                      </td>

                      {/* Picked Up */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {row.picked_up_date ?? '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <ActionButtons
                          status={row.status}
                          onView={() => setViewRequest(row)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {displayStart}–{displayEnd} of {filtered.length} requests
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange('prev')}
                disabled={safePage === 1}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500 px-1">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange('next')}
                disabled={safePage === totalPages}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>

      {/* View modal */}
      {viewRequest && (
        <RequestViewModal
          request={viewRequest}
          onClose={() => setViewRequest(null)}
        />
      )}
    </>
  );
}
