import { type ChangeEvent, type FormEvent, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  HeartHandshake,
  Lightbulb,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';
import { PublicPageShell } from '../../components/public';
import { Input, Select } from '../../components/ui';
import { usePublicFeedback } from '../../hooks/usePublicFeedback';
import type { FeedbackCategory, SubmitFeedbackPayload } from '../../types/database';

const CATEGORY_OPTIONS: Array<{ value: FeedbackCategory; label: string; helper: string }> = [
  {
    value: 'suggestion',
    label: 'Suggestion',
    helper: 'Share ideas to improve barangay services.',
  },
  {
    value: 'commendation',
    label: 'Commendation',
    helper: 'Recognize helpful staff, officials, or programs.',
  },
  {
    value: 'bug_report',
    label: 'System Issue',
    helper: 'Report a problem encountered while using BarangayHub.',
  },
  {
    value: 'feature_request',
    label: 'Feature Request',
    helper: 'Request a useful addition for the portal.',
  },
  {
    value: 'other',
    label: 'Other',
    helper: 'Send any other message for barangay review.',
  },
];

interface FeedbackForm {
  residentName: string;
  contactNumber: string;
  email: string;
  isAnonymous: boolean;
  category: FeedbackCategory;
  message: string;
}

const EMPTY_FORM: FeedbackForm = {
  residentName: '',
  contactNumber: '',
  email: '',
  isAnonymous: false,
  category: 'suggestion',
  message: '',
};

function validateForm(form: FeedbackForm): string | null {
  if (!form.isAnonymous && form.residentName.trim().length < 2) {
    return 'Please enter your name or choose anonymous feedback.';
  }
  if (form.contactNumber.trim() && form.contactNumber.trim().length < 7) {
    return 'Please enter a valid contact number.';
  }
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return 'Please enter a valid email address.';
  }
  if (form.message.trim().length < 5) {
    return 'Please write feedback with at least 5 characters.';
  }
  return null;
}

export function PublicFeedback() {
  const { submit, submitting, error, clearError } = usePublicFeedback();
  const [form, setForm] = useState<FeedbackForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function updateField<K extends keyof FeedbackForm>(field: K, value: FeedbackForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setSubmitted(false);
    setFormError(null);
    clearError();
  }

  function handleInputChange(
    field: keyof FeedbackForm,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    updateField(field, event.target.value as never);
  }

  function handleAnonymousChange(event: ChangeEvent<HTMLInputElement>) {
    const checked = event.target.checked;
    setForm((current) => ({
      ...current,
      isAnonymous: checked,
      residentName: checked ? '' : current.residentName,
      contactNumber: checked ? '' : current.contactNumber,
      email: checked ? '' : current.email,
    }));
    setSubmitted(false);
    setFormError(null);
    clearError();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload: SubmitFeedbackPayload = {
      residentName: form.isAnonymous ? null : form.residentName.trim(),
      contactNumber: form.isAnonymous ? null : form.contactNumber.trim() || null,
      email: form.isAnonymous ? null : form.email.trim() || null,
      isAnonymous: form.isAnonymous,
      category: form.category,
      message: form.message.trim(),
    };

    const result = await submit(payload);
    if (!result.id) return;

    setSubmitted(true);
    setForm(EMPTY_FORM);
  }

  const selectedCategory = CATEGORY_OPTIONS.find((option) => option.value === form.category);
  const visibleError = formError ?? error;

  return (
    <PublicLayout>
      <PublicPageShell
        eyebrow="Feedback"
        title="Send feedback or suggestions"
        description="Share suggestions, commendations, concerns, and system feedback with the barangay."
        icon={<MessageSquare size={24} />}
      >
        <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="space-y-4">
            <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/80 ring-1 ring-slate-100">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <HeartHandshake size={28} />
              </div>
              <h2 className="mt-5 text-2xl font-black text-slate-950">Help improve BarangayHub</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                Your message goes directly to the admin feedback queue. Barangay staff can review,
                mark, and respond through the admin portal when contact details are provided.
              </p>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck size={22} className="mt-0.5 shrink-0 text-blue-700" />
                <div>
                  <h3 className="text-sm font-black text-blue-900">Privacy option included</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-blue-800">
                    You may submit anonymously. If you want the barangay to contact you, leave
                    anonymous mode off and provide at least one contact detail.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-lg shadow-slate-200/70 ring-1 ring-slate-100">
              <div className="flex items-start gap-3">
                <Lightbulb size={22} className="mt-0.5 shrink-0 text-amber-500" />
                <div>
                  <h3 className="text-sm font-black text-slate-950">Current category</h3>
                  <p className="mt-1 text-sm font-semibold text-blue-700">
                    {selectedCategory?.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                    {selectedCategory?.helper}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/80 ring-1 ring-slate-100"
          >
            {submitted && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-black text-emerald-800">Feedback submitted</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-emerald-700">
                    Thank you for helping improve Barangay Daine II services.
                  </p>
                </div>
              </div>
            )}

            {visibleError && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                <p className="text-sm font-bold text-red-700">{visibleError}</p>
              </div>
            )}

            <div className="space-y-4">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <input
                  type="checkbox"
                  checked={form.isAnonymous}
                  onChange={handleAnonymousChange}
                  className="mt-1 h-4 w-4 rounded border-blue-300 text-blue-700 focus:ring-blue-500"
                />
                <span>
                  <span className="block text-sm font-black text-blue-900">
                    Submit as anonymous
                  </span>
                  <span className="mt-1 block text-xs font-semibold leading-5 text-blue-700">
                    Your name, contact number, and email will not be saved with this feedback.
                  </span>
                </span>
              </label>

              {!form.isAnonymous && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    id="residentName"
                    label="Full Name"
                    requiredMark
                    value={form.residentName}
                    onChange={(event) => handleInputChange('residentName', event)}
                    placeholder="e.g. Juan Dela Cruz"
                  />
                  <Input
                    id="contactNumber"
                    label="Contact Number"
                    value={form.contactNumber}
                    onChange={(event) => handleInputChange('contactNumber', event)}
                    placeholder="Optional"
                  />
                  <Input
                    id="email"
                    label="Email Address"
                    type="email"
                    value={form.email}
                    onChange={(event) => handleInputChange('email', event)}
                    placeholder="Optional"
                    containerClassName="sm:col-span-2"
                  />
                </div>
              )}

              <Select
                id="category"
                label="Feedback Category"
                requiredMark
                value={form.category}
                onChange={(event) => handleInputChange('category', event)}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <div>
                <label htmlFor="message" className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  value={form.message}
                  onChange={(event) => handleInputChange('message', event)}
                  rows={7}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                  placeholder="Write your suggestion, commendation, issue, or request here..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Submitting Feedback...' : 'Submit Feedback'}
            </button>
          </form>
        </section>
      </PublicPageShell>
    </PublicLayout>
  );
}
