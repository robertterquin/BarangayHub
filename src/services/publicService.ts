import { supabase } from './supabase';
import type { DocumentRequest, Complaint, Feedback } from '../types/database';
import { generateReferenceId } from '../utils/idGenerator';

// ─── Document Request Submission ──────────────────────────────────────────────

export async function submitDocumentRequest(
  payload: Pick<DocumentRequest, 'document_type' | 'purpose'> & { full_name: string }
): Promise<{ trackingCode: string | null; error: unknown }> {
  const trackingCode = await generateReferenceId('document_requests', 'tracking_code');

  const { error } = await supabase.from('document_requests').insert({
    tracking_code: trackingCode,
    document_type: payload.document_type,
    purpose: payload.purpose,
    status: 'pending',
    resident_id: null,
  });

  if (error) return { trackingCode: null, error };
  return { trackingCode, error: null };
}

// ─── Track Request Status ─────────────────────────────────────────────────────

export async function trackRequest(trackingCode: string) {
  return supabase
    .from('document_requests')
    .select('tracking_code, document_type, status, requested_at, updated_at')
    .eq('tracking_code', trackingCode)
    .maybeSingle();
}

// ─── Complaint Submission ─────────────────────────────────────────────────────

export async function submitComplaint(
  payload: Pick<Complaint, 'complainant_name' | 'respondent_name' | 'description' | 'urgency'>
): Promise<{ referenceId: string | null; error: unknown }> {
  const referenceId = await generateReferenceId('complaints', 'reference_id');

  const { error } = await supabase.from('complaints').insert({
    reference_id: referenceId,
    ...payload,
    status: 'open',
    attachment_url: null,
  });

  if (error) return { referenceId: null, error };
  return { referenceId, error: null };
}

// ─── Public Announcements ─────────────────────────────────────────────────────

export async function getPublishedAnnouncements() {
  return supabase
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });
}

// ─── Feedback Submission ──────────────────────────────────────────────────────

export async function submitFeedback(
  payload: Pick<Feedback, 'message' | 'is_anonymous' | 'resident_name'>
) {
  return supabase.from('feedback').insert({
    ...payload,
    submitted_at: new Date().toISOString(),
  });
}
