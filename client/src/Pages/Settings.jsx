import { useState, useEffect } from "react";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import Toast from "../components/Toast.jsx";

// Mock user for skeleton UI
const mockCurrentUser = { id: 1, name: "Admin", role: "admin" };

export default function Settings() {
  const currentUser = mockCurrentUser;

  // Mock users data for skeleton UI
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", employee_id: "EMP001", email: "john@example.com", role: "admin", status: "active" },
    { id: 2, name: "Jane Smith", employee_id: "EMP002", email: "jane@example.com", role: "hr", status: "active" },
    { id: 3, name: "Bob Wilson", employee_id: "EMP003", email: "bob@example.com", role: "employee", status: "active" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    userId: null,
    newRole: null,
    currentRole: null,
    userName: null,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null,
    userName: null,
    userEmail: null,
    userRole: null,
  });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success',
  });

  // Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ isVisible: false, message: '', type: 'success' });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setError(error.response?.data?.msg || "Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (userId, newRole, currentRole, userName) => {
    // Don't show modal if role hasn't changed
    if (newRole === currentRole) {
      return;
    }

    // Open confirmation modal
    setConfirmModal({
      isOpen: true,
      userId,
      newRole,
      currentRole,
      userName,
    });
  };

  const handleConfirmRoleChange = async () => {
    const { userId, newRole, userName } = confirmModal;

    try {
      setUpdatingUserId(userId);
      const response = await api.put(`/admin/users/${userId}/role`, { role: newRole });

      // Update local state with the updated user
      setUsers(
        users.map((user) => {
          if (user.id === userId) {
            return { ...user, role: newRole };
          }
          return user;
        })
      );

      // Close modal
      setConfirmModal({ isOpen: false, userId: null, newRole: null, currentRole: null, userName: null });

      // Show success toast
      showToast(`${userName}'s role has been updated successfully!`, 'success');
    } catch (error) {
      console.error("Failed to update role:", error);
      const errorMsg = error.response?.data?.msg || "Failed to update role. Please try again.";

      // Show error toast
      showToast(errorMsg, 'error');

      // Refresh users to revert the UI change if it failed
      fetchUsers();

      // Close modal
      setConfirmModal({ isOpen: false, userId: null, newRole: null, currentRole: null, userName: null });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleCancelRoleChange = () => {
    // Close modal and revert dropdown
    setConfirmModal({ isOpen: false, userId: null, newRole: null, currentRole: null, userName: null });
    // Trigger a re-render to reset the dropdown
    setUsers([...users]);
  };

  const handleDeleteUser = (userId, userName, userEmail, userRole) => {
    setDeleteModal({
      isOpen: true,
      userId,
      userName,
      userEmail,
      userRole,
    });
    setDeleteConfirmText('');
  };

  const handleConfirmDelete = async () => {
    const { userId, userName, userEmail } = deleteModal;

    // Validate confirmation text
    if (deleteConfirmText.trim() !== 'DELETE') {
      showToast('Please type DELETE to confirm', 'error');
      return;
    }

    try {
      setDeletingUserId(userId);
      const response = await api.delete(`/admin/users/${userId}`);

      // Remove user from local state
      setUsers(users.filter(user => user.id !== userId));

      // Close modal
      setDeleteModal({ isOpen: false, userId: null, userName: null, userEmail: null, userRole: null });
      setDeleteConfirmText('');

      // Show success toast with deletion stats
      const stats = response.data.stats || {};
      const statsMessage = Object.entries(stats)
        .filter(([_, count]) => count > 0)
        .map(([key, count]) => `${count} ${key}`)
        .join(', ');

      const message = statsMessage
        ? `${userName} deleted successfully. Removed: ${statsMessage}`
        : `${userName} deleted successfully`;

      showToast(message, 'success');
    } catch (error) {
      console.error("Failed to delete user:", error);
      const errorMsg = error.response?.data?.msg || "Failed to delete user. Please try again.";

      // Show error toast
      showToast(errorMsg, 'error');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, userId: null, userName: null, userEmail: null, userRole: null });
    setDeleteConfirmText('');
  };

  const roles = [
    { value: "employee", label: "Employee" },
    { value: "hr", label: "HR" },
    { value: "payroll", label: "Payroll Officer" },
    { value: "admin", label: "Admin" },
  ];

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#A24689] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500">Loading users...</div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-[#A24689] text-white rounded-lg hover:bg-[#8a3a73] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage user roles and permissions</p>
      </div>

      {/* Settings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  User name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                  Role
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.employee_id || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 flex justify-center">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value, user.role, user.name)}
                        disabled={updatingUserId === user.id}
                        className="px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A24689] focus:border-transparent outline-none transition-all text-sm text-center appearance-none bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          width: "180px",
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.5rem center',
                          backgroundSize: '1.5em 1.5em',
                        }}
                      >
                        {roles.map((role) => (
                          <option
                            key={role.value}
                            value={role.value}
                            className="text-center py-2"
                          >
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name, user.email, user.role)}
                        disabled={deletingUserId === user.id || user.id === currentUser?.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={user.id === currentUser?.id ? "You cannot delete your own account" : "Delete user"}
                      >
                        {deletingUserId === user.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleCancelRoleChange}
        onConfirm={handleConfirmRoleChange}
        title="Confirm Role Change"
        message={confirmModal.userName && confirmModal.currentRole && confirmModal.newRole ?
          `Are you sure you want to change ${confirmModal.userName}'s role from ${roles.find(r => r.value === confirmModal.currentRole)?.label
          } to ${roles.find(r => r.value === confirmModal.newRole)?.label
          }?\n\nThis will immediately affect their access permissions.` :
          ''
        }
        confirmText="Change Role"
        cancelText="Cancel"
        isLoading={updatingUserId === confirmModal.userId}
      />

      {/* Delete User Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop with blur only */}
          <div
            className="fixed inset-0 backdrop-blur-md transition-all"
            onClick={handleCancelDelete}
          ></div>

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete User Account
              </h3>

              {/* User Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium text-gray-900">{deleteModal.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium text-gray-900">{deleteModal.userEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Role:</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{deleteModal.userRole}</span>
                </div>
              </div>

              {/* Warning Message */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 font-medium mb-2">⚠️ This action cannot be undone!</p>
                <p className="text-xs text-red-700 mb-2">Deleting this user will:</p>
                <ul className="text-xs text-red-700 space-y-1 ml-4 list-disc">
                  <li>Permanently remove their account</li>
                  <li>Delete all associated payslips</li>
                  <li>Delete all attendance records</li>
                  <li>Delete all leave requests</li>
                  <li>Anonymize audit log entries</li>
                </ul>
              </div>

              {/* Edge Case Warnings */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> The system will prevent deletion if:
                </p>
                <ul className="text-xs text-yellow-700 mt-1 ml-4 list-disc space-y-0.5">
                  <li>This is the last admin account</li>
                  <li>User has active payroll runs</li>
                  <li>User has pending leave approvals</li>
                </ul>
              </div>

              {/* Confirmation Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  autoFocus
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDelete}
                  disabled={deletingUserId !== null}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmText.trim() !== 'DELETE' || deletingUserId !== null}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
                >
                  {deletingUserId !== null ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    'Delete User'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </>
  );
}
