import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { AdminLayout } from '../../../layouts/AdminLayout';

// ── Mock data ────────────────────────────────────────────────────────────────

interface StatCard {
  label: string;
  value: string;
  sub: string;
  accentColor: string;
  subColor: string;
}

const STAT_CARDS: StatCard[] = [
  {
    label: 'TOTAL RESIDENTS',
    value: '4,821',
    sub: '+14 this month',
    accentColor: 'border-blue-500',
    subColor: 'text-blue-400',
  },
  {
    label: 'DOCS ISSUED',
    value: '1,247',
    sub: '+89 vs last month',
    accentColor: 'border-yellow-400',
    subColor: 'text-yellow-400',
  },
  {
    label: 'COMPLETED',
    value: '318',
    sub: 'April 2026',
    accentColor: 'border-green-500',
    subColor: 'text-green-400',
  },
  {
    label: 'PENDING',
    value: '42',
    sub: '7 new today',
    accentColor: 'border-orange-400',
    subColor: 'text-orange-400',
  },
  {
    label: 'COMPLAINTS',
    value: '7',
    sub: 'Active cases',
    accentColor: 'border-red-500',
    subColor: 'text-red-400',
  },
  {
    label: 'HOUSEHOLDS',
    value: '1,190',
    sub: 'All puroks',
    accentColor: 'border-purple-500',
    subColor: 'text-purple-400',
  },
];

const PUROK_DATA = [
  { name: 'Purok 1', residents: 850 },
  { name: 'Purok 2', residents: 790 },
  { name: 'Purok 3', residents: 820 },
  { name: 'Purok 4', residents: 710 },
  { name: 'Purok 5', residents: 800 },
  { name: 'Purok 6', residents: 660 },
];

const MONTHLY_REQUESTS = [
  { month: 'Jan', requests: 62 },
  { month: 'Feb', requests: 75 },
  { month: 'Mar', requests: 58 },
  { month: 'Apr', requests: 90 },
  { month: 'May', requests: 95 },
  { month: 'Jun', requests: 80 },
  { month: 'Jul', requests: 88 },
  { month: 'Aug', requests: 92 },
  { month: 'Sep', requests: 85 },
  { month: 'Oct', requests: 78 },
  { month: 'Nov', requests: 70 },
  { month: 'Dec', requests: 83 },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCardItem({ card }: { card: StatCard }) {
  return (
    <div
      className={`bg-[#1e2028] border border-[#2a2d35] rounded-xl p-5 border-l-4 ${card.accentColor} flex flex-col gap-1`}
    >
      <p className="text-gray-400 text-xs font-semibold tracking-widest uppercase">{card.label}</p>
      <p className="text-white text-3xl font-bold tracking-tight">{card.value}</p>
      <p className={`text-xs font-medium ${card.subColor}`}>{card.sub}</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function Dashboard() {
  return (
    <AdminLayout title="Dashboard">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {STAT_CARDS.map((card) => (
          <StatCardItem key={card.label} card={card} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Bar chart — Residents by Purok */}
        <div className="bg-[#1e2028] border border-[#2a2d35] rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-1">Total Residents by Purok</h2>
          <p className="text-gray-500 text-xs mb-5">Registered residents per purok</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={PUROK_DATA} barCategoryGap="35%" margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid vertical={false} stroke="#2a2d35" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 1000]}
                ticks={[0, 200, 400, 600, 800, 1000]}
              />
              <Tooltip
                contentStyle={{ background: '#1a1c23', border: '1px solid #2a2d35', borderRadius: 8, color: '#fff', fontSize: 12 }}
                cursor={{ fill: 'rgba(59,130,246,0.08)' }}
              />
              <Bar dataKey="residents" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Area/Line chart — Monthly Document Requests */}
        <div className="bg-[#1e2028] border border-[#2a2d35] rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-1">Monthly Document Requests – 2026</h2>
          <p className="text-gray-500 text-xs mb-5">Documents requested per month</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={MONTHLY_REQUESTS} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="requestGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#2a2d35" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 120]}
                ticks={[0, 20, 40, 60, 80, 100, 120]}
              />
              <Tooltip
                contentStyle={{ background: '#1a1c23', border: '1px solid #2a2d35', borderRadius: 8, color: '#fff', fontSize: 12 }}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#requestGradient)"
                dot={{ r: 3.5, fill: '#3b82f6', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#60a5fa' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}
