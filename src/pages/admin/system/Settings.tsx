import { useState } from 'react';
import { CheckCircle2, Circle, Eye, EyeOff, Info } from 'lucide-react';
import { PageHeader, SettingsCard } from '../../../components/admin';
import { Button, Input } from '../../../components/ui';
import { AdminLayout } from '../../../layouts/AdminLayout';

interface BarangayInfoState {
  barangay: string;
  municipality: string;
  systemVersion: string;
  serviceSince: string;
}

interface EmailFormState {
  currentEmail: string;
  newEmail: string;
  confirmEmail: string;
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

const INITIAL_BARANGAY_INFO: BarangayInfoState = {
  barangay: 'Daine II',
  municipality: 'Indang, Cavite',
  systemVersion: 'MIS v1.0',
  serviceSince: '2009',
};

const INITIAL_ADMIN_EMAIL = 'admin@brgy.daine2.gov';

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Minimum 8 characters', test: (password) => password.length >= 8 },
  { label: 'At least one uppercase letter', test: (password) => /[A-Z]/.test(password) },
  { label: 'At least one lowercase letter', test: (password) => /[a-z]/.test(password) },
  { label: 'At least one number', test: (password) => /[0-9]/.test(password) },
  { label: 'At least one special character', test: (password) => /[^A-Za-z0-9]/.test(password) },
];

