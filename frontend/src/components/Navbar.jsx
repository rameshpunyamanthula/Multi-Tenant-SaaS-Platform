import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import React from 'react';
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        borderBottom: '1px solid #ccc'
      }}
    >
      <div>
        <b>Multi-Tenant SaaS</b>
      </div>

      <div style={{ display: 'flex', gap: 15 }}>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/projects">Projects</Link>

        {user.role === 'tenant_admin' && (
          <Link to="/users">Users</Link>
        )}
      </div>

      <div>
        <span style={{ marginRight: 10 }}>
          {user.fullName} ({user.role})
        </span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
