import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import PageWrapper from '../../components/common/PageWrapper';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, verified, unverified
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, suspended, banned

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const updateUserStatus = async (userId, newStatus) => {
    const { error } = await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    } else {
      fetchUsers();
    }
  };

  const exportToCSV = () => {
    // Define CSV headers
    const headers = [
      'Full Name',
      'Email',
      'University',
      'Department',
      'Verified',
      'Status',
      'Created At'
    ].join(',');

    // Convert user data to CSV rows
    const rows = filteredUsers.map(user => [
      user.full_name || '',
      user.email || '',
      user.university || '',
      user.department || '',
      user.is_verified ? 'Yes' : 'No',
      user.status || 'active',
      new Date(user.created_at).toLocaleDateString()
    ].map(field => `"${field}"`).join(','));

    // Combine headers and rows
    const csv = [headers, ...rows].join('\n');

    // Create and trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = (
      (user.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (user.university?.toLowerCase() || '').includes(search.toLowerCase())
    );

    const matchesVerification = 
      filter === 'all' ? true :
      filter === 'verified' ? user.is_verified :
      !user.is_verified;

    const matchesStatus =
      statusFilter === 'all' ? true :
      user.status === statusFilter;

    return matchesSearch && matchesVerification && matchesStatus;
  });

  return (
    <PageWrapper>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">👥 User Management</h2>
        
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name, email, or university..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded w-full"
          />
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All Users</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>

          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export to CSV
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    University
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.avatar_url && (
                            <img
                              className="h-10 w-10 rounded-full mr-3"
                              src={user.avatar_url}
                              alt=""
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.full_name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.university || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.department || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_verified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.is_verified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {user.status !== 'active' && (
                          <button
                            onClick={() => updateUserStatus(user.id, 'active')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Activate
                          </button>
                        )}
                        {user.status !== 'suspended' && (
                          <button
                            onClick={() => updateUserStatus(user.id, 'suspended')}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Suspend
                          </button>
                        )}
                        {user.status !== 'banned' && (
                          <button
                            onClick={() => updateUserStatus(user.id, 'banned')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Ban
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
} 