import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Clipboard, FileText, Search } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';
import { PublicPageShell } from '../../components/public';

interface SubmissionState {
  kind?: 'document' | 'complaint' | 'feedback';
  trackingCode?: string;
  referenceId?: string;
  requesterName?: string;
}

export function SubmissionSuccess() {
  const location = useLocation();
  const state = (location.state ?? {}) as SubmissionState;
  const trackingCode = state.trackingCode ?? state.referenceId ?? '';
  const isComplaint = state.kind === 'complaint';
  const codeLabel = isComplaint ? 'Reference Number' : 'Tracking Code';
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    if (!trackingCode) return;
    await navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <PublicLayout>
      <PublicPageShell
        eyebrow="Submission Complete"
        title={isComplaint ? 'Your complaint has been recorded' : 'Your request has been recorded'}
        description={
          isComplaint
            ? 'Please save your reference number. Barangay staff will review your complaint.'
            : 'Please save your tracking code. You can use it anytime to check your request status.'
        }
      >
        <div className="rounded-3xl bg-emerald-50 p-6 text-center ring-1 ring-emerald-100 sm:p-8">
          <CheckCircle2 className="mx-auto text-emerald-600" size={56} />
          <h2 className="mt-4 text-2xl font-black text-slate-950">
            Thank you{state.requesterName ? `, ${state.requesterName}` : ''}.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
            {isComplaint
              ? 'Your complaint or blotter report was submitted successfully. Barangay staff will review it and contact you if needed.'
              : 'Your document request was submitted successfully. Barangay staff will review and process it.'}
          </p>

          {trackingCode ? (
            <div className="mx-auto mt-6 max-w-xl rounded-3xl bg-white p-5 shadow-lg shadow-emerald-100 ring-1 ring-emerald-100">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-700">
                {codeLabel}
              </p>
              <p className="mt-2 break-all font-mono text-3xl font-black text-slate-950 sm:text-4xl">
                {trackingCode}
              </p>
              <button
                type="button"
                onClick={() => void copyCode()}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                <Clipboard size={16} />
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>
          ) : (
            <div className="mx-auto mt-6 max-w-xl rounded-3xl border border-yellow-200 bg-yellow-50 p-5">
              <p className="text-sm font-bold leading-6 text-yellow-800">
                No {isComplaint ? 'reference number' : 'tracking code'} was found on this page. If you already
                submitted a {isComplaint ? 'complaint' : 'request'}, please use the code shown after submission.
              </p>
            </div>
          )}

          <div className="mx-auto mt-7 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
            <StepCard
              icon={<FileText size={18} />}
              title="Submitted"
              text={isComplaint ? 'Your report is now recorded.' : 'Your request is now recorded.'}
            />
            <StepCard
              icon={<Search size={18} />}
              title={isComplaint ? 'Review' : 'Track'}
              text={isComplaint ? 'Barangay staff will review the report.' : 'Use your code to check progress.'}
            />
            <StepCard
              icon={<CheckCircle2 size={18} />}
              title={isComplaint ? 'Follow-up' : 'Claim'}
              text={isComplaint ? 'You may be contacted for details.' : 'Follow the status note when ready.'}
            />
          </div>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {!isComplaint && (
              <Link
                to={trackingCode ? `/track-status?code=${encodeURIComponent(trackingCode)}` : '/track-status'}
                className="inline-flex items-center justify-center rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-blue-800"
              >
                Track Request
              </Link>
            )}
            <Link
              to={isComplaint ? '/submit-complaint' : '/request-document'}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 transition-colors hover:bg-slate-50"
            >
              {isComplaint ? 'Submit Another Complaint' : 'Submit Another Request'}
            </Link>
            {isComplaint && (
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-blue-800"
              >
                Back to Home
              </Link>
            )}
          </div>
        </div>
      </PublicPageShell>
    </PublicLayout>
  );
}

function StepCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-emerald-100">
      <div className="flex items-center gap-2 text-emerald-700">
        {icon}
        <p className="text-sm font-black">{title}</p>
      </div>
      <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{text}</p>
    </div>
  );
}
