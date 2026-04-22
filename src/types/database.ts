// ─── Document Types ───────────────────────────────────────────────────────────

export type DocumentType =
  | 'barangay_clearance'
  | 'certificate_of_residency'
  | 'certificate_of_indigency'
  | 'business_clearance'
  | 'other';

export type RequestStatus =
  | 'pending'
  | 'processing'
  | 'ready_for_pickup'
  | 'completed'
  | 'rejected';

export type ComplaintStatus =
  | 'open'
  | 'under_review'
  | 'resolved'
  | 'dismissed';

export type LogType =
  | 'login'
  | 'approval'
  | 'rejection'
  | 'edit'
  | 'complaint'
  | 'system';

// ─── Table Interfaces ─────────────────────────────────────────────────────────

export interface Resident {
  id: string;                     // UUID
  reference_id: string;           // BD2-YYYY-XXXX
  full_name: string;
  birthdate: string;              // ISO date
  address: string;
  purok: string;
  contact_number: string | null;
  is_voter: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentRequest {
  id: string;
  resident_id: string | null;     // FK → residents.id (nullable for walk-ins)
  tracking_code: string;          // BD2-YYYY-XXXX
  document_type: DocumentType;
  status: RequestStatus;
  purpose: string;
  notes: string | null;
  requested_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  reference_id: string;
  complainant_name: string;
  respondent_name: string;
  description: string;
  attachment_url: string | null;
  status: ComplaintStatus;
  urgency: 'low' | 'medium' | 'high';
  submitted_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_by: string;             // FK → auth.users.id
  created_at: string;
}

export interface ActivityLog {
  id: string;
  admin_id: string;               // FK → auth.users.id
  action: string;                 // e.g. "Approved Request BD2-2025-0042"
  entity_type: string;            // e.g. "document_request"
  entity_id: string | null;
  log_type: LogType;
  created_at: string;
}

export interface Feedback {
  id: string;
  message: string;
  is_anonymous: boolean;
  resident_name: string | null;
  submitted_at: string;
}
