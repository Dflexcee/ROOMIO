import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getCurrentUser } from "../services/authService";

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-6 rounded shadow text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-lg">Checking access...</p>
    </div>
  </div>
);

export default function ProtectedAdminRoute() {
  const [isAllowed, setIsAllowed] = useState(undefined);
  const location = useLocation();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    console.log('🔍 ProtectedAdminRoute: Checking access...');
    try {
      const { user } = await getCurrentUser();
      console.log('🔍 ProtectedAdminRoute: getCurrentUser result:', user);
      
      if (!user) {
        console.log('❌ ProtectedAdminRoute: No user found, redirecting to login');
        setIsAllowed(false);
        return;
      }
      
      console.log('👤 ProtectedAdminRoute: User role:', user.role);
      console.log('👤 ProtectedAdminRoute: User status:', user.status);
      
      // Check if user has admin/manager role
      if (!["admin", "manager"].includes(user.role)) {
        console.log('❌ ProtectedAdminRoute: User does not have admin/manager role');
        setIsAllowed(false);
        return;
      }
      
      // For admin users, we allow access regardless of status
      // because they need to manage the system even if their account is restricted
      console.log('✅ ProtectedAdminRoute: Admin access granted (status ignored for admin users)');
      setIsAllowed(true);
    } catch (error) {
      console.error("❌ ProtectedAdminRoute: Error checking access:", error);
      setIsAllowed(false);
    }
  };

  console.log('🔍 ProtectedAdminRoute: isAllowed state:', isAllowed);

  if (isAllowed === undefined) {
    console.log('⏳ ProtectedAdminRoute: Showing loading spinner');
    return <LoadingSpinner />;
  }

  if (!isAllowed) {
    console.log('🔄 ProtectedAdminRoute: Redirecting to /admin/login');
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  console.log('✅ ProtectedAdminRoute: Rendering admin content');
  return <Outlet />;
} 