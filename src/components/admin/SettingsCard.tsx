interface SettingsCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsCard({ title, children, className = '' }: SettingsCardProps) {
  return (
    <section className={`min-h-72 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
      <h2 className="text-lg font-extrabold text-gray-950">{title}</h2>
      <div className="mt-3 border-t border-gray-200 pt-4">{children}</div>
    </section>
  );
}
