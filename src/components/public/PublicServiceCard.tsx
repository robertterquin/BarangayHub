import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface PublicServiceCardProps {
  title: string;
  description: string;
  to: string;
  icon: LucideIcon;
  tone?: 'blue' | 'gold' | 'green' | 'red';
  actionLabel?: string;
}

const TONE_CLASSES = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-100',
  gold: 'bg-yellow-50 text-yellow-700 ring-yellow-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  red: 'bg-red-50 text-red-700 ring-red-100',
};

export function PublicServiceCard({
  title,
  description,
  to,
  icon: Icon,
  tone = 'blue',
  actionLabel = 'Open service',
}: PublicServiceCardProps) {
  return (
    <Link
      to={to}
      className="group block rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/10"
    >
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${TONE_CLASSES[tone]}`}>
        <Icon size={22} />
      </div>
      <h3 className="mt-5 text-lg font-black text-slate-950">{title}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{description}</p>
      <p className="mt-5 text-sm font-bold text-blue-700 transition-colors group-hover:text-blue-900">
        {actionLabel}
      </p>
    </Link>
  );
}
