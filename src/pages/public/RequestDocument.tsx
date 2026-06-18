import { type ChangeEvent, type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, FileText, Info, ShieldCheck } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';
import { PublicPageShell } from '../../components/public';
import { Button, Input, Modal, Select } from '../../components/ui';
import { usePublicDocumentRequest } from '../../hooks/usePublicDocumentRequest';
import type {
  DocumentType,
  GenderType,
  SubmitDocumentRequestPayload,
} from '../../types/database';

interface PublicDocumentOption {
  title: string;
  description: string;
  documentType: DocumentType;
  fee: string;
  processing: string;
}

interface DocumentRequestForm {
  requesterName: string;
  birthdate: string;
  gender: GenderType;
  address: string;
  purok: string;
  contactNumber: string;
  email: string;
  purpose: string;
}

const DOCUMENT_OPTIONS: PublicDocumentOption[] = [
  {
    title: 'Barangay Clearance',
    description: 'Required for employment, business, and legal transactions',
    documentType: 'barangay_clearance',
    fee: 'PHP 100',
    processing: '1-2 days',
  },
  {
    title: 'Certificate of Indigency',
    description: 'For scholars, hospital assistance, and government programs',
    documentType: 'certificate_of_indigency',
    fee: 'Free',
    processing: '1 day',
  },
  {
    title: 'Business Permit (Barangay)',
    description: 'Required for business operations within the barangay',
    documentType: 'business_clearance',
    fee: 'PHP 200',
    processing: '3 days',
  },
];

const PUROK_OPTIONS = ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'];

const PURPOSE_OPTIONS = [
  'Employment Requirement',
  'School / Academic Requirement',
  'Scholarship Requirement',
  'Medical / Hospital Assistance',
  'Business Requirement',
  'Government Transaction',
  'Legal Transaction',
  'Other Personal Requirement',
];

const EMPTY_FORM: DocumentRequestForm = {
  requesterName: '',
  birthdate: '',
  gender: 'male',
  address: '',
  purok: 'Purok 1',
  contactNumber: '',
  email: '',
  purpose: '',
};

function validateForm(form: DocumentRequestForm): string | null {
  if (form.requesterName.trim().length < 2) return 'Please enter your full name.';
  if (!form.birthdate) return 'Please enter your date of birth.';
  if (new Date(form.birthdate) > new Date()) return 'Date of birth cannot be in the future.';
  if (form.address.trim().length < 5) return 'Please enter your complete address.';
  if (form.contactNumber.trim().length < 7) return 'Please enter a valid contact number.';
  if (!form.purpose) return 'Please select your purpose of request.';
  return null;
}

function calculateAge(birthdate: string): string {
  if (!birthdate) return '';
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 ? String(age) : '';
}

