import React, { useContext, useEffect, useState, createContext } from "react";
import { getCurrentUser } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const { user, error } = await getCurrentUser();
      if (error) {
        console.error('Auth error:', error);
        setUser(null);
      } else {
        setUser(user ?? null);
      }
    } catch (error) {
      console.error('Auth error:', error);
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