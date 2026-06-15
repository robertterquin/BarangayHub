import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';
import { PageHeader, SettingsCard } from '../../../components/admin';
import { Button, Input, Spinner } from '../../../components/ui';
import { useSettings } from '../../../hooks/useSettings';
import { AdminLayout } from '../../../layouts/AdminLayout';
import type {
  SystemSettings,
  SystemSettingsUpdate,
} from '../../../types/database';

interface BarangayInfoState {
  barangayName: string;
  municipality: string;
  province: string;
  completeAddress: string;
  contactNumber: string;
  publicEmail: string;
  serviceSince: string;
}

interface EmailFormState {
  newEmail: string;
  confirmEmail: string;
  currentPassword: string;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordRule {
  label: string;
  test: (password: string) => boolean;
}

interface NoticeState {
  tone: 'success' | 'error' | 'info';
  message: string;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Minimum 8 characters', test: (password) => password.length >= 8 },
  {
    label: 'At least one uppercase letter',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: 'At least one lowercase letter',
    test: (password) => /[a-z]/.test(password),
  },
  { label: 'At least one number', test: (password) => /[0-9]/.test(password) },
  {
    label: 'At least one special character',
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

function PasswordInput({
  id,
  value,
  placeholder,
  visible,
  disabled = false,
  onToggleVisible,
  onChange,
}: {
  id: string;
  value: string;
  placeholder: string;
  visible: boolean;
  disabled?: boolean;
  onToggleVisible: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm font-medium text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:bg-gray-50"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={onToggleVisible}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

function SaveNotice({ notice }: { notice: NoticeState | null }) {
  if (!notice) return null;

  const styles = {
    success: 'border-green-200 bg-green-50 text-green-700',
    error: 'border-red-200 bg-red-50 text-red-700',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
  };

  return (
    <div
      className={`mt-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm font-semibold ${styles[notice.tone]}`}
    >
      {notice.tone === 'error' ? (
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
      )}
      {notice.message}
    </div>
  );
}

function InformationCard({
  settings,
  saving,
  onSave,
}: {
  settings: SystemSettings;
  saving: boolean;
  onSave: (
    updates: SystemSettingsUpdate
  ) => Promise<{ error: string | null }>;
}) {
  const initialState: BarangayInfoState = {
    barangayName: settings.barangay_name,
    municipality: settings.municipality,
    province: settings.province,
    completeAddress: settings.complete_address,
    contactNumber: settings.contact_number ?? '',
    publicEmail: settings.public_email ?? '',
    serviceSince: String(settings.service_since),
  };
  const [form, setForm] = useState(initialState);
  const [isEditing, setIsEditing] = useState(false);
  const [notice, setNotice] = useState<NoticeState | null>(null);

  function updateField(field: keyof BarangayInfoState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    setNotice(null);
    const serviceSince = Number(form.serviceSince);
    const currentYear = new Date().getFullYear();

    if (
      !form.barangayName.trim() ||
      !form.municipality.trim() ||
      !form.province.trim() ||
      !form.completeAddress.trim()
    ) {
      setNotice({
        tone: 'error',
        message: 'Complete the required barangay information.',
      });
      return;
    }

    if (
      !Number.isInteger(serviceSince) ||
      serviceSince < 1900 ||
      serviceSince > currentYear
    ) {
      setNotice({
        tone: 'error',
        message: `Service year must be between 1900 and ${currentYear}.`,
      });
      return;
    }

    const result = await onSave({
      barangay_name: form.barangayName.trim(),
      municipality: form.municipality.trim(),
      province: form.province.trim(),
      complete_address: form.completeAddress.trim(),
      contact_number: form.contactNumber.trim() || null,
      public_email: form.publicEmail.trim() || null,
      service_since: serviceSince,
    });

    if (result.error) {
      setNotice({ tone: 'error', message: result.error });
      return;
    }

    setIsEditing(false);
    setNotice({
      tone: 'success',
      message: 'Barangay information saved to Supabase.',
    });
  }

  function handleCancel() {
    setForm(initialState);
    setIsEditing(false);
    setNotice(null);
  }

  return (
    <SettingsCard title="Barangay Information" className="min-h-0">
      <div className="space-y-3">
        {isEditing ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Input
              label="Barangay"
              requiredMark
              value={form.barangayName}
              disabled={saving}
              onChange={(event) =>
                updateField('barangayName', event.target.value)
              }
            />
            <Input
              label="Municipality"
              requiredMark
              value={form.municipality}
              disabled={saving}
              onChange={(event) =>
                updateField('municipality', event.target.value)
              }
            />
            <Input
              label="Province"
              requiredMark
              value={form.province}
              disabled={saving}
              onChange={(event) => updateField('province', event.target.value)}
            />
            <Input
              label="Complete Address"
              requiredMark
              value={form.completeAddress}
              disabled={saving}
              onChange={(event) =>
                updateField('completeAddress', event.target.value)
              }
              containerClassName="md:col-span-2"
            />
            <Input
              label="In Service Since"
              type="number"
              min={1900}
              max={new Date().getFullYear()}
              value={form.serviceSince}
              disabled={saving}
              onChange={(event) =>
                updateField('serviceSince', event.target.value)
              }
            />
            <Input
              label="Contact Number"
              value={form.contactNumber}
              disabled={saving}
              onChange={(event) =>
                updateField('contactNumber', event.target.value)
              }
              placeholder="Optional public contact"
            />
            <Input
              label="Public Email"
              type="email"
              value={form.publicEmail}
              disabled={saving}
              onChange={(event) =>
                updateField('publicEmail', event.target.value)
              }
              placeholder="Optional public email"
            />
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                System Version
              </p>
              <p className="mt-1 text-sm font-extrabold text-gray-900">
                {settings.system_version}
              </p>
              <p className="mt-1 text-xs font-medium text-gray-400">
                Managed by the application release.
              </p>
            </div>
          </div>
        ) : (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Barangay', settings.barangay_name],
              ['Municipality', settings.municipality],
              ['Province', settings.province],
              ['System Version', settings.system_version],
              ['Complete Address', settings.complete_address],
              ['Contact Number', settings.contact_number || 'Not set'],
              ['Public Email', settings.public_email || 'Not set'],
              ['In Service Since', String(settings.service_since)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-gray-50 px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  {label}
                </dt>
                <dd className="mt-1 break-words text-sm font-extrabold text-gray-900">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          {isEditing && (
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={handleCancel}
              fullWidth
              className="rounded-xl"
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            disabled={saving}
            onClick={isEditing ? () => void handleSave() : () => setIsEditing(true)}
            fullWidth
            className="rounded-xl"
          >
            {saving
              ? 'Saving Information...'
              : isEditing
                ? 'Save Information'
                : 'Update Information'}
          </Button>
        </div>
        <SaveNotice notice={notice} />
      </div>
    </SettingsCard>
  );
}

function EmailSettings({
  currentEmail,
  saving,
  onSave,
}: {
  currentEmail: string;
  saving: boolean;
  onSave: (
    currentPassword: string,
    newEmail: string
  ) => Promise<{
    data: { confirmationRequired: boolean } | null;
    error: string | null;
  }>;
}) {
  const [form, setForm] = useState<EmailFormState>({
    newEmail: '',
    confirmEmail: '',
    currentPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<NoticeState | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setNotice(null);

    const newEmail = form.newEmail.trim().toLowerCase();
    if (!newEmail || newEmail !== form.confirmEmail.trim().toLowerCase()) {
      setNotice({
        tone: 'error',
        message: 'Enter matching new email addresses.',
      });
      return;
    }
    if (newEmail === currentEmail.toLowerCase()) {
      setNotice({
        tone: 'error',
        message: 'The new email must be different from the current email.',
      });
      return;
    }
    if (!form.currentPassword) {
      setNotice({
        tone: 'error',
        message: 'Enter your current password to verify this change.',
      });
      return;
    }

    const result = await onSave(form.currentPassword, newEmail);
    if (result.error || !result.data) {
      setNotice({
        tone: 'error',
        message:
          result.error === 'Invalid login credentials'
            ? 'The current password is incorrect.'
            : result.error || 'Unable to update the admin email.',
      });
      return;
    }

    setForm({ newEmail: '', confirmEmail: '', currentPassword: '' });
    setNotice({
      tone: result.data.confirmationRequired ? 'info' : 'success',
      message: result.data.confirmationRequired
        ? 'Email change submitted. Confirm the change from the messages sent by Supabase.'
        : 'Admin sign-in email updated successfully.',
    });
  }

  const emailsMismatch =
    form.confirmEmail.length > 0 &&
    form.newEmail.trim().toLowerCase() !==
      form.confirmEmail.trim().toLowerCase();

  return (
    <section className="flex flex-col xl:pr-8">
      <div className="mb-4">
        <h3 className="text-sm font-extrabold text-gray-900">Change Email</h3>
        <p className="mt-1 text-xs font-medium text-gray-400">
          Update the email used to sign in to the admin portal.
        </p>
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-1 flex-col gap-4">
        <Input
          id="current-email"
          label="Current Email"
          value={currentEmail}
          readOnly
          className="bg-gray-50"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="new-email"
            label="New Email"
            requiredMark
            type="email"
            value={form.newEmail}
            disabled={saving}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                newEmail: event.target.value,
              }))
            }
            placeholder="New email address"
          />
          <Input
            id="confirm-email"
            label="Confirm New Email"
            requiredMark
            type="email"
            value={form.confirmEmail}
            disabled={saving}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                confirmEmail: event.target.value,
              }))
            }
            placeholder="Confirm new email"
            className={
              emailsMismatch
                ? 'border-red-300 focus:border-red-400 focus:ring-red-300/40'
                : ''
            }
          />
        </div>
        <div>
          <label
            htmlFor="email-current-password"
            className="mb-2 block text-sm font-extrabold text-gray-600"
          >
            Current Password <span className="text-red-500">*</span>
          </label>
          <PasswordInput
            id="email-current-password"
            value={form.currentPassword}
            placeholder="Verify your current password"
            visible={showPassword}
            disabled={saving}
            onToggleVisible={() => setShowPassword((current) => !current)}
            onChange={(value) =>
              setForm((current) => ({ ...current, currentPassword: value }))
            }
          />
        </div>
        <Button type="submit" disabled={saving} fullWidth className="mt-auto rounded-xl">
          {saving ? 'Saving Email...' : 'Save Email'}
        </Button>
      </form>
      <div className="min-h-14">
        <SaveNotice notice={notice} />
      </div>
    </section>
  );
}

function PasswordSettings({
  saving,
  onSave,
}: {
  saving: boolean;
  onSave: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ error: string | null }>;
}) {
  const [form, setForm] = useState<PasswordFormState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notice, setNotice] = useState<NoticeState | null>(null);

