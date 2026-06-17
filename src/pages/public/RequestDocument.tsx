import { FileText } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';
import { PublicPageShell } from '../../components/public';

export function RequestDocument() {
  return (
    <PublicLayout>
      <PublicPageShell
        eyebrow="Document Request"
        title="Request a barangay document"
        description="This page is ready for the Phase 9.4 form flow. It will submit resident requests through the existing public Supabase RPC."
      >
        <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50 p-8 text-center">
          <FileText className="mx-auto text-blue-700" size={42} />
          <h2 className="mt-4 text-2xl font-black text-slate-950">Document request form placeholder</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Next step: add fields for requester details, document type, purpose, and validation before calling
            `submitDocumentRequest`.
          </p>
        </div>
      </PublicPageShell>
    </PublicLayout>
  );
}
