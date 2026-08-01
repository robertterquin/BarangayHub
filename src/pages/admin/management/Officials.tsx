import { useState } from 'react';
import {
  AlertCircle,
  ImageIcon,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { ActionGroup, PageHeader, StatusBadge } from '../../../components/admin';
import { Button, Input, Modal, Select, Spinner } from '../../../components/ui';
import { useOfficials } from '../../../hooks/useOfficials';
import { AdminLayout } from '../../../layouts/AdminLayout';
import type {
  Official,
  OfficialAccent,
  OfficialInsert,
  OfficialUpdate,
} from '../../../types/database';
import { formatDate } from '../../../utils/formatters';

type OfficialModalMode = 'add' | 'edit';

interface OfficialFormState {
  initials: string;
  position: string;
  full_name: string;
  accent: OfficialAccent;
  photoFile: File | null;
  removePhoto: boolean;
  display_order: string;
  is_active: boolean;
  term_start: string;
  term_end: string;
}

interface OfficialModalState {
  mode: OfficialModalMode;
  official?: Official;
}

interface ServiceHistoryEntry {
  year: string;
  description: string;
  tone: OfficialAccent | 'green';
}

const PAGE_SIZE = 10;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const EMPTY_FORM: OfficialFormState = {
  initials: '',
  position: '',
  full_name: '',
  accent: 'blue',
  photoFile: null,
  removePhoto: false,
  display_order: '0',
  is_active: true,
  term_start: '',
  term_end: '',
};

const SERVICE_HISTORY: ServiceHistoryEntry[] = [
  {
    year: '2009',
    description: 'Barangay officials began active service in Barangay Daine II, Indang, Cavite.',
    tone: 'blue',
  },
  {
    year: '2026',
    description: 'Launch of BarangayHub - official online public portal for digital barangay services.',
    tone: 'green',
  },
];

const accentStyles: Record<
  OfficialAccent,
  { border: string; role: string; avatar: string; avatarText: string }
> = {
  gold: {
    border: 'border-t-yellow-400',
    role: 'text-amber-500',
    avatar: 'bg-amber-50 border-amber-200',
    avatarText: 'text-amber-600',
  },
  blue: {
    border: 'border-t-blue-600',
    role: 'text-blue-600',
    avatar: 'bg-blue-50 border-blue-200',
    avatarText: 'text-blue-600',
  },
};

const historyToneStyles: Record<
  ServiceHistoryEntry['tone'],
  { border: string; year: string }
> = {
  gold: {
    border: 'border-l-yellow-400',
    year: 'text-amber-500',
  },
  blue: {
    border: 'border-l-blue-500',
    year: 'text-blue-600',
  },
  green: {
    border: 'border-l-green-500',
    year: 'text-green-600',
  },
};

function createFormFromOfficial(official?: Official): OfficialFormState {
  if (!official) return EMPTY_FORM;

  return {
    initials: official.initials,
    position: official.position,
    full_name: official.full_name,
    accent: official.accent,
    photoFile: null,
    removePhoto: false,
    display_order: String(official.display_order),
    is_active: official.is_active,
    term_start: official.term_start ?? '',
    term_end: official.term_end ?? '',
  };
}

function OfficialCard({
  official,
  saving,
  deleting,
  onEdit,
  onToggleStatus,
  onRemove,
}: {
  official: Official;
  saving: boolean;
  deleting: boolean;
  onEdit: () => void;
  onToggleStatus: () => void;
  onRemove: () => void;
}) {
  const styles = accentStyles[official.accent];
  const term =
    official.term_start || official.term_end
      ? `${official.term_start ? formatDate(official.term_start) : 'Unspecified'} - ${
          official.term_end ? formatDate(official.term_end) : 'Present'
        }`
      : null;

  return (
    <article
      className={`flex min-h-60 flex-col rounded-xl border border-gray-200 ${styles.border} border-t-4 bg-white px-4 py-5 text-center shadow-sm shadow-slate-200/70 ${
        official.is_active ? '' : 'opacity-70'
      }`}
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        {official.photo_url ? (
          <img
            src={official.photo_url}
            alt={official.full_name}
            className="mb-4 h-14 w-14 rounded-full border-2 border-white object-cover shadow-md"
          />
        ) : (
          <div
            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 ${styles.avatar}`}
          >
            <span className={`text-sm font-extrabold ${styles.avatarText}`}>
              {official.initials}
            </span>
          </div>
        )}
        <p className={`text-[11px] font-extrabold uppercase tracking-wide ${styles.role}`}>
          {official.position}
        </p>
        <h2 className="mt-1 text-sm font-extrabold text-gray-950">
          {official.full_name}
        </h2>
        <StatusBadge
          label={official.is_active ? 'Active' : 'Inactive'}
          tone={official.is_active ? 'green' : 'gray'}
          className="mt-2"
        />
        {term && <p className="mt-2 text-[10px] font-medium text-gray-400">{term}</p>}
        <p className="mt-1 text-[10px] text-gray-400">
          Display order: {official.display_order}
        </p>
      </div>

      <ActionGroup className="mt-4 justify-center">
        <Button
          onClick={onEdit}
          variant="primary"
          size="sm"
          className="rounded-md bg-blue-50 text-[11px] text-blue-700 hover:bg-blue-100"
          disabled={saving || deleting}
        >
          Edit
        </Button>
        <Button
          onClick={onToggleStatus}
          variant="secondary"
          size="sm"
          className="rounded-md text-[11px]"
          disabled={saving || deleting}
        >
          {saving ? 'Saving...' : official.is_active ? 'Pause' : 'Activate'}
        </Button>
        <Button
          onClick={onRemove}
          variant="danger"
          size="sm"
          className="rounded-md text-[11px]"
          disabled={saving || deleting}
        >
          {deleting ? 'Removing...' : 'Remove'}
        </Button>
      </ActionGroup>
    </article>
  );
}

function ServiceHistoryRow({ entry }: { entry: ServiceHistoryEntry }) {
  const styles = historyToneStyles[entry.tone];

  return (
    <div
      className={`flex gap-5 rounded-lg border-l-4 ${styles.border} bg-slate-50 px-4 py-3`}
    >
      <span className={`w-10 shrink-0 text-xs font-extrabold ${styles.year}`}>
        {entry.year}
      </span>
      <p className="text-sm font-medium leading-relaxed text-slate-600">
        {entry.description}
      </p>
    </div>
  );
}

function OfficialModal({
  modal,
  saving,
  serviceError,
  onClose,
  onSave,
}: {
  modal: OfficialModalState;
  saving: boolean;
  serviceError: string | null;
  onClose: () => void;
  onSave: (form: OfficialFormState, official?: Official) => Promise<boolean>;
}) {
  const [form, setForm] = useState<OfficialFormState>(() =>
    createFormFromOfficial(modal.official)
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const isEdit = modal.mode === 'edit';

  function handleChange<K extends keyof OfficialFormState>(
    field: K,
    value: OfficialFormState[K]
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setValidationError(null);
  }

  function handlePhotoChange(file: File | null) {
    if (file && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setValidationError('Official photos must be JPG, PNG, or WebP files.');
      return;
    }
    if (file && file.size > MAX_PHOTO_SIZE) {
      setValidationError('Official photos must be 5 MB or smaller.');
      return;
    }
    setForm((previous) => ({
      ...previous,
      photoFile: file,
      removePhoto: false,
    }));
    setValidationError(null);
  }

  async function handleSubmit() {
    if (form.initials.trim().length < 1 || form.initials.trim().length > 4) {
      setValidationError('Initials must contain 1 to 4 characters.');
      return;
    }
    if (form.full_name.trim().length < 2) {
      setValidationError('Full name must contain at least 2 characters.');
      return;
    }
    if (form.position.trim().length < 2) {
      setValidationError('Position must contain at least 2 characters.');
      return;
    }
    if (
      form.term_start &&
      form.term_end &&
      form.term_end < form.term_start
    ) {
      setValidationError('Term end cannot be earlier than the term start.');
      return;
    }
    const displayOrder = Number(form.display_order);
    if (!Number.isInteger(displayOrder) || displayOrder < 0 || displayOrder > 32767) {
      setValidationError('Display order must be a whole number from 0 to 32767.');
      return;
    }

    await onSave(form, modal.official);
  }

  return (
    <Modal
      title={isEdit ? 'Edit Official' : 'Add Official'}
      subtitle={
        isEdit
          ? 'Update barangay official details'
          : 'Enter new barangay official information'
      }
      width="lg"
      onClose={onClose}
      footer={
        <Button
          onClick={() => void handleSubmit()}
          fullWidth
          size="lg"
          disabled={saving}
        >
          {saving && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {saving ? 'Saving Official...' : isEdit ? 'Save Changes' : 'Add Official'}
        </Button>
      }
    >
      {(validationError || serviceError) && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm font-medium text-red-700">
            {validationError || serviceError}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Initials"
          requiredMark
          value={form.initials}
          onChange={(event) =>
            handleChange('initials', event.target.value.toUpperCase())
          }
          placeholder="e.g. K8"
          maxLength={4}
          disabled={saving}
        />

        <Select
          label="Accent"
          value={form.accent}
          onChange={(event) =>
            handleChange('accent', event.target.value as OfficialAccent)
          }
          disabled={saving}
        >
          <option value="blue">Blue</option>
          <option value="gold">Gold</option>
        </Select>

        <Input
          label="Full Name"
          requiredMark
          value={form.full_name}
          onChange={(event) => handleChange('full_name', event.target.value)}
          placeholder="e.g. Hon. Maria L. Santos"
          containerClassName="sm:col-span-2"
          disabled={saving}
        />

        <Input
          label="Position / Committee"
          requiredMark
          value={form.position}
          onChange={(event) => handleChange('position', event.target.value)}
          placeholder="e.g. Kagawad - Agriculture"
          containerClassName="sm:col-span-2"
          disabled={saving}
        />

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">
            Official Photo
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 transition-colors hover:border-blue-400 hover:bg-blue-50">
            <ImageIcon size={22} className="text-blue-600" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-700">
                {form.photoFile?.name ||
                  (modal.official?.photo_url && !form.removePhoto
                    ? 'Replace current photo'
                    : 'Choose photo from computer')}
              </p>
              <p className="text-xs text-gray-400">JPG, PNG, or WebP up to 5 MB</p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={saving}
              onChange={(event) =>
                handlePhotoChange(event.target.files?.[0] ?? null)
              }
            />
          </label>

          {modal.official?.photo_url && !form.removePhoto && !form.photoFile && (
            <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 bg-gray-50 p-3">
                <img
                  src={modal.official.photo_url}
                  alt={modal.official.full_name}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <p className="text-xs font-medium text-gray-500">
                  Current official photo
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleChange('removePhoto', true)}
                className="w-full border-t border-gray-200 bg-white py-2 text-xs font-bold text-red-600 hover:bg-red-50"
              >
                Remove Current Photo
              </button>
            </div>
          )}

          {form.photoFile && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handlePhotoChange(null)}
              className="mt-2 text-xs font-bold text-red-600 underline"
            >
              Clear selected photo
            </button>
          )}
        </div>

        <Input
          label="Term Start"
          type="date"
          value={form.term_start}
          onChange={(event) => handleChange('term_start', event.target.value)}
          disabled={saving}
        />

        <Input
          label="Term End"
          type="date"
          min={form.term_start || undefined}
          value={form.term_end}
          onChange={(event) => handleChange('term_end', event.target.value)}
          disabled={saving}
        />

        <Input
          label="Display Order"
          type="number"
          min={0}
          max={32767}
          value={form.display_order}
          onChange={(event) => handleChange('display_order', event.target.value)}
          disabled={saving}
        />

        <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-700">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) => handleChange('is_active', event.target.checked)}
            className="h-4 w-4 accent-blue-600"
            disabled={saving}
          />
          Visible as an active official
        </label>
      </div>
    </Modal>
  );
}

export function Officials() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState<OfficialModalState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Official | null>(null);

  const {
    officials,
    count,
    activeCount,
    loading,
    saving,
    deletingId,
    error,
    clearError,
    refresh,
    addOfficial,
    editOfficial,
    removeOfficial,
  } = useOfficials({ page: currentPage, pageSize: PAGE_SIZE, search });

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const displayStart = count === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const displayEnd = Math.min(safePage * PAGE_SIZE, count);

  async function handleSaveOfficial(form: OfficialFormState, official?: Official) {
    const values = {
      initials: form.initials.trim().toUpperCase(),
      full_name: form.full_name.trim(),
      position: form.position.trim(),
      accent: form.accent,
      display_order: Number(form.display_order),
      is_active: form.is_active,
      term_start: form.term_start || null,
      term_end: form.term_end || null,
    };

    const result = official
      ? await editOfficial(
          official,
          values satisfies OfficialUpdate,
          form.photoFile,
          form.removePhoto
        )
      : await addOfficial(values satisfies OfficialInsert, form.photoFile);

    if (result.error) return false;
    setModal(null);
    if (!official) setCurrentPage(1);
    return true;
  }

  async function handleDeleteOfficial() {
    if (!deleteTarget) return;
    const result = await removeOfficial(deleteTarget);
    if (!result.error) {
      if (officials.length === 1 && safePage > 1) {
        setCurrentPage(safePage - 1);
      }
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <AdminLayout title="Barangay Officials">
        <section className="space-y-5">
          <PageHeader
            title="Barangay Officials - Daine II"
            subtitle={`${activeCount} active of ${count.toLocaleString()} registered officials`}
            action={
              <Button
                onClick={() => {
                  clearError();
                  setModal({ mode: 'add' });
                }}
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus size={16} />
                Add Official
              </Button>
            }
          />

          {error && !modal && !deleteTarget && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-red-700">Official operation failed</p>
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

          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search officials by name..."
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              className="rounded-lg border border-gray-200 bg-white p-2.5 text-gray-500 transition-colors hover:border-blue-300 hover:text-blue-600 disabled:opacity-50"
              aria-label="Refresh officials"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
              <Spinner label="Loading barangay officials..." />
            </div>
          ) : officials.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-400 shadow-sm">
              No officials match your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {officials.map((official) => (
                <OfficialCard
                  key={official.id}
                  official={official}
                  saving={saving}
                  deleting={deletingId === official.id}
                  onEdit={() => {
                    clearError();
                    setModal({ mode: 'edit', official });
                  }}
                  onToggleStatus={() =>
                    void editOfficial(official, {
                      is_active: !official.is_active,
                    })
                  }
                  onRemove={() => {
                    clearError();
                    setDeleteTarget(official);
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Showing {displayStart}-{displayEnd} of {count.toLocaleString()} officials
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage === 1 || loading}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
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
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm shadow-slate-200/70">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-extrabold text-gray-950">
                Service History & Platform
              </h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-600">
                Since 2009
              </span>
            </div>

            <div className="space-y-3 px-5 py-5">
              {SERVICE_HISTORY.map((entry) => (
                <ServiceHistoryRow key={entry.year} entry={entry} />
              ))}

              <p className="pt-1 text-sm font-medium leading-7 text-slate-600">
                Their platform focuses on transparent governance, digital public services,
                improved livelihood, safer streets, and better health and sanitation for
                every household in Barangay Daine II, Indang, Cavite.
              </p>
            </div>
          </section>
        </section>
      </AdminLayout>

      {modal && (
        <OfficialModal
          key={`${modal.mode}-${modal.official?.id ?? 'new'}`}
          modal={modal}
          saving={saving}
          serviceError={error}
          onClose={() => {
            if (!saving) {
              clearError();
              setModal(null);
            }
          }}
          onSave={handleSaveOfficial}
        />
      )}

      {deleteTarget && (
        <Modal
          title="Remove Barangay Official"
          subtitle={deleteTarget.full_name}
          width="sm"
          onClose={() => {
            if (!deletingId) {
              clearError();
              setDeleteTarget(null);
            }
          }}
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 size={22} />
            </div>
            <p className="text-sm font-bold text-gray-800">
              Permanently remove this official?
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Existing complaints will remain, but their assigned official link will be
              cleared. Use Pause instead if this is only temporary.
            </p>
            {error && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </p>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                disabled={Boolean(deletingId)}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                fullWidth
                disabled={Boolean(deletingId)}
                onClick={() => void handleDeleteOfficial()}
              >
                {deletingId ? 'Removing...' : 'Remove Official'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
