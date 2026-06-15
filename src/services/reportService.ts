import { supabase } from './supabase';
import type {
  CivilStatusType,
  Complaint,
  ComplaintStatus,
  DocumentRequest,
  DocumentType,
  GenderType,
  Resident,
  SystemSettings,
  UrgencyLevel,
} from '../types/database';

export type ReportId =
  | 'monthly-documents'
  | 'resident-census'
  | 'complaints-blotter'
  | 'annual-summary';

export interface ReportBreakdown {
  label: string;
  value: number;
}

export interface MonthlyDocumentSummary {
  month: string;
  requested: number;
  completed: number;
  rejected: number;
}

export interface ReportsSnapshot {
  year: number;
  generatedAt: string;
  settings: SystemSettings | null;
  residents: Resident[];
  documentRequests: DocumentRequest[];
  complaints: Complaint[];
  totals: {
    residents: number;
    registeredVoters: number;
    documentRequests: number;
    completedRequests: number;
    complaints: number;
    resolvedComplaints: number;
  };
  monthlyDocuments: MonthlyDocumentSummary[];
  documentsByType: ReportBreakdown[];
  residentsByPurok: ReportBreakdown[];
  residentsByGender: ReportBreakdown[];
  residentsByCivilStatus: ReportBreakdown[];
  complaintsByStatus: ReportBreakdown[];
  complaintsByUrgency: ReportBreakdown[];
}

export interface ReportDownload {
  fileName: string;
  rowCount: number;
}

interface PageResult<T> {
  data: T[] | null;
  error: unknown;
}

const PAGE_SIZE = 1000;
const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  barangay_clearance: 'Barangay Clearance',
  certificate_of_residency: 'Certificate of Residency',
  certificate_of_indigency: 'Certificate of Indigency',
  business_clearance: 'Business Clearance',
  other: 'Other',
};

const GENDER_LABELS: Record<GenderType, string> = {
  male: 'Male',
  female: 'Female',
};

const CIVIL_STATUS_LABELS: Record<CivilStatusType, string> = {
  single: 'Single',
  married: 'Married',
  widow: 'Widow',
  widower: 'Widower',
  separated: 'Separated',
};

const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  open: 'Open',
  under_review: 'Under Review',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
};

const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

async function collectPages<T>(
  loadPage: (from: number, to: number) => PromiseLike<PageResult<T>>
): Promise<{ data: T[]; error: unknown }> {
  const rows: T[] = [];

  for (let page = 0; ; page += 1) {
    const from = page * PAGE_SIZE;
    const result = await loadPage(from, from + PAGE_SIZE - 1);
    if (result.error) return { data: rows, error: result.error };

    const pageRows = result.data ?? [];
    rows.push(...pageRows);
    if (pageRows.length < PAGE_SIZE) break;
  }

  return { data: rows, error: null };
}

function countBy<T extends string>(
  rows: T[],
  labels: Record<T, string>
): ReportBreakdown[] {
  return Object.entries(labels).map(([value, label]) => ({
    label: String(label),
    value: rows.filter((row) => row === value).length,
  }));
}

