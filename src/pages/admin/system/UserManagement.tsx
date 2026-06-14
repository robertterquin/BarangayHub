import { useState } from 'react';
import { Settings2, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../../../components/admin';
import { Button, Modal, Select, TableHeader, TableShell } from '../../../components/ui';
import { AdminLayout } from '../../../layouts/AdminLayout';

type UserRole = 'Admin';
type AccountStatus = 'active' | 'inactive';

interface AdminUser {
  id: string;
  username: string;
  role: UserRole;
  last_login: string;
  status: AccountStatus;
}

interface AccountForm {
  role: UserRole;
  status: AccountStatus;
}

const INITIAL_ADMIN_USER: AdminUser = {
  id: 'admin-001',
  username: 'admin@brgy.daine2.gov',
  role: 'Admin',
  last_login: 'Today, 8:45 AM',
  status: 'active',
};

const ROLE_TONES: Record<UserRole, 'blue'> = {
  Admin: 'blue',
};

const STATUS_LABELS: Record<AccountStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
};

const STATUS_TONES: Record<AccountStatus, 'green' | 'gray'> = {
  active: 'green',
  inactive: 'gray',
};

function AccountModal({
  user,
  onClose,
  onSave,
}: {
  user: AdminUser;
  onClose: () => void;
  onSave: (form: AccountForm) => void;
}) {
  const [form, setForm] = useState<AccountForm>({
    role: user.role,
    status: user.status,
  });

  function handleChange<K extends keyof AccountForm>(field: K, value: AccountForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    onSave(form);
  }

  return (
    <Modal
      title="Edit Admin Account"
      subtitle="Manage account role and availability. Email and password changes belong in Settings."
      width="md"
      onClose={onClose}
      footer={(
        <Button onClick={handleSubmit} fullWidth size="lg">
          Save Account Settings
        </Button>
      )}
    >
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Admin Account</p>
            <p className="mt-1 break-all text-sm font-extrabold text-gray-900">{user.username}</p>
          </div>

          <div>
            <Select
                label="Account Status"
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value as AccountStatus)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </Select>
          </div>

          <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
            <p className="text-xs font-bold text-yellow-800">Capstone note</p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-yellow-700">
              This only updates local mock state for now. Real credential changes should later use Supabase Auth.
            </p>
          </div>
        </div>
    </Modal>
  );
}

export function UserManagement() {
  const [adminUser, setAdminUser] = useState<AdminUser>(INITIAL_ADMIN_USER);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleSaveAccount(form: AccountForm) {
    setAdminUser((current) => ({
      ...current,
      role: form.role,
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

            <TableShell>
                <table className="w-full text-sm">
                  <TableHeader columns={['USERNAME', 'ROLE', 'LAST LOGIN', 'STATUS', 'ACTIONS']} />
                  <tbody>
                    <tr className="bg-white transition-colors hover:bg-blue-50">
                      <td className="whitespace-nowrap px-4 py-4 font-bold text-gray-900">
                        {adminUser.username}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <StatusBadge label={adminUser.role} tone={ROLE_TONES[adminUser.role]} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-gray-600">
                        {adminUser.last_login}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <StatusBadge label={STATUS_LABELS[adminUser.status]} tone={STATUS_TONES[adminUser.status]} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <Button
                          onClick={() => setIsModalOpen(true)}
                          variant="primary"
                          size="sm"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          <Settings2 size={13} />
                          Account Settings
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
            </TableShell>
          </div>
        </section>
      </AdminLayout>

      {isModalOpen && (
        <AccountModal
          user={adminUser}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveAccount}
        />
      )}
    </>
  );
}
