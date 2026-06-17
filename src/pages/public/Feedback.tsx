import { MessageSquare } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';
import { PublicPageShell } from '../../components/public';

export function PublicFeedback() {
  return (
    <PublicLayout>
      <PublicPageShell
        eyebrow="Feedback"
        title="Send feedback or suggestions"
        description="Residents can share suggestions, commendations, concerns, and feature requests through this public channel."
      >
        <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50 p-8 text-center">
          <MessageSquare className="mx-auto text-emerald-700" size={42} />
          <h2 className="mt-4 text-2xl font-black text-slate-950">Feedback form placeholder</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Next step: add anonymous option, category selection, message field, and call `submitFeedback`.
          </p>
        </div>
      </PublicPageShell>
    </PublicLayout>
  );
}
