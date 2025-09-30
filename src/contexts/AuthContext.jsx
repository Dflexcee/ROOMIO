import React, { useContext, useEffect, useState, createContext } from "react";
import { getCurrentUser } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      console.log('AuthContext: Refreshing user data...');
      const { user: freshUser, error } = await getCurrentUser();
      if (error) {
        console.error('Auth refresh error:', error);
        setUser(null);
      } else {
        // Check if user status changed
        if (user && freshUser) {
          const statusChanged = user.status !== freshUser.status;
          const verificationChanged = user.verification_status !== freshUser.verification_status;

          if (statusChanged) {
            console.log('AuthContext: User status changed from', user.status, 'to', freshUser.status);
          }
          if (verificationChanged) {
            console.log('AuthContext: User verification changed from', user.verification_status, 'to', freshUser.verification_status);
          }

          // If user was suspended/banned/deactivated, clear session and force reload
          if (freshUser.status === 'banned' || freshUser.status === 'suspended' || freshUser.status === 'inactive') {
            console.warn('AuthContext: User account restricted, updating state');
          }
        }

        setUser(freshUser ?? null);
      }
    } catch (error) {
      console.error('Auth refresh error:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    console.log('AuthContext: Checking user session...');
    // Get initial user from PHP session
    getCurrentUser()
      .then(({ user, error }) => {
        console.log('AuthContext: getCurrentUser response:', { user, error });
        if (error) {
          console.error('Auth error:', error);
          setUser(null);
        } else {
          console.log('AuthContext: Setting user:', user);
          setUser(user ?? null);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Auth error:', error);
        setUser(null);
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 