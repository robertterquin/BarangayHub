import { ClipboardList, FileText, Megaphone, MessageSquare, Search, Shield } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';
import { PublicPageShell, PublicServiceCard } from '../../components/public';

const SERVICES = [
  {
    title: 'Request Document',
    description: 'Apply for barangay certificates and clearances through the online request form.',
    to: '/request-document',
    icon: FileText,
    tone: 'blue' as const,
  },
  {
    title: 'Track Status',
    description: 'Check if your request is pending, processing, ready for pickup, or completed.',
    to: '/track-status',
    icon: Search,
    tone: 'green' as const,
  },
  {
    title: 'Submit Complaint',
    description: 'Send a complaint or blotter concern with important incident details.',
    to: '/submit-complaint',
    icon: ClipboardList,
    tone: 'red' as const,
  },
  {
    title: 'Announcements',
    description: 'View official public advisories, events, and barangay updates.',
    to: '/announcements',
    icon: Megaphone,
    tone: 'gold' as const,
  },
  {
    title: 'Barangay Officials',
    description: 'See the active barangay officials serving Daine II residents.',
    to: '/officials',
    icon: Shield,
    tone: 'blue' as const,
  },
  {
    title: 'Feedback',
    description: 'Share suggestions, commendations, concerns, or feature requests.',
    to: '/feedback',
    icon: MessageSquare,
    tone: 'green' as const,
  },
];

export function SelectService() {
  return (
    <PublicLayout>
      <PublicPageShell
        eyebrow="Resident Services"
        title="Choose an online service"
        description="Select what you need today. Each service will be connected step by step in the next public portal phases."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service) => (
            <PublicServiceCard key={service.to} {...service} />
          ))}
        </div>
      </PublicPageShell>
    </PublicLayout>
  );
}