export function RequestDocument() {
  const navigate = useNavigate();
  const { submit, submitting, error, clearError } = usePublicDocumentRequest();
  const [selectedDocument, setSelectedDocument] = useState<PublicDocumentOption | null>(null);
  const [form, setForm] = useState<DocumentRequestForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  function openRequestModal(document: PublicDocumentOption) {
    setSelectedDocument(document);
    setForm(EMPTY_FORM);
    setFormError(null);
    clearError();
  }

  function closeRequestModal() {
    if (submitting) return;
    setSelectedDocument(null);
    setFormError(null);
    clearError();
  }

  function updateField<K extends keyof DocumentRequestForm>(
    field: K,
    value: DocumentRequestForm[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError(null);
    clearError();
  }

  function handleInputChange(
    field: keyof DocumentRequestForm,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    updateField(field, event.target.value as never);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDocument) return;

    const validationError = validateForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload: SubmitDocumentRequestPayload = {
      requesterName: form.requesterName.trim(),
      birthdate: form.birthdate,
      gender: form.gender,
      address: form.address.trim(),
      purok: form.purok,
      contactNumber: form.contactNumber.trim(),
      email: form.email.trim() || null,
      documentType: selectedDocument.documentType,
      otherDocumentType: null,
      purpose: form.purpose,
    };

    const result = await submit(payload);
    if (!result.trackingCode) return;

    navigate('/submission-success', {
      state: {
        kind: 'document',
        trackingCode: result.trackingCode,
        requesterName: payload.requesterName,
      },
    });
  }

  const visibleError = formError ?? error;

  return (
    <PublicLayout>
      <PublicPageShell
        eyebrow="Document Requests"
        title="Document Requests"
        description="Request barangay certificates online - fast and convenient"
        icon={<FileText size={24} />}
      >
        <div className="mx-auto max-w-4xl space-y-4">
          <section className="overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-200/80 ring-1 ring-slate-100">
            {DOCUMENT_OPTIONS.map((document, index) => (
              <div
                key={document.documentType}
                className={[
                  'flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center',
                  index > 0 ? 'border-t border-slate-100' : '',
                ].join(' ')}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <FileText size={24} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-black text-slate-950">{document.title}</h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-400">
                    {document.description}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
                    {document.fee} - {document.processing}
                  </span>
                  <Button type="button" onClick={() => openRequestModal(document)}>
                    Request
                  </Button>
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <Info size={19} className="mt-0.5 shrink-0 text-blue-700" />
              <p className="text-sm font-semibold leading-6 text-blue-700">
                <span className="font-black">How to Request:</span> Click Request on any document, fill out the form,
                and submit. You will receive a reference number. Pick up your document at the Barangay Hall when ready.
              </p>
            </div>
          </section>
        </div>

        {selectedDocument && (
          <Modal
            title={`${selectedDocument.title} - Request Form`}
            subtitle="Fill in all required fields to submit your request."
            width="xl"
            onClose={closeRequestModal}
          >
            <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-bold text-blue-700">
                Fee: {selectedDocument.fee} - Processing: {selectedDocument.processing} - Pickup at Barangay Hall
              </div>

              {visibleError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                  <p className="text-sm font-bold text-red-700">{visibleError}</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="requesterName"
                  label="Full Name"
                  requiredMark
                  value={form.requesterName}
                  onChange={(event) => handleInputChange('requesterName', event)}
                  placeholder="e.g. Juan Dela Cruz"
                />
                <Input
                  id="age"
                  label="Age"
                  requiredMark
                  value={calculateAge(form.birthdate)}
                  readOnly
                  placeholder="e.g. 28"
                  className="bg-slate-50"
                />
                <Input
                  id="birthdate"
                  label="Date of Birth"
                  requiredMark
                  type="date"
                  value={form.birthdate}
                  onChange={(event) => handleInputChange('birthdate', event)}
                />
                <Input
                  id="contactNumber"
                  label="Contact Number"
                  requiredMark
                  value={form.contactNumber}
                  onChange={(event) => handleInputChange('contactNumber', event)}
                  placeholder="e.g. 09171234567"
                />
              </div>

              <div>
                <label htmlFor="address" className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Complete Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="address"
                  value={form.address}
                  onChange={(event) => handleInputChange('address', event)}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                  placeholder="e.g. 123 Sampaguita St., Purok 3, Brgy. Daine II, Indang, Cavite"
                />
              </div>

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
                  id="gender"
                  label="Gender"
                  requiredMark
                  value={form.gender}
                  onChange={(event) => updateField('gender', event.target.value as GenderType)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Select>
                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(event) => handleInputChange('email', event)}
                  placeholder="Optional"
                />
                <Select
                  id="purpose"
                  label="Purpose of Request"
                  requiredMark
                  value={form.purpose}
                  onChange={(event) => handleInputChange('purpose', event)}
                >
                  <option value="">Select Purpose</option>
                  {PURPOSE_OPTIONS.map((purpose) => (
                    <option key={purpose} value={purpose}>
                      {purpose}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="rounded-xl border border-blue-100 bg-white p-3">
                <div className="flex items-start gap-2">
                  <ShieldCheck size={17} className="mt-0.5 shrink-0 text-blue-700" />
                  <p className="text-xs font-semibold leading-5 text-slate-500">
                    After submission, save your reference number so you can track your document request.
                  </p>
                </div>
              </div>

              <Button type="submit" fullWidth disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </Modal>
        )}
      </PublicPageShell>
    </PublicLayout>
  );
}
