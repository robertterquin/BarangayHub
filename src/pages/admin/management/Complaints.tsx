import { useState } from 'react';
import { Paperclip } from 'lucide-react';
import { ActionGroup, DetailField, FilterBar, StatusBadge } from '../../../components/admin';
import { Button, Modal, Select } from '../../../components/ui';
import { AdminLayout } from '../../../layouts/AdminLayout';

type ComplaintStatus = 'open' | 'under_review' | 'resolved' | 'dismissed';
type Urgency = 'low' | 'medium' | 'high';

interface ComplaintRow {
  id: string;
  blotter_no: string;
  title: string;
  description: string;
  complainant_name: string;
  respondent_name: string;
  purok: string;
  date: string;
  status: ComplaintStatus;
  urgency: Urgency;
  assigned_officer: string | null;
  has_attachment: boolean;
}

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

const URGENCY_DOT: Record<Urgency, string> = {
  low: 'bg-blue-400',
  medium: 'bg-yellow-400',
  high: 'bg-red-500',
};

const URGENCY_LABEL: Record<Urgency, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const STATUS_OPTIONS: ComplaintStatus[] = ['open', 'under_review', 'resolved', 'dismissed'];
const URGENCY_OPTIONS: Urgency[] = ['low', 'medium', 'high'];

const MOCK_COMPLAINTS: ComplaintRow[] = [
  {
    id: '1',
    blotter_no: 'BLOTTER-2026-007',
    title: 'Noise Disturbance - Late Night Music',
    description: 'Complainant reports repeated loud music from neighboring residence past midnight. Second complaint this month from same address.',
    complainant_name: 'Roberto A. Cruz',
    respondent_name: 'Unknown Neighbor (123 Maliksi St.)',
    purok: 'Purok 3',
    date: 'April 4, 2026',
    status: 'open',
    urgency: 'medium',
    assigned_officer: null,
    has_attachment: false,
  },
  {
    id: '2',
    blotter_no: 'BLOTTER-2026-006',
    title: 'Illegal Dumping of Garbage',
    description: 'Resident reported individual dumping garbage on vacant lot at Sitio Masaya. Photos submitted. Violates Barangay Ordinance No. 2024-03.',
    complainant_name: 'Lorna B. Mendoza',
    respondent_name: 'Eduardo C. Villanueva',
    purok: 'Purok 5',
    date: 'April 2, 2026',
    status: 'under_review',
    urgency: 'high',
    assigned_officer: 'Kagawad - Environment',
    has_attachment: true,
  },
  {
    id: '3',
    blotter_no: 'BLOTTER-2026-005',
    title: 'Boundary Dispute - Fence Construction',
    description: 'Mediation conducted. Both parties agreed to surveyor-verified boundary. Resolved peacefully.',
    complainant_name: 'Marisol T. Aquino',
    respondent_name: 'Nestor D. Reyes',
    purok: 'Purok 1',
    date: 'March 28, 2026',
    status: 'resolved',
    urgency: 'low',
    assigned_officer: 'Barangay Secretary',
    has_attachment: false,
  },
  {
    id: '4',
    blotter_no: 'BLOTTER-2026-004',
    title: 'Physical Altercation - Barangay Road',
    description: 'Altercation between two residents near the barangay road. One party sustained minor injuries. Case referred to higher authorities.',
    complainant_name: 'Danilo P. Santos',
    respondent_name: 'Marco J. Torres',
    purok: 'Purok 2',
    date: 'March 20, 2026',
    status: 'under_review',
    urgency: 'high',
    assigned_officer: 'Kagawad - Peace and Order',
    has_attachment: true,
  },
  {
    id: '5',
    blotter_no: 'BLOTTER-2026-003',
    title: 'Stray Animals - Health Hazard',
    description: 'Multiple residents complained about stray animals causing health and safety hazards near the market area.',
    complainant_name: 'Concepcion R. Lim',
    respondent_name: 'N/A',
    purok: 'Purok 4',
    date: 'March 15, 2026',
    status: 'open',
    urgency: 'medium',
    assigned_officer: null,
    has_attachment: false,
  },
  {
    id: '6',
    blotter_no: 'BLOTTER-2026-002',
    title: 'Verbal Threat - Personal Dispute',
    description: 'Complainant alleges verbal threat made during a personal dispute over borrowed money. Mediation scheduled.',
    complainant_name: 'Elena G. Dela Cruz',
    respondent_name: 'Ramon F. Bautista',
    purok: 'Purok 6',
    date: 'March 10, 2026',
    status: 'dismissed',
    urgency: 'low',
    assigned_officer: null,
    has_attachment: false,
  },
];

