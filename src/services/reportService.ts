import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from './supabase';
import { formatDate } from '../utils/formatters';
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

function normalizeBarangayName(name: string): string {
  return name
    .replace(/\bIl\b/g, 'II')
    .replace(/\bIL\b/g, 'II')
    .replace(/\b11\b/g, 'II')
    .replace(/\bll\b/g, 'II');
}

function addReportHeader(
  doc: jsPDF,
  title: string,
  snapshot: ReportsSnapshot,
  subtitle?: string
): number {
  const rawBarangay = snapshot.settings?.barangay_name ?? 'Daine II';
  const barangay = normalizeBarangayName(rawBarangay);
  const municipality = snapshot.settings?.municipality ?? 'Indang';
  const province = snapshot.settings?.province ?? 'Cavite';
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('REPUBLIC OF THE PHILIPPINES', pageWidth / 2, 12, { align: 'center' });
  doc.text(
    `PROVINCE OF ${province.toUpperCase()} · MUNICIPALITY OF ${municipality.toUpperCase()}`,
    pageWidth / 2,
    16.5,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text(`BARANGAY ${barangay.toUpperCase()}`, pageWidth / 2, 22, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('BARANGAY MANAGEMENT INFORMATION SYSTEM (BMIS)', pageWidth / 2, 26.5, { align: 'center' });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, 29.5, pageWidth - 14, 29.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(29, 78, 216);
  doc.text(title.toUpperCase(), 14, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const genDate = new Date(snapshot.generatedAt).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Reporting Year: ${snapshot.year}   |   Generated: ${genDate}   |   System: BarangayHub`, 14, 41);

  if (subtitle) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(subtitle, 14, 46);
    return 50;
  }

  return 45;
}

function addReportFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 11, pageWidth - 14, pageHeight - 11);
    doc.text('BarangayHub - Official Digital Management Information System', 14, pageHeight - 7);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
  }
}

function getLastAutoTableY(doc: jsPDF, fallback: number): number {
  const lastTable = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable;
  return lastTable?.finalY ?? fallback;
}

function generateMonthlyDocumentsPdf(snapshot: ReportsSnapshot): { doc: jsPDF; rowCount: number } {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const startY = addReportHeader(
    doc,
    'Monthly Document Issuance Report',
    snapshot,
    `Total Requests: ${snapshot.totals.documentRequests.toLocaleString()}   |   Completed: ${snapshot.totals.completedRequests.toLocaleString()}`
  );

  const tableBody = snapshot.monthlyDocuments.map((row) => [
    row.month,
    row.requested.toLocaleString(),
    row.completed.toLocaleString(),
    row.rejected.toLocaleString(),
    row.requested > 0 ? `${Math.round((row.completed / row.requested) * 100)}%` : '0%',
  ]);

  const totalRejected = snapshot.monthlyDocuments.reduce((sum, r) => sum + r.rejected, 0);
  const totalRate =
    snapshot.totals.documentRequests > 0
      ? `${Math.round((snapshot.totals.completedRequests / snapshot.totals.documentRequests) * 100)}%`
      : '0%';

  autoTable(doc, {
    startY,
    head: [['Month', 'Requested', 'Completed', 'Rejected', 'Completion Rate']],
    body: tableBody,
    foot: [
      [
        'Annual Total',
        snapshot.totals.documentRequests.toLocaleString(),
        snapshot.totals.completedRequests.toLocaleString(),
        totalRejected.toLocaleString(),
        totalRate,
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [29, 78, 216], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  addReportFooter(doc);
  return { doc, rowCount: snapshot.monthlyDocuments.length };
}

function generateResidentCensusPdf(snapshot: ReportsSnapshot): { doc: jsPDF; rowCount: number } {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const startY = addReportHeader(
    doc,
    'Resident Census & Demographics Report',
    snapshot,
    `Total Registered Residents: ${snapshot.residents.length.toLocaleString()}   |   Registered Voters: ${snapshot.totals.registeredVoters.toLocaleString()}`
  );

  const tableBody =
    snapshot.residents.length > 0
      ? snapshot.residents.map((resident) => [
          resident.reference_id,
          resident.full_name,
          GENDER_LABELS[resident.gender] ?? resident.gender,
          resident.birthdate,
          CIVIL_STATUS_LABELS[resident.civil_status] ?? resident.civil_status,
          resident.purok,
          resident.contact_number || 'N/A',
          resident.is_voter ? 'Voter' : 'Non-Voter',
        ])
      : [['No resident records found.', '', '', '', '', '', '', '']];

  autoTable(doc, {
    startY,
    head: [['Reference ID', 'Full Name', 'Gender', 'Birthdate', 'Civil Status', 'Purok', 'Contact No.', 'Voter Status']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [22, 101, 52], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  addReportFooter(doc);
  return { doc, rowCount: snapshot.residents.length };
}

function generateComplaintsBlotterPdf(snapshot: ReportsSnapshot): { doc: jsPDF; rowCount: number } {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const startY = addReportHeader(
    doc,
    'Complaints & Blotter Log',
    snapshot,
    `Total Complaints: ${snapshot.totals.complaints.toLocaleString()}   |   Resolved: ${snapshot.totals.resolvedComplaints.toLocaleString()}`
  );

  const tableBody =
    snapshot.complaints.length > 0
      ? snapshot.complaints.map((complaint) => [
          complaint.reference_id,
          complaint.submitted_at ? formatDate(complaint.submitted_at) : 'N/A',
          complaint.title,
          complaint.complainant_name,
          complaint.respondent_name || 'N/A',
          complaint.purok,
          URGENCY_LABELS[complaint.urgency] ?? complaint.urgency,
          COMPLAINT_STATUS_LABELS[complaint.status] ?? complaint.status,
        ])
      : [['No complaints or blotter records filed for this period.', '', '', '', '', '', '', '']];

  autoTable(doc, {
    startY,
    head: [['Reference ID', 'Date Filed', 'Title / Concern', 'Complainant', 'Respondent', 'Purok', 'Urgency', 'Status']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  addReportFooter(doc);
  return { doc, rowCount: snapshot.complaints.length };
}

function generateAnnualSummaryPdf(snapshot: ReportsSnapshot): { doc: jsPDF; rowCount: number } {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const startY = addReportHeader(
    doc,
    'Annual Barangay MIS Consolidated Summary',
    snapshot,
    `Consolidated performance indicators and MIS analytics for Calendar Year ${snapshot.year}`
  );

  // Table 1: Key MIS Totals
  autoTable(doc, {
    startY,
    head: [['Key Indicator', 'Metric Value']],
    body: [
      ['Total Resident Population', snapshot.totals.residents.toLocaleString()],
      ['Registered Voters', snapshot.totals.registeredVoters.toLocaleString()],
      ['Total Document Requests Received', snapshot.totals.documentRequests.toLocaleString()],
      ['Documents Processed & Completed', snapshot.totals.completedRequests.toLocaleString()],
      [
        'Document Completion Efficiency',
        snapshot.totals.documentRequests > 0
          ? `${Math.round((snapshot.totals.completedRequests / snapshot.totals.documentRequests) * 100)}%`
          : '0%',
      ],
      ['Complaints & Blotters Filed', snapshot.totals.complaints.toLocaleString()],
      ['Complaints Resolved', snapshot.totals.resolvedComplaints.toLocaleString()],
      [
        'Complaint Resolution Rate',
        snapshot.totals.complaints > 0
          ? `${Math.round((snapshot.totals.resolvedComplaints / snapshot.totals.complaints) * 100)}%`
          : '0%',
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [180, 83, 9], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: [51, 65, 85] },
    margin: { left: 14, right: 14 },
  });

  // Table 2: Document Breakdown
  const table1EndY = getLastAutoTableY(doc, startY + 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('Document Requests Breakdown by Type', 14, table1EndY + 7);

  autoTable(doc, {
    startY: table1EndY + 9,
    head: [['Document Classification', 'Volume Issued']],
    body: snapshot.documentsByType.map((item) => [item.label, item.value.toLocaleString()]),
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
    margin: { left: 14, right: 14 },
  });

  // Table 3: Purok Distribution
  const table2EndY = getLastAutoTableY(doc, table1EndY + 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('Population Distribution by Purok', 14, table2EndY + 7);

  autoTable(doc, {
    startY: table2EndY + 9,
    head: [['Purok', 'Registered Residents']],
    body: snapshot.residentsByPurok.map((item) => [item.label, item.value.toLocaleString()]),
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
    margin: { left: 14, right: 14 },
  });

  addReportFooter(doc);
  return { doc, rowCount: 8 + snapshot.documentsByType.length + snapshot.residentsByPurok.length };
}

export async function downloadReport(
  reportId: ReportId,
  snapshot: ReportsSnapshot
): Promise<{ data: ReportDownload | null; error: unknown }> {
  const rawBarangay = snapshot.settings?.barangay_name ?? 'Daine II';
  const barangay = normalizeBarangayName(rawBarangay);
  const prefix = barangay.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let fileName: string;
  let doc: jsPDF;
  let rowCount: number;

  if (reportId === 'monthly-documents') {
    fileName = `${prefix}-${snapshot.year}-monthly-documents.pdf`;
    const result = generateMonthlyDocumentsPdf(snapshot);
    doc = result.doc;
    rowCount = result.rowCount;
  } else if (reportId === 'resident-census') {
    fileName = `${prefix}-resident-census.pdf`;
    const result = generateResidentCensusPdf(snapshot);
    doc = result.doc;
    rowCount = result.rowCount;
  } else if (reportId === 'complaints-blotter') {
    fileName = `${prefix}-${snapshot.year}-complaints-blotter.pdf`;
    const result = generateComplaintsBlotterPdf(snapshot);
    doc = result.doc;
    rowCount = result.rowCount;
  } else {
    fileName = `${prefix}-${snapshot.year}-annual-summary.pdf`;
    const result = generateAnnualSummaryPdf(snapshot);
    doc = result.doc;
    rowCount = result.rowCount;
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
    action: `Generated ${reportId.replaceAll('-', ' ')} PDF report`,
    entity_type: 'reports',
    entity_id: null,
    log_type: 'system',
    details: {
      report_id: reportId,
      reporting_year: snapshot.year,
      file_name: fileName,
      row_count: rowCount,
      format: 'pdf',
    },
  });
  if (logError) return { data: null, error: logError };

  doc.save(fileName);
  return { data: { fileName, rowCount }, error: null };
}
