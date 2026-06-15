import { supabase } from './supabase';
import { generateReferenceId } from '../utils/idGenerator';
import type {
  ActivityLog,
  AdminProfileUpdate,
  AnnouncementInsert,
  AnnouncementStatus,
  AnnouncementUpdate,
  ComplaintStatus,
  ComplaintUpdate,
  DocumentRequestUpdate,
  FeedbackStatus,
  FeedbackUpdate,
  LogType,
  NotificationUpdate,
  DocumentType,
  FeedbackCategory,
  OfficialInsert,
  OfficialUpdate,
  RequestStatus,
  ResidentInsert,
  ResidentUpdate,
  SystemSettingsUpdate,
  UrgencyLevel,
  GenderType,
} from '../types/database';

export interface PageOptions {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface DashboardStats {
  totalResidents: number;
  residentsThisMonth: number;
  registeredVoters: number;
  completedRequests: number;
  completedThisMonth: number;
  pendingRequests: number;
  processingRequests: number;
  readyRequests: number;
  requestsToday: number;
  openComplaints: number;
}

export interface DashboardChartPoint {
  name: string;
  value: number;
}

export interface DashboardSnapshot extends DashboardStats {
  year: number;
  residentsByPurok: DashboardChartPoint[];
  monthlyRequests: DashboardChartPoint[];
  recentActivity: ActivityLog[];
}

export interface AdminEmailUpdateResult {
  confirmationRequired: boolean;
}

const DEFAULT_PAGE_SIZE = 20;
const ANNOUNCEMENT_BUCKET = 'announcement-images';
const COMPLAINT_BUCKET = 'complaint-attachments';
const OFFICIAL_PHOTO_BUCKET = 'official-photos';
const DASHBOARD_PUROKS = ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getPageRange({ page = 0, pageSize = DEFAULT_PAGE_SIZE }: PageOptions) {
  const from = Math.max(0, page) * Math.max(1, pageSize);
  return { from, to: from + Math.max(1, pageSize) - 1 };
}

function createStoragePath(file: File, folder?: string): string {
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
  const fileName = `${crypto.randomUUID()}.${extension}`;
  return folder ? `${folder}/${fileName}` : fileName;
}

export async function getCurrentAdminProfile() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { data: null, error: authError ?? new Error('No authenticated user.') };
  }

  return supabase.from('admin_profiles').select('*').eq('id', authData.user.id).maybeSingle();
}

export async function isCurrentUserActiveAdmin() {
  return supabase.rpc('is_active_admin');
}

export async function updateCurrentAdminProfile(updates: AdminProfileUpdate) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { data: null, error: authError ?? new Error('No authenticated user.') };
  }

  const allowedUpdates: AdminProfileUpdate = {
    email: updates.email,
    display_name: updates.display_name,
    last_login_at: updates.last_login_at,
  };

  return supabase
    .from('admin_profiles')
    .update(allowedUpdates)
    .eq('id', authData.user.id)
    .select()
    .single();
}

export async function recordAdminLogin() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { data: null, error: authError ?? new Error('No authenticated user.') };
  }

  const now = new Date().toISOString();
  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .update({ last_login_at: now })
    .eq('id', authData.user.id)
    .select()
    .single();

  if (profileError) return { data: null, error: profileError };

  const { error: logError } = await supabase.from('activity_logs').insert({
    admin_id: authData.user.id,
    admin_email: profile.email,
    action: 'Admin logged in',
    entity_type: 'auth',
    entity_id: authData.user.id,
    log_type: 'login',
    details: {},
  });

  return { data: profile, error: logError };
}

export async function logLoginActivity(): Promise<void> {
  await recordAdminLogin();
}

export async function getSystemSettings() {
  return supabase.from('system_settings').select('*').eq('id', 1).single();
}

export async function updateSystemSettings(updates: SystemSettingsUpdate) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { data: null, error: authError ?? new Error('No authenticated user.') };
  }

  return supabase
    .from('system_settings')
    .update({ ...updates, updated_by: authData.user.id })
    .eq('id', 1)
    .select()
    .single();
}

async function reauthenticateCurrentAdmin(currentPassword: string) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user?.email) {
    return {
      user: null,
      error: authError ?? new Error('The authenticated account does not have an email address.'),
    };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: authData.user.email,
    password: currentPassword,
  });

  return {
    user: signInError ? null : authData.user,
    error: signInError,
  };
}

