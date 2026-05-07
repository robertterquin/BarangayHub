import { AdminLayout } from '../../../layouts/AdminLayout';

type OfficialAccent = 'gold' | 'blue';

interface BarangayOfficial {
  id: string;
  initials: string;
  role: string;
  name: string;
  accent: OfficialAccent;
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
  },
  {
    id: 'sk-chairperson',
    initials: 'SK',
    role: 'SK Chairperson',
    name: 'Hon. [SK Chair]',
    accent: 'blue',
  },
  {
    id: 'peace-order',
    initials: 'K1',
    role: 'Kagawad - Peace and Order',
    name: 'Hon. [Kagawad 1]',
    accent: 'blue',
  },
  {
    id: 'health',
    initials: 'K2',
    role: 'Kagawad - Health',
    name: 'Hon. [Kagawad 2]',
    accent: 'blue',
  },
  {
    id: 'education',
    initials: 'K3',
    role: 'Kagawad - Education',
    name: 'Hon. [Kagawad 3]',
    accent: 'blue',
  },
  {
    id: 'livelihood',
    initials: 'K4',
    role: 'Kagawad - Livelihood',
    name: 'Hon. [Kagawad 4]',
    accent: 'blue',
  },
  {
    id: 'infrastructure',
    initials: 'K5',
    role: 'Kagawad - Infrastructure',
    name: 'Hon. [Kagawad 5]',
    accent: 'blue',
  },
  {
    id: 'environment',
    initials: 'K6',
    role: 'Kagawad - Environment',
    name: 'Hon. [Kagawad 6]',
    accent: 'blue',
  },
  {
    id: 'gad',
    initials: 'K7',
    role: 'Kagawad - GAD',
    name: 'Hon. [Kagawad 7]',
    accent: 'blue',
  },
  {
    id: 'secretary',
    initials: 'BS',
    role: 'Barangay Secretary',
    name: 'Hon. [Secretary]',
    accent: 'blue',
  },
];

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

function OfficialCard({ official }: { official: BarangayOfficial }) {
  const styles = accentStyles[official.accent];

  return (
    <article
      className={`flex min-h-29 flex-col items-center justify-center rounded-xl border border-gray-200 ${styles.border} border-t-4 bg-white px-4 py-5 text-center shadow-sm shadow-slate-200/70`}
    >
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full border-2 ${styles.avatar}`}
      >
        <span className={`text-sm font-extrabold ${styles.avatarText}`}>{official.initials}</span>
      </div>
      <p className={`text-[11px] font-extrabold uppercase tracking-wide ${styles.role}`}>{official.role}</p>
      <h2 className="mt-1 text-sm font-extrabold text-gray-950">{official.name}</h2>
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

export function Officials() {
  return (
    <AdminLayout title="Barangay Officials">
      <section className="space-y-5">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-950">
            Barangay Officials - Daine II
          </h1>
          <p className="mt-0.5 text-sm font-medium text-slate-400">
            Indang, Cavite - In service since 2009
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {BARANGAY_OFFICIALS.map((official) => (
            <OfficialCard key={official.id} official={official} />
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
  );
}
