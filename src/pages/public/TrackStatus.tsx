import { Search } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';
import { PublicPageShell } from '../../components/public';

export function TrackStatus() {
  return (
    <PublicLayout>
      <PublicPageShell
        eyebrow="Track Request"
        title="Check your document request status"
        description="Residents will use their tracking code here to see request progress without creating an account."
      >
        <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50 p-8 text-center">
          <Search className="mx-auto text-blue-700" size={42} />
          <h2 className="mt-4 text-2xl font-black text-slate-950">Tracking form placeholder</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Next step: add a tracking code input, result card, status timeline, and call `trackRequest`.
          </p>
        </div>
      </PublicPageShell>
    </PublicLayout>
  );
}
