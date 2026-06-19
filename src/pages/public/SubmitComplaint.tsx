import { type ChangeEvent, type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ClipboardList, FileUp, ShieldAlert } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';
import { PublicPageShell } from '../../components/public';
import { Input, Select } from '../../components/ui';
import { usePublicComplaint } from '../../hooks/usePublicComplaint';
import type { SubmitComplaintPayload } from '../../types/database';

const COMPLAINT_TYPES = [
  'Noise Disturbance',
  'Illegal Dumping / Garbage',
  'Boundary Dispute',
  'Physical Altercation',
  'Theft / Robbery',
  'Drug-related Incident',
  'Vandalism',
  'Other',
];

const PUROK_OPTIONS = ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'];

interface ComplaintForm {
  complainantName: string;
  complainantContact: string;
  complainantAddress: string;
  purok: string;
  complaintType: string;
  description: string;
  incidentDate: string;
  incidentLocation: string;
  respondentName: string;
}

const EMPTY_FORM: ComplaintForm = {
  complainantName: '',
  complainantContact: '',
  complainantAddress: '',
  purok: 'Purok 1',
  complaintType: '',
  description: '',
  incidentDate: '',
  incidentLocation: '',
  respondentName: '',
};

function validateForm(form: ComplaintForm, attachment: File | null): string | null {
  if (form.complainantName.trim().length < 2) return 'Please enter your full name.';
  if (form.complainantContact.trim().length < 7) return 'Please enter a valid contact number.';
  if (form.complainantAddress.trim().length < 5) return 'Please enter your complete address.';
  if (!form.complaintType) return 'Please select the type of complaint.';
  if (form.description.trim().length < 10) {
    return 'Please describe the complaint in at least 10 characters.';
  }
  if (form.incidentDate && new Date(form.incidentDate) > new Date()) {
    return 'Incident date cannot be in the future.';
  }
  if (attachment && attachment.size > 5 * 1024 * 1024) {
    return 'Attachment must be 5MB or smaller.';
  }
  return null;
}

export function SubmitComplaint() {
  const navigate = useNavigate();
  const { submit, submitting, error, clearError } = usePublicComplaint();
  const [form, setForm] = useState<ComplaintForm>(EMPTY_FORM);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function updateField<K extends keyof ComplaintForm>(field: K, value: ComplaintForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError(null);
    clearError();
  }

  function handleInputChange(
    field: keyof ComplaintForm,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    updateField(field, event.target.value as never);
  }

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    setAttachment(event.target.files?.[0] ?? null);
    setFormError(null);
    clearError();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm(form, attachment);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload: SubmitComplaintPayload = {
      title: form.complaintType,
      description: form.description.trim(),
      complainantName: form.complainantName.trim(),
      respondentName: form.respondentName.trim() || null,
      complainantContact: form.complainantContact.trim(),
      complainantAddress: form.complainantAddress.trim(),
      purok: form.purok,
      incidentDate: form.incidentDate || null,
      incidentLocation: form.incidentLocation.trim() || null,
      attachmentUrl: null,
    };

    const result = await submit(payload, attachment);
    if (!result.referenceId) return;

    navigate('/submission-success', {
      state: {
        kind: 'complaint',
        referenceId: result.referenceId,
        requesterName: payload.complainantName,
      },
    });
  }

  const visibleError = formError ?? error;

  return (
    <PublicLayout>
      <PublicPageShell
        eyebrow="Submit Complaint"
        title="Submit a Complaint"
        description="File a complaint or blotter report to the Barangay"
        icon={<ClipboardList size={24} />}
      >
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/80 ring-1 ring-slate-100"
        >
          <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert size={20} className="mt-0.5 shrink-0 text-blue-700" />
              <p className="text-sm font-semibold leading-6 text-blue-800">
                Please provide accurate details. Barangay staff will review your report and may contact you for follow-up.
              </p>
            </div>
          </div>

          {visibleError && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm font-bold text-red-700">{visibleError}</p>
            </div>
          )}

          <div className="space-y-4">
            <Input
              id="complainantName"
              label="Full Name"
              requiredMark
              value={form.complainantName}
              onChange={(event) => handleInputChange('complainantName', event)}
              placeholder="e.g. Juan Dela Cruz"
            />
            <Input
              id="complainantContact"
              label="Contact Number"
              requiredMark
              value={form.complainantContact}
              onChange={(event) => handleInputChange('complainantContact', event)}
              placeholder="e.g. 09171234567"
            />
            <Input
              id="complainantAddress"
              label="Complete Address"
              requiredMark
              value={form.complainantAddress}
              onChange={(event) => handleInputChange('complainantAddress', event)}
              placeholder="e.g. 123 Sampaguita St., Purok 3, Brgy. Daine II, Indang, Cavite"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                id="purok"
                label="Purok"
                requiredMark
                value={form.purok}
                onChange={(event) => handleInputChange('purok', event)}
              >
                {PUROK_OPTIONS.map((purok) => (
                  <option key={purok} value={purok}>
                    {purok}
                  </option>
                ))}
              </Select>
              <Select
                id="complaintType"
                label="Type of Complaint"
                requiredMark
                value={form.complaintType}
                onChange={(event) => handleInputChange('complaintType', event)}
              >
                <option value="">-- Select Complaint Type --</option>
                {COMPLAINT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="respondentName"
                label="Respondent Name"
                value={form.respondentName}
                onChange={(event) => handleInputChange('respondentName', event)}
                placeholder="Optional"
              />
              <Input
                id="incidentDate"
                label="Incident Date"
                type="date"
                value={form.incidentDate}
                onChange={(event) => handleInputChange('incidentDate', event)}
              />
            </div>

            <Input
              id="incidentLocation"
              label="Incident Location"
              value={form.incidentLocation}
              onChange={(event) => handleInputChange('incidentLocation', event)}
              placeholder="Optional"
            />

            <div>
              <label htmlFor="description" className="mb-1.5 block text-xs font-semibold text-gray-600">
                Details of Complaint <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={form.description}
                onChange={(event) => handleInputChange('description', event)}
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                placeholder="Describe the incident in detail - include date, time, location, and persons involved..."
              />
            </div>

            <div>
              <label htmlFor="attachment" className="mb-1.5 block text-xs font-semibold text-gray-600">
                Attachment <span className="text-gray-400">(Optional)</span>
              </label>
              <label
                htmlFor="attachment"
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <FileUp size={18} className="shrink-0" />
                  <span className="truncate">
                    {attachment ? attachment.name : 'Upload image or PDF evidence, up to 5MB'}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-black">Browse</span>
              </label>
              <input
                id="attachment"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="sr-only"
                onChange={handleAttachmentChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting Complaint...' : 'Submit Complaint'}
          </button>
        </form>
      </PublicPageShell>
    </PublicLayout>
  );
}
