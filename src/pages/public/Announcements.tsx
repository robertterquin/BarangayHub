import { AlertCircle, CalendarDays, ImageIcon, Megaphone } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';
import { PublicPageShell } from '../../components/public';
import { Spinner } from '../../components/ui';
import { usePublicAnnouncements } from '../../hooks/usePublicAnnouncements';
import type { Announcement } from '../../types/database';
import { formatDate } from '../../utils/formatters';

function getDisplayDate(announcement: Announcement) {
  return formatDate(announcement.published_at ?? announcement.created_at);
}

export function PublicAnnouncements() {
  const { announcements, loading, error } = usePublicAnnouncements(30);

  return (
    <PublicLayout>
      <PublicPageShell
        eyebrow="Announcements"
        title="Official barangay updates"
        description="Read published advisories, events, programs, and notices from Barangay Daine II."
        icon={<Megaphone size={24} />}
      >
        <section className="mx-auto max-w-5xl space-y-5">
          <div className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-lg shadow-slate-200/80 ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">Latest Announcements</h2>
              <p className="mt-1 text-sm font-semibold text-slate-400">
                Showing public announcements that are currently published.
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-black text-red-700">Announcements could not be loaded</p>
                <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl bg-white py-16 shadow-lg shadow-slate-200/80 ring-1 ring-slate-100">
              <Spinner label="Loading public announcements..." />
            </div>
          ) : announcements.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50 p-10 text-center">
              <Megaphone className="mx-auto text-blue-700" size={44} />
              <h2 className="mt-4 text-2xl font-black text-slate-950">
                No published announcements yet
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                Please check again soon for official advisories, events, programs, and barangay updates.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {announcements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-200/80 ring-1 ring-slate-100"
                >
                  <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
                    {announcement.image_url ? (
                      <img
                        src={announcement.image_url}
                        alt={announcement.title}
                        className="h-56 w-full object-cover lg:h-full"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center bg-blue-50 text-blue-700 lg:h-full">
                        <ImageIcon size={44} />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-700 ring-1 ring-blue-100">
                          {announcement.category}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <CalendarDays size={14} />
                          {getDisplayDate(announcement)}
                        </span>
                      </div>

                      <h3 className="mt-4 text-2xl font-black leading-tight text-slate-950">
                        {announcement.title}
                      </h3>
                      <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-7 text-slate-600">
                        {announcement.body}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </PublicPageShell>
    </PublicLayout>
  );
}
