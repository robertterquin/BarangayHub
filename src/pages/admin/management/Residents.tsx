import { useState } from 'react';
import { AlertCircle, RefreshCw, Trash2, UserPlus } from 'lucide-react';
import { DetailField, FilterBar, PageHeader, StatusBadge } from '../../../components/admin';
import {
  Button,
  Input,
  Modal,
  Select,
  Spinner,
  TableEmptyRow,
  TableHeader,
  TableShell,
} from '../../../components/ui';
import { useResidents, type ResidentFilters } from '../../../hooks/useResidents';
import { AdminLayout } from '../../../layouts/AdminLayout';
import type {
  CivilStatusType,
  GenderType,
  Resident,
  ResidentUpdate,
} from '../../../types/database';
import { formatDate } from '../../../utils/formatters';

interface ResidentFormState {
  full_name: string;
  birthdate: string;
  address: string;
  purok: string;
  gender: GenderType | '';
  civil_status: CivilStatusType | '';
  contact_number: string;
  citizenship: string;
  is_voter: boolean;
}

interface ResidentModalProps {
  mode: 'add' | 'edit' | 'view';
  resident?: Resident;
  saving: boolean;
  serviceError: string | null;
  onSave: (form: ResidentFormState, residentId?: string) => Promise<boolean>;
  onClose: () => void;
}

const PUROKS = ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'];
const PAGE_SIZE = 5;

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

const GENDER_LABELS: Record<GenderType, string> = {
  male: 'Male',
  female: 'Female',
};

const CIVIL_STATUS_LABELS: Record<CivilStatusType, string> = {
  single: 'Single',
  married: 'Married',
  widow: 'Widow',
  widower: 'Widower',
  separated: 'Separated',
};

function getInitialForm(resident?: Resident): ResidentFormState {
  if (!resident) return EMPTY_FORM;
  return {
    full_name: resident.full_name,
    birthdate: resident.birthdate,
    address: resident.address,
    purok: resident.purok,
    gender: resident.gender,
    civil_status: resident.civil_status,
    contact_number: resident.contact_number ?? '',
    citizenship: resident.citizenship,
    is_voter: resident.is_voter,
  };
}

function validateResident(form: ResidentFormState): string | null {
  if (form.full_name.trim().length < 2) return 'Full name must contain at least 2 characters.';
  if (!form.gender) return 'Please select a gender.';
  if (!form.birthdate) return 'Birthdate is required.';
  if (form.birthdate > new Date().toISOString().slice(0, 10)) return 'Birthdate cannot be in the future.';
  if (!form.civil_status) return 'Please select a civil status.';
  if (form.address.trim().length < 5) return 'Complete address must contain at least 5 characters.';
  if (!form.purok) return 'Please select a purok.';
  if (!form.citizenship.trim()) return 'Citizenship is required.';
  return null;
}

