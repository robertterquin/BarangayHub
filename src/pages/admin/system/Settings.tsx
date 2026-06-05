import { useState } from 'react';
import { CheckCircle2, Circle, Eye, EyeOff, Info } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';

interface SystemSettingsState {
  mfaEnabled: boolean;
  ipWhitelistEnabled: boolean;
  autoBackupEnabled: boolean;
  darkModeEnabled: boolean;
}

interface BarangayInfoState {
  barangay: string;
  municipality: string;
  adminEmail: string;
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

const INITIAL_SYSTEM_SETTINGS: SystemSettingsState = {
  mfaEnabled: true,
  ipWhitelistEnabled: false,
  autoBackupEnabled: true,
  darkModeEnabled: false,
};

const INITIAL_BARANGAY_INFO: BarangayInfoState = {
  barangay: 'Daine II',
  municipality: 'Indang, Cavite',
  adminEmail: 'admin@brgy.daine2.gov',
  systemVersion: 'MIS v1.0',
  serviceSince: '2009',
};

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Minimum 8 characters', test: (password) => password.length >= 8 },
  { label: 'At least one uppercase letter', test: (password) => /[A-Z]/.test(password) },
  { label: 'At least one lowercase letter', test: (password) => /[a-z]/.test(password) },
  { label: 'At least one number', test: (password) => /[0-9]/.test(password) },
  { label: 'At least one special character', test: (password) => /[^A-Za-z0-9]/.test(password) },
];

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-label={label}
      aria-pressed={checked}
      className={`relative h-8 w-14 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`}
      />
    </button>
  );
}

function SettingRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-base font-medium text-gray-800">{label}</span>
      <ToggleSwitch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

function SettingsCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-72 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-extrabold text-gray-950">{title}</h2>
      <div className="mt-3 border-t border-gray-200 pt-4">
        {children}
      </div>
    </section>
  );
}

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
  const [systemSettings, setSystemSettings] = useState<SystemSettingsState>(INITIAL_SYSTEM_SETTINGS);
  const [barangayInfo, setBarangayInfo] = useState<BarangayInfoState>(INITIAL_BARANGAY_INFO);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [emailForm, setEmailForm] = useState<EmailFormState>({
    currentEmail: INITIAL_BARANGAY_INFO.adminEmail,
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

  function updateSetting(field: keyof SystemSettingsState) {
    setSystemSettings((current) => ({ ...current, [field]: !current[field] }));
  }

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
    setBarangayInfo((current) => ({ ...current, adminEmail: emailForm.newEmail.trim() }));
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
      <div className="space-y-8">
        <section>
          <h1 className="mb-5 text-2xl font-extrabold tracking-tight text-gray-950">System Settings</h1>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <SettingsCard title="Security">
              <div className="space-y-2">
                <SettingRow
                  label="Multi-Factor Authentication"
                  checked={systemSettings.mfaEnabled}
                  onChange={() => updateSetting('mfaEnabled')}
                />
                <SettingRow
                  label="IP Whitelist Mode"
                  checked={systemSettings.ipWhitelistEnabled}
                  onChange={() => updateSetting('ipWhitelistEnabled')}
                />
              </div>
            </SettingsCard>

            <SettingsCard title="System">
              <div className="space-y-2">
                <SettingRow
                  label="Auto Backup"
                  checked={systemSettings.autoBackupEnabled}
                  onChange={() => updateSetting('autoBackupEnabled')}
                />
                <SettingRow
                  label="Dark Mode"
                  checked={systemSettings.darkModeEnabled}
                  onChange={() => updateSetting('darkModeEnabled')}
                />
              </div>
            </SettingsCard>

            <SettingsCard title="Barangay Info">
              <div className="space-y-3">
                {isEditingInfo ? (
                  <>
                    <input
                      value={barangayInfo.barangay}
                      onChange={(event) => updateBarangayInfo('barangay', event.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-blue-500"
                      placeholder="Barangay"
                    />
                    <input
                      value={barangayInfo.municipality}
                      onChange={(event) => updateBarangayInfo('municipality', event.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-blue-500"
                      placeholder="Municipality"
                    />
                    <input
                      value={barangayInfo.adminEmail}
                      onChange={(event) => updateBarangayInfo('adminEmail', event.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-blue-500"
                      placeholder="Admin Email"
                    />
                    <input
                      value={barangayInfo.systemVersion}
                      onChange={(event) => updateBarangayInfo('systemVersion', event.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-blue-500"
                      placeholder="System Version"
                    />
                    <input
                      value={barangayInfo.serviceSince}
                      onChange={(event) => updateBarangayInfo('serviceSince', event.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-blue-500"
                      placeholder="In Service Since"
                    />
                  </>
                ) : (
                  <>
                    <p className="text-base text-gray-700"><span className="font-extrabold text-gray-950">Barangay:</span> {barangayInfo.barangay}</p>
                    <p className="text-base text-gray-700"><span className="font-extrabold text-gray-950">Municipality:</span> {barangayInfo.municipality}</p>
                    <p className="text-base text-gray-700"><span className="font-extrabold text-gray-950">Admin Email:</span> {barangayInfo.adminEmail}</p>
                    <p className="text-base text-gray-700"><span className="font-extrabold text-gray-950">System Version:</span> {barangayInfo.systemVersion}</p>
                    <p className="text-base text-gray-700"><span className="font-extrabold text-gray-950">In Service Since:</span> {barangayInfo.serviceSince}</p>
                  </>
                )}

                <button
                  type="button"
                  onClick={isEditingInfo ? handleSaveInfo : () => setIsEditingInfo(true)}
                  className="mt-3 w-full rounded-xl bg-blue-700 py-3 text-sm font-extrabold text-white transition-colors hover:bg-blue-800"
                >
                  {isEditingInfo ? 'Save Info' : 'Update Info'}
                </button>
                <SaveNotice message={infoNotice} />
              </div>
            </SettingsCard>
          </div>
        </section>

        <section>
          <h2 className="mb-5 text-2xl font-extrabold tracking-tight text-gray-950">Change Credentials</h2>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-extrabold text-gray-950">Change Username / Email</h3>
              <div className="mt-3 border-t border-gray-200 pt-5">
                <form onSubmit={handleSaveEmail} className="space-y-4">
                  <div>
                    <label htmlFor="current-email" className="mb-2 block text-sm font-extrabold text-gray-600">Current Email</label>
                    <input
                      id="current-email"
                      value={emailForm.currentEmail}
                      readOnly
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="new-email" className="mb-2 block text-sm font-extrabold text-gray-600">
                      New Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="new-email"
                      type="email"
                      value={emailForm.newEmail}
                      onChange={(event) => setEmailForm((current) => ({ ...current, newEmail: event.target.value }))}
                      placeholder="New email address"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirm-email" className="mb-2 block text-sm font-extrabold text-gray-600">
                      Confirm New Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="confirm-email"
                      type="email"
                      value={emailForm.confirmEmail}
                      onChange={(event) => setEmailForm((current) => ({ ...current, confirmEmail: event.target.value }))}
                      placeholder="Confirm new email"
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-gray-800 outline-none transition-colors focus:ring-1 ${
                        emailForm.confirmEmail.length > 0 && !emailsMatch
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-300/40'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/30'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-blue-700 py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-blue-800"
                  >
                    Save Email
                  </button>
                </form>
                <SaveNotice message={emailNotice} />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-extrabold text-gray-950">Change Password</h3>
              <div className="mt-3 border-t border-gray-200 pt-5">
                <form onSubmit={handleSavePassword} className="space-y-4">
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

                  <div className="rounded-xl bg-blue-50/70 px-5 py-4">
                    <p className="mb-2 text-sm font-extrabold text-gray-600">Password must have:</p>
                    <div className="space-y-1.5">
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

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-blue-700 py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-blue-800"
                  >
                    Save Password
                  </button>
                </form>
                <SaveNotice message={passwordNotice} />
              </div>
            </section>
          </div>
        </section>

        <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800">
          <Info size={18} className="mt-0.5 shrink-0" />
          <p>
            These settings are using dummy/local state for now. Real MFA, email, password, and system preference updates can be connected after the Supabase schema and service layer are finalized.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
