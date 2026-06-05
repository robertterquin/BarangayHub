import { useState } from 'react';
import { ActionGroup, PageHeader, StatusBadge } from '../../../components/admin';
import { Button, Input, Modal, Select, TableEmptyRow, TableHeader, TableShell } from '../../../components/ui';
import { AdminLayout } from '../../../layouts/AdminLayout';

type AnnouncementStatus = 'published' | 'scheduled' | 'draft';
type AnnouncementModalMode = 'add' | 'edit';

interface AnnouncementRow {
  id: string;
  title: string;
  category: string;
  date_posted: string;
  status: AnnouncementStatus;
  body: string;
}

interface AnnouncementFormState {
  title: string;
  category: string;
  date_posted: string;
  status: AnnouncementStatus;
  body: string;
}

interface AnnouncementModalState {
  mode: AnnouncementModalMode;
  announcement?: AnnouncementRow;
}

const MOCK_ANNOUNCEMENTS: AnnouncementRow[] = [
  {
    id: '1',
    title: 'Community Clean-up Drive - April 6',
    category: 'Event',
    date_posted: '2025-03-15',
    status: 'published',
    body: 'All residents are invited to join the community clean-up drive this April 6. Assembly will be at the barangay hall at 7:00 AM.',
  },
  {
    id: '2',
    title: 'Livelihood Skills Training - TESDA',
    category: 'Program',
    date_posted: '2025-01-20',
    status: 'published',
    body: 'TESDA livelihood skills training registration is now open for interested Barangay Daine II residents.',
  },
  {
    id: '3',
    title: 'Online Portal Now Live',
    category: 'System',
    date_posted: '2024-11-05',
    status: 'published',
    body: 'BarangayHub is now available for online document requests, tracking, announcements, and resident concerns.',
  },
  {
    id: '4',
    title: 'Senior Citizen Medical Mission',
    category: 'Health',
    date_posted: '2024-08-18',
    status: 'scheduled',
    body: 'A medical mission for senior citizens is scheduled at the barangay covered court. Please bring a valid ID and senior citizen card.',
  },
];

const EMPTY_FORM: AnnouncementFormState = {
  title: '',
  category: '',
  date_posted: new Date().toISOString().slice(0, 10),
  status: 'draft',
  body: '',
};

const STATUS_LABELS: Record<AnnouncementStatus, string> = {
  published: 'Published',
  scheduled: 'Scheduled',
  draft: 'Draft',
};

const STATUS_TONES: Record<AnnouncementStatus, 'green' | 'blue' | 'gray'> = {
  published: 'green',
  scheduled: 'blue',
  draft: 'gray',
};

function formatAnnouncementDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function createFormFromAnnouncement(announcement?: AnnouncementRow): AnnouncementFormState {
  if (!announcement) return EMPTY_FORM;

  return {
    title: announcement.title,
    category: announcement.category,
    date_posted: announcement.date_posted,
    status: announcement.status,
    body: announcement.body,
  };
}

function ActionButtons({
  status,
  onEdit,
  onPublish,
  onUnpublish,
  onDelete,
}: {
  status: AnnouncementStatus;
  onEdit: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
}) {
  return (
    <ActionGroup>
      <Button onClick={onEdit} variant="primary" size="sm" className="rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100">
        Edit
      </Button>
      {status === 'published' ? (
        <Button onClick={onUnpublish} variant="danger" size="sm" className="rounded-md">
          Unpublish
        </Button>
      ) : (
        <Button onClick={onPublish} variant="success" size="sm" className="rounded-md">
          Publish Now
        </Button>
      )}
      <Button onClick={onDelete} variant="danger" size="sm" className="rounded-md">
        Delete
      </Button>
    </ActionGroup>
  );
}

