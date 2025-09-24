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
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        setIsAllowed(false);
        return;
      }
      if (!["admin", "manager"].includes(user.role)) {
        setIsAllowed(false);
        return;
      }
      setIsAllowed(true);
    } catch (error) {
      console.error("Error checking access:", error);
      setIsAllowed(false);
    }
  };

  if (isAllowed === undefined) {
    return <LoadingSpinner />;
  }

  if (!isAllowed) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
} 