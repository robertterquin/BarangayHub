import { Megaphone } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';
import { PublicPageShell } from '../../components/public';

export function PublicAnnouncements() {
  return (
    <PublicLayout>
      <PublicPageShell
        eyebrow="Announcements"
        title="Official barangay updates"
        description="Published advisories, events, programs, and notices will appear here for residents."
      >
        <div className="rounded-3xl border border-dashed border-yellow-200 bg-yellow-50 p-8 text-center">
          <Megaphone className="mx-auto text-yellow-700" size={42} />
          <h2 className="mt-4 text-2xl font-black text-slate-950">Announcements list placeholder</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Next step: load published announcements from `getPublishedAnnouncements` and display them as public cards.
          </p>
        </div>
      </PublicPageShell>
    </PublicLayout>
  );
}
