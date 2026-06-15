import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { PageHeader, StatCard } from '../../../components/admin';
import { Spinner } from '../../../components/ui';
import { useDashboard } from '../../../hooks/useDashboard';
import { AdminLayout } from '../../../layouts/AdminLayout';
import type { ActivityLog, Json, LogType } from '../../../types/database';
import { formatTimeAgo } from '../../../utils/formatters';

interface StatCardData {
  label: string;
  value: string;
  sub: string;
  accentColor: string;
  subColor: string;
}

interface WorkflowItem {
  label: string;
  value: number;
  color: string;
}

const numberFormatter = new Intl.NumberFormat('en-PH');

const activityDotColor: Record<LogType, string> = {
  login: 'bg-blue-500',
  approval: 'bg-green-500',
  rejection: 'bg-red-500',
  edit: 'bg-yellow-400',
  complaint: 'bg-red-500',
  system: 'bg-gray-400',
};

function readableValue(value: Json | undefined): string | null {
  if (typeof value !== 'string') return null;
  return value.replaceAll('_', ' ');
}

function getActivityDetail(activity: ActivityLog): string {
  const details = activity.details;
  if (details && typeof details === 'object' && !Array.isArray(details)) {
    const previousStatus = readableValue(details.previous_status);
    const newStatus = readableValue(details.new_status);
    if (previousStatus && newStatus && previousStatus !== newStatus) {
      return `${previousStatus} to ${newStatus}`;
    }
  }

  if (activity.admin_email) return activity.admin_email;
  return activity.entity_type.replaceAll('_', ' ');
}

function RecentActivityItem({ activity }: { activity: ActivityLog }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${activityDotColor[activity.log_type]}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-gray-800">{activity.action}</p>
        <p className="truncate text-xs font-medium capitalize text-gray-400">
          {getActivityDetail(activity)}
        </p>
      </div>
      <span className="shrink-0 text-[11px] font-semibold text-gray-400">
        {formatTimeAgo(activity.created_at)}
      </span>
    </div>
  );
}

export function Dashboard() {
  const { snapshot, loading, error, refresh } = useDashboard();
  const monthLabel = new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });

  const statCards: StatCardData[] = [
    {
      label: 'TOTAL RESIDENTS',
      value: numberFormatter.format(snapshot.totalResidents),
      sub: `+${numberFormatter.format(snapshot.residentsThisMonth)} this month`,
      accentColor: 'border-blue-500',
      subColor: 'text-blue-400',
    },
    {
      label: 'DOCS ISSUED',
      value: numberFormatter.format(snapshot.completedRequests),
      sub: `${numberFormatter.format(snapshot.completedThisMonth)} this month`,
      accentColor: 'border-yellow-400',
      subColor: 'text-yellow-500',
    },
    {
      label: 'COMPLETED',
      value: numberFormatter.format(snapshot.completedThisMonth),
      sub: monthLabel,
      accentColor: 'border-green-500',
      subColor: 'text-green-500',
    },
    {
      label: 'PENDING',
      value: numberFormatter.format(snapshot.pendingRequests),
      sub: `${numberFormatter.format(snapshot.requestsToday)} new today`,
      accentColor: 'border-orange-400',
      subColor: 'text-orange-500',
    },
    {
      label: 'COMPLAINTS',
      value: numberFormatter.format(snapshot.openComplaints),
      sub: 'Open cases',
      accentColor: 'border-red-500',
      subColor: 'text-red-500',
    },
    {
      label: 'REGISTERED VOTERS',
      value: numberFormatter.format(snapshot.registeredVoters),
      sub: 'Resident records',
      accentColor: 'border-cyan-500',
      subColor: 'text-cyan-600',
    },
  ];

  const workflowItems: WorkflowItem[] = [
    { label: 'Pending Requests', value: snapshot.pendingRequests, color: 'bg-orange-400' },
    { label: 'Processing', value: snapshot.processingRequests, color: 'bg-blue-500' },
    { label: 'Ready for Pickup', value: snapshot.readyRequests, color: 'bg-green-500' },
    { label: 'Open Complaints', value: snapshot.openComplaints, color: 'bg-red-500' },
  ];
  const largestWorkflowValue = Math.max(1, ...workflowItems.map((item) => item.value));

  return (
    <AdminLayout title="Dashboard">
      <PageHeader
        title="Dashboard Overview"
        subtitle="Live operational data for Barangay Daine II."
        meta={
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        }
      />

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Dashboard data is partially unavailable</p>
            <p className="text-xs font-medium text-amber-700">{error}</p>
          </div>
          <button type="button" onClick={() => void refresh()} className="text-xs font-bold underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white py-24 shadow-sm">
          <Spinner label="Loading live dashboard..." />
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-1 text-sm font-semibold text-gray-800">Total Residents by Purok</h2>
              <p className="mb-5 text-xs text-gray-400">Registered residents per purok</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={snapshot.residentsByPurok}
                  barCategoryGap="35%"
                  margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
                >
                  <CartesianGrid vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [numberFormatter.format(Number(value)), 'Residents']}
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      color: '#111827',
                      fontSize: 12,
                    }}
                    cursor={{ fill: 'rgba(59,130,246,0.06)' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-1 text-sm font-semibold text-gray-800">
                Monthly Document Requests - {snapshot.year}
              </h2>
              <p className="mb-5 text-xs text-gray-400">Documents requested per month</p>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={snapshot.monthlyRequests} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="requestGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [numberFormatter.format(Number(value)), 'Requests']}
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      color: '#111827',
                      fontSize: 12,
                    }}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
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
                  <p className="text-xs font-medium text-gray-400">Latest immutable audit events</p>
                </div>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">Live</span>
              </div>
              {snapshot.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {snapshot.recentActivity.map((activity) => (
                    <RecentActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 py-10 text-center">
                  <p className="text-sm font-semibold text-gray-500">No admin activity yet</p>
                  <p className="mt-1 text-xs text-gray-400">New admin actions will appear here automatically.</p>
                </div>
              )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-800">Workflow Snapshot</h2>
              <p className="mb-5 text-xs font-medium text-gray-400">Current queue health</p>

              <div className="space-y-4">
                {workflowItems.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-600">{item.label}</span>
                      <span className="text-xs font-extrabold text-gray-900">
                        {numberFormatter.format(item.value)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-[width] duration-500 ${item.color}`}
                        style={{ width: `${(item.value / largestWorkflowValue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
