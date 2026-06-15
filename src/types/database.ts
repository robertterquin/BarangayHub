export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AdminRole = 'admin';
export type AccountStatus = 'active' | 'inactive';
export type GenderType = 'male' | 'female';
export type CivilStatusType = 'single' | 'married' | 'widow' | 'widower' | 'separated';
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
export type ComplaintStatus = 'open' | 'under_review' | 'resolved' | 'dismissed';
export type UrgencyLevel = 'low' | 'medium' | 'high';
export type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type OfficialAccent = 'gold' | 'blue';
export type FeedbackCategory =
  | 'suggestion'
  | 'commendation'
  | 'bug_report'
  | 'feature_request'
  | 'other';
export type FeedbackStatus = 'pending' | 'under_review' | 'reviewed';
export type LogType = 'login' | 'approval' | 'rejection' | 'edit' | 'complaint' | 'system';
export type NotificationType = 'document_request' | 'complaint' | 'feedback' | 'system';

type TableDefinition<Row, Insert, Update> = {
  Row: Row & Record<string, unknown>;
  Insert: Insert & Record<string, unknown>;
  Update: Update & Record<string, unknown>;
  Relationships: [];
};

export interface AdminProfile {
  id: string;
  email: string;
  display_name: string;
  role: AdminRole;
  status: AccountStatus;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SystemSettings {
  id: number;
  barangay_name: string;
  municipality: string;
  province: string;
  complete_address: string;
  contact_number: string | null;
  public_email: string | null;
  system_version: string;
  service_since: number;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resident {
  id: string;
  reference_id: string;
  full_name: string;
  gender: GenderType;
  birthdate: string;
  civil_status: CivilStatusType;
  address: string;
  purok: string;
  contact_number: string | null;
  citizenship: string;
  is_voter: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentRequest {
  id: string;
  tracking_code: string;
  resident_id: string | null;
  requester_name: string;
  birthdate: string;
  gender: GenderType;
  address: string;
  purok: string;
  contact_number: string;
  email: string | null;
  document_type: DocumentType;
  other_document_type: string | null;
  purpose: string;
  status: RequestStatus;
  admin_notes: string | null;
  public_status_note: string | null;
  rejection_reason: string | null;
  processed_by: string | null;
  requested_at: string;
  updated_at: string;
  ready_at: string | null;
  completed_at: string | null;
  picked_up_at: string | null;
}

export interface Official {
  id: string;
  initials: string;
  full_name: string;
  position: string;
  accent: OfficialAccent;
  photo_url: string | null;
  display_order: number;
  is_active: boolean;
  term_start: string | null;
  term_end: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  reference_id: string;
  title: string;
  description: string;
  complainant_name: string;
  respondent_name: string | null;
  complainant_contact: string;
  complainant_address: string;
  purok: string;
  incident_date: string | null;
  incident_location: string | null;
  attachment_url: string | null;
  status: ComplaintStatus;
  urgency: UrgencyLevel;
  assigned_official_id: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  submitted_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: string;
  body: string;
  image_url: string | null;
  status: AnnouncementStatus;
  scheduled_for: string | null;
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  resident_name: string | null;
  contact_number: string | null;
  email: string | null;
  is_anonymous: boolean;
  category: FeedbackCategory;
  message: string;
  status: FeedbackStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  submitted_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  admin_id: string | null;
  admin_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  log_type: LogType;
  details: Json;
  created_at: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export type AdminProfileInsert = Pick<AdminProfile, 'id' | 'email'> &
  Partial<Omit<AdminProfile, 'id' | 'email'>>;
export type AdminProfileUpdate = Partial<Omit<AdminProfile, 'id' | 'created_at' | 'updated_at'>>;
export type SystemSettingsInsert = Partial<SystemSettings> & Pick<SystemSettings, 'id'>;
export type SystemSettingsUpdate = Partial<Omit<SystemSettings, 'id' | 'created_at' | 'updated_at'>>;
export type ResidentInsert = Pick<
  Resident,
  'reference_id' | 'full_name' | 'gender' | 'birthdate' | 'civil_status' | 'address' | 'purok'
> &
  Partial<Omit<Resident, 'id' | 'reference_id' | 'full_name' | 'gender' | 'birthdate' | 'civil_status' | 'address' | 'purok' | 'created_at' | 'updated_at'>>;
export type ResidentUpdate = Partial<Omit<Resident, 'id' | 'created_at' | 'updated_at'>>;
export type DocumentRequestInsert = Pick<
  DocumentRequest,
  | 'tracking_code'
  | 'requester_name'
  | 'birthdate'
  | 'gender'
  | 'address'
  | 'purok'
  | 'contact_number'
  | 'document_type'
  | 'purpose'
> &
  Partial<Omit<DocumentRequest, 'id' | 'tracking_code' | 'requester_name' | 'birthdate' | 'gender' | 'address' | 'purok' | 'contact_number' | 'document_type' | 'purpose' | 'requested_at' | 'updated_at'>>;
export type DocumentRequestUpdate = Partial<Omit<DocumentRequest, 'id' | 'requested_at' | 'updated_at'>>;
export type OfficialInsert = Pick<Official, 'initials' | 'full_name' | 'position'> &
  Partial<Omit<Official, 'id' | 'initials' | 'full_name' | 'position' | 'created_at' | 'updated_at'>>;
export type OfficialUpdate = Partial<Omit<Official, 'id' | 'created_at' | 'updated_at'>>;
export type ComplaintInsert = Pick<
  Complaint,
  | 'reference_id'
  | 'title'
  | 'description'
  | 'complainant_name'
  | 'complainant_contact'
  | 'complainant_address'
  | 'purok'
> &
  Partial<Omit<Complaint, 'id' | 'reference_id' | 'title' | 'description' | 'complainant_name' | 'complainant_contact' | 'complainant_address' | 'purok' | 'submitted_at' | 'updated_at'>>;
export type ComplaintUpdate = Partial<Omit<Complaint, 'id' | 'reference_id' | 'submitted_at' | 'updated_at'>>;
export type AnnouncementInsert = Pick<Announcement, 'title' | 'category' | 'body'> &
  Partial<Omit<Announcement, 'id' | 'title' | 'category' | 'body' | 'created_at' | 'updated_at'>>;
export type AnnouncementUpdate = Partial<Omit<Announcement, 'id' | 'created_at' | 'updated_at'>>;
export type FeedbackInsert = Pick<Feedback, 'message'> &
  Partial<Omit<Feedback, 'id' | 'message' | 'submitted_at' | 'updated_at'>>;
export type FeedbackUpdate = Partial<Omit<Feedback, 'id' | 'submitted_at' | 'updated_at'>>;
export type ActivityLogInsert = Pick<ActivityLog, 'action' | 'entity_type'> &
  Partial<Omit<ActivityLog, 'id' | 'action' | 'entity_type' | 'created_at'>>;
export type ActivityLogUpdate = Partial<Omit<ActivityLog, 'id' | 'created_at'>>;
export type NotificationInsert = Pick<Notification, 'type' | 'title' | 'message'> &
  Partial<Omit<Notification, 'id' | 'type' | 'title' | 'message' | 'created_at'>>;
export type NotificationUpdate = Partial<Omit<Notification, 'id' | 'created_at'>>;

export interface SubmitDocumentRequestPayload {
  requesterName: string;
  birthdate: string;
  gender: GenderType;
  address: string;
  purok: string;
  contactNumber: string;
  email?: string | null;
  documentType: DocumentType;
  otherDocumentType?: string | null;
  purpose: string;
}

export interface SubmitComplaintPayload {
  title: string;
  description: string;
  complainantName: string;
  respondentName?: string | null;
  complainantContact: string;
  complainantAddress: string;
  purok: string;
  incidentDate?: string | null;
  incidentLocation?: string | null;
  attachmentUrl?: string | null;
}

export interface SubmitFeedbackPayload {
  residentName?: string | null;
  contactNumber?: string | null;
  email?: string | null;
  isAnonymous: boolean;
  category: FeedbackCategory;
  message: string;
}

export interface TrackedDocumentRequest {
  tracking_code: string;
  document_type: DocumentType;
  other_document_type: string | null;
  status: RequestStatus;
  public_status_note: string | null;
  requested_at: string;
  updated_at: string;
  ready_at: string | null;
  completed_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      admin_profiles: TableDefinition<AdminProfile, AdminProfileInsert, AdminProfileUpdate>;
      system_settings: TableDefinition<SystemSettings, SystemSettingsInsert, SystemSettingsUpdate>;
      residents: TableDefinition<Resident, ResidentInsert, ResidentUpdate>;
      document_requests: TableDefinition<DocumentRequest, DocumentRequestInsert, DocumentRequestUpdate>;
      officials: TableDefinition<Official, OfficialInsert, OfficialUpdate>;
      complaints: TableDefinition<Complaint, ComplaintInsert, ComplaintUpdate>;
      announcements: TableDefinition<Announcement, AnnouncementInsert, AnnouncementUpdate>;
      feedback: TableDefinition<Feedback, FeedbackInsert, FeedbackUpdate>;
      activity_logs: TableDefinition<ActivityLog, ActivityLogInsert, ActivityLogUpdate>;
      notifications: TableDefinition<Notification, NotificationInsert, NotificationUpdate>;
    };
    Views: Record<never, never>;
    Functions: {
      is_active_admin: {
        Args: never;
        Returns: boolean;
      };
      submit_document_request: {
        Args: {
          p_requester_name: string;
          p_birthdate: string;
          p_gender: GenderType;
          p_address: string;
          p_purok: string;
          p_contact_number: string;
          p_email: string | null;
          p_document_type: DocumentType;
          p_other_document_type: string | null;
          p_purpose: string;
        };
        Returns: { id: string; tracking_code: string }[];
      };
      track_document_request: {
        Args: { p_tracking_code: string };
        Returns: TrackedDocumentRequest[];
      };
      submit_complaint: {
        Args: {
          p_title: string;
          p_description: string;
          p_complainant_name: string;
          p_respondent_name: string | null;
          p_complainant_contact: string;
          p_complainant_address: string;
          p_purok: string;
          p_incident_date: string | null;
          p_incident_location: string | null;
          p_attachment_url: string | null;
        };
        Returns: { id: string; reference_id: string }[];
      };
      submit_feedback: {
        Args: {
          p_resident_name: string | null;
          p_contact_number: string | null;
          p_email: string | null;
          p_is_anonymous: boolean;
          p_category: FeedbackCategory;
          p_message: string;
        };
        Returns: string;
      };
    };
    Enums: {
      admin_role: AdminRole;
      account_status: AccountStatus;
      gender_type: GenderType;
      civil_status_type: CivilStatusType;
      document_type: DocumentType;
      request_status: RequestStatus;
      complaint_status: ComplaintStatus;
      urgency_level: UrgencyLevel;
      announcement_status: AnnouncementStatus;
      official_accent: OfficialAccent;
      feedback_category: FeedbackCategory;
      feedback_status: FeedbackStatus;
      log_type: LogType;
      notification_type: NotificationType;
    };
    CompositeTypes: Record<never, never>;
  };
}