function ResidentModal({
  mode,
  resident,
  saving,
  serviceError,
  onSave,
  onClose,
}: ResidentModalProps) {
  const [form, setForm] = useState<ResidentFormState>(() => getInitialForm(resident));
  const [validationError, setValidationError] = useState<string | null>(null);
  const isView = mode === 'view';
  const title = mode === 'add' ? 'Add New Resident' : mode === 'edit' ? 'Edit Resident' : 'Resident Details';
  const subtitle =
    mode === 'add'
      ? 'Enter new resident information'
      : mode === 'edit'
        ? 'Update resident information'
        : resident?.reference_id;

  function handleChange(field: keyof ResidentFormState, value: string | boolean) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setValidationError(null);
  }

  async function handleSubmit() {
    const error = validateResident(form);
    if (error) {
      setValidationError(error);
      return;
    }

    await onSave(form, resident?.id);
  }

  return (
    <Modal title={title} subtitle={subtitle} width="xl" onClose={onClose}>
      {isView && resident ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <DetailField label="Reference ID" value={resident.reference_id} />
          <DetailField label="Full Name" value={resident.full_name} />
          <DetailField label="Gender" value={GENDER_LABELS[resident.gender]} />
          <DetailField label="Date of Birth" value={formatDate(resident.birthdate)} />
          <DetailField label="Civil Status" value={CIVIL_STATUS_LABELS[resident.civil_status]} />
          <DetailField label="Contact Number" value={resident.contact_number || 'Not provided'} />
          <DetailField label="Citizenship" value={resident.citizenship} />
          <DetailField label="Purok" value={resident.purok} />
          <DetailField label="Voter Status" value={resident.is_voter ? 'Voter' : 'Non-Voter'} />
          <DetailField label="Record Created" value={formatDate(resident.created_at)} />
          <div className="sm:col-span-2">
            <DetailField label="Complete Address" value={resident.address} />
          </div>
        </div>
      ) : (
        <>
          {(validationError || serviceError) && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm font-medium text-red-700">{validationError || serviceError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="resident-full-name"
              label="Full Name"
              requiredMark
              value={form.full_name}
              onChange={(event) => handleChange('full_name', event.target.value)}
              placeholder="e.g. Juan B. dela Cruz"
              containerClassName="sm:col-span-2"
              disabled={saving}
            />

            <Select
              id="resident-gender"
              label="Gender"
              requiredMark
              value={form.gender}
              onChange={(event) => handleChange('gender', event.target.value)}
              disabled={saving}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Select>

            <Input
              id="resident-birthdate"
              type="date"
              label="Birthdate"
              requiredMark
              max={new Date().toISOString().slice(0, 10)}
              value={form.birthdate}
              onChange={(event) => handleChange('birthdate', event.target.value)}
              disabled={saving}
            />

            <Input
              id="resident-address"
              label="Complete Address"
              requiredMark
              value={form.address}
              onChange={(event) => handleChange('address', event.target.value)}
              placeholder="e.g. 123 Sampaguita St., Brgy. Daine II"
              containerClassName="sm:col-span-2"
              disabled={saving}
            />

            <Select
              id="resident-purok"
              label="Purok"
              requiredMark
              value={form.purok}
              onChange={(event) => handleChange('purok', event.target.value)}
              disabled={saving}
            >
              <option value="">Select purok</option>
              {PUROKS.map((purok) => (
                <option key={purok} value={purok}>{purok}</option>
              ))}
            </Select>

            <Select
              id="resident-civil-status"
              label="Civil Status"
              requiredMark
              value={form.civil_status}
              onChange={(event) => handleChange('civil_status', event.target.value)}
              disabled={saving}
            >
              <option value="">Select status</option>
              {Object.entries(CIVIL_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>

            <Input
              id="resident-contact"
              label="Contact Number"
              value={form.contact_number}
              onChange={(event) => handleChange('contact_number', event.target.value)}
              placeholder="09XX-XXX-XXXX"
              disabled={saving}
            />

            <Input
              id="resident-citizenship"
              label="Citizenship"
              requiredMark
              value={form.citizenship}
              onChange={(event) => handleChange('citizenship', event.target.value)}
              disabled={saving}
            />

            <Select
              id="resident-voter-status"
              label="Voter Status"
              value={form.is_voter ? 'voter' : 'non_voter'}
              onChange={(event) => handleChange('is_voter', event.target.value === 'voter')}
              containerClassName="sm:col-span-2"
              disabled={saving}
            >
              <option value="voter">Voter</option>
              <option value="non_voter">Non-Voter</option>
            </Select>
          </div>

          <div className="pt-5">
            <Button type="button" onClick={() => void handleSubmit()} size="lg" fullWidth disabled={saving}>
              {saving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {saving ? 'Saving Resident...' : mode === 'add' ? 'Add Resident' : 'Save Changes'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

export function Residents() {
  const [search, setSearch] = useState('');
  const [purokFilter, setPurokFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState<GenderType | ''>('');
  const [voterFilter, setVoterFilter] = useState<ResidentFilters['voterStatus']>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState<{ mode: 'add' | 'edit' | 'view'; resident?: Resident } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Resident | null>(null);

  const filters: ResidentFilters = {
    search,
    purok: purokFilter,
    gender: genderFilter,
    voterStatus: voterFilter,
  };
  const {
    residents,
    count,
    loading,
    saving,
    error,
    clearError,
    refresh,
    addResident,
    editResident,
    removeResident,
  } = useResidents({ page: currentPage, pageSize: PAGE_SIZE, filters });

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const displayStart = count === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const displayEnd = Math.min(currentPage * PAGE_SIZE, count);

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setCurrentPage(1);
  }

  async function handleSaveResident(form: ResidentFormState, residentId?: string) {
    if (!form.gender || !form.civil_status) return false;

    const values = {
      full_name: form.full_name.trim(),
      birthdate: form.birthdate,
      address: form.address.trim(),
      purok: form.purok,
      gender: form.gender,
      civil_status: form.civil_status,
      contact_number: form.contact_number.trim() || null,
      citizenship: form.citizenship.trim(),
      is_voter: form.is_voter,
    };

    const result = residentId
      ? await editResident(residentId, values satisfies ResidentUpdate)
      : await addResident(values);

    if (result.error) return false;
    setModal(null);
    if (!residentId) setCurrentPage(1);
    return true;
  }

  async function handleDeleteResident() {
    if (!deleteTarget) return;
    const result = await removeResident(deleteTarget.id);
    if (!result.error) {
      if (residents.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      }
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <AdminLayout title="Resident Management">
        <PageHeader
          title="Resident Management"
          subtitle="Search, add, update, and maintain resident records."
          action={
            <Button
              onClick={() => {
                clearError();
                setModal({ mode: 'add' });
              }}
              className="rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus size={16} />
              Add Resident
            </Button>
          }
        />

        {error && !modal && !deleteTarget && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-red-700">Resident operation failed</p>
              <p className="text-xs font-medium text-red-600">{error}</p>
            </div>
            <button type="button" onClick={() => void refresh()} className="text-xs font-bold text-red-700 underline">
              Retry
            </button>
          </div>
        )}

        <FilterBar
          searchValue={search}
          searchPlaceholder="Search by name, ID, or purok..."
          onSearchChange={(value) => updateFilter(setSearch, value)}
        >
          <Select
            value={purokFilter}
            onChange={(event) => updateFilter(setPurokFilter, event.target.value)}
            className="min-w-36 border-gray-200 py-2"
          >
            <option value="">All Puroks</option>
            {PUROKS.map((purok) => <option key={purok} value={purok}>{purok}</option>)}
          </Select>
          <Select
            value={genderFilter}
            onChange={(event) => {
              setGenderFilter(event.target.value as GenderType | '');
              setCurrentPage(1);
            }}
            className="min-w-36 border-gray-200 py-2"
          >
            <option value="">All Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
          <Select
            value={voterFilter}
            onChange={(event) => {
              setVoterFilter(event.target.value as ResidentFilters['voterStatus']);
              setCurrentPage(1);
            }}
            className="min-w-40 border-gray-200 py-2"
          >
            <option value="">All Voter Status</option>
            <option value="voter">Voter</option>
            <option value="non_voter">Non-Voter</option>
          </Select>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600 disabled:opacity-50"
            aria-label="Refresh residents"
          >
            <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
          </button>
        </FilterBar>

        <TableShell>
          <table className="w-full text-sm">
            <TableHeader columns={['ID', 'FULL NAME', 'ADDRESS', 'GENDER', 'BIRTHDATE', 'CIVIL STATUS', 'CONTACT', 'CITIZENSHIP', 'VOTER', 'ACTIONS']} />
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16">
                    <Spinner label="Loading residents..." />
                  </td>
                </tr>
              ) : residents.length === 0 ? (
                <TableEmptyRow colSpan={10} message="No residents match the selected filters." />
              ) : (
                residents.map((resident, index) => (
                  <tr key={resident.id} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-mono text-xs font-bold text-blue-600">{resident.reference_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-800">{resident.full_name}</span>
                    </td>
                    <td className="max-w-44 px-4 py-3 text-xs text-gray-500">{resident.address}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600">{GENDER_LABELS[resident.gender]}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600">{formatDate(resident.birthdate)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600">{CIVIL_STATUS_LABELS[resident.civil_status]}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600">{resident.contact_number || 'N/A'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600">{resident.citizenship}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge label={resident.is_voter ? 'Voter' : 'Non-Voter'} tone={resident.is_voter ? 'green' : 'gray'} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => setModal({ mode: 'view', resident })} className="rounded border border-gray-200 px-3 py-1 text-xs text-gray-600 transition-colors hover:border-blue-400 hover:text-blue-600">
                          View
                        </button>
                        <button
                          onClick={() => {
                            clearError();
                            setModal({ mode: 'edit', resident });
                          }}
                          className="rounded border border-gray-200 px-3 py-1 text-xs text-gray-600 transition-colors hover:border-yellow-400 hover:text-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            clearError();
                            setDeleteTarget(resident);
                          }}
                          className="rounded border border-red-100 px-3 py-1 text-xs text-red-500 transition-colors hover:border-red-300 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <span className="text-xs text-gray-400">
              Showing {displayStart}-{displayEnd} of {count.toLocaleString()} residents
            </span>
            <div className="flex items-center gap-2">
              <span className="mr-1 text-xs font-medium text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1 || loading}
                className="rounded border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage >= totalPages || loading}
                className="rounded border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        </TableShell>
      </AdminLayout>

      {modal && (
        <ResidentModal
          key={`${modal.mode}-${modal.resident?.id ?? 'new'}`}
          mode={modal.mode}
          resident={modal.resident}
          saving={saving}
          serviceError={error}
          onSave={handleSaveResident}
          onClose={() => {
            if (!saving) {
              clearError();
              setModal(null);
            }
          }}
        />
      )}

      {deleteTarget && (
        <Modal
          title="Delete Resident"
          subtitle={deleteTarget.reference_id}
          width="sm"
          onClose={() => {
            if (!saving) {
              clearError();
              setDeleteTarget(null);
            }
          }}
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 size={22} />
            </div>
            <p className="text-sm font-bold text-gray-800">Delete {deleteTarget.full_name}?</p>
            <p className="mt-2 text-sm text-gray-500">
              This permanently removes the resident record. Related document requests will remain but lose their resident link.
            </p>
            {error && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </p>
            )}
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                disabled={saving}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                fullWidth
                disabled={saving}
                onClick={() => void handleDeleteResident()}
              >
                {saving ? 'Deleting...' : 'Delete Resident'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
