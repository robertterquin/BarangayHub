import { ClipboardList } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';
import { PublicPageShell } from '../../components/public';

export function SubmitComplaint() {
  return (
    <PublicLayout>
      <PublicPageShell
        eyebrow="Complaints / Blotter"
        title="Submit a concern to the barangay"
        description="This public form will collect complaint details and optional attachments through the existing Supabase storage policy."
      >
        <div className="rounded-3xl border border-dashed border-red-200 bg-red-50 p-8 text-center">
          <ClipboardList className="mx-auto text-red-700" size={42} />
          <h2 className="mt-4 text-2xl font-black text-slate-950">Complaint form placeholder</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Next step: add complainant fields, incident details, file upload, and calls to `uploadComplaintAttachment`
            plus `submitComplaint`.
          </p>
        </div>
      </PublicPageShell>
    </PublicLayout>
  );
}
