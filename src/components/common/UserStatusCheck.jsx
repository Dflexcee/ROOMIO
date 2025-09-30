import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UserStatusMessage from './UserStatusMessage';

export default function UserStatusCheck({ children }) {
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    // Check user status on every page load
    if (user && user.status) {
      console.log('User status check:', user.status, 'Verification:', user.verification_status, 'Role:', user.role);

      // Only check status for regular users, not admin/manager users
      if (!['admin', 'manager'].includes(user.role)) {
        if (user.status === 'banned' || user.status === 'suspended' || user.status === 'inactive') {
          console.log('User status requires blocking:', user.status);
        }

        // Also check verification_status for suspended state
        if (user.verification_status === 'suspended') {
          console.log('User verification suspended');
        }
      } else {
        console.log('Admin/Manager user - status check bypassed');
      }
    }
  }, [user]);

  // Refresh user status periodically to catch admin changes
  useEffect(() => {
    if (user && !['admin', 'manager'].includes(user.role)) {
      const intervalId = setInterval(() => {
        console.log('Refreshing user status...');
        refreshUser();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(intervalId);
    }
  }, [user, refreshUser]);

  // Only block for ACCOUNT-LEVEL status issues (not admin/manager)
  // Verification status (unverified/pending/rejected) is handled via modals on posting pages
  // Admin users should be able to access the system even if their status is restricted
  if (user && !['admin', 'manager'].includes(user.role)) {
    // Check account status ONLY (banned/suspended/inactive)
    // These block the ENTIRE app
    if (user.status === 'banned' || user.status === 'suspended' || user.status === 'inactive') {
      return (
        <UserStatusMessage
          userStatus={user.status}
          statusReason={user.status_reason}
          statusChangedAt={user.status_changed_at}
        />
      );
    }

    // NOTE: verification_status (unverified/pending/rejected/suspended) does NOT block here
    // It only prevents posting via VerificationRequiredModal on posting pages
  }

  // Show normal content for active users and all admin/manager users
  return children;
}
