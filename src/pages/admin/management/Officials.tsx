import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';

type OfficialAccent = 'gold' | 'blue';
type OfficialModalMode = 'add' | 'edit';

interface BarangayOfficial {
  id: string;
  initials: string;
  role: string;
  name: string;
  accent: OfficialAccent;
  is_active: boolean;
}

interface OfficialFormState {
  initials: string;
  role: string;
  name: string;
  accent: OfficialAccent;
  is_active: boolean;
}

interface OfficialModalState {
  mode: OfficialModalMode;
  official?: BarangayOfficial;
}

interface ServiceHistoryEntry {
  year: string;
  description: string;
  tone: OfficialAccent | 'green';
}

const BARANGAY_OFFICIALS: BarangayOfficial[] = [
  {
    id: 'punong-barangay',
    initials: 'PO',
    role: 'Punong Barangay',
    name: 'Hon. [Pangulo]',
    accent: 'gold',
    is_active: true,
  },
  {
    id: 'sk-chairperson',
    initials: 'SK',
    role: 'SK Chairperson',
    name: 'Hon. [SK Chair]',
    accent: 'blue',
    is_active: true,
  },
  {
    id: 'peace-order',
    initials: 'K1',
    role: 'Kagawad - Peace and Order',
    name: 'Hon. [Kagawad 1]',
    accent: 'blue',
    is_active: true,
  },
  {
    id: 'health',
    initials: 'K2',
    role: 'Kagawad - Health',
    name: 'Hon. [Kagawad 2]',
    accent: 'blue',
    is_active: true,
  },
  {
    id: 'education',
    initials: 'K3',
    role: 'Kagawad - Education',
    name: 'Hon. [Kagawad 3]',
    accent: 'blue',
    is_active: true,
  },
  {
    id: 'livelihood',
    initials: 'K4',
    role: 'Kagawad - Livelihood',
    name: 'Hon. [Kagawad 4]',
    accent: 'blue',
    is_active: true,
  },
  {
    id: 'infrastructure',
    initials: 'K5',
    role: 'Kagawad - Infrastructure',
    name: 'Hon. [Kagawad 5]',
    accent: 'blue',
    is_active: true,
  },
  {
    id: 'environment',
    initials: 'K6',
    role: 'Kagawad - Environment',
    name: 'Hon. [Kagawad 6]',
    accent: 'blue',
    is_active: true,
  },
  {
    id: 'gad',
    initials: 'K7',
    role: 'Kagawad - GAD',
    name: 'Hon. [Kagawad 7]',
    accent: 'blue',
    is_active: true,
  },
  {
    id: 'secretary',
    initials: 'BS',
    role: 'Barangay Secretary',
    name: 'Hon. [Secretary]',
    accent: 'blue',
    is_active: true,
  },
];

