import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "../supabase";

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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setIsAllowed(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        setIsAllowed(false);
        return;
      }

      if (!profile || !["admin", "manager"].includes(profile.role)) {
        setIsAllowed(false);
      } else {
        setIsAllowed(true);
      }
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