import { useEffect, useState } from "react";
import { getAllUsers, lockUser, unlockUser } from "../api/adminApi";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reason, setReason] = useState('');
  const [action, setAction] = useState('');  // 'lock' or 'unlock'

  const load = async (page = 1) => {
    setLoading(true);
    setCurrentPage(page);
    try {
      const res = await getAllUsers();
      const data = Array.isArray(res) ? res : (res.data || res || []);
      setUsers(data);
      setTotalPages(1);  // Simple, no pagination yet; add if needed
    } catch (err) {
      console.error("Load users error:", err?.response || err);
      alert("Cannot load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  const handleAction = async (userId, act) => {
    setSelectedUser(userId);
    setAction(act);
    setReason('');
    setShowModal(true);
  };

  const onSubmit = async () => {
    if (!reason.trim()) {
      alert('Reason is required');
      return;
    }
    try {
      if (action === 'lock') {
        await lockUser(selectedUser, reason);
      } else {
        await unlockUser(selectedUser, reason);
      }
      setShowModal(false);
      load(currentPage);  // Reload list
      alert('User status updated successfully');
    } catch (err) {
      alert('Failed to update: ' + (err?.response?.data?.error || err.message));
    }
  };

  const Pagination = () => (
    <div className="flex justify-center mt-4 gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => load(p)} className={`px-3 py-1 rounded ${p === currentPage ? 'bg-blue-600 text-white' : 'border'}`}>
          {p}
        </button>
      ))}
    </div>
  );

  const StatusBadge = ({ status }) => (
    <span className={`px-2 py-1 rounded text-sm ${status === 'active' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
      {status}
    </span>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <button onClick={() => load(1)} className="px-4 py-2 border rounded">Refresh</button>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading users...</div>
      ) : (
        <>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Username</th>
                <th className="border p-2">Fullname</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Roles</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Lock Reason</th>
                <th className="border p-2">Unlock Reason</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id || u.id} className="hover:bg-gray-50">
                  <td className="border p-2 font-medium">{u.username}</td>
                  <td className="border p-2">{u.fullname}</td>
                  <td className="border p-2">{u.email}</td>
                  <td className="border p-2">{u.roles}</td>
                  <td className="border p-2"><StatusBadge status={u.account_status} /></td>
                  <td className="border p-2 max-w-xs truncate">{u.lock_reason || 'N/A'}</td>
                  <td className="border p-2 max-w-xs truncate">{u.unlock_reason || 'N/A'}</td>
                  <td className="border p-2">
                    {u.account_status === 'active' && (
                      <button onClick={() => handleAction(u.user_id || u.id, 'lock')} className="mr-2 px-2 py-1 bg-red-500 text-white rounded text-sm">Lock</button>
                    )}
                    {u.account_status === 'locked' && (
                      <button onClick={() => handleAction(u.user_id || u.id, 'unlock')} className="px-2 py-1 bg-green-500 text-white rounded text-sm">Unlock</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && <Pagination />}
          {users.length === 0 && <p className="text-center py-4">No users found.</p>}
        </>
      )}

      {/* Modal for reason input */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {action === 'lock' ? 'Lock User' : 'Unlock User'}
            </h2>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason (at least 10 characters)..."
              className="w-full p-2 border rounded mb-4 h-32"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={onSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}