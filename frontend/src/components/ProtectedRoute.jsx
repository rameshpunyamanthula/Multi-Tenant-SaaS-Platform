import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { auth, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontFamily: "sans-serif"
      }}>
        Loading...
      </div>
    );
  }

  {}
  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  // Check if user role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(auth.user.role)) {
    return (
      <div style={{ 
        padding: "20px", 
        fontFamily: "sans-serif",
        textAlign: "center",
        marginTop: "50px"
      }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return children;
}
