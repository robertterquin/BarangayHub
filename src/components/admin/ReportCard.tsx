import { Download } from 'lucide-react';

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  onDownload: () => void;
}

export function ReportCard({ title, description, icon, accent, onDownload }: ReportCardProps) {
  return (
    <article className="flex min-h-40 flex-col rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
          {icon}
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-500">
          PDF
        </span>
      </div>
      <h2 className="text-sm font-extrabold text-blue-900">{title}</h2>
      <p className="mt-1 flex-1 text-sm font-medium leading-relaxed text-slate-600">{description}</p>
      <button
        onClick={onDownload}
        className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-blue-800"
      >
        <Download size={13} />
        Download PDF
      </button>
    </article>
  );
}
