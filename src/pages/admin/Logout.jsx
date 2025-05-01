import React, { useEffect } from "react";
import { supabase } from "../../supabase";

export default function Logout() {
  useEffect(() => {
    const performLogout = async () => {
      try {
        // Clear any stored auth state
        await supabase.auth.signOut();
        
        // Clear any localStorage items that might contain auth state
        localStorage.removeItem('supabase.auth.token');
        
        // Use a more reliable way to redirect and clear state
        setTimeout(() => {
          window.location.replace('/admin/login');
        }, 0);
      } catch (error) {
        console.error("Logout failed:", error);
        // Still redirect to login on error
        window.location.replace('/admin/login');
      }
    };

    performLogout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg">Logging out...</p>
      </div>
    </div>
  );
} 