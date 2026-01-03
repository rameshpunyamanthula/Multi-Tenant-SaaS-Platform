import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";

export default function Navigation() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);


  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
    logout();
    navigate("/login");
  };
  
  const isActive = (path) => location.pathname === path;
  if (!auth) return null;


  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        SaaS Platform
      </Link>


      <ul className="navbar-menu">
        <li>
          <Link
            to="/dashboard"
            className={`navbar-link ${isActive("/dashboard") ? "active" : ""}`}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/projects"
            className={`navbar-link ${isActive("/projects") ? "active" : ""}`}
          >
            Projects
          </Link>
        </li>


        {(auth.user.role === "tenant_admin" || auth.user.role === "super_admin") && (
          <li>
            <Link
              to="/users"
              className={`navbar-link ${isActive("/users") ? "active" : ""}`}
            >
              Users
            </Link>
          </li>
        )}


        <li className="user-dropdown">
          <button
            className="user-button"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span>{auth.user.fullName || auth.user.email}</span>
            <span style={{ fontSize: "12px", color: "#718096" }}>
              ({auth.user.role})
            </span>
          </button>


          {showDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-item" style={{ borderBottom: "2px solid #e2e8f0", cursor: "default" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a202c" }}>
                  {auth.user.fullName}
                </div>
                <div style={{ fontSize: "12px", color: "#718096", marginTop: "4px" }}>
                  {auth.user.email}
                </div>
                {auth.tenantSubdomain && (
                  <div style={{ fontSize: "12px", color: "#718096", marginTop: "4px" }}>
                    Tenant: {auth.tenantSubdomain}
                  </div>
                )}
              </div>
              <Link 
                to="/profile" 
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                Profile
              </Link>
              <Link 
                to="/settings" 
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                Settings
              </Link>
              <div className="dropdown-item" onClick={handleLogout}>
                Logout
              </div>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}