  const allRulesPassed = PASSWORD_RULES.every((rule) =>
    rule.test(form.newPassword)
  );
  const passwordsMatch =
    form.newPassword === form.confirmPassword && form.confirmPassword.length > 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setNotice(null);

    if (!form.currentPassword) {
      setNotice({
        tone: 'error',
        message: 'Enter your current password.',
      });
      return;
    }
    if (!allRulesPassed || !passwordsMatch) {
      setNotice({
        tone: 'error',
        message: 'Meet every password rule and confirm the new password.',
      });
      return;
    }

    const result = await onSave(form.currentPassword, form.newPassword);
    if (result.error) {
      setNotice({
        tone: 'error',
        message:
          result.error === 'Invalid login credentials'
            ? 'The current password is incorrect.'
            : result.error,
      });
      return;
    }

    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setNotice({
      tone: 'success',
      message: 'Admin password updated successfully.',
    });
  }

  return (
    <section className="flex flex-col border-t border-gray-200 pt-6 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
      <div className="mb-4">
        <h3 className="text-sm font-extrabold text-gray-900">Change Password</h3>
        <p className="mt-1 text-xs font-medium text-gray-400">
          Use a strong password that is not shared with other accounts.
        </p>
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-1 flex-col gap-4">
        <div>
          <label
            htmlFor="settings-current-password"
            className="mb-2 block text-sm font-extrabold text-gray-600"
          >
            Current Password
          </label>
          <PasswordInput
            id="settings-current-password"
            value={form.currentPassword}
            placeholder="Enter current password"
            visible={showCurrentPassword}
            disabled={saving}
            onToggleVisible={() =>
              setShowCurrentPassword((current) => !current)
            }
            onChange={(value) =>
              setForm((current) => ({ ...current, currentPassword: value }))
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="settings-new-password"
              className="mb-2 block text-sm font-extrabold text-gray-600"
            >
              New Password <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              id="settings-new-password"
              value={form.newPassword}
              placeholder="New password"
              visible={showNewPassword}
              disabled={saving}
              onToggleVisible={() => setShowNewPassword((current) => !current)}
              onChange={(value) =>
                setForm((current) => ({ ...current, newPassword: value }))
              }
            />
          </div>
          <div>
            <label
              htmlFor="settings-confirm-password"
              className="mb-2 block text-sm font-extrabold text-gray-600"
            >
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              id="settings-confirm-password"
              value={form.confirmPassword}
              placeholder="Confirm new password"
              visible={showConfirmPassword}
              disabled={saving}
              onToggleVisible={() =>
                setShowConfirmPassword((current) => !current)
              }
              onChange={(value) =>
                setForm((current) => ({ ...current, confirmPassword: value }))
              }
            />
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-5 py-4">
          <p className="mb-2 text-sm font-extrabold text-gray-600">
            Password must have:
          </p>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {PASSWORD_RULES.map((rule) => {
              const passed = rule.test(form.newPassword);
              return (
                <div key={rule.label} className="flex items-center gap-2">
                  {passed ? (
                    <CheckCircle2
                      size={14}
                      className="shrink-0 text-blue-700"
                    />
                  ) : (
                    <Circle size={14} className="shrink-0 text-gray-300" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      passed ? 'text-blue-700' : 'text-gray-500'
                    }`}
                  >
                    {rule.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Button type="submit" disabled={saving} fullWidth className="mt-auto rounded-xl">
          {saving ? 'Saving Password...' : 'Save Password'}
        </Button>
      </form>
      <div className="min-h-14">
        <SaveNotice notice={notice} />
      </div>
    </section>
  );
}

export function Settings() {
  const {
    settings,
    profile,
    loading,
    savingSection,
    error,
    clearError,
    refresh,
    saveInformation,
    saveEmail,
    savePassword,
  } = useSettings();

  return (
    <AdminLayout title="Settings">
      <PageHeader
        title="System Settings"
        subtitle="Manage barangay information and administrator credentials."
      />

      {loading ? (
        <SettingsCard title="Loading Settings" className="min-h-0">
          <Spinner label="Loading settings from Supabase..." className="py-10" />
        </SettingsCard>
      ) : (
        <div className="space-y-5">
          {error && (
            <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 font-semibold">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="ghost" onClick={clearError}>
                  Dismiss
                </Button>
                <Button type="button" size="sm" onClick={() => void refresh()}>
                  Retry
                </Button>
              </div>
            </div>
          )}

          {settings ? (
            <InformationCard
              key={settings.updated_at}
              settings={settings}
              saving={savingSection === 'information'}
              onSave={saveInformation}
            />
          ) : (
            <SettingsCard title="Barangay Information" className="min-h-0">
              <p className="text-sm font-medium text-gray-500">
                Barangay information could not be loaded.
              </p>
            </SettingsCard>
          )}

          <SettingsCard title="Account Credentials" className="min-h-0">
            {profile ? (
              <div className="grid grid-cols-1 items-stretch gap-7 xl:grid-cols-2 xl:gap-8">
                <EmailSettings
                  currentEmail={profile.email}
                  saving={savingSection === 'email'}
                  onSave={saveEmail}
                />
                <PasswordSettings
                  saving={savingSection === 'password'}
                  onSave={savePassword}
                />
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-500">
                Administrator profile information could not be loaded.
              </p>
            )}
          </SettingsCard>

          <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800">
            <Info size={18} className="mt-0.5 shrink-0" />
            <p>
              Changes are saved securely through Supabase. Email updates may
              require confirmation depending on your project authentication
              settings.
            </p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
