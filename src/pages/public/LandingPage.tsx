import { useState } from 'react';
import { Home, Layers, X } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';

const STATS = [
  {
    label: 'TOTAL RESIDENTS',
    value: '4,821',
    caption: 'Registered - Daine II',
    accent: 'border-t-blue-600',
  },
  {
    label: 'DOCS ISSUED',
    value: '1,247',
    caption: 'Year 2026',
    accent: 'border-t-yellow-400',
  },
  {
    label: 'COMPLETED',
    value: '318',
    caption: 'This month',
    accent: 'border-t-emerald-500',
  },
  {
    label: 'PENDING',
    value: '42',
    caption: 'To be processed',
    accent: 'border-t-red-500',
  },
  {
    label: 'HOUSEHOLDS',
    value: '1,190',
    caption: 'All puroks',
    accent: 'border-t-violet-500',
  },
];

const OFFICIAL_PLATFORMS = [
  ['PUNONG BARANGAY', 'Hon. [Name]'],
  ['SK CHAIRPERSON', 'Hon. [Name]'],
  ['KAGAWAD - PEACE AND ORDER', 'Hon. [Name]'],
  ['KAGAWAD - HEALTH', 'Hon. [Name]'],
  ['KAGAWAD - EDUCATION', 'Hon. [Name]'],
  ['KAGAWAD - LIVELIHOOD', 'Hon. [Name]'],
  ['KAGAWAD - INFRASTRUCTURE', 'Hon. [Name]'],
  ['KAGAWAD - ENVIRONMENT', 'Hon. [Name]'],
  ['KAGAWAD - GAD', 'Hon. [Name]'],
  ['BARANGAY SECRETARY', 'Hon. [Name]'],
];

const SERVICE_HISTORY = [
  {
    year: '2009',
    border: 'border-blue-600',
    text: 'Barangay officials began active service in Barangay Daine II, Indang, Cavite.',
  },
  {
    year: '2026',
    border: 'border-emerald-500',
    text: 'Launch of BarangayHub - official digital portal for Barangay Daine II residents.',
  },
];

export function LandingPage() {
  const [aboutOpen, setAboutOpen] = useState(false);

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
              Barangay Daine II
            </h1>
            <p
              className="mt-2 text-5xl font-normal leading-none text-white drop-shadow-sm sm:text-7xl"
              style={{ fontFamily: '"Brush Script MT", "Segoe Script", cursive' }}
            >
              Online Services
            </p>

            <p className="mt-10 max-w-3xl text-xl font-semibold leading-9 text-blue-50 sm:text-2xl">
              Request certificates, stay updated with announcements, and
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
          {STATS.map((stat) => (
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
      </section>

      {aboutOpen && (
        <div
          className="fixed inset-0 z-60 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-[1px] sm:py-8"
          onClick={() => setAboutOpen(false)}
        >
          <section
            className="w-full max-w-180 overflow-hidden rounded-[26px] bg-white shadow-2xl shadow-slate-950/30"
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
                    About Barangay Daine II
                  </h2>
                  <p className="mt-1 text-xs font-bold text-blue-100 sm:text-sm">
                    Officials' Platforms, History and Why We Launched This Portal
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
                  Our Elected Officials and Their Platforms
                </h3>
                <p className="mt-3 text-sm font-medium leading-7 text-slate-600 sm:text-base">
                  The barangay officials of Daine II, Indang, Cavite were duly elected by the residents to serve a
                  three-year term. Their platform centered on transparent governance, digital public services, improved
                  livelihood programs, safer streets, and better health and sanitation for every household.
                </p>
                <p className="mt-3 text-sm font-medium leading-7 text-slate-600 sm:text-base">
                  Key commitments: (1) Barangay MIS system, (2) Online document requests, (3) Livelihood and skills
                  training center, and (4) Infrastructure improvement in all puroks.
                </p>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {OFFICIAL_PLATFORMS.map(([position, name]) => (
                    <div key={position} className="rounded-lg bg-blue-50 px-4 py-3 ring-1 ring-blue-100">
                      <p className="text-[11px] font-black uppercase tracking-wide text-blue-700">{position}</p>
                      <p className="mt-1 text-sm font-black text-slate-900">{name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="text-base font-black text-blue-700 sm:text-lg">Service History</h3>
                <div className="mt-4 space-y-3">
                  {SERVICE_HISTORY.map((item) => (
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
                  Barangay Daine II launched this portal to modernize and digitalize barangay services. Residents no
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
