import { useState } from 'react';
import { Search, ChevronDown, X, UserPlus } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';

// ── Types ─────────────────────────────────────────────────────────────────────

type Gender = 'Male' | 'Female';
type CivilStatus = 'Single' | 'Married' | 'Widow' | 'Widower' | 'Separated';

interface ResidentRow {
  id: string;
  reference_id: string;
  full_name: string;
  address: string;
  gender: Gender;
  birthdate: string;
  civil_status: CivilStatus;
  contact_number: string;
  citizenship: string;
  is_voter: boolean;
  purok: string;
}

interface ResidentFormState {
  full_name: string;
  birthdate: string;
  address: string;
  purok: string;
  gender: Gender | '';
  civil_status: CivilStatus | '';
  contact_number: string;
  citizenship: string;
  is_voter: boolean;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_RESIDENTS: ResidentRow[] = [
  {
    id: '1',
    reference_id: 'BD2-2026-0001',
    full_name: 'Maria L. Santos',
    address: '123 Sampaguita St., Purok 2',
    gender: 'Female',
    birthdate: 'Mar 12, 1985',
    civil_status: 'Married',
    contact_number: '0912-XXX-XXXX',
    citizenship: 'Filipino',
    is_voter: true,
    purok: 'Purok 2',
  },
  {
    id: '2',
    reference_id: 'BD2-2026-0002',
    full_name: 'Juan B. dela Cruz',
    address: '45 Rizal St., Purok 1',
    gender: 'Male',
    birthdate: 'Jun 5, 1998',
    civil_status: 'Single',
    contact_number: '0917-XXX-XXXX',
    citizenship: 'Filipino',
    is_voter: true,
    purok: 'Purok 1',
  },
  {
    id: '3',
    reference_id: 'BD2-2026-0003',
    full_name: 'Ana C. Reyes',
    address: '78 Mabini St., Purok 4',
    gender: 'Female',
    birthdate: 'Sep 20, 1960',
    civil_status: 'Widow',
    contact_number: '0918-XXX-XXXX',
    citizenship: 'Filipino',
    is_voter: false,
    purok: 'Purok 4',
  },
  {
    id: '4',
    reference_id: 'BD2-2026-0004',
    full_name: 'Pedro M. Flores',
    address: '12 Bonifacio Ave., Purok 3',
    gender: 'Male',
    birthdate: 'Jan 15, 1979',
    civil_status: 'Married',
    contact_number: '0920-XXX-XXXX',
    citizenship: 'Filipino',
    is_voter: true,
    purok: 'Purok 3',
  },
  {
    id: '5',
    reference_id: 'BD2-2026-0005',
    full_name: 'Rosa T. Lim',
    address: '56 Aguinaldo Rd., Purok 6',
    gender: 'Female',
    birthdate: 'Apr 30, 2001',
    civil_status: 'Single',
    contact_number: '0909-XXX-XXXX',
    citizenship: 'Filipino',
    is_voter: false,
    purok: 'Purok 6',
  },
];

const PUROKS = ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'];
const PAGE_SIZE = 5;
const TOTAL_COUNT = 4821; // will reflect real DB total once connected

const EMPTY_FORM: ResidentFormState = {
  full_name: '',
  birthdate: '',
  address: '',
  purok: '',
  gender: '',
  civil_status: '',
  contact_number: '',
  citizenship: 'Filipino',
  is_voter: false,
};

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 cursor-pointer min-w-36"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

// ── Resident Modal ───────────────────────────────────────────────────────────

function ResidentModal({
  mode,
  resident,
  onClose,
}: {
  mode: 'add' | 'edit' | 'view';
  resident?: ResidentRow;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ResidentFormState>(
    resident
      ? {
          full_name: resident.full_name,
          birthdate: resident.birthdate,
          address: resident.address,
          purok: resident.purok,
          gender: resident.gender,
          civil_status: resident.civil_status,
          contact_number: resident.contact_number,
          citizenship: resident.citizenship,
          is_voter: resident.is_voter,
        }
      : EMPTY_FORM
  );

  const isView = mode === 'view';
  const title = mode === 'add' ? 'Add New Resident' : mode === 'edit' ? 'Edit Resident' : 'Resident Details';
  const subtitle = mode === 'add' ? 'Enter new resident information' : mode === 'edit' ? 'Update resident information' : 'Full resident information';

  function handleChange(field: keyof ResidentFormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Helper for view-mode field pairs
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
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">

        {/* Blue gradient header */}
        <div className="bg-linear-to-r from-blue-800 to-blue-600 px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">{title}</h2>
            <p className="text-blue-200 text-xs mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── VIEW MODE ── */}
        {isView && resident && (
          <div className="px-6 py-5">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <DetailField label="Full Name" value={resident.full_name} />
              <DetailField label="Gender" value={resident.gender} />
              <DetailField label="Date of Birth" value={resident.birthdate} />
              <DetailField label="Civil Status" value={resident.civil_status} />
              <DetailField label="Contact Number" value={resident.contact_number} />
              <DetailField label="Citizenship" value={resident.citizenship} />
              <DetailField label="Voter Status" value={resident.is_voter ? 'Voter' : 'Non-Voter'} />
              <div />
              <div className="col-span-2">
                <DetailField label="Complete Address" value={`${resident.address}, Brgy. Daine II`} />
              </div>
            </div>
          </div>
        )}

        {/* ── ADD / EDIT MODE ── */}
        {!isView && (
          <>
            <div className="px-6 py-5 grid grid-cols-2 gap-x-4 gap-y-4">

              {/* Full Name */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="e.g. Juan B. dela Cruz"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Birthdate */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Birthdate</label>
                <input
                  type="date"
                  value={form.birthdate}
                  onChange={(e) => handleChange('birthdate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                />
              </div>

              {/* Complete Address */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Complete Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="e.g. 123 Sampaguita St., Purok 2, Brgy. Daine II"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                />
              </div>

              {/* Civil Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Civil Status</label>
                <select
                  value={form.civil_status}
                  onChange={(e) => handleChange('civil_status', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                >
                  <option value="">Select status</option>
                  {(['Single', 'Married', 'Widow', 'Widower', 'Separated'] as CivilStatus[]).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Number</label>
                <input
                  type="text"
                  value={form.contact_number}
                  onChange={(e) => handleChange('contact_number', e.target.value)}
                  placeholder="09XX-XXX-XXXX"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                />
              </div>

              {/* Citizenship */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Citizenship</label>
                <input
                  type="text"
                  value={form.citizenship}
                  onChange={(e) => handleChange('citizenship', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                />
              </div>

              {/* Voter Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Voter Status</label>
                <select
                  value={form.is_voter ? 'Voter' : 'Non-Voter'}
                  onChange={(e) => handleChange('is_voter', e.target.value === 'Voter')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                >
                  <option value="Voter">Voter</option>
                  <option value="Non-Voter">Non-Voter</option>
                </select>
              </div>
            </div>

            {/* Save button */}
            <div className="px-6 pb-5">
              <button
                onClick={onClose}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
              >
                {mode === 'add' ? 'Add Resident' : 'Save Changes'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


// ── Page ──────────────────────────────────────────────────────────────────────

export function Residents() {
  const [search, setSearch] = useState('');
  const [purokFilter, setPurokFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [voterFilter, setVoterFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState<{ mode: 'add' | 'edit' | 'view'; resident?: ResidentRow } | null>(null);

  // Client-side filtering on mock data
  const filtered = MOCK_RESIDENTS.filter((r) => {
    const matchSearch =
      search === '' ||
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.reference_id.toLowerCase().includes(search.toLowerCase());
    const matchPurok = purokFilter === '' || r.purok === purokFilter;
    const matchGender = genderFilter === '' || r.gender === genderFilter;
    const matchVoter =
      voterFilter === '' ||
      (voterFilter === 'Voter' && r.is_voter) ||
      (voterFilter === 'Non-Voter' && !r.is_voter);
    return matchSearch && matchPurok && matchGender && matchVoter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  // For display: use real total count when filters are clear, otherwise filtered count
  const displayTotal =
    search === '' && purokFilter === '' && genderFilter === '' && voterFilter === ''
      ? TOTAL_COUNT
      : filtered.length;
  const displayStart = pageStart + 1;
  const displayEnd = Math.min(pageStart + PAGE_SIZE, filtered.length);

  function handlePageChange(dir: 'prev' | 'next') {
    setCurrentPage((p) => (dir === 'prev' ? Math.max(1, p - 1) : Math.min(totalPages, p + 1)));
  }

  return (
    <>
      <AdminLayout title="Resident Management">
        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-gray-800 font-bold text-xl">Resident Management</h1>
          <button
            onClick={() => setModal({ mode: 'add' })}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <UserPlus size={16} />
            + Add Resident
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <FilterSelect
            value={purokFilter}
            onChange={(v) => { setPurokFilter(v); setCurrentPage(1); }}
            options={PUROKS}
            placeholder="All Puroks"
          />
          <FilterSelect
            value={genderFilter}
            onChange={(v) => { setGenderFilter(v); setCurrentPage(1); }}
            options={['Male', 'Female']}
            placeholder="All Gender"
          />
          <FilterSelect
            value={voterFilter}
            onChange={(v) => { setVoterFilter(v); setCurrentPage(1); }}
            options={['Voter', 'Non-Voter']}
            placeholder="All Voter Status"
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  {['ID', 'FULL NAME', 'ADDRESS', 'GENDER', 'BIRTHDATE', 'CIVIL STATUS', 'CONTACT', 'CITIZENSHIP', 'VOTER', 'ACTIONS'].map((col) => (
                    <th
                      key={col}
                      className="text-left text-[11px] font-bold tracking-widest text-gray-600 uppercase px-4 py-3 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pageRows.length === 0 ? (
                  <tr>
                      <td colSpan={10} className="text-center text-gray-400 py-10 text-sm">
                      No residents match your search.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((r, i) => (
                    <tr
                      key={r.id}
                      className={`transition-colors hover:bg-blue-50 ${
                        i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      {/* ID */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-blue-600 font-mono text-xs font-bold">{r.reference_id}</span>
                      </td>
                      {/* Full Name */}
                      <td className="px-4 py-3">
                        <span className="text-gray-800 font-medium text-sm">{r.full_name}</span>
                      </td>
                      {/* Address */}
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-44">{r.address}</td>
                      {/* Gender */}
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{r.gender}</td>
                      {/* Birthdate */}
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{r.birthdate}</td>
                      {/* Civil Status */}
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{r.civil_status}</td>
                      {/* Contact */}
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{r.contact_number}</td>
                      {/* Citizenship */}
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{r.citizenship}</td>
                      {/* Voter badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.is_voter ? (
                          <span className="bg-green-50 text-green-600 border border-green-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                            Voter
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 border border-gray-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                            Non-Voter
                          </span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => setModal({ mode: 'view', resident: r })}
                            className="text-xs border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 rounded px-3 py-1 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setModal({ mode: 'edit', resident: r })}
                            className="text-xs border border-gray-200 text-gray-600 hover:border-yellow-400 hover:text-yellow-600 rounded px-3 py-1 transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-gray-400 text-xs">
              Showing {filtered.length === 0 ? 0 : displayStart}–{displayEnd} of {displayTotal.toLocaleString()} residents
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange('prev')}
                disabled={safeCurrentPage === 1}
                className="text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed rounded px-3 py-1.5 transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => handlePageChange('next')}
                disabled={safeCurrentPage >= totalPages}
                className="text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed rounded px-3 py-1.5 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>

      {/* Modal */}
      {modal && (
        <ResidentModal
          mode={modal.mode}
          resident={modal.resident}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
