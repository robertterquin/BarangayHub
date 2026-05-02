import { useState } from 'react';
import { X } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';

type AnnouncementStatus = 'published' | 'scheduled' | 'draft';

interface AnnouncementRow {
  id: string;
  title: string;
  category: string;
  date_posted: string;
  status: AnnouncementStatus;
}

interface AnnouncementFormState {
  title: string;
  category: string;
  date_posted: string;
  status: AnnouncementStatus;
  body: string;
}

const MOCK_ANNOUNCEMENTS: AnnouncementRow[] = [
  {
    id: '1',
    title: 'Community Clean-up Drive - April 6',
    category: 'Event',
    date_posted: 'Mar 15, 2025',
    status: 'published',
  },
  {
    id: '2',
    title: 'Livelihood Skills Training - TESDA',
    category: 'Program',
    date_posted: 'Jan 20, 2025',
    status: 'published',
  },
  {
    id: '3',
    title: 'Online Portal Now Live',
    category: 'System',
    date_posted: 'Nov 5, 2024',
    status: 'published',
  },
  {
    id: '4',
    title: 'Senior Citizen Medical Mission',
    category: 'Health',
    date_posted: 'Aug 18, 2024',
    status: 'scheduled',
  },
];

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

function StatusBadge({ status }: { status: AnnouncementStatus }) {
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function ActionButtons({ status }: { status: AnnouncementStatus }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
        Edit
      </button>
      {status === 'scheduled' ? (
        <button className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors">
          Publish Now
        </button>
      ) : (
        <button className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors">
          Unpublish
        </button>
      )}
      <button className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors">
        Delete
      </button>
    </div>
  );
}

const EMPTY_FORM: AnnouncementFormState = {
  title: '',
  category: '',
  date_posted: '',
  status: 'draft',
  body: '',
};

function AnnouncementModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [form, setForm] = useState<AnnouncementFormState>(EMPTY_FORM);

  function handleChange<K extends keyof AnnouncementFormState>(field: K, value: AnnouncementFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        <div className="bg-linear-to-r from-blue-800 to-blue-600 px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-2xl leading-tight">Add Announcement</h2>
            <p className="text-blue-200 text-xs mt-1">Enter new announcement information</p>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
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
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Announcement Body</label>
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
            onClick={onClose}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
          >
            Add Announcement
          </button>
        </div>
      </div>
    </div>
  );
}

export function Announcements() {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <>
      <AdminLayout title="Announcements">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-gray-800 font-bold text-xl">Announcements</h1>
          <button
            onClick={() => setIsAddOpen(true)}
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
                {MOCK_ANNOUNCEMENTS.map((announcement) => (
                  <tr key={announcement.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-4 text-gray-900 font-semibold">{announcement.title}</td>
                    <td className="px-4 py-4 text-gray-700">{announcement.category}</td>
                    <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{announcement.date_posted}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={announcement.status} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <ActionButtons status={announcement.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>

      {isAddOpen && <AnnouncementModal onClose={() => setIsAddOpen(false)} />}
    </>
  );
}
