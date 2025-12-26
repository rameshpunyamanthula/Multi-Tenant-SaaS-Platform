import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import React from 'react';
const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    tenantName: '',
    subdomain: '',
    adminEmail: '',
    adminFullName: '',
    adminPassword: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.adminPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!form.acceptTerms) {
      setError('You must accept Terms & Conditions');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register-tenant', {
        tenantName: form.tenantName,
        subdomain: form.subdomain,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
        adminFullName: form.adminFullName
      });

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 450, margin: '60px auto' }}>
      <h2>Register Organization</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Organization Name</label>
          <input
            type="text"
            name="tenantName"
            value={form.tenantName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Subdomain</label>
          <input
            type="text"
            name="subdomain"
            value={form.subdomain}
            onChange={handleChange}
            placeholder="e.g. demo"
            required
          />
          <small>{form.subdomain && `${form.subdomain}.yourapp.com`}</small>
        </div>

        <div>
          <label>Admin Full Name</label>
          <input
            type="text"
            name="adminFullName"
            value={form.adminFullName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Admin Email</label>
          <input
            type="email"
            name="adminEmail"
            value={form.adminEmail}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            name="adminPassword"
            value={form.adminPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              name="acceptTerms"
              checked={form.acceptTerms}
              onChange={handleChange}
            />{' '}
            I accept Terms & Conditions
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: 10 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