function AnnouncementModal({
  modal,
  onClose,
  onSave,
}: {
  modal: AnnouncementModalState;
  onClose: () => void;
  onSave: (form: AnnouncementFormState, announcementId?: string) => void;
}) {
  const [form, setForm] = useState<AnnouncementFormState>(
    createFormFromAnnouncement(modal.announcement)
  );

  const isEdit = modal.mode === 'edit';
  const title = isEdit ? 'Edit Announcement' : 'Add Announcement';
  const subtitle = isEdit ? 'Update announcement information' : 'Enter new announcement information';

  function handleChange<K extends keyof AnnouncementFormState>(field: K, value: AnnouncementFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    if (!form.title.trim() || !form.category.trim() || !form.body.trim()) return;
    onSave(form, modal.announcement?.id);
  }

  return (
    <Modal
      title={title}
      subtitle={subtitle}
      width="lg"
      onClose={onClose}
      footer={(
        <Button onClick={handleSubmit} size="lg" fullWidth>
          {isEdit ? 'Save Changes' : 'Add Announcement'}
        </Button>
      )}
    >
        <div className="space-y-4">
          <Input
              label="Title"
              requiredMark
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. Community Clean-up Drive - April 6"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Category"
                requiredMark
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <option value="">Select category</option>
                <option value="Event">Event</option>
                <option value="Program">Program</option>
                <option value="System">System</option>
                <option value="Health">Health</option>
                <option value="Advisory">Advisory</option>
              </Select>

              <Input
                label="Date Posted"
                type="date"
                value={form.date_posted}
                onChange={(e) => handleChange('date_posted', e.target.value)}
              />
          </div>

          <Select
              label="Status"
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value as AnnouncementStatus)}
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
          </Select>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Announcement Body <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.body}
              onChange={(e) => handleChange('body', e.target.value)}
              placeholder="Write the announcement details here..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 resize-none"
            />
          </div>
        </div>
    </Modal>
  );
}

export function Announcements() {
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>(MOCK_ANNOUNCEMENTS);
  const [modal, setModal] = useState<AnnouncementModalState | null>(null);

  function handleSaveAnnouncement(form: AnnouncementFormState, announcementId?: string) {
    if (announcementId) {
      setAnnouncements((rows) =>
        rows.map((row) =>
          row.id === announcementId
            ? {
                ...row,
                title: form.title.trim(),
                category: form.category,
                date_posted: form.date_posted,
                status: form.status,
                body: form.body.trim(),
              }
            : row
        )
      );
    } else {
      const newAnnouncement: AnnouncementRow = {
        id: String(Date.now()),
        title: form.title.trim(),
        category: form.category,
        date_posted: form.date_posted,
        status: form.status,
        body: form.body.trim(),
      };
      setAnnouncements((rows) => [newAnnouncement, ...rows]);
    }

    setModal(null);
  }

  function handleStatusChange(announcementId: string, status: AnnouncementStatus) {
    setAnnouncements((rows) =>
      rows.map((row) =>
        row.id === announcementId
          ? {
              ...row,
              status,
              date_posted: status === 'published' ? new Date().toISOString().slice(0, 10) : row.date_posted,
            }
          : row
      )
    );
  }

  function handleDeleteAnnouncement(announcementId: string) {
    setAnnouncements((rows) => rows.filter((row) => row.id !== announcementId));
  }

  return (
    <>
      <AdminLayout title="Announcements">
        <PageHeader
          title="Announcements"
          subtitle={`${announcements.length} mock announcements ready for public posting`}
          action={(
            <Button onClick={() => setModal({ mode: 'add' })} className="rounded-xl bg-blue-600 hover:bg-blue-700">
              + Post Announcement
            </Button>
          )}
        />

        <TableShell className="rounded-2xl">
            <table className="w-full text-sm">
              <TableHeader columns={['TITLE', 'CATEGORY', 'DATE POSTED', 'STATUS', 'ACTIONS']} />
              <tbody className="divide-y divide-gray-200">
                {announcements.length === 0 ? (
                  <TableEmptyRow colSpan={5} message="No announcements yet. Post one to begin." />
                ) : (
                  announcements.map((announcement) => (
                    <tr key={announcement.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-4">
                        <p className="text-gray-900 font-semibold">{announcement.title}</p>
                        <p className="text-gray-400 text-xs line-clamp-1 mt-0.5">{announcement.body}</p>
                      </td>
                      <td className="px-4 py-4 text-gray-700">{announcement.category}</td>
                      <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{formatAnnouncementDate(announcement.date_posted)}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge label={STATUS_LABELS[announcement.status]} tone={STATUS_TONES[announcement.status]} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <ActionButtons
                          status={announcement.status}
                          onEdit={() => setModal({ mode: 'edit', announcement })}
                          onPublish={() => handleStatusChange(announcement.id, 'published')}
                          onUnpublish={() => handleStatusChange(announcement.id, 'draft')}
                          onDelete={() => handleDeleteAnnouncement(announcement.id)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
        </TableShell>
      </AdminLayout>

      {modal && (
        <AnnouncementModal
          modal={modal}
          onClose={() => setModal(null)}
          onSave={handleSaveAnnouncement}
        />
      )}
    </>
  );
}
