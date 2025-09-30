import React, { useEffect } from "react";
import config from "../../config/api";

export default function Logout() {
  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call the actual logout API
        const response = await fetch(config.getUrl(config.endpoints.auth.logout), {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Clear any localStorage items that might contain auth state
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        sessionStorage.clear();
        
        // Redirect to admin login
        window.location.replace('/admin/login');
      } catch (error) {
        console.error("Logout failed:", error);
        // Clear storage and redirect anyway
        localStorage.clear();
        sessionStorage.clear();
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