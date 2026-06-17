import { Shield } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';
import { PublicPageShell } from '../../components/public';

export function PublicOfficials() {
  return (
    <PublicLayout>
      <PublicPageShell
        eyebrow="Barangay Officials"
        title="Meet the officials serving Daine II"
        description="Active barangay officials will be shown here using the same official records managed by the admin portal."
      >
        <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50 p-8 text-center">
          <Shield className="mx-auto text-blue-700" size={42} />
          <h2 className="mt-4 text-2xl font-black text-slate-950">Officials directory placeholder</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Next step: load active officials from `getPublicOfficials` and display public profile cards.
          </p>
        </div>
      </PublicPageShell>
    </PublicLayout>
  );
}
