import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Search,
  XCircle,
} from 'lucide-react';
import { PublicPageShell } from '../../components/public';
import { Button, Input } from '../../components/ui';
import { usePublicDocumentRequest } from '../../hooks/usePublicDocumentRequest';
import { usePublicComplaint } from '../../hooks/usePublicComplaint';
import type {
  ComplaintStatus,
  DocumentType,
  TrackedComplaint,
  TrackedDocumentRequest,
} from '../../types/database';
import { formatComplaintStatus, formatDate, formatRequestStatus } from '../../utils/formatters';

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  barangay_clearance: 'Barangay Clearance',
  certificate_of_residency: 'Certificate of Residency',
  certificate_of_indigency: 'Certificate of Indigency',
  business_clearance: 'Business Clearance',
  other: 'Other Document',
};

const COMPLAINT_STATUS_STYLES: Record<ComplaintStatus, string> = {
  open: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
  under_review: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  resolved: 'bg-green-100 text-green-700 ring-1 ring-green-200',
  dismissed: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
};

type LookupResult =
  | { kind: 'document'; data: TrackedDocumentRequest }
  | { kind: 'complaint'; data: TrackedComplaint }
  | null;

function normalizeTrackingCode(value: string) {
  return value.trim().toUpperCase();
}

export function TrackStatus() {
  const [searchParams] = useSearchParams();
  const initialCode = useMemo(() => searchParams.get('code') ?? '', [searchParams]);
  const [trackingCode, setTrackingCode] = useState(initialCode);
  const [result, setResult] = useState<LookupResult>(null);
  const [searching, setSearching] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const docHook = usePublicDocumentRequest();
  const complaintHook = usePublicComplaint();

  async function lookup(code: string) {
    const normalized = normalizeTrackingCode(code);
    if (normalized.length < 6) {
      setLocalError('Please enter a valid reference number.');
      setResult(null);
      return;
    }

    setLocalError(null);
    docHook.clearError();
    complaintHook.clearError();
    setSearching(true);

    // Smart detection based on prefix
    if (normalized.startsWith('BLOTTER-')) {
      const res = await complaintHook.track(normalized);
      setSearching(false);
      if (res.complaint) {
        setResult({ kind: 'complaint', data: res.complaint });
        return;
      }
      // If not found, show error
      setLocalError('No complaint was found for this reference number.');
      setResult(null);
      return;
    }

    if (normalized.startsWith('BD2-')) {
      const res = await docHook.track(normalized);
      setSearching(false);
      if (res.request) {
        setResult({ kind: 'document', data: res.request });
        return;
      }
      setLocalError('No document request was found for this tracking code.');
      setResult(null);
      return;
    }

    // Unknown prefix — try document first, then complaint
    const docRes = await docHook.track(normalized);
    if (docRes.request) {
      setSearching(false);
      setResult({ kind: 'document', data: docRes.request });
      return;
    }

    docHook.clearError();
    const compRes = await complaintHook.track(normalized);
    setSearching(false);
    if (compRes.complaint) {
      setResult({ kind: 'complaint', data: compRes.complaint });
      return;
    }

    complaintHook.clearError();
    setLocalError('No request or complaint was found for this reference number.');
    setResult(null);
  }

  useEffect(() => {
    if (!initialCode) return;
    const timer = window.setTimeout(() => {
      void lookup(initialCode);
    }, 0);

    return () => window.clearTimeout(timer);
    // Run once for the code loaded from the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void lookup(trackingCode);
  }

  const isLoading = searching || docHook.tracking || complaintHook.tracking;

  return (
    <>
      <PublicPageShell
        eyebrow="Request Tracker"
        title="Track My Request"
        description="Enter your reference number to check your document request or complaint status"
        icon={<Search size={32} />}
      >
        <section className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/80 ring-1 ring-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-950">Search by Reference Number</h2>
            <p className="mt-1 text-sm font-semibold text-slate-400">
              Enter the reference number you received after submitting your request or complaint.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="trackingCode"
                value={trackingCode}
                onChange={(event) => {
                  setTrackingCode(event.target.value);
                  setLocalError(null);
                  docHook.clearError();
                  complaintHook.clearError();
                }}
                placeholder="BD2-2026-1234 or BLOTTER-2026-1234"
                className="font-mono uppercase sm:h-12"
                containerClassName="flex-1"
              />
              <Button type="submit" disabled={isLoading} className="sm:h-12 sm:px-7">
                {isLoading ? 'Checking...' : 'Check Status'}
              </Button>
            </div>
          </form>

          {localError && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm font-bold text-red-700">{localError}</p>
            </div>
          )}

          <div className="mt-5">
            {result?.kind === 'document' ? (
              <RequestStatusCard request={result.data} />
            ) : result?.kind === 'complaint' ? (
              <ComplaintStatusCard complaint={result.data} />
            ) : (
              <section className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-6 text-center">
                <div>
                  <Search className="mx-auto text-blue-700" size={32} />
                  <h2 className="mt-3 text-lg font-black text-slate-950">Status will appear here</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-blue-700">
                    Enter your reference number to view your request type, date submitted, and current status.
                  </p>
                </div>
              </section>
            )}
          </div>
        </section>
      </PublicPageShell>
    </>
  );
}

