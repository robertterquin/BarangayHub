import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';
import { PublicPageShell } from '../../components/public';

export function SubmissionSuccess() {
  return (
    <PublicLayout>
      <PublicPageShell
        eyebrow="Submission Complete"
        title="Your request has been recorded"
        description="This confirmation page will display the tracking code or complaint reference after a resident submits a form."
      >
        <div className="rounded-3xl bg-emerald-50 p-8 text-center ring-1 ring-emerald-100">
          <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
          <h2 className="mt-4 text-2xl font-black text-slate-950">Success page placeholder</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Later, this page will show the generated tracking code, next steps, and a shortcut to track status.
          </p>
          <Link
            to="/track-status"
            className="mt-6 inline-flex rounded-2xl bg-blue-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-800"
          >
            Go to Track Status
          </Link>
        </div>
      </PublicPageShell>
    </PublicLayout>
  );
}
