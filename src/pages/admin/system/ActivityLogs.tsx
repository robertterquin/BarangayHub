import { useState } from 'react';
import { RefreshCcw, ScrollText } from 'lucide-react';
import { Button } from '../../../components/ui';
import { AdminLayout } from '../../../layouts/AdminLayout';

type ActivityLogType = 'login' | 'request' | 'approval' | 'edit' | 'complaint' | 'system';

interface ActivityLogEntry {
  id: string;
  message: string;
  time: string;
  log_type: ActivityLogType;
}

const MOCK_ACTIVITY_LOGS: ActivityLogEntry[] = [
  {
    id: '1',
    message: 'admin logged in via MFA - IP: 192.168.1.xx',
    time: 'Today, 8:45 AM',
    log_type: 'login',
  },
  {
    id: '2',
    message: 'Document request BD2-2026-0318 received from public portal',
    time: 'Today, 9:02 AM',
    log_type: 'request',
  },
  {
    id: '3',
    message: 'admin approved request BD2-2026-0317 - Juan dela Cruz',
    time: 'Today, 9:15 AM',
    log_type: 'approval',
  },
  {
    id: '4',
    message: 'admin published "Community Clean-up Drive" announcement',
    time: 'Today, 9:32 AM',
    log_type: 'edit',
  },
  {
    id: '5',
    message: 'New complaint BLOTTER-2026-007 filed via public portal',
    time: 'Today, 10:01 AM',
    log_type: 'complaint',
  },
  {
    id: '6',
    message: 'admin completed request BD2-2026-0316 - Ana Reyes',
    time: 'Today, 10:20 AM',
    log_type: 'approval',
  },
  {
    id: '7',
    message: 'System: Daily automatic backup completed successfully',
    time: 'Today, 12:00 PM',
    log_type: 'system',
  },
];

const LOG_DOT_STYLES: Record<ActivityLogType, string> = {
  login: 'bg-blue-600',
  request: 'bg-blue-600',
  approval: 'bg-green-600',
  edit: 'bg-yellow-400',
  complaint: 'bg-red-500',
  system: 'bg-blue-600',
};

function ActivityLogRow({ entry }: { entry: ActivityLogEntry }) {
  return (
    <li className="flex gap-4 border-b border-gray-100 px-6 py-4 last:border-b-0">
      <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${LOG_DOT_STYLES[entry.log_type]}`} />
      <div>
        <p className="text-sm font-medium leading-snug text-gray-800">
          {entry.message}
        </p>
        <p className="mt-1 text-xs font-semibold text-gray-400">
          {entry.time}
        </p>
      </div>
    </li>
  );
}

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>(MOCK_ACTIVITY_LOGS);
  const [lastRefresh, setLastRefresh] = useState('Just now');

  function handleRefresh() {
    const refreshEntry: ActivityLogEntry = {
      id: `refresh-${Date.now()}`,
      message: 'System: Activity logs refreshed from mock data',
      time: 'Just now',
      log_type: 'system',
    };

    setLogs((current) => [refreshEntry, ...current]);
    setLastRefresh(new Date().toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
    }));
  }

  return (
    <AdminLayout title="Activity Logs">
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <ScrollText size={18} className="text-blue-700" />
              <h1 className="text-base font-extrabold text-gray-950">Activity Logs</h1>
            </div>
            <p className="mt-1 text-xs font-medium text-gray-400">
              Mock immutable audit trail. Last refreshed: {lastRefresh}
            </p>
          </div>

          <Button
            onClick={handleRefresh}
            variant="primary"
            size="sm"
            className="bg-blue-50 text-blue-700 hover:bg-blue-100"
          >
            <RefreshCcw size={14} />
            Refresh
          </Button>
        </div>

        <ul className="divide-y-0">
          {logs.map((entry) => (
            <ActivityLogRow key={entry.id} entry={entry} />
          ))}
        </ul>
      </section>
    </AdminLayout>
  );
}
