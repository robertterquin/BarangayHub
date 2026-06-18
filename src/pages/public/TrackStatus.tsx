import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Search,
  XCircle,
} from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';
import { PublicPageShell } from '../../components/public';
import { Button, Input } from '../../components/ui';
import { usePublicDocumentRequest } from '../../hooks/usePublicDocumentRequest';
import type {
  DocumentType,
  TrackedDocumentRequest,
} from '../../types/database';
import { formatDate, formatRequestStatus } from '../../utils/formatters';

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  barangay_clearance: 'Barangay Clearance',
  certificate_of_residency: 'Certificate of Residency',
  certificate_of_indigency: 'Certificate of Indigency',
  business_clearance: 'Business Clearance',
  other: 'Other Document',
};

function normalizeTrackingCode(value: string) {
  return value.trim().toUpperCase();
}

export function TrackStatus() {
  const [searchParams] = useSearchParams();
  const initialCode = useMemo(() => searchParams.get('code') ?? '', [searchParams]);
  const [trackingCode, setTrackingCode] = useState(initialCode);
  const [request, setRequest] = useState<TrackedDocumentRequest | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const { track, tracking, error, clearError } = usePublicDocumentRequest();

  async function lookup(code: string) {
    const normalizedCode = normalizeTrackingCode(code);
    if (normalizedCode.length < 6) {
      setLocalError('Please enter a valid tracking code.');
      setRequest(null);
      return;
    }

    setLocalError(null);
    clearError();
    const result = await track(normalizedCode);
    setRequest(result.request);
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

  const visibleError = localError ?? error;

  return (
    <PublicLayout>
      <PublicPageShell
        eyebrow="Track Request"
        title="Track My Request"
        description="Enter your reference number to check your document request status"
        icon={<Search size={24} />}
      >
        <section className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/80 ring-1 ring-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-950">Track Document Request</h2>
            <p className="mt-1 text-sm font-semibold text-slate-400">
              Enter the reference number you received after submitting your request.
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
                  clearError();
                }}
                placeholder="BD2-2026-1234"
                className="font-mono uppercase sm:h-12"
                containerClassName="flex-1"
              />
              <Button type="submit" disabled={tracking} className="sm:h-12 sm:px-7">
                {tracking ? 'Checking...' : 'Check Status'}
              </Button>
            </div>
          </form>

          {visibleError && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm font-bold text-red-700">{visibleError}</p>
            </div>
          )}

          <div className="mt-5">
            {request ? (
            <RequestStatusCard request={request} />
          ) : (
            <section className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-6 text-center">
              <div>
                <Search className="mx-auto text-blue-700" size={32} />
                <h2 className="mt-3 text-lg font-black text-slate-950">Status will appear here</h2>
                <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-blue-700">
                  Enter your reference number to view document type, date requested, and current status.
                </p>
              </div>
            </section>
          )}
          </div>
        </section>
      </PublicPageShell>
    </PublicLayout>
  );
}

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

function StatusField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-blue-700">{label}</p>
      <p className="mt-1 font-black text-blue-950">{value}</p>
    </div>
  );
}
