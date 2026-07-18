import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  FileText,
  Home,
  Layers,
  Megaphone,
  Search,
  Send,
  X,
} from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';
import { getPublishedAnnouncements } from '../../services/publicService';
import type { Announcement } from '../../types/database';
import { usePublicDashboardSummary } from '../../hooks/usePublicDashboardSummary';
import { usePublicOfficials } from '../../hooks/usePublicOfficials';
import { usePublicSystemSettings } from '../../hooks/usePublicSystemSettings';
import { formatDate } from '../../utils/formatters';

const QUICK_SERVICES = [
  {
    title: 'Request Document',
    description: 'Apply for barangay certificates and clearances online.',
    to: '/request-document',
    icon: <FileText size={22} />,
  },
  {
    title: 'Track Request',
    description: 'Check your document request using your tracking code.',
    to: '/track-status',
    icon: <Search size={22} />,
  },
  {
    title: 'Submit Complaint',
    description: 'Send a complaint or blotter report to the barangay.',
    to: '/submit-complaint',
    icon: <Send size={22} />,
  },
];

function getAnnouncementDate(announcement: Announcement) {
  return formatDate(announcement.published_at ?? announcement.created_at);
}

function formatCount(value: number) {
  return new Intl.NumberFormat('en-PH').format(value);
}

