import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../utils/api';
import type { AdminUser } from '../../lib/adminTypes';
import { Shield, User } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.USERS);
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Manage Users</h1>
      </div>
      
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading users...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-right px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user._id || idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    {user.isAdmin ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-[11px] font-bold">
                        <Shield className="w-3.5 h-3.5" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold">
                        <User className="w-3.5 h-3.5" /> User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-gray-500">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
