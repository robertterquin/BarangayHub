import { useState } from 'react';
import { AlertCircle, ImageIcon, Megaphone, RefreshCw, Trash2 } from 'lucide-react';
import { ActionGroup, FilterBar, PageHeader, StatusBadge } from '../../../components/admin';
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
import {
  useAnnouncements,
  type AnnouncementFilters,
} from '../../../hooks/useAnnouncements';
import { AdminLayout } from '../../../layouts/AdminLayout';
import type {
  Announcement,
  AnnouncementInsert,
  AnnouncementStatus,
  AnnouncementUpdate,
} from '../../../types/database';
import { formatDate } from '../../../utils/formatters';

type AnnouncementModalMode = 'add' | 'edit';

interface AnnouncementFormState {
  title: string;
  category: string;
  status: AnnouncementStatus;
  scheduled_for: string;
  body: string;
  imageFile: File | null;
  removeImage: boolean;
}

interface AnnouncementModalState {
  mode: AnnouncementModalMode;
  announcement?: Announcement;
}

interface AnnouncementFormPayload {
  values: AnnouncementInsert | AnnouncementUpdate;
  imageFile: File | null;
  removeImage: boolean;
}

const PAGE_SIZE = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const EMPTY_FORM: AnnouncementFormState = {
  title: '',
  category: '',
  status: 'draft',
  scheduled_for: '',
  body: '',
  imageFile: null,
  removeImage: false,
};

const STATUS_OPTIONS: AnnouncementStatus[] = [
  'draft',
  'scheduled',
  'published',
  'archived',
];

const STATUS_LABELS: Record<AnnouncementStatus, string> = {
  published: 'Published',
  scheduled: 'Scheduled',
  draft: 'Draft',
  archived: 'Archived',
};

const STATUS_TONES: Record<
  AnnouncementStatus,
  'green' | 'blue' | 'gray' | 'orange'
> = {
  published: 'green',
  scheduled: 'blue',
  draft: 'gray',
  archived: 'orange',
};

