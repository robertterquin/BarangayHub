import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { AdminLayout } from '../../../layouts/AdminLayout';

interface StatCard {
  label: string;
  value: string;
  sub: string;
  accentColor: string;
  subColor: string;
}

interface RecentActivity {
  id: string;
  action: string;
  detail: string;
  time: string;
  dotColor: string;
}

interface WorkflowItem {
  label: string;
  value: number;
  color: string;
  width: string;
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

const RECENT_ACTIVITY: RecentActivity[] = [
  {
    id: '1',
    action: 'Approved barangay clearance',
    detail: 'BD2-2026-0318 - Maria L. Santos',
    time: '8 min ago',
    dotColor: 'bg-green-500',
  },
  {
    id: '2',
    action: 'New complaint filed',
    detail: 'Noise disturbance - Purok 3',
    time: '25 min ago',
    dotColor: 'bg-red-500',
  },
  {
    id: '3',
    action: 'Resident record updated',
    detail: 'Pedro M. Flores contact details',
    time: '1 hr ago',
    dotColor: 'bg-yellow-400',
  },
];

const WORKFLOW_ITEMS: WorkflowItem[] = [
  { label: 'Pending Requests', value: 42, color: 'bg-orange-400', width: 'w-9/12' },
  { label: 'Processing', value: 18, color: 'bg-blue-500', width: 'w-5/12' },
  { label: 'Ready / Completed', value: 64, color: 'bg-green-500', width: 'w-full' },
  { label: 'Open Complaints', value: 7, color: 'bg-red-500', width: 'w-2/12' },
];

function StatCardItem({ card }: { card: StatCard }) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl p-5 border-l-4 ${card.accentColor} flex flex-col gap-1 shadow-sm`}
    >
      <p className="text-gray-400 text-xs font-semibold tracking-widest uppercase">{card.label}</p>
      <p className="text-gray-800 text-3xl font-bold tracking-tight">{card.value}</p>
      <p className={`text-xs font-medium ${card.subColor}`}>{card.sub}</p>
    </div>
  );
}

function RecentActivityItem({ item }: { item: RecentActivity }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.dotColor}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-gray-800">{item.action}</p>
        <p className="truncate text-xs font-medium text-gray-400">{item.detail}</p>
      </div>
      <span className="shrink-0 text-[11px] font-semibold text-gray-400">{item.time}</span>
    </div>
  );
}

export function Dashboard() {
  return (
    <AdminLayout title="Dashboard">
      <div className="mb-5 flex flex-col gap-1">
        <h1 className="text-xl font-extrabold tracking-tight text-gray-950">Dashboard Overview</h1>
        <p className="text-sm font-medium text-gray-400">Mock analytics snapshot for Barangay Daine II operations.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {STAT_CARDS.map((card) => (
          <StatCardItem key={card.label} card={card} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-gray-800 font-semibold text-sm mb-1">Total Residents by Purok</h2>
          <p className="text-gray-400 text-xs mb-5">Registered residents per purok</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={PUROK_DATA} barCategoryGap="35%" margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 1000]}
                ticks={[0, 200, 400, 600, 800, 1000]}
              />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#111827', fontSize: 12 }}
                cursor={{ fill: 'rgba(59,130,246,0.06)' }}
              />
              <Bar dataKey="residents" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-gray-800 font-semibold text-sm mb-1">Monthly Document Requests - 2026</h2>
          <p className="text-gray-400 text-xs mb-5">Documents requested per month</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={MONTHLY_REQUESTS} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="requestGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 120]}
                ticks={[0, 20, 40, 60, 80, 100, 120]}
              />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#111827', fontSize: 12 }}
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

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-800">Recent Admin Activity</h2>
              <p className="text-xs font-medium text-gray-400">Preview of future audit log feed</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
              Mock Data
            </span>
          </div>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((item) => (
              <RecentActivityItem key={item.id} item={item} />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800">Workflow Snapshot</h2>
          <p className="mb-5 text-xs font-medium text-gray-400">Today&apos;s queue health</p>

          <div className="space-y-4">
            {WORKFLOW_ITEMS.map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600">{item.label}</span>
                  <span className="text-xs font-extrabold text-gray-900">{item.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className={`h-full rounded-full ${item.color} ${item.width}`} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
