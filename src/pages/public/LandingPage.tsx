import { Link } from 'react-router-dom';
import { Home, Layers } from 'lucide-react';
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

export function LandingPage() {
  return (
    <PublicLayout>
      <section className="min-h-[calc(100vh-86px)] w-full bg-[#f4f7fb]">
        <div className="relative min-h-[575px] overflow-hidden bg-gradient-to-br from-[#14368f] via-[#105be2] to-[#3e9cff]">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.42) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.42) 1px, transparent 1px)',
              backgroundSize: '42px 42px',
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.08),transparent_32%),linear-gradient(90deg,rgba(0,0,0,0.18),transparent_55%)]" />

          <div className="relative flex min-h-[575px] flex-col items-center justify-center px-5 pb-16 pt-14 text-center text-white">
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

            <Link
              to="/select-service"
              className="mt-12 inline-flex min-w-56 items-center justify-center gap-3 rounded-2xl bg-white px-8 py-5 text-xl font-black text-blue-700 shadow-xl shadow-blue-950/20 transition-transform hover:-translate-y-0.5"
            >
              <span className="relative h-6 w-6">
                <span className="absolute left-0 top-1 h-3 w-3 rounded-sm bg-emerald-400" />
                <span className="absolute left-2 top-2 h-3 w-3 rounded-sm bg-red-400" />
                <span className="absolute left-4 top-3 h-3 w-3 rounded-sm bg-blue-500" />
              </span>
              Read More
            </Link>
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
    </PublicLayout>
  );
}
