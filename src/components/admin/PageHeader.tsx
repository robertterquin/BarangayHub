interface PageHeaderProps {
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, meta, action, className = '' }: PageHeaderProps) {
  return (
    <div className={`mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-gray-950">{title}</h1>
        {subtitle && <p className="mt-1 text-sm font-medium text-gray-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {meta}
        {action}
      </div>
    </div>
  );
}