export function LandingPage() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(null);
  const {
    summary,
    loading: summaryLoading,
    error: summaryError,
  } = usePublicDashboardSummary();
  const { officials, loading: officialsLoading, error: officialsError } = usePublicOfficials();
  const { settings, publicSettings } = usePublicSystemSettings();

  const barangayTitle = `Barangay ${publicSettings.barangayName}`;
  const municipality = settings?.municipality || 'Indang';
  const province = settings?.province || 'Cavite';
  const location = `${municipality}, ${province}`;
  const serviceSince = settings?.service_since ?? 2009;
  const serviceHistory = [
    {
      year: String(serviceSince),
      border: 'border-blue-600',
      text: `${barangayTitle} began active public service in ${location}.`,
    },
    {
      year: String(summary.year),
      border: 'border-emerald-500',
      text: `Launch of BarangayHub - official digital portal for ${barangayTitle} residents.`,
    },
  ];

  const stats = [
    {
      label: 'TOTAL RESIDENTS',
      value: summaryLoading ? '...' : formatCount(summary.total_residents),
      caption: `Registered - ${publicSettings.barangayName}`,
      accent: 'border-t-blue-600',
    },
    {
      label: 'DOCS ISSUED',
      value: summaryLoading ? '...' : formatCount(summary.documents_issued),
      caption: `Year ${summary.year}`,
      accent: 'border-t-yellow-400',
    },
    {
      label: 'ANNOUNCEMENTS',
      value: summaryLoading ? '...' : formatCount(summary.published_announcements),
      caption: 'Published updates',
      accent: 'border-t-emerald-500',
    },
    {
      label: 'SERVICES',
      value: summaryLoading ? '...' : formatCount(summary.online_services),
      caption: 'Available online',
      accent: 'border-t-red-500',
    },
    {
      label: 'PUROKS',
      value: summaryLoading ? '...' : formatCount(summary.residents_by_purok.length),
      caption: 'With resident records',
      accent: 'border-t-violet-500',
    },
  ];

  useEffect(() => {
    let isMounted = true;

    async function loadAnnouncements() {
      setAnnouncementsLoading(true);
      const { data, error } = await getPublishedAnnouncements(3);
      if (!isMounted) return;

      if (error) {
        setAnnouncements([]);
        setAnnouncementsError('Latest announcements are temporarily unavailable.');
      } else {
        setAnnouncements((data ?? []) as Announcement[]);
        setAnnouncementsError(null);
      }
      setAnnouncementsLoading(false);
    }

    void loadAnnouncements();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PublicLayout>
      <section className="min-h-[calc(100vh-86px)] w-full bg-[#f4f7fb]">
        <div className="relative min-h-143.75 overflow-hidden bg-linear-to-br from-[#14368f] via-[#105be2] to-[#3e9cff]">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.42) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.42) 1px, transparent 1px)',
              backgroundSize: '42px 42px',
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.08),transparent_32%),linear-gradient(90deg,rgba(0,0,0,0.18),transparent_55%)]" />

          <div className="relative flex min-h-143.75 flex-col items-center justify-center px-5 pb-16 pt-14 text-center text-white">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/40 bg-white/10 px-8 py-3 font-mono text-sm font-black tracking-[0.18em] text-blue-50 shadow-inner backdrop-blur-sm">
              <Home size={18} strokeWidth={2.5} />
              Official Barangay Portal
            </div>

            <h1 className="mt-12 text-5xl font-black leading-none tracking-tight text-white drop-shadow-sm sm:text-7xl lg:text-8xl">
              {barangayTitle}
            </h1>
            <p
              className="mt-2 text-5xl font-normal leading-none text-white drop-shadow-sm sm:text-7xl"
              style={{ fontFamily: '"Brush Script MT", "Segoe Script", cursive' }}
            >
              Online Services
            </p>

            <p className="mt-10 max-w-3xl text-xl font-semibold leading-9 text-blue-50 sm:text-2xl">
              Request certificates, stay updated with announcements, and{' '}
              <br className="hidden sm:block" />
              access barangay services - anytime, anywhere.
            </p>

            <button
              type="button"
              onClick={() => setAboutOpen(true)}
              className="mt-12 inline-flex min-w-56 items-center justify-center gap-3 rounded-2xl bg-white px-8 py-5 text-xl font-black text-blue-700 shadow-xl shadow-blue-950/20 transition-transform hover:-translate-y-0.5"
            >
              <span className="relative h-6 w-6">
                <span className="absolute left-0 top-1 h-3 w-3 rounded-sm bg-emerald-400" />
                <span className="absolute left-2 top-2 h-3 w-3 rounded-sm bg-red-400" />
                <span className="absolute left-4 top-3 h-3 w-3 rounded-sm bg-blue-500" />
              </span>
              Read More
            </button>
          </div>
        </div>

        <div className="grid gap-4 px-4 pb-8 pt-7 sm:grid-cols-2 lg:grid-cols-5 lg:px-6 xl:px-10">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className={`rounded-2xl border-t-4 ${stat.accent} bg-white px-6 py-6 shadow-lg shadow-slate-200/70 ring-1 ring-slate-100`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-sm font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <Layers className="h-4 w-4 text-slate-200" />
              </div>
              <p className="mt-3 text-4xl font-black leading-none tracking-tight text-black sm:text-5xl">{stat.value}</p>
              <p className="mt-3 font-mono text-sm font-bold text-slate-300">{stat.caption}</p>
            </article>
          ))}
        </div>

        <div className="px-4 pb-14 lg:px-6 xl:px-10">
          {summaryError && (
            <AnnouncementNotice message="Dashboard totals are temporarily unavailable. Showing fallback values." />
          )}

          <div className="grid gap-5 lg:grid-cols-3">
            {QUICK_SERVICES.map((service) => (
              <Link
                key={service.to}
                to={service.to}
                className="group flex items-start gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/80 ring-1 ring-slate-100 transition-transform hover:-translate-y-1"
              >
                <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                  {service.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-lg font-black text-slate-950">{service.title}</span>
                  <span className="mt-1 block text-sm font-semibold leading-6 text-slate-500">
                    {service.description}
                  </span>
                </span>
                <ArrowRight
                  size={18}
                  className="ml-auto mt-1 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-700"
                />
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <OverviewCard
              title="Total Residents by Purok"
              subtitle={`Registered residents per purok, ${barangayTitle}`}
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={summary.residents_by_purok} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e8eef8" />
                  <XAxis dataKey="purok" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#eff6ff' }} />
                  <Bar dataKey="residents" fill="#3f7ee8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </OverviewCard>

            <OverviewCard
              title={`Monthly Document Requests - ${summary.year}`}
              subtitle="Number of documents requested per month"
            >
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={summary.monthly_document_requests} margin={{ top: 12, right: 10, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e8eef8" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="requests"
                    stroke="#2563eb"
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </OverviewCard>
          </div>

          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="h-7 w-1 rounded-full bg-blue-700" />
                <h2 className="text-2xl font-black text-slate-950">Latest Announcements</h2>
              </div>
              <Link to="/announcements" className="text-sm font-black text-blue-700 hover:text-blue-900">
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {announcementsLoading && (
                <AnnouncementNotice message="Loading latest announcements..." />
              )}

              {!announcementsLoading && announcementsError && (
                <AnnouncementNotice message={announcementsError} />
              )}

              {!announcementsLoading && !announcementsError && announcements.length === 0 && (
                <AnnouncementNotice message="No published announcements yet. Please check again soon." />
              )}

              {!announcementsLoading &&
                !announcementsError &&
                announcements.map((announcement) => (
                  <article
                    key={announcement.id}
                    className="rounded-3xl border-l-4 border-blue-600 bg-white p-6 shadow-lg shadow-slate-200/70 ring-1 ring-slate-100"
                  >
                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-700">
                      {announcement.category}
                    </span>
                    <h3 className="mt-3 text-lg font-black text-slate-950">{announcement.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-500">
                      {announcement.body}
                    </p>
                    <p className="mt-3 text-xs font-bold text-slate-400">
                      {getAnnouncementDate(announcement)}
                    </p>
                  </article>
                ))}
            </div>
          </section>
        </div>
      </section>

      {aboutOpen && (
        <div
          className="fixed inset-0 z-60 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-xs sm:py-8"
          onClick={() => setAboutOpen(false)}
        >
          <section
            className="w-full max-w-180 overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/30"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-barangay-title"
          >
            <div className="relative bg-linear-to-br from-[#1749c9] via-[#1f64ed] to-[#2f7dff] px-6 py-5 text-white sm:px-8">
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center">
                  <span className="absolute h-3 w-3 -translate-x-1 rounded-sm bg-emerald-400" />
                  <span className="absolute h-3 w-3 translate-x-px translate-y-0.75 rounded-sm bg-red-400" />
                  <span className="absolute h-3 w-3 translate-x-1.75 translate-y-1.25 rounded-sm bg-blue-200" />
                </span>
                <div>
                  <h2 id="about-barangay-title" className="text-xl font-black leading-tight sm:text-2xl">
                    About {barangayTitle}
                  </h2>
                  <p className="mt-1 text-xs font-bold text-blue-100 sm:text-sm">
                    Officials, History and Why We Launched This Portal
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAboutOpen(false)}
                className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
                aria-label="Close about barangay dialog"
              >
                <X size={22} />
              </button>
            </div>

            <div className="max-h-[78vh] overflow-y-auto px-6 py-6 sm:px-8">
              <div>
                <h3 className="text-base font-black text-blue-700 sm:text-lg">
                  Our Active Barangay Officials
                </h3>
                <p className="mt-3 text-sm font-medium leading-7 text-slate-600 sm:text-base">
                  The barangay officials of {publicSettings.barangayName}, {location} serve residents through
                  transparent governance, digital public services, safer communities, and responsive local programs.
                </p>
                <p className="mt-3 text-sm font-medium leading-7 text-slate-600 sm:text-base">
                  This list comes from the active officials maintained in the admin portal, so updates made by the
                  barangay staff appear here automatically.
                </p>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {officialsLoading && (
                    <InfoCard
                      title="Loading officials"
                      text="Fetching the latest active officials..."
                    />
                  )}

                  {!officialsLoading && officialsError && (
                    <InfoCard
                      title="Officials unavailable"
                      text="Please check the Barangay Officials page again later."
                    />
                  )}

                  {!officialsLoading && !officialsError && officials.length === 0 && (
                    <InfoCard
                      title="No active officials listed"
                      text="Officials will appear here once they are added in the admin portal."
                    />
                  )}

                  {!officialsLoading &&
                    !officialsError &&
                    officials.map((official) => (
                      <div key={official.id} className="rounded-lg bg-blue-50 px-4 py-3 ring-1 ring-blue-100">
                        <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                          {official.position}
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-900">{official.full_name}</p>
                      </div>
                    ))}
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="text-base font-black text-blue-700 sm:text-lg">Service History</h3>
                <div className="mt-4 space-y-3">
                  {serviceHistory.map((item) => (
                    <div
                      key={item.year}
                      className={`grid gap-3 rounded-xl border-l-4 ${item.border} bg-slate-50 px-4 py-4 sm:grid-cols-[70px_1fr]`}
                    >
                      <p className="font-mono text-sm font-black text-blue-700">{item.year}</p>
                      <p className="text-sm font-semibold leading-6 text-slate-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="text-base font-black text-blue-700 sm:text-lg">Why a Public Online Portal?</h3>
                <p className="mt-3 text-sm font-medium leading-7 text-slate-600 sm:text-base">
                  {barangayTitle} launched this portal to modernize and digitalize barangay services. Residents no
                  longer need to take time off work just to get a certificate. Everything can be done online from your
                  phone or computer, aligned with the Philippine Digital Transformation Strategy.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </PublicLayout>
  );
}

function OverviewCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/80 ring-1 ring-slate-100">
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      <p className="mt-1 text-sm font-semibold text-slate-400">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function AnnouncementNotice({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50 p-6 text-center">
      <Megaphone className="mx-auto text-blue-700" size={28} />
      <p className="mt-3 text-sm font-bold text-blue-700">{message}</p>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg bg-blue-50 px-4 py-3 ring-1 ring-blue-100 sm:col-span-2">
      <p className="text-xs font-black uppercase tracking-wide text-blue-700">{title}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{text}</p>
    </div>
  );
}
