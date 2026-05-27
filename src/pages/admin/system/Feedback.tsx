import { useState } from 'react';
import { Inbox, RotateCcw } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';

type FeedbackStatus = 'pending' | 'reviewed' | 'under_review';
type FeedbackTone = 'blue' | 'green' | 'yellow';

interface FeedbackEntry {
  id: string;
  resident_name: string;
  category: string;
  message: string;
  submitted_at: string;
  status: FeedbackStatus;
  tone: FeedbackTone;
}

const INITIAL_FEEDBACK: FeedbackEntry[] = [
  {
    id: 'feedback-1',
    resident_name: 'Maria Santos',
    category: 'Suggestion',
    message: 'Add SMS notification when document is ready',
    submitted_at: 'April 4, 2026 - 9:45 AM',
    status: 'pending',
    tone: 'blue',
  },
  {
    id: 'feedback-2',
    resident_name: 'Juan dela Cruz',
    category: 'Commendation',
    message: 'The online portal is very convenient. Thank you!',
    submitted_at: 'April 3, 2026 - 2:15 PM',
    status: 'reviewed',
    tone: 'green',
  },
  {
    id: 'feedback-3',
    resident_name: 'Anonymous',
    category: 'Bug Report',
    message: "Track request sometimes doesn't show result on mobile",
    submitted_at: 'April 2, 2026 - 11:30 AM',
    status: 'under_review',
    tone: 'yellow',
  },
  {
    id: 'feedback-4',
    resident_name: 'Rosa Lim',
    category: 'Feature Request',
    message: 'Add email notifications for document status updates',
    submitted_at: 'March 30, 2026 - 4:00 PM',
    status: 'pending',
    tone: 'blue',
  },
];

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  pending: 'Pending Review',
  reviewed: 'Reviewed',
  under_review: 'Under Review',
};

const STATUS_STYLES: Record<FeedbackStatus, string> = {
  pending: 'bg-orange-50 text-orange-500 border border-orange-100',
  reviewed: 'bg-green-50 text-green-600 border border-green-100',
  under_review: 'bg-blue-50 text-blue-600 border border-blue-100',
};

const DOT_STYLES: Record<FeedbackTone, string> = {
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  yellow: 'bg-yellow-400',
};

function FeedbackRow({
  feedback,
  onStatusChange,
}: {
  feedback: FeedbackEntry;
  onStatusChange: (feedbackId: string, status: FeedbackStatus) => void;
}) {
  return (
    <li className="flex items-start gap-4 border-b border-gray-100 px-6 py-5 last:border-b-0">
      <span className={`mt-2 h-3 w-3 shrink-0 rounded-full ${DOT_STYLES[feedback.tone]}`} />
      <div className="min-w-0 flex-1">
        <p className="text-base font-medium leading-relaxed text-gray-900">
          <span className="font-extrabold">{feedback.resident_name}</span>
          <span className="mx-1">-</span>
          <span>{feedback.category}: {feedback.message}</span>
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-gray-400">{feedback.submitted_at}</span>
          <span className="text-gray-300">-</span>
          <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${STATUS_STYLES[feedback.status]}`}>
            {STATUS_LABELS[feedback.status]}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {feedback.status !== 'under_review' && (
            <button
              onClick={() => onStatusChange(feedback.id, 'under_review')}
              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-700 transition-colors hover:bg-blue-100"
            >
              Mark Under Review
            </button>
          )}
          {feedback.status !== 'reviewed' && (
            <button
              onClick={() => onStatusChange(feedback.id, 'reviewed')}
              className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-extrabold text-green-700 transition-colors hover:bg-green-100"
            >
              Mark Reviewed
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

export function Feedback() {
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>(INITIAL_FEEDBACK);

  function handleStatusChange(feedbackId: string, status: FeedbackStatus) {
    setFeedbackList((current) =>
      current.map((feedback) =>
        feedback.id === feedbackId ? { ...feedback, status } : feedback
      )
    );
  }

  function handleRestoreMockData() {
    setFeedbackList(INITIAL_FEEDBACK);
  }

  return (
    <AdminLayout title="Feedback & Suggestions">
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <Inbox size={18} className="text-blue-700" />
              <h1 className="text-xl font-extrabold tracking-tight text-gray-950">Received from Residents</h1>
            </div>
            <p className="mt-1 text-sm font-medium text-gray-400">Review suggestions, bug reports, and commendations from the public portal.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-gray-400 sm:inline">From public portal</span>
            <button
              onClick={handleRestoreMockData}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700 transition-colors hover:bg-blue-100"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>
        </div>

        <ul>
          {feedbackList.map((feedback) => (
            <FeedbackRow
              key={feedback.id}
              feedback={feedback}
              onStatusChange={handleStatusChange}
            />
          ))}
        </ul>
      </section>
    </AdminLayout>
  );
}
