import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";


export default function RegisterTenant() {
  const [formData, setFormData] = useState({
    tenantName: "",
    subdomain: "",
    adminEmail: "",
    adminFullName: "",
    adminPassword: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();


  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");


    // Validation
    if (formData.adminPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }


    if (formData.adminPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }


    if (!formData.acceptTerms) {
      setError("Please accept the terms and conditions");
      return;
    }


    setLoading(true);


    try {
      await authAPI.registerTenant({
        tenantName: formData.tenantName,
        subdomain: formData.subdomain,
        adminEmail: formData.adminEmail,
        adminFullName: formData.adminFullName,
        adminPassword: formData.adminPassword,
      });


      alert("Tenant registered successfully! Please login.");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "Registration failed. Subdomain or email may already exist."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-container">
      <div className="auth-card scrollable">
        <h2 className="auth-title">Register New Tenant</h2>
        <p className="auth-subtitle">Create your organization account</p>


        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Organization Name *</label>
            <input
              type="text"
              name="tenantName"
              value={formData.tenantName}
              onChange={handleChange}
              placeholder="Acme Corporation"
              required
              className="form-input"
            />
          </div>


          <div className="form-group">
            <label className="form-label">Subdomain *</label>
            <div className="subdomain-wrapper">
              <input
                type="text"
                name="subdomain"
                value={formData.subdomain}
                onChange={handleChange}
                placeholder="acme"
                pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
                className="form-input"
                style={{ marginBottom: 0 }}
              />
              <span className="subdomain-suffix">.yourapp.com</span>
            </div>
            <small className="form-hint">Lowercase letters, numbers, and hyphens only</small>
          </div>


          <div className="form-group">
            <label className="form-label">Admin Full Name *</label>
            <input
              type="text"
              name="adminFullName"
              value={formData.adminFullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className="form-input"
            />
          </div>


          <div className="form-group">
            <label className="form-label">Admin Email *</label>
            <input
              type="email"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleChange}
              placeholder="admin@acme.com"
              required
              className="form-input"
            />
          </div>


          <div className="form-group">
            <label className="form-label">Password *</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="adminPassword"
                value={formData.adminPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength="8"
                className="form-input"
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>


          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="form-input"
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                }}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>


          <div className="checkbox-group">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              required
              className="checkbox"
            />
            <label className="checkbox-label">
              I accept the Terms & Conditions
            </label>
          </div>


          {error && <div className="alert alert-error">{error}</div>}


          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Creating Account..." : "Create Tenant Account"}
          </button>
        </form>


        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "#6b7280" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#667eea", textDecoration: "none", fontWeight: "600" }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