function countPuroks(residents: Resident[]): ReportBreakdown[] {
  const counts = new Map<string, number>();
  residents.forEach((resident) => {
    counts.set(resident.purok, (counts.get(resident.purok) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export async function getReportsSnapshot(
  year: number
): Promise<{ data: ReportsSnapshot; error: unknown }> {
  const start = `${year}-01-01T00:00:00+08:00`;
  const end = `${year + 1}-01-01T00:00:00+08:00`;

  const [settingsResult, residentsResult, requestsResult, complaintsResult] =
    await Promise.all([
      supabase.from('system_settings').select('*').eq('id', 1).single(),
      collectPages<Resident>((from, to) =>
        supabase
          .from('residents')
          .select('*')
          .order('created_at', { ascending: true })
          .range(from, to)
      ),
      collectPages<DocumentRequest>((from, to) =>
        supabase
          .from('document_requests')
          .select('*')
          .gte('requested_at', start)
          .lt('requested_at', end)
          .order('requested_at', { ascending: true })
          .range(from, to)
      ),
      collectPages<Complaint>((from, to) =>
        supabase
          .from('complaints')
          .select('*')
          .gte('submitted_at', start)
          .lt('submitted_at', end)
          .order('submitted_at', { ascending: true })
          .range(from, to)
      ),
    ]);

  const residents = residentsResult.data;
  const documentRequests = requestsResult.data;
  const complaints = complaintsResult.data;
  const error =
    settingsResult.error ??
    residentsResult.error ??
    requestsResult.error ??
    complaintsResult.error;

  return {
    data: {
      year,
      generatedAt: new Date().toISOString(),
      settings: settingsResult.data,
      residents,
      documentRequests,
      complaints,
      totals: {
        residents: residents.length,
        registeredVoters: residents.filter((resident) => resident.is_voter)
          .length,
        documentRequests: documentRequests.length,
        completedRequests: documentRequests.filter(
          (request) => request.status === 'completed'
        ).length,
        complaints: complaints.length,
        resolvedComplaints: complaints.filter(
          (complaint) => complaint.status === 'resolved'
        ).length,
      },
      monthlyDocuments: MONTH_LABELS.map((month, index) => {
        const monthly = documentRequests.filter(
          (request) => new Date(request.requested_at).getUTCMonth() === index
        );
        return {
          month,
          requested: monthly.length,
          completed: monthly.filter(
            (request) => request.status === 'completed'
          ).length,
          rejected: monthly.filter((request) => request.status === 'rejected')
            .length,
        };
      }),
      documentsByType: countBy(
        documentRequests.map((request) => request.document_type),
        DOCUMENT_TYPE_LABELS
      ),
      residentsByPurok: countPuroks(residents),
      residentsByGender: countBy(
        residents.map((resident) => resident.gender),
        GENDER_LABELS
      ),
      residentsByCivilStatus: countBy(
        residents.map((resident) => resident.civil_status),
        CIVIL_STATUS_LABELS
      ),
      complaintsByStatus: countBy(
        complaints.map((complaint) => complaint.status),
        COMPLAINT_STATUS_LABELS
      ),
      complaintsByUrgency: countBy(
        complaints.map((complaint) => complaint.urgency),
        URGENCY_LABELS
      ),
    },
    error,
  };
}

function escapeCsv(value: string | number | boolean | null): string {
  const rawText = value === null ? '' : String(value);
  const text = /^[=+\-@\t\r]/.test(rawText) ? `'${rawText}` : rawText;
  return `"${text.replaceAll('"', '""')}"`;
}

function createCsv(headers: string[], rows: (string | number | boolean | null)[][]) {
  return [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\r\n');
}

function downloadCsv(fileName: string, csv: string) {
  const blob = new Blob([`\uFEFF${csv}`], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function downloadReport(
  reportId: ReportId,
  snapshot: ReportsSnapshot
): Promise<{ data: ReportDownload | null; error: unknown }> {
  const barangay = snapshot.settings?.barangay_name ?? 'barangay';
  const prefix = barangay.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let fileName: string;
  let csv: string;
  let rowCount: number;

  if (reportId === 'monthly-documents') {
    fileName = `${prefix}-${snapshot.year}-monthly-documents.csv`;
    rowCount = snapshot.monthlyDocuments.length;
    csv = createCsv(
      ['Month', 'Requested', 'Completed', 'Rejected'],
      snapshot.monthlyDocuments.map((row) => [
        row.month,
        row.requested,
        row.completed,
        row.rejected,
      ])
    );
  } else if (reportId === 'resident-census') {
    fileName = `${prefix}-resident-census.csv`;
    rowCount = snapshot.residents.length;
    csv = createCsv(
      [
        'Reference ID',
        'Full Name',
        'Gender',
        'Birthdate',
        'Civil Status',
        'Address',
        'Purok',
        'Contact Number',
        'Citizenship',
        'Registered Voter',
      ],
      snapshot.residents.map((resident) => [
        resident.reference_id,
        resident.full_name,
        GENDER_LABELS[resident.gender],
        resident.birthdate,
        CIVIL_STATUS_LABELS[resident.civil_status],
        resident.address,
        resident.purok,
        resident.contact_number,
        resident.citizenship,
        resident.is_voter,
      ])
    );
  } else if (reportId === 'complaints-blotter') {
    fileName = `${prefix}-${snapshot.year}-complaints-blotter.csv`;
    rowCount = snapshot.complaints.length;
    csv = createCsv(
      [
        'Reference ID',
        'Date Submitted',
        'Title',
        'Complainant',
        'Respondent',
        'Purok',
        'Incident Date',
        'Incident Location',
        'Urgency',
        'Status',
        'Resolution Notes',
      ],
      snapshot.complaints.map((complaint) => [
        complaint.reference_id,
        complaint.submitted_at,
        complaint.title,
        complaint.complainant_name,
        complaint.respondent_name,
        complaint.purok,
        complaint.incident_date,
        complaint.incident_location,
        URGENCY_LABELS[complaint.urgency],
        COMPLAINT_STATUS_LABELS[complaint.status],
        complaint.resolution_notes,
      ])
    );
  } else {
    fileName = `${prefix}-${snapshot.year}-annual-summary.csv`;
    const rows: (string | number)[][] = [
      ['Total Residents', snapshot.totals.residents],
      ['Registered Voters', snapshot.totals.registeredVoters],
      ['Document Requests', snapshot.totals.documentRequests],
      ['Completed Requests', snapshot.totals.completedRequests],
      ['Complaints Filed', snapshot.totals.complaints],
      ['Resolved Complaints', snapshot.totals.resolvedComplaints],
      ...snapshot.documentsByType.map((row) => [
        `Documents - ${row.label}`,
        row.value,
      ]),
      ...snapshot.complaintsByStatus.map((row) => [
        `Complaints - ${row.label}`,
        row.value,
      ]),
    ];
    rowCount = rows.length;
    csv = createCsv(['Metric', 'Value'], rows);
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return {
      data: null,
      error: authError ?? new Error('No authenticated user.'),
    };
  }

  const { error: logError } = await supabase.from('activity_logs').insert({
    admin_id: authData.user.id,
    admin_email: authData.user.email,
    action: `Generated ${reportId.replaceAll('-', ' ')} report`,
    entity_type: 'reports',
    entity_id: null,
    log_type: 'system',
    details: {
      report_id: reportId,
      reporting_year: snapshot.year,
      file_name: fileName,
      row_count: rowCount,
    },
  });
  if (logError) return { data: null, error: logError };

  downloadCsv(fileName, csv);
  return { data: { fileName, rowCount }, error: null };
}
