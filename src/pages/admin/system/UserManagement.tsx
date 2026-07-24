import { useState } from 'react';
import {
  AlertCircle,
  RefreshCw,
  Settings2,
  ShieldCheck,
} from 'lucide-react';
import {
  FilterBar,
  StatusBadge,
} from '../../../components/admin';
import {
  Button,
  Input,
  Modal,
  Select,
  Spinner,
  TableEmptyRow,
  TableHeader,
  TableShell,
} from '../../../components/ui';
import {
  useUserManagement,
  type UserManagementFilters,
} from '../../../hooks/useUserManagement';
import { useAuth } from '../../../hooks/useAuth';
import { AdminLayout } from '../../../layouts/AdminLayout';
import type {
  AccountStatus,
  AdminProfile,
  AdminProfileUpdate,
} from '../../../types/database';
import { formatDateTime } from '../../../utils/formatters';

const PAGE_SIZE = 8;

const STATUS_LABELS: Record<AccountStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
};

const STATUS_TONES: Record<AccountStatus, 'green' | 'gray'> = {
  active: 'green',
  inactive: 'gray',
};

interface AccountForm {
  displayName: string;
  status: AccountStatus;
}

function AccountModal({
  profile,
  currentUserId,
  saving,
  onClose,
  onSave,
}: {
  profile: AdminProfile;
  currentUserId: string | null;
  saving: boolean;
  onClose: () => void;
  onSave: (updates: AdminProfileUpdate) => void;
}) {
  const [form, setForm] = useState<AccountForm>({
    displayName: profile.display_name,
    status: profile.status,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const isCurrentAccount = profile.id === currentUserId;

  function handleSubmit() {
    const displayName = form.displayName.trim();
    setFormError(null);

    if (displayName.length < 2) {
      setFormError('Display name must contain at least 2 characters.');
      return;
    }

    if (isCurrentAccount && form.status === 'inactive') {
      setFormError('You cannot deactivate your own active session from here.');
      return;
    }

    onSave({
      display_name: displayName,
      role: 'admin',
      status: form.status,
    });
  }

  return (
    <Modal
      title="Edit Admin Account"
      subtitle="Manage account display name and availability."
      width="md"
      onClose={onClose}
      footer={(
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            fullWidth
            size="lg"
            disabled={saving}
            onClick={handleSubmit}
          >
            {saving ? 'Saving...' : 'Save Account Settings'}
          </Button>
        </div>
      )}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            Admin Account
          </p>
          <p className="mt-1 break-all text-sm font-extrabold text-gray-900">
            {profile.email}
          </p>
        </div>

        <Input
          label="Display Name"
          requiredMark
          value={form.displayName}
          disabled={saving}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              displayName: event.target.value,
            }))
          }
        />

        <Select
          label="Role"
          value="admin"
          disabled
          className="bg-gray-50"
        >
          <option value="admin">Admin</option>
        </Select>

        <Select
          label="Account Status"
          value={form.status}
          disabled={saving}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              status: event.target.value as AccountStatus,
            }))
          }
        >
          <option value="active">Active</option>
          <option value="inactive" disabled={isCurrentAccount}>
            Inactive
          </option>
        </Select>

        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {formError}
          </div>
        )}

        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-xs font-bold text-blue-800">Credential note</p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-blue-700">
            Email and password changes are handled in Settings. New account
            creation is reserved for a future secure admin workflow, so this
            page manages profiles that already exist.
          </p>
        </div>
      </div>
    </Modal>
  );
}