function PasswordInput({
  id,
  value,
  placeholder,
  visible,
  onToggleVisible,
  onChange,
}: {
  id: string;
  value: string;
  placeholder: string;
  visible: boolean;
  onToggleVisible: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm font-medium text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
      />
      <button
        type="button"
        onClick={onToggleVisible}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

function SaveNotice({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
      <CheckCircle2 size={16} />
      {message}
    </div>
  );
}

export function Settings() {
  const [barangayInfo, setBarangayInfo] = useState<BarangayInfoState>(INITIAL_BARANGAY_INFO);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [emailForm, setEmailForm] = useState<EmailFormState>({
    currentEmail: INITIAL_ADMIN_EMAIL,
    newEmail: '',
    confirmEmail: '',
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  const allPasswordRulesPassed = PASSWORD_RULES.every((rule) => rule.test(passwordForm.newPassword));
  const passwordsMatch = passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.confirmPassword.length > 0;
  const emailsMatch = emailForm.newEmail === emailForm.confirmEmail && emailForm.confirmEmail.length > 0;

  function updateBarangayInfo(field: keyof BarangayInfoState, value: string) {
    setBarangayInfo((current) => ({ ...current, [field]: value }));
  }

  function handleSaveInfo() {
    setIsEditingInfo(false);
    setInfoNotice('Barangay information saved locally.');
  }

  function handleSaveEmail(event: React.FormEvent) {
    event.preventDefault();
    setEmailNotice(null);

    if (!emailForm.newEmail.trim() || !emailsMatch) {
      setEmailNotice('Please enter matching email addresses.');
      return;
    }

    setEmailForm({
      currentEmail: emailForm.newEmail.trim(),
      newEmail: '',
      confirmEmail: '',
    });
    setEmailNotice('Admin email saved locally.');
  }

  function handleSavePassword(event: React.FormEvent) {
    event.preventDefault();
    setPasswordNotice(null);

    if (!passwordForm.currentPassword.trim()) {
      setPasswordNotice('Current password is required for the mock password update.');
      return;
    }

    if (!allPasswordRulesPassed || !passwordsMatch) {
      setPasswordNotice('Password requirements must pass and confirmation must match.');
      return;
    }

    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordNotice('Password saved locally for mock demo.');
  }

  return (
    <AdminLayout title="Settings">
      <PageHeader
        title="System Settings"
        subtitle="Manage barangay information and administrator credentials."
      />

      <div className="space-y-5">
        <SettingsCard title="Barangay Information" className="min-h-0">
          <div className="space-y-3">
            {isEditingInfo ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                  label="Barangay"
                  value={barangayInfo.barangay}
                  onChange={(event) => updateBarangayInfo('barangay', event.target.value)}
                  placeholder="Barangay"
                />
                <Input
                  label="Municipality"
                  value={barangayInfo.municipality}
                  onChange={(event) => updateBarangayInfo('municipality', event.target.value)}
                  placeholder="Municipality"
                />
                <Input
                  label="In Service Since"
                  value={barangayInfo.serviceSince}
                  onChange={(event) => updateBarangayInfo('serviceSince', event.target.value)}
                  placeholder="Year"
                />
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 md:col-span-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">System Version</p>
                  <p className="mt-1 text-sm font-extrabold text-gray-900">{barangayInfo.systemVersion}</p>
                  <p className="mt-1 text-xs font-medium text-gray-400">Managed by the application release.</p>
                </div>
              </div>
            ) : (
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">Barangay</dt>
                  <dd className="mt-1 text-sm font-extrabold text-gray-900">{barangayInfo.barangay}</dd>
                </div>
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">Municipality</dt>
                  <dd className="mt-1 text-sm font-extrabold text-gray-900">{barangayInfo.municipality}</dd>
                </div>
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">System Version</dt>
                  <dd className="mt-1 text-sm font-extrabold text-gray-900">{barangayInfo.systemVersion}</dd>
                </div>
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">In Service Since</dt>
                  <dd className="mt-1 text-sm font-extrabold text-gray-900">{barangayInfo.serviceSince}</dd>
                </div>
              </dl>
            )}

            <Button
              type="button"
              onClick={isEditingInfo ? handleSaveInfo : () => setIsEditingInfo(true)}
              fullWidth
              className="mt-3 rounded-xl"
            >
              {isEditingInfo ? 'Save Information' : 'Update Information'}
            </Button>
            <SaveNotice message={infoNotice} />
          </div>
        </SettingsCard>

        <SettingsCard title="Account Credentials" className="min-h-0">
          <div className="grid grid-cols-1 items-stretch gap-7 xl:grid-cols-2 xl:gap-8">
            <section className="flex flex-col xl:pr-8">
              <div className="mb-4">
                <h3 className="text-sm font-extrabold text-gray-900">Change Email</h3>
                <p className="mt-1 text-xs font-medium text-gray-400">Update the email used to sign in to the admin portal.</p>
              </div>

              <form onSubmit={handleSaveEmail} className="flex flex-1 flex-col gap-4">
                <Input
                  id="current-email"
                  label="Current Email"
                  value={emailForm.currentEmail}
                  readOnly
                  className="bg-gray-50"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    id="new-email"
                    label="New Email"
                    requiredMark
                    type="email"
                    value={emailForm.newEmail}
                    onChange={(event) => setEmailForm((current) => ({ ...current, newEmail: event.target.value }))}
                    placeholder="New email address"
                  />
                  <Input
                    id="confirm-email"
                    label="Confirm New Email"
                    requiredMark
                    type="email"
                    value={emailForm.confirmEmail}
                    onChange={(event) => setEmailForm((current) => ({ ...current, confirmEmail: event.target.value }))}
                    placeholder="Confirm new email"
                    className={
                      emailForm.confirmEmail.length > 0 && !emailsMatch
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-300/40'
                        : ''
                    }
                  />
                </div>
                <Button type="submit" fullWidth className="mt-auto rounded-xl">
                  Save Email
                </Button>
              </form>
              <div className="min-h-14">
                <SaveNotice message={emailNotice} />
              </div>
            </section>

            <section className="flex flex-col border-t border-gray-200 pt-6 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
              <div className="mb-4">
                <h3 className="text-sm font-extrabold text-gray-900">Change Password</h3>
                <p className="mt-1 text-xs font-medium text-gray-400">Use a strong password that is not shared with other accounts.</p>
              </div>

              <form onSubmit={handleSavePassword} className="flex flex-1 flex-col gap-4">
                <div>
                  <label htmlFor="settings-current-password" className="mb-2 block text-sm font-extrabold text-gray-600">Current Password</label>
                  <PasswordInput
                    id="settings-current-password"
                    value={passwordForm.currentPassword}
                    placeholder="Enter current password"
                    visible={showCurrentPassword}
                    onToggleVisible={() => setShowCurrentPassword((current) => !current)}
                    onChange={(value) => setPasswordForm((current) => ({ ...current, currentPassword: value }))}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="settings-new-password" className="mb-2 block text-sm font-extrabold text-gray-600">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <PasswordInput
                      id="settings-new-password"
                      value={passwordForm.newPassword}
                      placeholder="New password"
                      visible={showNewPassword}
                      onToggleVisible={() => setShowNewPassword((current) => !current)}
                      onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="settings-confirm-password" className="mb-2 block text-sm font-extrabold text-gray-600">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <PasswordInput
                      id="settings-confirm-password"
                      value={passwordForm.confirmPassword}
                      placeholder="Confirm new password"
                      visible={showConfirmPassword}
                      onToggleVisible={() => setShowConfirmPassword((current) => !current)}
                      onChange={(value) => setPasswordForm((current) => ({ ...current, confirmPassword: value }))}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-5 py-4">
                  <p className="mb-2 text-sm font-extrabold text-gray-600">Password must have:</p>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {PASSWORD_RULES.map((rule) => {
                      const passed = rule.test(passwordForm.newPassword);
                      return (
                        <div key={rule.label} className="flex items-center gap-2">
                          {passed ? (
                            <CheckCircle2 size={14} className="shrink-0 text-blue-700" />
                          ) : (
                            <Circle size={14} className="shrink-0 text-gray-300" />
                          )}
                          <span className={`text-sm font-medium ${passed ? 'text-blue-700' : 'text-gray-500'}`}>
                            {rule.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button type="submit" fullWidth className="mt-auto rounded-xl">
                  Save Password
                </Button>
              </form>
              <div className="min-h-14">
                <SaveNotice message={passwordNotice} />
              </div>
            </section>
          </div>
        </SettingsCard>

        <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800">
          <Info size={18} className="mt-0.5 shrink-0" />
          <p>
            Barangay information and credential forms are using local state for now. They can be connected after the Supabase schema and service layer are finalized.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