// ─── Document Request Status Card ─────────────────────────────────────────────

function RequestStatusCard({ request }: { request: TrackedDocumentRequest }) {
  const isRejected = request.status === 'rejected';
  const documentLabel =
    request.document_type === 'other'
      ? request.other_document_type || DOCUMENT_TYPE_LABELS.other
      : DOCUMENT_TYPE_LABELS[request.document_type];

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
      <div className="grid gap-3 text-sm font-semibold text-blue-950 sm:grid-cols-2">
        <StatusField label="Reference No." value={request.tracking_code} />
        <StatusField label="Document Type" value={documentLabel} />
        <StatusField label="Date Requested" value={formatDate(request.requested_at)} />
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-700">Status</p>
        <span
          className={[
              'mt-1 inline-flex rounded-full px-3 py-1 text-xs font-black',
            isRejected
              ? 'bg-red-50 text-red-700 ring-1 ring-red-100'
                : 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
          ].join(' ')}
        >
          {formatRequestStatus(request.status)}
        </span>
        </div>
      </div>

      {isRejected ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <XCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
            <div>
              <h3 className="font-black text-red-800">Request rejected</h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-red-700">
                Please contact the barangay office for assistance or submit a new request with corrected details.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-white/80 p-3 text-sm font-semibold leading-6 text-blue-900">
          {request.public_status_note ||
            'Estimated ready date will be announced by the barangay office. You will be notified when ready for pickup at the Barangay Hall.'}
        </p>
      )}

      <div className="mt-4 grid gap-2 text-xs font-bold text-blue-700 sm:grid-cols-2">
        <p>Last updated: {formatDate(request.updated_at)}</p>
        {request.ready_at && <p>Ready date: {formatDate(request.ready_at)}</p>}
        {request.completed_at && <p>Completed date: {formatDate(request.completed_at)}</p>}
      </div>
    </section>
  );
}

// ─── Complaint Status Card ────────────────────────────────────────────────────

function ComplaintStatusCard({ complaint }: { complaint: TrackedComplaint }) {
  const isDismissed = complaint.status === 'dismissed';
  const isResolved = complaint.status === 'resolved';

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
      <div className="grid gap-3 text-sm font-semibold text-blue-950 sm:grid-cols-2">
        <StatusField label="Reference No." value={complaint.reference_id} />
        <StatusField label="Incident Type" value={complaint.title} />
        <StatusField label="Date Filed" value={formatDate(complaint.submitted_at)} />
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-700">Status</p>
          <span
            className={[
              'mt-1 inline-flex rounded-full px-3 py-1 text-xs font-black',
              COMPLAINT_STATUS_STYLES[complaint.status],
            ].join(' ')}
          >
            {formatComplaintStatus(complaint.status)}
          </span>
        </div>
        {complaint.incident_date && (
          <StatusField label="Incident Date" value={formatDate(complaint.incident_date)} />
        )}
        {complaint.incident_location && (
          <StatusField label="Incident Location" value={complaint.incident_location} />
        )}
      </div>

      {isDismissed ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <XCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
            <div>
              <h3 className="font-black text-red-800">Complaint dismissed</h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-red-700">
                {complaint.resolution_notes ||
                  'This complaint has been dismissed. Please contact the barangay office for further details.'}
              </p>
            </div>
          </div>
        </div>
      ) : isResolved ? (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-green-600" />
            <div>
              <h3 className="font-black text-green-800">Complaint resolved</h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-green-700">
                {complaint.resolution_notes ||
                  'This complaint has been resolved. Thank you for your patience.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-white/80 p-3 text-sm font-semibold leading-6 text-blue-900">
          {complaint.resolution_notes ||
            'Your complaint is currently under review by barangay staff. If a hearing or mediation is scheduled, you will be contacted via your provided contact details.'}
        </p>
      )}

      <div className="mt-4 grid gap-2 text-xs font-bold text-blue-700 sm:grid-cols-2">
        <p>Last updated: {formatDate(complaint.updated_at)}</p>
        {complaint.resolved_at && <p>Resolved date: {formatDate(complaint.resolved_at)}</p>}
      </div>
    </section>
  );
}

// ─── Shared Field Component ───────────────────────────────────────────────────

function StatusField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-blue-700">{label}</p>
      <p className="mt-1 font-black text-blue-950">{value}</p>
    </div>
  );
}
