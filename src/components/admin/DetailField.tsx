interface DetailFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function DetailField({ label, value, className = '' }: DetailFieldProps) {
  return (
    <div className={className}>
      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-600">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value || '-'}</p>
    </div>
  );
}