function toLocalDateTime(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function getAnnouncementDate(announcement: Announcement): string {
  if (announcement.status === 'published' && announcement.published_at) {
    return formatDate(announcement.published_at);
  }
  if (announcement.status === 'scheduled' && announcement.scheduled_for) {
    return formatDate(announcement.scheduled_for);
  }
  return formatDate(announcement.created_at);
}

function createFormFromAnnouncement(
  announcement?: Announcement
): AnnouncementFormState {
  if (!announcement) return EMPTY_FORM;
  return {
    title: announcement.title,
    category: announcement.category,
    status: announcement.status,
    scheduled_for: toLocalDateTime(announcement.scheduled_for),
    body: announcement.body,
    imageFile: null,
    removeImage: false,
  };
}

function ActionButtons({
  announcement,
  saving,
  deleting,
  onEdit,
  onStatusChange,
  onDelete,
}: {
  announcement: Announcement;
  saving: boolean;
  deleting: boolean;
  onEdit: () => void;
  onStatusChange: (status: AnnouncementStatus) => void;
  onDelete: () => void;
}) {
  return (
    <ActionGroup>
      <Button
        onClick={onEdit}
        variant="primary"
        size="sm"
        className="rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
        disabled={saving || deleting}
      >
        Edit
      </Button>
      {announcement.status === 'published' ? (
        <Button
          onClick={() => onStatusChange('draft')}
          variant="warning"
          size="sm"
          className="rounded-md"
          disabled={saving || deleting}
        >
          Unpublish
        </Button>
      ) : (
        <Button
          onClick={() => onStatusChange('published')}
          variant="success"
          size="sm"
          className="rounded-md"
          disabled={saving || deleting}
        >
          {saving ? 'Publishing...' : 'Publish Now'}
        </Button>
      )}
      {announcement.status !== 'archived' && (
        <Button
          onClick={() => onStatusChange('archived')}
          variant="secondary"
          size="sm"
          className="rounded-md"
          disabled={saving || deleting}
        >
          Archive
        </Button>
      )}
      <Button
        onClick={onDelete}
        variant="danger"
        size="sm"
        className="rounded-md"
        disabled={saving || deleting}
      >
        {deleting ? 'Deleting...' : 'Delete'}
      </Button>
    </ActionGroup>
  );
}

function AnnouncementModal({
  modal,
  saving,
  serviceError,
  onClose,
  onSave,
}: {
  modal: AnnouncementModalState;
  saving: boolean;
  serviceError: string | null;
  onClose: () => void;
  onSave: (
    payload: AnnouncementFormPayload,
    announcement?: Announcement
  ) => Promise<boolean>;
}) {
  const [form, setForm] = useState<AnnouncementFormState>(() =>
    createFormFromAnnouncement(modal.announcement)
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const isEdit = modal.mode === 'edit';
  const currentImage =
    !form.removeImage && !form.imageFile ? modal.announcement?.image_url : null;

  function handleChange<K extends keyof AnnouncementFormState>(
    field: K,
    value: AnnouncementFormState[K]
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setValidationError(null);
  }

  function handleImageChange(file: File | null) {
    if (file && file.size > MAX_IMAGE_SIZE) {
      setValidationError('Announcement images must be 5 MB or smaller.');
      return;
    }
    handleChange('imageFile', file);
    setForm((previous) => ({ ...previous, removeImage: false }));
  }

  async function handleSubmit() {
    if (form.title.trim().length < 3) {
      setValidationError('Title must contain at least 3 characters.');
      return;
    }
    if (form.category.trim().length < 2) {
      setValidationError('Please select an announcement category.');
      return;
    }
    if (form.body.trim().length < 10) {
      setValidationError('Announcement body must contain at least 10 characters.');
      return;
    }
    if (form.status === 'scheduled' && !form.scheduled_for) {
      setValidationError('Choose a date and time for the scheduled announcement.');
      return;
    }

    const values: AnnouncementInsert | AnnouncementUpdate = {
      title: form.title.trim(),
      category: form.category.trim(),
      body: form.body.trim(),
      status: form.status,
      scheduled_for:
        form.status === 'scheduled'
          ? new Date(form.scheduled_for).toISOString()
          : null,
      published_at:
        form.status === 'published'
          ? modal.announcement?.published_at ?? new Date().toISOString()
          : modal.announcement?.published_at ?? null,
    };

    await onSave(
      {
        values,
        imageFile: form.imageFile,
        removeImage: form.removeImage,
      },
      modal.announcement
    );
  }

  return (
    <Modal
      title={isEdit ? 'Edit Announcement' : 'Post Announcement'}
      subtitle={
        isEdit
          ? 'Update announcement information'
          : 'Create a public barangay announcement'
      }
      width="lg"
      onClose={onClose}
      footer={
        <Button onClick={() => void handleSubmit()} size="lg" fullWidth disabled={saving}>
          {saving && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {saving
            ? 'Saving Announcement...'
            : isEdit
              ? 'Save Changes'
              : 'Post Announcement'}
        </Button>
      }
    >
      <div className="space-y-4">
        {(validationError || serviceError) && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm font-medium text-red-700">
              {validationError || serviceError}
            </p>
          </div>
        )}

        <Input
          label="Title"
          requiredMark
          value={form.title}
          onChange={(event) => handleChange('title', event.target.value)}
          placeholder="e.g. Community Clean-up Drive"
          disabled={saving}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            label="Category"
            requiredMark
            value={form.category}
            onChange={(event) => handleChange('category', event.target.value)}
            disabled={saving}
          >
            <option value="">Select category</option>
            <option value="Event">Event</option>
            <option value="Program">Program</option>
            <option value="System">System</option>
            <option value="Health">Health</option>
            <option value="Advisory">Advisory</option>
          </Select>

          <Select
            label="Status"
            value={form.status}
            onChange={(event) =>
              handleChange('status', event.target.value as AnnouncementStatus)
            }
            disabled={saving}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </div>

        {form.status === 'scheduled' && (
          <Input
            label="Publish Date and Time"
            requiredMark
            type="datetime-local"
            min={toLocalDateTime(new Date().toISOString())}
            value={form.scheduled_for}
            onChange={(event) => handleChange('scheduled_for', event.target.value)}
            disabled={saving}
          />
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">
            Announcement Body <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.body}
            onChange={(event) => handleChange('body', event.target.value)}
            placeholder="Write the announcement details here..."
            rows={5}
            disabled={saving}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 disabled:opacity-60"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">
            Announcement Image
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 transition-colors hover:border-blue-400 hover:bg-blue-50">
            <ImageIcon size={22} className="text-blue-600" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-700">
                {form.imageFile?.name || (currentImage ? 'Replace current image' : 'Choose an image')}
              </p>
              <p className="text-xs text-gray-400">JPG, PNG, or WebP up to 5 MB</p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={saving}
              onChange={(event) => handleImageChange(event.target.files?.[0] ?? null)}
            />
          </label>

          {currentImage && (
            <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
              <img
                src={currentImage}
                alt="Current announcement"
                className="h-40 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleChange('removeImage', true)}
                disabled={saving}
                className="w-full border-t border-gray-200 bg-white py-2 text-xs font-bold text-red-600 hover:bg-red-50"
              >
                Remove Current Image
              </button>
            </div>
          )}

          {form.imageFile && (
            <button
              type="button"
              onClick={() => handleImageChange(null)}
              disabled={saving}
              className="mt-2 text-xs font-bold text-red-600 underline"
            >
              Clear selected image
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export function Announcements() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AnnouncementStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState<AnnouncementModalState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  const filters: AnnouncementFilters = {
    search,
    status: statusFilter,
  };
  const {
    announcements,
    count,
    loading,
    saving,
    deletingId,
    error,
    clearError,
    refresh,
    addAnnouncement,
    editAnnouncement,
    changeStatus,
    removeAnnouncement,
  } = useAnnouncements({ page: currentPage, pageSize: PAGE_SIZE, filters });

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const displayStart = count === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const displayEnd = Math.min(safePage * PAGE_SIZE, count);

  async function handleSaveAnnouncement(
    payload: AnnouncementFormPayload,
    announcement?: Announcement
  ) {
    const result = announcement
      ? await editAnnouncement(announcement, payload)
      : await addAnnouncement(payload);

    if (result.error) return false;
    setModal(null);
    if (!announcement) setCurrentPage(1);
    return true;
  }

  async function handleDeleteAnnouncement() {
    if (!deleteTarget) return;
    const result = await removeAnnouncement(deleteTarget);
    if (!result.error) {
      if (announcements.length === 1 && safePage > 1) {
        setCurrentPage(safePage - 1);
      }
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <AdminLayout title="Announcements">
        <PageHeader
          title="Announcements"
          subtitle={`${count.toLocaleString()} announcements in the barangay portal`}
          action={
            <Button
              onClick={() => {
                clearError();
                setModal({ mode: 'add' });
              }}
              className="rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              <Megaphone size={16} />
              Post Announcement
            </Button>
          }
        />

        {error && !modal && !deleteTarget && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-red-700">Announcement operation failed</p>
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
          searchPlaceholder="Search announcements by title..."
          onSearchChange={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
        >
          <Select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as AnnouncementStatus | '');
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
            aria-label="Refresh announcements"
          >
            <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
          </button>
        </FilterBar>

        <TableShell className="rounded-2xl">
          <table className="w-full text-sm">
            <TableHeader
              columns={['IMAGE', 'TITLE', 'CATEGORY', 'DISPLAY DATE', 'STATUS', 'ACTIONS']}
            />
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16">
                    <Spinner label="Loading announcements..." />
                  </td>
                </tr>
              ) : announcements.length === 0 ? (
                <TableEmptyRow
                  colSpan={6}
                  message="No announcements match the selected filters."
                />
              ) : (
                announcements.map((announcement) => (
                  <tr
                    key={announcement.id}
                    className="transition-colors hover:bg-blue-50"
                  >
                    <td className="px-4 py-3">
                      {announcement.image_url ? (
                        <img
                          src={announcement.image_url}
                          alt=""
                          className="h-12 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                          <ImageIcon size={18} />
                        </div>
                      )}
                    </td>
                    <td className="max-w-80 px-4 py-4">
                      <p className="font-semibold text-gray-900">{announcement.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">
                        {announcement.body}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{announcement.category}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                      {getAnnouncementDate(announcement)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <StatusBadge
                        label={STATUS_LABELS[announcement.status]}
                        tone={STATUS_TONES[announcement.status]}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <ActionButtons
                        announcement={announcement}
                        saving={saving}
                        deleting={deletingId === announcement.id}
                        onEdit={() => {
                          clearError();
                          setModal({ mode: 'edit', announcement });
                        }}
                        onStatusChange={(status) =>
                          void changeStatus(announcement, status)
                        }
                        onDelete={() => {
                          clearError();
                          setDeleteTarget(announcement);
                        }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <span className="text-xs text-gray-400">
              Showing {displayStart}-{displayEnd} of {count.toLocaleString()} announcements
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage === 1 || loading}
                className="rounded border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
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
                className="rounded border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        </TableShell>
      </AdminLayout>

      {modal && (
        <AnnouncementModal
          key={`${modal.mode}-${modal.announcement?.id ?? 'new'}`}
          modal={modal}
          saving={saving}
          serviceError={error}
          onClose={() => {
            if (!saving) {
              clearError();
              setModal(null);
            }
          }}
          onSave={handleSaveAnnouncement}
        />
      )}

      {deleteTarget && (
        <Modal
          title="Delete Announcement"
          subtitle={deleteTarget.title}
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
              Permanently delete this announcement?
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Its uploaded image will also be removed from storage.
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
                onClick={() => void handleDeleteAnnouncement()}
              >
                {deletingId ? 'Deleting...' : 'Delete Announcement'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
