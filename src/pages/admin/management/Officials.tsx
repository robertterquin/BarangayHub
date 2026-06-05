import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { ActionGroup, PageHeader, StatusBadge } from '../../../components/admin';
import { Button, Input, Modal, Select } from '../../../components/ui';
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
        <StatusBadge label={official.is_active ? 'Active' : 'Inactive'} tone={official.is_active ? 'green' : 'gray'} />
      </div>

      <ActionGroup className="mt-4 justify-center">
        <Button onClick={onEdit} variant="primary" size="sm" className="rounded-md bg-blue-50 text-[11px] text-blue-700 hover:bg-blue-100">
          Edit
        </Button>
        <Button onClick={onToggleStatus} variant="secondary" size="sm" className="rounded-md text-[11px]">
          {official.is_active ? 'Pause' : 'Active'}
        </Button>
        <Button onClick={onRemove} variant="danger" size="sm" className="rounded-md text-[11px]">
          Remove
        </Button>
      </ActionGroup>
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
    <Modal
      title={isEdit ? 'Edit Official' : 'Add Official'}
      subtitle={isEdit ? 'Update barangay official details' : 'Enter new barangay official information'}
      width="md"
      onClose={onClose}
      footer={(
        <Button onClick={handleSubmit} fullWidth size="lg">
          {isEdit ? 'Save Changes' : 'Add Official'}
        </Button>
      )}
    >
        <div className="grid grid-cols-2 gap-4">
          <Input
              label="Initials"
              requiredMark
              value={form.initials}
              onChange={(e) => handleChange('initials', e.target.value.toUpperCase())}
              placeholder="e.g. K8"
              maxLength={4}
          />

          <Select
              label="Accent"
              value={form.accent}
              onChange={(e) => handleChange('accent', e.target.value as OfficialAccent)}
            >
              <option value="blue">Blue</option>
              <option value="gold">Gold</option>
          </Select>

          <Input
              label="Full Name"
              requiredMark
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Hon. Maria L. Santos"
              containerClassName="col-span-2"
          />

          <Input
              label="Position / Committee"
              requiredMark
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value)}
              placeholder="e.g. Kagawad - Agriculture"
              containerClassName="col-span-2"
          />

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
    </Modal>
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
          <PageHeader
            title="Barangay Officials - Daine II"
            subtitle={`${activeCount} active officials in service since 2009`}
            action={(
              <Button
              onClick={() => setModal({ mode: 'add' })}
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus size={16} />
              Add Official
              </Button>
            )}
          />

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
