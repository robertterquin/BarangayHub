import { Download } from 'lucide-react';

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  metric?: string;
  formatLabel?: string;
  actionLabel?: string;
  disabled?: boolean;
  onDownload: () => void;
}

export function ReportCard({
  title,
  description,
  icon,
  accent,
  metric,
  formatLabel = 'CSV',
  actionLabel = 'Download CSV',
  disabled = false,
  onDownload,
}: ReportCardProps) {
  return (
    <article className="flex min-h-40 flex-col rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
          {icon}
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-500">
          {formatLabel}
        </span>
      </div>
      <h2 className="text-sm font-extrabold text-blue-900">{title}</h2>
      <p className="mt-1 flex-1 text-sm font-medium leading-relaxed text-slate-600">{description}</p>
      {metric && (
        <p className="mt-3 text-xs font-extrabold uppercase tracking-wide text-blue-700">
          {metric}
        </p>
      )}
      <button
        onClick={onDownload}
        disabled={disabled}
        className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download size={13} />
        {actionLabel}
      </button>
    </article>
  );
}
