import { useState } from 'react';
import { LockKeyhole, ShieldCheck, X } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';

type UserRole = 'Admin';
type MfaStatus = 'active' | 'inactive';
type AccountStatus = 'active' | 'inactive';

interface AdminUser {
  id: string;
  username: string;
  role: UserRole;
  mfa_status: MfaStatus;
  last_login: string;
  status: AccountStatus;
}

interface CredentialsForm {
  username: string;
  role: UserRole;
  mfa_status: MfaStatus;
  status: AccountStatus;
}

const INITIAL_ADMIN_USER: AdminUser = {
  id: 'admin-001',
  username: 'admin@brgy.daine2.gov',
  role: 'Admin',
  mfa_status: 'active',
  last_login: 'Today, 8:45 AM',
  status: 'active',
};

const ROLE_STYLES: Record<UserRole, string> = {
  Admin: 'bg-blue-50 text-blue-600 border border-blue-100',
};

const MFA_LABELS: Record<MfaStatus, string> = {
  active: 'MFA Active',
  inactive: 'MFA Inactive',
};

const MFA_STYLES: Record<MfaStatus, string> = {
  active: 'bg-green-50 text-green-600 border border-green-100',
  inactive: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
};

const STATUS_LABELS: Record<AccountStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
};

const STATUS_STYLES: Record<AccountStatus, string> = {
  active: 'bg-green-50 text-green-600 border border-green-100',
  inactive: 'bg-gray-100 text-gray-500 border border-gray-200',
};

function CredentialsModal({
  user,
  onClose,
  onSave,
}: {
  user: AdminUser;
  onClose: () => void;
  onSave: (form: CredentialsForm) => void;
}) {
  const [form, setForm] = useState<CredentialsForm>({
    username: user.username,
    role: user.role,
    mfa_status: user.mfa_status,
    status: user.status,
  });

  function handleChange<K extends keyof CredentialsForm>(field: K, value: CredentialsForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    if (!form.username.trim()) return;
    onSave({ ...form, username: form.username.trim() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between bg-linear-to-r from-blue-800 to-blue-600 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold leading-tight text-white">Edit Admin Credentials</h2>
            <p className="mt-0.5 text-xs text-blue-200">Mock-only account settings for the single administrator.</p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 rounded-full p-1 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Admin Email / Username <span className="text-red-500">*</span>
            </label>
            <input
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">MFA Status</label>
              <select
                value={form.mfa_status}
                onChange={(e) => handleChange('mfa_status', e.target.value as MfaStatus)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              >
                <option value="active">MFA Active</option>
                <option value="inactive">MFA Inactive</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Account Status</label>
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value as AccountStatus)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
            <p className="text-xs font-bold text-yellow-800">Capstone note</p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-yellow-700">
              This only updates local mock state for now. Real credential changes should later use Supabase Auth.
            </p>
          </div>
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={handleSubmit}
            className="w-full rounded-lg bg-blue-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
          >
            Save Mock Credentials
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserManagement() {
  const [adminUser, setAdminUser] = useState<AdminUser>(INITIAL_ADMIN_USER);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleSaveCredentials(form: CredentialsForm) {
    setAdminUser((current) => ({
      ...current,
      username: form.username,
      role: form.role,
      mfa_status: form.mfa_status,
      status: form.status,
      last_login: 'Today, 8:45 AM',
    }));
    setIsModalOpen(false);
  }

  return (
    <>
      <AdminLayout title="User Management">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <h1 className="text-base font-extrabold text-gray-950">User Management</h1>
              <p className="mt-0.5 text-xs font-medium text-gray-400">
                Single administrator account control for this mock admin portal.
              </p>
            </div>
            <span className="rounded-full bg-orange-50 px-4 py-1.5 text-xs font-extrabold text-orange-500">
              Admin Access Only
            </span>
          </div>

          <div className="px-6 py-5">
            <div className="mb-5 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
              <ShieldCheck size={17} className="shrink-0 text-blue-600" />
              <p className="text-sm font-medium text-blue-700">
                <span className="font-extrabold">Single Administrator Policy:</span> Only one Admin manages this system.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-100">
                      {['USERNAME', 'ROLE', 'MFA STATUS', 'LAST LOGIN', 'STATUS', 'ACTIONS'].map((col) => (
                        <th
                          key={col}
                          className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-gray-500"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white transition-colors hover:bg-blue-50">
                      <td className="whitespace-nowrap px-4 py-4 font-bold text-gray-900">
                        {adminUser.username}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${ROLE_STYLES[adminUser.role]}`}>
                          {adminUser.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${MFA_STYLES[adminUser.mfa_status]}`}>
                          {MFA_LABELS[adminUser.mfa_status]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-gray-600">
                        {adminUser.last_login}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${STATUS_STYLES[adminUser.status]}`}>
                          {STATUS_LABELS[adminUser.status]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-700 transition-colors hover:bg-blue-100"
                        >
                          <LockKeyhole size={13} />
                          Edit Credentials
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </AdminLayout>

      {isModalOpen && (
        <CredentialsModal
          user={adminUser}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCredentials}
        />
      )}
    </>
  );
}
