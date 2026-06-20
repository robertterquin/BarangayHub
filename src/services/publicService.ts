import { supabase } from './supabase';
import type {
  PublicDashboardSummary,
  SubmitComplaintPayload,
  SubmitDocumentRequestPayload,
  SubmitFeedbackPayload,
} from '../types/database';

const COMPLAINT_BUCKET = 'complaint-attachments';

function createStoragePath(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
  return `public/${crypto.randomUUID()}.${extension}`;
}

export async function submitDocumentRequest(payload: SubmitDocumentRequestPayload) {
  const { data, error } = await supabase.rpc('submit_document_request', {
    p_requester_name: payload.requesterName,
    p_birthdate: payload.birthdate,
    p_gender: payload.gender,
    p_address: payload.address,
    p_purok: payload.purok,
    p_contact_number: payload.contactNumber,
    p_email: payload.email ?? null,
    p_document_type: payload.documentType,
    p_other_document_type: payload.otherDocumentType ?? null,
    p_purpose: payload.purpose,
  });

  return {
    data: data?.[0] ?? null,
    trackingCode: data?.[0]?.tracking_code ?? null,
    error,
  };
}

export async function trackRequest(trackingCode: string) {
  const { data, error } = await supabase.rpc('track_document_request', {
    p_tracking_code: trackingCode.trim().toUpperCase(),
  });
  return { data: data?.[0] ?? null, error };
}

export async function uploadComplaintAttachment(file: File) {
  const path = createStoragePath(file);
  const { data, error } = await supabase.storage
    .from(COMPLAINT_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  return { data: data ? { path: data.path } : null, error };
}

export async function submitComplaint(payload: SubmitComplaintPayload) {
  const { data, error } = await supabase.rpc('submit_complaint', {
    p_title: payload.title,
    p_description: payload.description,
    p_complainant_name: payload.complainantName,
    p_respondent_name: payload.respondentName ?? null,
    p_complainant_contact: payload.complainantContact,
    p_complainant_address: payload.complainantAddress,
    p_purok: payload.purok,
    p_incident_date: payload.incidentDate ?? null,
    p_incident_location: payload.incidentLocation ?? null,
    p_attachment_url: payload.attachmentUrl ?? null,
  });

  return {
    data: data?.[0] ?? null,
    referenceId: data?.[0]?.reference_id ?? null,
    error,
  };
}

export async function getPublishedAnnouncements(limit = 20) {
  return supabase
    .from('announcements')
    .select('*')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit);
}

export async function getPublicOfficials() {
  return supabase
    .from('officials')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
}

export async function getPublicSystemSettings() {
  return supabase.from('system_settings').select('*').eq('id', 1).single();
}

export async function getPublicDashboardSummary() {
  const { data, error } = await supabase.rpc('get_public_dashboard_summary');

  return {
    data: data as PublicDashboardSummary | null,
    error,
  };
}

export async function submitFeedback(payload: SubmitFeedbackPayload) {
  const { data, error } = await supabase.rpc('submit_feedback', {
    p_resident_name: payload.residentName ?? null,
    p_contact_number: payload.contactNumber ?? null,
    p_email: payload.email ?? null,
    p_is_anonymous: payload.isAnonymous,
    p_category: payload.category,
    p_message: payload.message,
  });

  return { data: data ?? null, error };
}