function ComplaintViewModal({
  complaint,
  onClose,
}: {
  complaint: ComplaintRow;
  onClose: () => void;
}) {
  return (
    <Modal
      title="Complaint Details"
      subtitle={complaint.blotter_no}
      onClose={onClose}
      footer={(
        <Button onClick={onClose} variant="ghost" fullWidth>
          Close
        </Button>
      )}
    >
        <div className="space-y-4">
          <div>
            <p className="text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-0.5">Complaint Title</p>
            <p className="text-gray-900 font-bold text-base">{complaint.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <DetailField label="Date Filed" value={complaint.date} />
            <DetailField label="Purok" value={complaint.purok} />
            <DetailField label="Complainant" value={complaint.complainant_name} />
            <DetailField label="Respondent" value={complaint.respondent_name} />
            <DetailField label="Assigned Officer" value={complaint.assigned_officer ?? 'Unassigned'} />
            <div>
              <p className="text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-0.5">Urgency</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${URGENCY_DOT[complaint.urgency]}`} />
                <span className="text-gray-800 font-semibold text-sm">{URGENCY_LABEL[complaint.urgency]}</span>
              </div>
            </div>
            <div>
              <p className="text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-0.5">Status</p>
              <StatusBadge label={STATUS_LABELS[complaint.status]} tone={STATUS_TONES[complaint.status]} />
            </div>
          </div>

          <div>
            <p className="text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-0.5">Description</p>
            <p className="text-gray-700 text-sm leading-relaxed">{complaint.description}</p>
          </div>

          {complaint.has_attachment && (
            <div className="flex items-center gap-2 text-blue-600 text-xs font-medium">
              <Paperclip size={13} />
              <span>Attachment submitted</span>
            </div>
          )}
        </div>
    </Modal>
  );
}

function ComplaintCard({
  complaint,
  onView,
  onAssign,
  onStatusChange,
  onUrgencyChange,
}: {
  complaint: ComplaintRow;
  onView: () => void;
  onAssign: () => void;
  onStatusChange: (status: ComplaintStatus) => void;
  onUrgencyChange: (urgency: Urgency) => void;
}) {
  const borderColor = STATUS_BORDER[complaint.status];

  return (
    <div className={`bg-white border border-gray-200 border-l-4 ${borderColor} rounded-xl p-5 shadow-sm`}>
      <p className="text-gray-400 text-xs font-medium mb-1.5 tracking-wide">
        {complaint.blotter_no}
        <span className="mx-2">-</span>
        {complaint.date}
        <span className="mx-2">-</span>
        {complaint.purok}
      </p>

      <h3 className="text-gray-900 font-bold text-base mb-1.5 leading-snug">{complaint.title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{complaint.description}</p>

      <ActionGroup>
        <StatusBadge label={STATUS_LABELS[complaint.status]} tone={STATUS_TONES[complaint.status]} className="py-1" />

        <Select
          value={complaint.urgency}
          onChange={(e) => onUrgencyChange(e.target.value as Urgency)}
          className="min-w-32 border-gray-200 px-2 py-1 text-xs text-gray-500"
        >
          {URGENCY_OPTIONS.map((urgency) => (
            <option key={urgency} value={urgency}>{URGENCY_LABEL[urgency]} Priority</option>
          ))}
        </Select>

        {complaint.assigned_officer && (
          <span className="text-xs text-gray-400 font-medium">{complaint.assigned_officer}</span>
        )}

        {complaint.has_attachment && (
          <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
            <Paperclip size={11} />
            Attachment
          </span>
        )}

        <div className="flex-1" />

        <Button onClick={onView} variant="primary" size="sm" className="bg-blue-50 text-blue-600 hover:bg-blue-100">
          View
        </Button>
        {!complaint.assigned_officer && complaint.status !== 'resolved' && complaint.status !== 'dismissed' && (
          <Button onClick={onAssign} variant="secondary" size="sm">
            Assign Officer
          </Button>
        )}
        {complaint.status === 'open' && (
          <Button onClick={() => onStatusChange('under_review')} variant="warning" size="sm">
            Review
          </Button>
        )}
        {complaint.status === 'under_review' && (
          <Button onClick={() => onStatusChange('resolved')} variant="success" size="sm">
            Resolve
          </Button>
        )}
        {complaint.status !== 'dismissed' && complaint.status !== 'resolved' && (
          <Button onClick={() => onStatusChange('dismissed')} variant="danger" size="sm">
            Dismiss
          </Button>
        )}
      </ActionGroup>
    </div>
  );
}

export function Complaints() {
  const [complaints, setComplaints] = useState<ComplaintRow[]>(MOCK_COMPLAINTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [viewComplaint, setViewComplaint] = useState<ComplaintRow | null>(null);

  const filtered = complaints.filter((complaint) => {
    const matchSearch =
      search === '' ||
      complaint.title.toLowerCase().includes(search.toLowerCase()) ||
      complaint.blotter_no.toLowerCase().includes(search.toLowerCase()) ||
      complaint.complainant_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === '' || complaint.status === statusFilter;
    const matchUrgency = urgencyFilter === '' || complaint.urgency === urgencyFilter;
    return matchSearch && matchStatus && matchUrgency;
  });

  const activeCount = complaints.filter((complaint) => complaint.status === 'open' || complaint.status === 'under_review').length;

  function updateComplaint(id: string, updates: Partial<ComplaintRow>) {
    setComplaints((rows) => rows.map((row) => row.id === id ? { ...row, ...updates } : row));
    setViewComplaint((current) => current && current.id === id ? { ...current, ...updates } : current);
  }

  return (
    <>
      <AdminLayout title="Complaints / Blotter">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-gray-800 font-bold text-xl">Complaints / Blotter</h1>
          <span className="text-sm text-gray-500 font-medium">
            <span className="text-red-500 font-bold">{activeCount}</span> active
          </span>
        </div>

        <FilterBar
          searchValue={search}
          searchPlaceholder="Search by title, blotter no., or complainant..."
          onSearchChange={setSearch}
        >
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="min-w-36 border-gray-200 py-2">
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{STATUS_LABELS[status]}</option>
            ))}
          </Select>

          <Select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)} className="min-w-36 border-gray-200 py-2">
            <option value="">All Urgency</option>
            {URGENCY_OPTIONS.map((urgency) => (
              <option key={urgency} value={urgency}>{URGENCY_LABEL[urgency]} Priority</option>
            ))}
          </Select>
        </FilterBar>

        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-16 text-center text-gray-400 text-sm shadow-sm">
            No complaints match your search.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onView={() => setViewComplaint(complaint)}
                onAssign={() => updateComplaint(complaint.id, { assigned_officer: 'Barangay Secretary', status: 'under_review' })}
                onStatusChange={(status) => updateComplaint(complaint.id, { status })}
                onUrgencyChange={(urgency) => updateComplaint(complaint.id, { urgency })}
              />
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4">
          Showing {filtered.length} of {complaints.length} complaints
        </p>
      </AdminLayout>

      {viewComplaint && (
        <ComplaintViewModal complaint={viewComplaint} onClose={() => setViewComplaint(null)} />
      )}
    </>
  );
}