const EMPTY_FORM: OfficialFormState = {
  initials: '',
  role: '',
  name: '',
  accent: 'blue',
  is_active: true,
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

const accentStyles: Record<OfficialAccent, { border: string; role: string; avatar: string; avatarText: string }> = {
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

const historyToneStyles: Record<ServiceHistoryEntry['tone'], { border: string; year: string }> = {
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

function createFormFromOfficial(official?: BarangayOfficial): OfficialFormState {
  if (!official) return EMPTY_FORM;

  return {
    initials: official.initials,
    role: official.role,
    name: official.name,
    accent: official.accent,
    is_active: official.is_active,
  };
}

function OfficialCard({
  official,
  onEdit,
  onToggleStatus,
  onRemove,
}: {
  official: BarangayOfficial;
  onEdit: () => void;
  onToggleStatus: () => void;
  onRemove: () => void;
}) {
  const styles = accentStyles[official.accent];

  return (
    <article
      className={`flex min-h-45 flex-col rounded-xl border border-gray-200 ${styles.border} border-t-4 bg-white px-4 py-5 text-center shadow-sm shadow-slate-200/70 ${official.is_active ? '' : 'opacity-70'}`}
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full border-2 ${styles.avatar}`}
        >
          <span className={`text-sm font-extrabold ${styles.avatarText}`}>{official.initials}</span>
        </div>
        <p className={`text-[11px] font-extrabold uppercase tracking-wide ${styles.role}`}>{official.role}</p>
        <h2 className="mt-1 text-sm font-extrabold text-gray-950">{official.name}</h2>
        <span className={`mt-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${official.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
          {official.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5">
        <button onClick={onEdit} className="rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition-colors">
          Edit
        </button>
        <button onClick={onToggleStatus} className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-bold text-gray-600 hover:bg-gray-100 transition-colors">
          {official.is_active ? 'Pause' : 'Active'}
        </button>
        <button onClick={onRemove} className="rounded-md border border-red-100 bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 transition-colors">
          Remove
        </button>
      </div>
    </article>
  );
}

function ServiceHistoryRow({ entry }: { entry: ServiceHistoryEntry }) {
  const styles = historyToneStyles[entry.tone];

  return (
    <div className={`flex gap-5 rounded-lg border-l-4 ${styles.border} bg-slate-50 px-4 py-3`}>
      <span className={`w-10 shrink-0 text-xs font-extrabold ${styles.year}`}>{entry.year}</span>
      <p className="text-sm font-medium leading-relaxed text-slate-600">{entry.description}</p>
    </div>
  );
}

function OfficialModal({
  modal,
  onClose,
  onSave,
}: {
  modal: OfficialModalState;
  onClose: () => void;
  onSave: (form: OfficialFormState, officialId?: string) => void;
}) {
  const [form, setForm] = useState<OfficialFormState>(createFormFromOfficial(modal.official));
  const isEdit = modal.mode === 'edit';

  function handleChange<K extends keyof OfficialFormState>(field: K, value: OfficialFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    if (!form.name.trim() || !form.role.trim() || !form.initials.trim()) return;
    onSave(form, modal.official?.id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-linear-to-r from-blue-800 to-blue-600 px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold leading-tight text-white">{isEdit ? 'Edit Official' : 'Add Official'}</h2>
            <p className="mt-0.5 text-xs text-blue-200">{isEdit ? 'Update barangay official details' : 'Enter new barangay official information'}</p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 rounded-full p-1 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Initials <span className="text-red-500">*</span>
            </label>
            <input
              value={form.initials}
              onChange={(e) => handleChange('initials', e.target.value.toUpperCase())}
              placeholder="e.g. K8"
              maxLength={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Accent</label>
            <select
              value={form.accent}
              onChange={(e) => handleChange('accent', e.target.value as OfficialAccent)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            >
              <option value="blue">Blue</option>
              <option value="gold">Gold</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Hon. Maria L. Santos"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            />
          </div>

          <div className="col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Position / Committee <span className="text-red-500">*</span>
            </label>
            <input
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value)}
              placeholder="e.g. Kagawad - Agriculture"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            />
          </div>

          <label className="col-span-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            Active official
          </label>
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={handleSubmit}
            className="w-full rounded-lg bg-blue-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
          >
            {isEdit ? 'Save Changes' : 'Add Official'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Officials() {
  const [officials, setOfficials] = useState<BarangayOfficial[]>(BARANGAY_OFFICIALS);
  const [modal, setModal] = useState<OfficialModalState | null>(null);

  const activeCount = officials.filter((official) => official.is_active).length;

  function handleSaveOfficial(form: OfficialFormState, officialId?: string) {
    if (officialId) {
      setOfficials((rows) =>
        rows.map((row) =>
          row.id === officialId
            ? {
                ...row,
                initials: form.initials.trim().toUpperCase(),
                role: form.role.trim(),
                name: form.name.trim(),
                accent: form.accent,
                is_active: form.is_active,
              }
            : row
        )
      );
    } else {
      const newOfficial: BarangayOfficial = {
        id: `official-${Date.now()}`,
        initials: form.initials.trim().toUpperCase(),
        role: form.role.trim(),
        name: form.name.trim(),
        accent: form.accent,
        is_active: form.is_active,
      };
      setOfficials((rows) => [...rows, newOfficial]);
    }

    setModal(null);
  }

  function handleToggleStatus(officialId: string) {
    setOfficials((rows) =>
      rows.map((row) =>
        row.id === officialId ? { ...row, is_active: !row.is_active } : row
      )
    );
  }

  function handleRemoveOfficial(officialId: string) {
    setOfficials((rows) => rows.filter((row) => row.id !== officialId));
  }

  return (
    <>
      <AdminLayout title="Barangay Officials">
        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-gray-950">
                Barangay Officials - Daine II
              </h1>
              <p className="mt-0.5 text-sm font-medium text-slate-400">
                {activeCount} active officials in service since 2009
              </p>
            </div>

            <button
              onClick={() => setModal({ mode: 'add' })}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <UserPlus size={16} />
              Add Official
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {officials.map((official) => (
              <OfficialCard
                key={official.id}
                official={official}
                onEdit={() => setModal({ mode: 'edit', official })}
                onToggleStatus={() => handleToggleStatus(official.id)}
                onRemove={() => handleRemoveOfficial(official.id)}
              />
            ))}
          </div>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm shadow-slate-200/70">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-extrabold text-gray-950">Service History & Platform</h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-600">
                Since 2009
              </span>
            </div>

            <div className="space-y-3 px-5 py-5">
              {SERVICE_HISTORY.map((entry) => (
                <ServiceHistoryRow key={entry.year} entry={entry} />
              ))}

              <p className="pt-1 text-sm font-medium leading-7 text-slate-600">
                Their platform focuses on transparent governance, digital public services, improved
                livelihood, safer streets, and better health and sanitation for every household in
                Barangay Daine II, Indang, Cavite.
              </p>
            </div>
          </section>
        </section>
      </AdminLayout>

      {modal && (
        <OfficialModal
          modal={modal}
          onClose={() => setModal(null)}
          onSave={handleSaveOfficial}
        />
      )}
    </>
  );
}
