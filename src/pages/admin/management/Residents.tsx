import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { DetailField, FilterBar, PageHeader, StatusBadge } from '../../../components/admin';
import { Button, Modal, Select, TableEmptyRow, TableHeader, TableShell } from '../../../components/ui';
import { AdminLayout } from '../../../layouts/AdminLayout';

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
const TOTAL_COUNT = 4821;

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

function ResidentModal({
  mode,
  resident,
  onSave,
  onClose,
}: {
  mode: 'add' | 'edit' | 'view';
  resident?: ResidentRow;
  onSave: (form: ResidentFormState, residentId?: string) => void;
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

  function handleSubmit() {
    if (!form.full_name.trim() || !form.address.trim()) return;
    onSave(form, resident?.id);
  }

  return (
    <Modal title={title} subtitle={subtitle} onClose={onClose}>
        {isView && resident && (
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
        )}

        {!isView && (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
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

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Birthdate</label>
                <input
                  type="date"
                  value={form.birthdate}
                  onChange={(e) => handleChange('birthdate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                />
              </div>

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

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Purok</label>
                <select
                  value={form.purok}
                  onChange={(e) => handleChange('purok', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                >
                  <option value="">Select purok</option>
                  {PUROKS.map((purok) => (
                    <option key={purok} value={purok}>{purok}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Civil Status</label>
                <select
                  value={form.civil_status}
                  onChange={(e) => handleChange('civil_status', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                >
                  <option value="">Select status</option>
                  {(['Single', 'Married', 'Widow', 'Widower', 'Separated'] as CivilStatus[]).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

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

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Citizenship</label>
                <input
                  type="text"
                  value={form.citizenship}
                  onChange={(e) => handleChange('citizenship', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                />
              </div>

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

            <div className="pt-1">
              <Button
                onClick={handleSubmit}
                size="lg"
                fullWidth
              >
                {mode === 'add' ? 'Add Resident' : 'Save Changes'}
              </Button>
            </div>
          </>
        )}
    </Modal>
  );
}

export function Residents() {
  const [residents, setResidents] = useState<ResidentRow[]>(MOCK_RESIDENTS);
  const [search, setSearch] = useState('');
  const [purokFilter, setPurokFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [voterFilter, setVoterFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState<{ mode: 'add' | 'edit' | 'view'; resident?: ResidentRow } | null>(null);

  const filtered = residents.filter((resident) => {
    const matchSearch =
      search === '' ||
      resident.full_name.toLowerCase().includes(search.toLowerCase()) ||
      resident.reference_id.toLowerCase().includes(search.toLowerCase());
    const matchPurok = purokFilter === '' || resident.purok === purokFilter;
    const matchGender = genderFilter === '' || resident.gender === genderFilter;
    const matchVoter =
      voterFilter === '' ||
      (voterFilter === 'Voter' && resident.is_voter) ||
      (voterFilter === 'Non-Voter' && !resident.is_voter);
    return matchSearch && matchPurok && matchGender && matchVoter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const displayTotal =
    search === '' && purokFilter === '' && genderFilter === '' && voterFilter === ''
      ? TOTAL_COUNT
      : filtered.length;
  const displayStart = filtered.length === 0 ? 0 : pageStart + 1;
  const displayEnd = Math.min(pageStart + PAGE_SIZE, filtered.length);

  function handlePageChange(dir: 'prev' | 'next') {
    setCurrentPage((page) => (dir === 'prev' ? Math.max(1, page - 1) : Math.min(totalPages, page + 1)));
  }

  function handleSaveResident(form: ResidentFormState, residentId?: string) {
    if (residentId) {
      setResidents((rows) =>
        rows.map((row) =>
          row.id === residentId
            ? {
                ...row,
                full_name: form.full_name.trim(),
                birthdate: form.birthdate || row.birthdate,
                address: form.address.trim(),
                purok: form.purok || row.purok,
                gender: form.gender || row.gender,
                civil_status: form.civil_status || row.civil_status,
                contact_number: form.contact_number || 'N/A',
                citizenship: form.citizenship || 'Filipino',
                is_voter: form.is_voter,
              }
            : row
        )
      );
    } else {
      const nextNumber = residents.length + 1;
      const newResident: ResidentRow = {
        id: String(Date.now()),
        reference_id: `BD2-2026-${String(nextNumber).padStart(4, '0')}`,
        full_name: form.full_name.trim(),
        address: form.address.trim(),
        gender: form.gender || 'Male',
        birthdate: form.birthdate || 'Not set',
        civil_status: form.civil_status || 'Single',
        contact_number: form.contact_number || 'N/A',
        citizenship: form.citizenship || 'Filipino',
        is_voter: form.is_voter,
        purok: form.purok || 'Purok 1',
      };
      setResidents((rows) => [newResident, ...rows]);
      setCurrentPage(1);
    }
    setModal(null);
  }

  function handleDeleteResident(residentId: string) {
    setResidents((rows) => rows.filter((row) => row.id !== residentId));
  }

  return (
    <>
      <AdminLayout title="Resident Management">
        <PageHeader
          title="Resident Management"
          action={(
            <Button
            onClick={() => setModal({ mode: 'add' })}
            className="rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus size={16} />
              + Add Resident
            </Button>
          )}
        />

        <FilterBar
          searchValue={search}
          searchPlaceholder="Search by name or ID..."
          onSearchChange={(value) => { setSearch(value); setCurrentPage(1); }}
        >
          <Select value={purokFilter} onChange={(e) => { setPurokFilter(e.target.value); setCurrentPage(1); }} className="min-w-36 border-gray-200 py-2">
            <option value="">All Puroks</option>
            {PUROKS.map((purok) => <option key={purok} value={purok}>{purok}</option>)}
          </Select>
          <Select value={genderFilter} onChange={(e) => { setGenderFilter(e.target.value); setCurrentPage(1); }} className="min-w-36 border-gray-200 py-2">
            <option value="">All Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </Select>
          <Select value={voterFilter} onChange={(e) => { setVoterFilter(e.target.value); setCurrentPage(1); }} className="min-w-36 border-gray-200 py-2">
            <option value="">All Voter Status</option>
            <option value="Voter">Voter</option>
            <option value="Non-Voter">Non-Voter</option>
          </Select>
        </FilterBar>

        <TableShell>
            <table className="w-full text-sm">
              <TableHeader columns={['ID', 'FULL NAME', 'ADDRESS', 'GENDER', 'BIRTHDATE', 'CIVIL STATUS', 'CONTACT', 'CITIZENSHIP', 'VOTER', 'ACTIONS']} />
              <tbody className="divide-y divide-gray-200">
                {pageRows.length === 0 ? (
                  <TableEmptyRow colSpan={10} message="No residents match your search." />
                ) : (
                  pageRows.map((resident, index) => (
                    <tr key={resident.id} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-blue-600 font-mono text-xs font-bold">{resident.reference_id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-800 font-medium text-sm">{resident.full_name}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-44">{resident.address}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{resident.gender}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{resident.birthdate}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{resident.civil_status}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{resident.contact_number}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{resident.citizenship}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge label={resident.is_voter ? 'Voter' : 'Non-Voter'} tone={resident.is_voter ? 'green' : 'gray'} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <button onClick={() => setModal({ mode: 'view', resident })} className="text-xs border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 rounded px-3 py-1 transition-colors">
                            View
                          </button>
                          <button onClick={() => setModal({ mode: 'edit', resident })} className="text-xs border border-gray-200 text-gray-600 hover:border-yellow-400 hover:text-yellow-600 rounded px-3 py-1 transition-colors">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteResident(resident.id)} className="text-xs border border-red-100 text-red-500 hover:border-red-300 hover:bg-red-50 rounded px-3 py-1 transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-gray-400 text-xs">
              Showing {displayStart}-{displayEnd} of {displayTotal.toLocaleString()} residents
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange('prev')} disabled={safeCurrentPage === 1} className="text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed rounded px-3 py-1.5 transition-colors">
                Prev
              </button>
              <button onClick={() => handlePageChange('next')} disabled={safeCurrentPage >= totalPages} className="text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed rounded px-3 py-1.5 transition-colors">
                Next
              </button>
            </div>
          </div>
        </TableShell>
      </AdminLayout>

      {modal && (
        <ResidentModal
          mode={modal.mode}
          resident={modal.resident}
          onSave={handleSaveResident}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
