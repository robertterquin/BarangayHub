import { useState } from 'react';
import { X } from 'lucide-react';
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

const STATUS_STYLES: Record<AnnouncementStatus, string> = {
  published: 'bg-green-50 text-green-600 border border-green-200',
  scheduled: 'bg-blue-50 text-blue-600 border border-blue-200',
  draft: 'bg-gray-100 text-gray-500 border border-gray-200',
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

function StatusBadge({ status }: { status: AnnouncementStatus }) {
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
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
    <div className="flex items-center gap-2 flex-wrap">
      <button onClick={onEdit} className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
        Edit
      </button>
      {status === 'published' ? (
        <button onClick={onUnpublish} className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors">
          Unpublish
        </button>
      ) : (
        <button onClick={onPublish} className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors">
          Publish Now
        </button>
      )}
      <button onClick={onDelete} className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors">
        Delete
      </button>
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        <div className="bg-linear-to-r from-blue-800 to-blue-600 px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-2xl leading-tight">{title}</h2>
            <p className="text-blue-200 text-xs mt-1">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. Community Clean-up Drive - April 6"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              >
                <option value="">Select category</option>
                <option value="Event">Event</option>
                <option value="Program">Program</option>
                <option value="System">System</option>
                <option value="Health">Health</option>
                <option value="Advisory">Advisory</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date Posted</label>
              <input
                type="date"
                value={form.date_posted}
                onChange={(e) => handleChange('date_posted', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value as AnnouncementStatus)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </div>

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

        <div className="px-6 pb-5">
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
          >
            {isEdit ? 'Save Changes' : 'Add Announcement'}
          </button>
        </div>
      </div>
    </div>
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
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-gray-800 font-bold text-xl">Announcements</h1>
            <p className="text-gray-400 text-xs mt-1">{announcements.length} mock announcements ready for public posting</p>
          </div>
          <button
            onClick={() => setModal({ mode: 'add' })}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            + Post Announcement
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  {['TITLE', 'CATEGORY', 'DATE POSTED', 'STATUS', 'ACTIONS'].map((col) => (
                    <th
                      key={col}
                      className="text-left text-[11px] font-bold tracking-widest text-gray-500 uppercase px-4 py-3 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {announcements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">
                      No announcements yet. Post one to begin.
                    </td>
                  </tr>
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
                        <StatusBadge status={announcement.status} />
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
          </div>
        </div>
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
