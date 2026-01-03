import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load auth from localStorage on mount
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const tenantSubdomain = localStorage.getItem("tenantSubdomain");
    if (token && user) {
      setAuth({
        token,
        user: JSON.parse(user),
        tenantSubdomain,
      });
    }
    setLoading(false);
  }, []);

  const login = (authData) => {
    localStorage.setItem("token", authData.token);
    localStorage.setItem("user", JSON.stringify(authData.user));
    localStorage.setItem("tenantSubdomain", authData.tenantSubdomain || "");
    setAuth(authData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tenantSubdomain");
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}