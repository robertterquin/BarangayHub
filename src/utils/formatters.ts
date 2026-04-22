// ─── Date Formatting ──────────────────────────────────────────────────────────

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Status Labels ────────────────────────────────────────────────────────────

import type { RequestStatus, ComplaintStatus, LogType } from '../types/database';

export function formatRequestStatus(status: RequestStatus): string {
  const labels: Record<RequestStatus, string> = {
    pending: 'Pending',
    processing: 'Processing',
    ready_for_pickup: 'Ready for Pickup',
    completed: 'Completed',
    rejected: 'Rejected',
  };
  return labels[status];
}

export function formatComplaintStatus(status: ComplaintStatus): string {
  const labels: Record<ComplaintStatus, string> = {
    open: 'Open',
    under_review: 'Under Review',
    resolved: 'Resolved',
    dismissed: 'Dismissed',
  };
  return labels[status];
}

export function requestStatusColor(status: RequestStatus): string {
  const colors: Record<RequestStatus, string> = {
    pending: 'text-yellow-400',
    processing: 'text-blue-400',
    ready_for_pickup: 'text-green-400',
    completed: 'text-gray-400',
    rejected: 'text-red-400',
  };
  return colors[status];
}

export function logTypeColor(logType: LogType): string {
  const colors: Record<LogType, string> = {
    login: 'text-blue-400',
    approval: 'text-green-400',
    rejection: 'text-red-400',
    edit: 'text-yellow-400',
    complaint: 'text-red-400',
    system: 'text-gray-400',
  };
  return colors[logType];
}
