import { supabase } from './supabase';
import type { Resident, DocumentRequest, Complaint, Announcement, ActivityLog, LogType } from '../types/database';

// ─── Activity Logging ─────────────────────────────────────────────────────────

export async function 
logLoginActivity(adminId: string): Promise<void> {
  await supabase.from('activity_logs').insert({
    admin_id: adminId,
    action: 'Admin logged in',
    entity_type: 'auth',
    entity_id: null,
    log_type: 'login' satisfies LogType,
  });
}

async function logActivity(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  logType: LogType
): Promise<void> {
  await supabase.from('activity_logs').insert({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    log_type: logType,
  });
}

// ─── Residents ────────────────────────────────────────────────────────────────

export async function getResidents(page: number, pageSize: number, search: string) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('residents')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.ilike('full_name', `%${search}%`);
  }

  return query;
}

export async function createResident(
  resident: Omit<Resident, 'id' | 'created_at' | 'updated_at'>,
  adminId: string
) {
  const { data, error } = await supabase.from('residents').insert(resident).select().single();
  if (!error && data) {
    await logActivity(adminId, `Added resident ${resident.full_name}`, 'residents', data.id, 'edit');
  }
  return { data, error };
}

export async function updateResident(
  id: string,
  updates: Partial<Resident>,
  adminId: string
) {
  const { data, error } = await supabase.from('residents').update(updates).eq('id', id).select().single();
  if (!error && data) {
    await logActivity(adminId, `Updated resident ${updates.full_name ?? id}`, 'residents', id, 'edit');
  }
  return { data, error };
}

export async function deleteResident(id: string, name: string, adminId: string) {
  const { error } = await supabase.from('residents').delete().eq('id', id);
  if (!error) {
    await logActivity(adminId, `Deleted resident ${name}`, 'residents', id, 'edit');
  }
  return { error };
}

// ─── Document Requests ────────────────────────────────────────────────────────

export async function getDocumentRequests(page: number, pageSize: number) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  return supabase
    .from('document_requests')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('requested_at', { ascending: false });
}

export async function updateRequestStatus(
  id: string,
  status: DocumentRequest['status'],
  trackingCode: string,
  adminId: string
) {
  const { data, error } = await supabase
    .from('document_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (!error) {
    const logType = status === 'completed' || status === 'ready_for_pickup' ? 'approval' : status === 'rejected' ? 'rejection' : 'edit';
    await logActivity(adminId, `Updated request ${trackingCode} to ${status}`, 'document_requests', id, logType);
  }

  return { data, error };
}

// ─── Announcements ────────────────────────────────────────────────────────────

export async function getAnnouncements() {
  return supabase.from('announcements').select('*').order('created_at', { ascending: false });
}

export async function createAnnouncement(
  announcement: Omit<Announcement, 'id' | 'created_at'>,
  adminId: string
) {
  const { data, error } = await supabase.from('announcements').insert(announcement).select().single();
  if (!error && data) {
    await logActivity(adminId, `Created announcement: ${announcement.title}`, 'announcements', data.id, 'edit');
  }
  return { data, error };
}

export async function deleteAnnouncement(id: string, title: string, adminId: string) {
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (!error) {
    await logActivity(adminId, `Deleted announcement: ${title}`, 'announcements', id, 'edit');
  }
  return { error };
}

// ─── Complaints ───────────────────────────────────────────────────────────────

export async function getComplaints(page: number, pageSize: number) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  return supabase
    .from('complaints')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('submitted_at', { ascending: false });
}

export async function updateComplaintStatus(
  id: string,
  status: Complaint['status'],
  referenceId: string,
  adminId: string
) {
  const { data, error } = await supabase
    .from('complaints')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (!error) {
    await logActivity(adminId, `Updated complaint ${referenceId} to ${status}`, 'complaints', id, 'complaint');
  }

  return { data, error };
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export async function getFeedback() {
  return supabase.from('feedback').select('*').order('submitted_at', { ascending: false });
}

// ─── Activity Logs ────────────────────────────────────────────────────────────

export async function getActivityLogs(): Promise<{ data: ActivityLog[] | null; error: unknown }> {
  return supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(200);
}