export async function changeCurrentAdminEmail(
  currentPassword: string,
  newEmail: string
): Promise<{ data: AdminEmailUpdateResult | null; error: unknown }> {
  const verification = await reauthenticateCurrentAdmin(currentPassword);
  if (verification.error || !verification.user) {
    return { data: null, error: verification.error };
  }

  const normalizedEmail = newEmail.trim().toLowerCase();
  const { data: updateData, error: updateError } = await supabase.auth.updateUser({
    email: normalizedEmail,
  });
  if (updateError) return { data: null, error: updateError };

  const profileResult = await updateCurrentAdminProfile({ email: normalizedEmail });
  if (profileResult.error) return { data: null, error: profileResult.error };

  return {
    data: {
      confirmationRequired:
        updateData.user.email?.toLowerCase() !== normalizedEmail,
    },
    error: null,
  };
}

export async function changeCurrentAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ data: boolean; error: unknown }> {
  const verification = await reauthenticateCurrentAdmin(currentPassword);
  if (verification.error || !verification.user) {
    return { data: false, error: verification.error };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (updateError) return { data: false, error: updateError };

  const { error: logError } = await supabase.from('activity_logs').insert({
    admin_id: verification.user.id,
    admin_email: verification.user.email,
    action: 'Admin password changed',
    entity_type: 'auth',
    entity_id: verification.user.id,
    log_type: 'edit',
    details: { field: 'password' },
  });

  return { data: !logError, error: logError };
}

export interface ResidentQueryOptions extends PageOptions {
  purok?: string;
  gender?: GenderType;
  isVoter?: boolean;
}

export async function getResidents(options: ResidentQueryOptions = {}) {
  const { from, to } = getPageRange(options);
  let query = supabase
    .from('residents')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  const search = options.search?.trim();
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,reference_id.ilike.%${search}%,purok.ilike.%${search}%`);
  }
  if (options.purok) query = query.eq('purok', options.purok);
  if (options.gender) query = query.eq('gender', options.gender);
  if (options.isVoter !== undefined) query = query.eq('is_voter', options.isVoter);

  return query;
}

export async function createResident(resident: Omit<ResidentInsert, 'reference_id'>) {
  const { data: authData } = await supabase.auth.getUser();
  const referenceId = await generateReferenceId('residents', 'reference_id');
  return supabase
    .from('residents')
    .insert({
      ...resident,
      reference_id: referenceId,
      created_by: authData.user?.id ?? null,
      updated_by: authData.user?.id ?? null,
    })
    .select()
    .single();
}

export async function updateResident(id: string, updates: ResidentUpdate) {
  const { data: authData } = await supabase.auth.getUser();
  return supabase
    .from('residents')
    .update({ ...updates, updated_by: authData.user?.id ?? null })
    .eq('id', id)
    .select()
    .single();
}

export async function deleteResident(id: string) {
  return supabase.from('residents').delete().eq('id', id);
}

export function subscribeToResidentChanges(onChange: () => void) {
  const channel = supabase
    .channel(`residents-${crypto.randomUUID()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'residents' }, onChange)
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function getDocumentRequests(
  options: PageOptions & { status?: RequestStatus; documentType?: DocumentType } = {}
) {
  const { from, to } = getPageRange(options);
  let query = supabase
    .from('document_requests')
    .select('*', { count: 'exact' })
    .order('requested_at', { ascending: false })
    .range(from, to);

  if (options.status) query = query.eq('status', options.status);
  if (options.documentType) query = query.eq('document_type', options.documentType);

  const search = options.search?.trim();
  if (search) {
    query = query.or(`requester_name.ilike.%${search}%,tracking_code.ilike.%${search}%`);
  }

  return query;
}

export async function getPendingDocumentRequestCount() {
  return supabase
    .from('document_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');
}

export async function updateDocumentRequest(id: string, updates: DocumentRequestUpdate) {
  const { data: authData } = await supabase.auth.getUser();
  return supabase
    .from('document_requests')
    .update({ ...updates, processed_by: updates.processed_by ?? authData.user?.id ?? null })
    .eq('id', id)
    .select()
    .single();
}

export async function updateRequestStatus(
  id: string,
  status: RequestStatus,
  notes: Pick<DocumentRequestUpdate, 'admin_notes' | 'public_status_note' | 'rejection_reason'> = {}
) {
  return updateDocumentRequest(id, { ...notes, status });
}

export async function deleteDocumentRequest(id: string) {
  return supabase.from('document_requests').delete().eq('id', id);
}

export function subscribeToDocumentRequestChanges(onChange: () => void) {
  const channel = supabase
    .channel(`document-requests-${crypto.randomUUID()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'document_requests' }, onChange)
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function getOfficials(options: PageOptions & { activeOnly?: boolean } = {}) {
  const { from, to } = getPageRange(options);
  let query = supabase
    .from('officials')
    .select('*', { count: 'exact' })
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })
    .range(from, to);

  if (options.activeOnly) query = query.eq('is_active', true);
  if (options.search?.trim()) query = query.ilike('full_name', `%${options.search.trim()}%`);
  return query;
}

export async function getActiveOfficialCount() {
  return supabase
    .from('officials')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);
}

export async function createOfficial(official: OfficialInsert) {
  const { data: authData } = await supabase.auth.getUser();
  return supabase
    .from('officials')
    .insert({ ...official, created_by: authData.user?.id ?? null, updated_by: authData.user?.id ?? null })
    .select()
    .single();
}

export async function updateOfficial(id: string, updates: OfficialUpdate) {
  const { data: authData } = await supabase.auth.getUser();
  return supabase
    .from('officials')
    .update({ ...updates, updated_by: authData.user?.id ?? null })
    .eq('id', id)
    .select()
    .single();
}

export async function deleteOfficial(id: string) {
  return supabase.from('officials').delete().eq('id', id);
}

export async function getComplaints(
  options: PageOptions & { status?: ComplaintStatus; urgency?: UrgencyLevel } = {}
) {
  const { from, to } = getPageRange(options);
  let query = supabase
    .from('complaints')
    .select('*', { count: 'exact' })
    .order('submitted_at', { ascending: false })
    .range(from, to);

  if (options.status) query = query.eq('status', options.status);
  if (options.urgency) query = query.eq('urgency', options.urgency);

  const search = options.search?.trim();
  if (search) {
    query = query.or(`title.ilike.%${search}%,reference_id.ilike.%${search}%,complainant_name.ilike.%${search}%`);
  }

  return query;
}

export async function getActiveComplaintCount() {
  return supabase
    .from('complaints')
    .select('id', { count: 'exact', head: true })
    .in('status', ['open', 'under_review']);
}

export async function updateComplaint(id: string, updates: ComplaintUpdate) {
  return supabase.from('complaints').update(updates).eq('id', id).select().single();
}

export async function updateComplaintStatus(
  id: string,
  status: ComplaintStatus,
  resolutionNotes?: string | null
) {
  return updateComplaint(id, { status, resolution_notes: resolutionNotes });
}

export async function deleteComplaint(id: string) {
  return supabase.from('complaints').delete().eq('id', id);
}

export function subscribeToComplaintChanges(onChange: () => void) {
  const channel = supabase
    .channel(`complaints-${crypto.randomUUID()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, onChange)
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function getAnnouncements(
  options: PageOptions & { status?: AnnouncementStatus } = {}
) {
  const { from, to } = getPageRange(options);
  let query = supabase
    .from('announcements')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (options.status) query = query.eq('status', options.status);
  if (options.search?.trim()) query = query.ilike('title', `%${options.search.trim()}%`);
  return query;
}

export async function createAnnouncement(announcement: AnnouncementInsert) {
  const { data: authData } = await supabase.auth.getUser();
  return supabase
    .from('announcements')
    .insert({ ...announcement, created_by: authData.user?.id ?? null, updated_by: authData.user?.id ?? null })
    .select()
    .single();
}

export async function updateAnnouncement(id: string, updates: AnnouncementUpdate) {
  const { data: authData } = await supabase.auth.getUser();
  return supabase
    .from('announcements')
    .update({ ...updates, updated_by: authData.user?.id ?? null })
    .eq('id', id)
    .select()
    .single();
}

export async function deleteAnnouncement(id: string) {
  return supabase.from('announcements').delete().eq('id', id);
}

export function subscribeToAnnouncementChanges(onChange: () => void) {
  const channel = supabase
    .channel(`announcements-${crypto.randomUUID()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, onChange)
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function getFeedback(
  options: PageOptions & { status?: FeedbackStatus; category?: FeedbackCategory } = {}
) {
  const { from, to } = getPageRange(options);
  let query = supabase
    .from('feedback')
    .select('*', { count: 'exact' })
    .order('submitted_at', { ascending: false })
    .range(from, to);

  if (options.status) query = query.eq('status', options.status);
  if (options.category) query = query.eq('category', options.category);
  return query;
}

export async function updateFeedback(id: string, updates: FeedbackUpdate) {
  return supabase.from('feedback').update(updates).eq('id', id).select().single();
}

export async function markFeedbackReviewed(id: string, status: FeedbackStatus = 'reviewed') {
  return updateFeedback(id, { status });
}

export async function deleteFeedback(id: string) {
  return supabase.from('feedback').delete().eq('id', id);
}

export async function getActivityLogs(
  options: PageOptions & { logType?: LogType } = {}
): Promise<{
  data: ActivityLog[] | null;
  count: number | null;
  error: unknown;
}> {
  const { from, to } = getPageRange(options);
  let query = supabase
    .from('activity_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  const search = options.search?.trim();
  if (search) {
    query = query.or(`action.ilike.%${search}%,admin_email.ilike.%${search}%,entity_type.ilike.%${search}%`);
  }
  if (options.logType) query = query.eq('log_type', options.logType);

  return query;
}

export function subscribeToActivityLogChanges(onChange: () => void) {
  const channel = supabase
    .channel(`activity-logs-${crypto.randomUUID()}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'activity_logs' },
      onChange
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function getNotifications(
  options: PageOptions & { unreadOnly?: boolean } = {}
) {
  const { from, to } = getPageRange(options);
  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (options.unreadOnly) query = query.eq('is_read', false);
  return query;
}

export async function updateNotification(id: string, updates: NotificationUpdate) {
  return supabase.from('notifications').update(updates).eq('id', id).select().single();
}

export async function markNotificationRead(id: string, isRead = true) {
  return updateNotification(id, {
    is_read: isRead,
    read_at: isRead ? new Date().toISOString() : null,
  });
}

export async function markAllNotificationsRead() {
  return supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('is_read', false)
    .select();
}

export async function deleteNotification(id: string) {
  return supabase.from('notifications').delete().eq('id', id);
}

export async function getDashboardStats(): Promise<{ data: DashboardStats; error: unknown }> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  const [
    residents,
    residentsThisMonth,
    registeredVoters,
    completedRequests,
    completedThisMonth,
    pendingRequests,
    processingRequests,
    readyRequests,
    requestsToday,
    openComplaints,
  ] = await Promise.all([
    supabase.from('residents').select('id', { count: 'exact', head: true }),
    supabase
      .from('residents')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfMonth)
      .lt('created_at', startOfNextMonth),
    supabase.from('residents').select('id', { count: 'exact', head: true }).eq('is_voter', true),
    supabase.from('document_requests').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase
      .from('document_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('completed_at', startOfMonth)
      .lt('completed_at', startOfNextMonth),
    supabase.from('document_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('document_requests').select('id', { count: 'exact', head: true }).eq('status', 'processing'),
    supabase.from('document_requests').select('id', { count: 'exact', head: true }).eq('status', 'ready_for_pickup'),
    supabase
      .from('document_requests')
      .select('id', { count: 'exact', head: true })
      .gte('requested_at', startOfToday)
      .lt('requested_at', startOfTomorrow),
    supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('status', 'open'),
  ]);

  const error =
    residents.error ??
    residentsThisMonth.error ??
    registeredVoters.error ??
    completedRequests.error ??
    completedThisMonth.error ??
    pendingRequests.error ??
    processingRequests.error ??
    readyRequests.error ??
    requestsToday.error ??
    openComplaints.error;

  return {
    data: {
      totalResidents: residents.count ?? 0,
      residentsThisMonth: residentsThisMonth.count ?? 0,
      registeredVoters: registeredVoters.count ?? 0,
      completedRequests: completedRequests.count ?? 0,
      completedThisMonth: completedThisMonth.count ?? 0,
      pendingRequests: pendingRequests.count ?? 0,
      processingRequests: processingRequests.count ?? 0,
      readyRequests: readyRequests.count ?? 0,
      requestsToday: requestsToday.count ?? 0,
      openComplaints: openComplaints.count ?? 0,
    },
    error,
  };
}

export async function getDashboardSnapshot(): Promise<{
  data: DashboardSnapshot;
  error: unknown;
}> {
  const year = new Date().getFullYear();
  const purokQueries = DASHBOARD_PUROKS.map((purok) =>
    supabase.from('residents').select('id', { count: 'exact', head: true }).eq('purok', purok)
  );
  const monthlyQueries = MONTH_LABELS.map((_, month) => {
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 1).toISOString();
    return supabase
      .from('document_requests')
      .select('id', { count: 'exact', head: true })
      .gte('requested_at', start)
      .lt('requested_at', end);
  });

  const [statsResult, purokResults, monthlyResults, activityResult] = await Promise.all([
    getDashboardStats(),
    Promise.all(purokQueries),
    Promise.all(monthlyQueries),
    getActivityLogs({ page: 0, pageSize: 5 }),
  ]);

  const queryError =
    purokResults.find((result) => result.error)?.error ??
    monthlyResults.find((result) => result.error)?.error ??
    activityResult.error;

  return {
    data: {
      ...statsResult.data,
      year,
      residentsByPurok: DASHBOARD_PUROKS.map((name, index) => ({
        name,
        value: purokResults[index]?.count ?? 0,
      })),
      monthlyRequests: MONTH_LABELS.map((name, index) => ({
        name,
        value: monthlyResults[index]?.count ?? 0,
      })),
      recentActivity: activityResult.data ?? [],
    },
    error: statsResult.error ?? queryError,
  };
}

export function subscribeToDashboardChanges(onChange: () => void) {
  const channel = supabase
    .channel(`dashboard-${crypto.randomUUID()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'residents' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'document_requests' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, onChange)
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function subscribeToNotificationChanges(onChange: () => void) {
  const channel = supabase
    .channel(`notifications-${crypto.randomUUID()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, onChange)
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function uploadAnnouncementImage(file: File) {
  const path = createStoragePath(file, 'announcements');
  const { data, error } = await supabase.storage
    .from(ANNOUNCEMENT_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) return { data: null, error };
  const { data: publicUrl } = supabase.storage.from(ANNOUNCEMENT_BUCKET).getPublicUrl(data.path);
  return { data: { path: data.path, publicUrl: publicUrl.publicUrl }, error: null };
}

export async function deleteAnnouncementImage(path: string) {
  const publicMarker = `/storage/v1/object/public/${ANNOUNCEMENT_BUCKET}/`;
  const imagePath = path.includes(publicMarker)
    ? decodeURIComponent(path.split(publicMarker)[1] ?? '')
    : path;

  if (!imagePath) return { data: null, error: new Error('Invalid announcement image path.') };
  return supabase.storage.from(ANNOUNCEMENT_BUCKET).remove([imagePath]);
}

export async function uploadOfficialPhoto(file: File) {
  const path = createStoragePath(file, 'officials');
  const { data, error } = await supabase.storage
    .from(OFFICIAL_PHOTO_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) return { data: null, error };
  const { data: publicUrl } = supabase.storage
    .from(OFFICIAL_PHOTO_BUCKET)
    .getPublicUrl(data.path);
  return { data: { path: data.path, publicUrl: publicUrl.publicUrl }, error: null };
}

export async function deleteOfficialPhoto(path: string) {
  const publicMarker = `/storage/v1/object/public/${OFFICIAL_PHOTO_BUCKET}/`;
  const photoPath = path.includes(publicMarker)
    ? decodeURIComponent(path.split(publicMarker)[1] ?? '')
    : path;

  if (!photoPath) return { data: null, error: new Error('Invalid official photo path.') };
  return supabase.storage.from(OFFICIAL_PHOTO_BUCKET).remove([photoPath]);
}

export async function getComplaintAttachmentUrl(path: string, expiresIn = 3600) {
  return supabase.storage.from(COMPLAINT_BUCKET).createSignedUrl(path, expiresIn);
}

export async function deleteComplaintAttachment(path: string) {
  return supabase.storage.from(COMPLAINT_BUCKET).remove([path]);
}
