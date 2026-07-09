import { AlertCircle, CalendarDays, Shield, UserRound } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';
import { PublicPageShell } from '../../components/public';
import { Spinner } from '../../components/ui';
import { usePublicOfficials } from '../../hooks/usePublicOfficials';
import type { Official } from '../../types/database';
import { formatDate } from '../../utils/formatters';

function getInitials(name: string, fallback: string) {
  if (fallback.trim()) return fallback.trim().slice(0, 4).toUpperCase();

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function getTermText(official: Official) {
  if (!official.term_start && !official.term_end) return 'Current term';
  const start = official.term_start ? formatDate(official.term_start) : 'Unspecified';
  const end = official.term_end ? formatDate(official.term_end) : 'Present';
  return `${start} - ${end}`;
}

export function PublicOfficials() {
  const { officials, loading, error } = usePublicOfficials();

  return (
    <PublicLayout>
      <PublicPageShell
        eyebrow="Barangay Officials"
        title="Barangay Officials"
        description="Meet the active officials serving Barangay Daine II residents."
        icon={<Shield size={24} />}
      >
        <section className="mx-auto max-w-6xl space-y-5">
          <div className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-lg shadow-slate-200/80 ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">Active Barangay Officials</h2>
              <p className="mt-1 text-sm font-semibold text-slate-400">
                Displaying officials marked active in the admin portal.
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-black text-red-700">Officials could not be loaded</p>
                <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl bg-white py-16 shadow-lg shadow-slate-200/80 ring-1 ring-slate-100">
              <Spinner label="Loading barangay officials..." />
            </div>
          ) : officials.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50 p-10 text-center">
              <Shield className="mx-auto text-blue-700" size={44} />
              <h2 className="mt-4 text-2xl font-black text-slate-950">
                No active officials listed yet
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                Active barangay officials will appear here once they are added and enabled in the admin portal.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {officials.map((official) => (
                <OfficialCard key={official.id} official={official} />
              ))}
            </div>
          )}
        </section>
      </PublicPageShell>
    </PublicLayout>
  );
}

function OfficialCard({ official }: { official: Official }) {
  const accent =
    official.accent === 'gold'
      ? 'from-amber-400 to-yellow-500 text-amber-950'
      : 'from-blue-700 to-blue-500 text-white';

  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-200/80 ring-1 ring-slate-100">
      <div className={`h-3 bg-linear-to-r ${official.accent === 'gold' ? 'from-amber-400 to-yellow-500' : 'from-blue-700 to-blue-500'}`} />
      <div className="p-6 text-center">
        <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-blue-50 ring-4 ring-white shadow-lg shadow-slate-200">
          {official.photo_url ? (
            <img
              src={official.photo_url}
              alt={official.full_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className={`flex h-full w-full items-center justify-center bg-linear-to-br ${accent}`}>
              <span className="text-3xl font-black">
                {getInitials(official.full_name, official.initials)}
              </span>
            </div>
          )}
        </div>

        <span className="mt-5 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-700 ring-1 ring-blue-100">
          {official.position}
        </span>
        <h3 className="mt-3 text-2xl font-black leading-tight text-slate-950">
          {official.full_name}
        </h3>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-100">
          <div className="flex items-start gap-3">
            <CalendarDays size={18} className="mt-0.5 shrink-0 text-blue-700" />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-700">Term</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">{getTermText(official)}</p>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-3">
            <UserRound size={18} className="mt-0.5 shrink-0 text-blue-700" />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-700">Status</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Currently serving</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
