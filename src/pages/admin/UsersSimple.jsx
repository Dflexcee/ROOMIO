import React, { useState, useEffect } from "react";
import PageWrapper from "../../components/common/PageWrapper";

export default function UsersSimple() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - works immediately
    const mockUsers = [
      { id: 1, email: 'admin@roomio.com', full_name: 'Admin User', role: 'admin', is_verified: true, status: 'active' },
      { id: 2, email: 'user@roomio.com', full_name: 'Test User', role: 'user', is_verified: false, status: 'active' }
    ];
    
    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const handleAction = (userId, action) => {
    alert(`${action} for user ${userId} - Working!`);
    // Update the user in state
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, is_verified: action === 'verify', status: action === 'activate' ? 'active' : user.status }
        : user
    ));
  };

  if (loading) return <PageWrapper><p>Loading...</p></PageWrapper>;

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4">👥 User Management</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleAction(user.id, 'verify')}
                    className="text-green-600 hover:text-green-900 bg-green-100 px-3 py-1 rounded"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => handleAction(user.id, 'activate')}
                    className="text-blue-600 hover:text-blue-900 bg-blue-100 px-3 py-1 rounded"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleAction(user.id, 'suspend')}
                    className="text-orange-600 hover:text-orange-900 bg-orange-100 px-3 py-1 rounded"
                  >
                    Suspend
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
