interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  accentColor: string;
  subColor: string;
}

export function StatCard({ label, value, sub, accentColor, subColor }: StatCardProps) {
  return (
    <div className={`flex flex-col gap-1 rounded-xl border border-gray-200 border-l-4 bg-white p-5 shadow-sm ${accentColor}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="text-3xl font-bold tracking-tight text-gray-800">{value}</p>
      <p className={`text-xs font-medium ${subColor}`}>{sub}</p>
    </div>
  );
}