export function UserManagement() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState<AdminProfile | null>(null);

  const filters: UserManagementFilters = {
    search,
    status: statusFilter,
  };
  const {
    profiles,
    count,
    activeCount,
    loading,
    savingId,
    error,
    clearError,
    refresh,
    saveProfile,
  } = useUserManagement({ page: currentPage, pageSize: PAGE_SIZE, filters });

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const displayStart = count === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const displayEnd = Math.min(safePage * PAGE_SIZE, count);

  async function handleSaveAccount(updates: AdminProfileUpdate) {
    if (!selectedProfile) return;
    const result = await saveProfile(selectedProfile.id, updates);
    if (result.data) setSelectedProfile(null);
  }

  return (
    <>
      <AdminLayout title="User Management">
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-red-700">
                User management operation failed
              </p>
              <p className="text-xs font-medium text-red-600">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => void refresh()}
              className="text-xs font-bold text-red-700 underline"
            >
              Retry
            </button>
          </div>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-base font-extrabold text-gray-950">
                User Management
              </h1>
              <p className="mt-0.5 text-xs font-medium text-gray-400">
                Manage admin profiles and account availability.
              </p>
            </div>
            <span className="rounded-full bg-orange-50 px-4 py-1.5 text-xs font-extrabold text-orange-500">
              {activeCount} Active Admin{activeCount === 1 ? '' : 's'}
            </span>
          </div>

          <div className="px-6 py-5">
            <div className="mb-5 flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 sm:flex-row sm:items-center">
              <ShieldCheck size={17} className="shrink-0 text-blue-600" />
              <p className="flex-1 text-sm font-medium text-blue-700">
                <span className="font-extrabold">Admin Profiles:</span> Manage existing
                administrator profiles, display names, and account availability.
              </p>
            </div>

            <FilterBar
              searchValue={search}
              searchPlaceholder="Search by email or display name..."
              onSearchChange={(value) => {
                setSearch(value);
                setCurrentPage(1);
              }}
            >
              <Select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as AccountStatus | '');
                  setCurrentPage(1);
                }}
                className="min-w-36 border-gray-200 py-2"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>

              <button
                type="button"
                onClick={() => {
                  clearError();
                  void refresh();
                }}
                disabled={loading}
                className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600 disabled:opacity-50"
                aria-label="Refresh admin accounts"
              >
                <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
              </button>
            </FilterBar>

            <TableShell>
              <table className="w-full text-sm">
                <TableHeader
                  columns={[
                    'ACCOUNT',
                    'DISPLAY NAME',
                    'ROLE',
                    'LAST LOGIN',
                    'STATUS',
                    'ACTIONS',
                  ]}
                />
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16">
                        <Spinner label="Loading admin accounts..." />
                      </td>
                    </tr>
                  ) : profiles.length === 0 ? (
                    <TableEmptyRow
                      colSpan={6}
                      message="No admin accounts match the selected filters."
                    />
                  ) : (
                    profiles.map((profile) => {
                      const isCurrentAccount = profile.id === user?.id;
                      return (
                        <tr
                          key={profile.id}
                          className="bg-white transition-colors hover:bg-blue-50"
                        >
                          <td className="whitespace-nowrap px-4 py-4">
                            <div>
                              <p className="break-all font-bold text-gray-900">
                                {profile.email}
                              </p>
                              {isCurrentAccount && (
                                <p className="mt-0.5 text-xs font-semibold text-blue-600">
                                  Current session
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 font-semibold text-gray-700">
                            {profile.display_name}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4">
                            <StatusBadge label="Admin" tone="blue" />
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 font-semibold text-gray-600">
                            {profile.last_login_at
                              ? formatDateTime(profile.last_login_at)
                              : 'Never'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4">
                            <StatusBadge
                              label={STATUS_LABELS[profile.status]}
                              tone={STATUS_TONES[profile.status]}
                            />
                          </td>
                          <td className="whitespace-nowrap px-4 py-4">
                            <Button
                              type="button"
                              onClick={() => setSelectedProfile(profile)}
                              variant="primary"
                              size="sm"
                              disabled={savingId === profile.id}
                              className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                            >
                              <Settings2 size={13} />
                              {savingId === profile.id
                                ? 'Saving...'
                                : 'Account Settings'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </TableShell>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing {displayStart}-{displayEnd} of {count.toLocaleString()}{' '}
                admin accounts
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safePage === 1 || loading}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-1 text-xs text-gray-500">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, safePage + 1))
                  }
                  disabled={safePage >= totalPages || loading}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </AdminLayout>

      {selectedProfile && (
        <AccountModal
          key={selectedProfile.id}
          profile={selectedProfile}
          currentUserId={user?.id ?? null}
          saving={savingId === selectedProfile.id}
          onClose={() => {
            if (!savingId) setSelectedProfile(null);
          }}
          onSave={(updates) => void handleSaveAccount(updates)}
        />
      )}
    </>
  );
}
