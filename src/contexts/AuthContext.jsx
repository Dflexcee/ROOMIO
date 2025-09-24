import React, { useContext, useEffect, useState, createContext } from "react";
import { getCurrentUser } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user from PHP session
    getCurrentUser()
      .then(({ user, error }) => {
        if (error) {
          console.error('Auth error:', error);
          setUser(null);
        } else {
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
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 