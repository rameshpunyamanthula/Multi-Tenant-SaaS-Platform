import React, { useState, useEffect } from "react";
import { usersAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navigation from "../components/Navigation";


export default function Users() {
  const { auth } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");


  useEffect(() => {
    loadUsers();
  }, []);


  const loadUsers = async () => {
    try {
      const response = await usersAPI.list();
      setUsers(response.data.data || []);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      fullName: user.full_name,
      password: "",
      role: user.role,
    });
    setShowModal(true);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");


    if (!editingUser && formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }


    if (editingUser && formData.password && formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }


    try {
      if (editingUser) {
        const updateData = {
          fullName: formData.fullName,
          role: formData.role,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await usersAPI.update(editingUser.id, updateData);
      } else {
        await usersAPI.create(formData);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({
        email: "",
        fullName: "",
        password: "",
        role: "user",
      });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${editingUser ? 'update' : 'create'} user`);
    }
  };


  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      email: "",
      fullName: "",
      password: "",
      role: "user",
    });
    setError("");
  };


  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }


    try {
      await usersAPI.deactivate(userId);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };


  if (loading) {
    return (
      <>
        <Navigation />
        <div className="loading-container">Loading users...</div>
      </>
    );
  }


  // Filter users: hide inactive, apply search and role filter
  const filteredUsers = users
    .filter((user) => user.is_active === true)
    .filter((user) => {
      const matchesSearch = 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });


  return (
    <>
      <Navigation />
      <div className="dashboard-container">
        <div className="page-header">
          <h1 className="page-title">Users Management</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add User
          </button>
        </div>


        {/* Search and Filter Bar */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="filters-bar">
            <div className="search-box">
              <input
                type="text"
                className="form-input"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: 0 }}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Role:</label>
              <select
                className="form-input"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ marginBottom: 0 }}
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="tenant_admin">Tenant Admin</option>
              </select>
            </div>
          </div>
        </div>


        {filteredUsers.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-title">
                {searchTerm || roleFilter !== "all" ? "No users found" : "No users yet"}
              </div>
              <p>
                {searchTerm || roleFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Add your first user to get started!"}
              </p>
              {!searchTerm && roleFilter === "all" && (
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                  Add User
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="font-semibold">{user.full_name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span
                          className={`badge badge-${
                            user.role === "tenant_admin"
                              ? "primary"
                              : user.role === "super_admin"
                              ? "danger"
                              : "info"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            user.is_active ? "badge-success" : "badge-warning"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleEdit(user)}
                          className="btn btn-small btn-primary mr-2"
                          disabled={user.id === auth.user.id}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="btn btn-small btn-danger"
                          disabled={user.id === auth.user.id}
                        >
                          {user.id === auth.user.id ? "You" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2 className="modal-title">
                {editingUser ? "Edit User" : "Add New User"}
              </h2>
              <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    disabled={editingUser}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Password {editingUser ? "(leave blank to keep current)" : "*"}
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editingUser}
                    minLength="8"
                    placeholder="Min 8 characters"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-input"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="user">User</option>
                    <option value="tenant_admin">Tenant Admin</option>
                  </select>
                </div>
                {error && <div className="alert alert-error">{error}</div>}
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingUser ? "Update User" : "Add User"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
