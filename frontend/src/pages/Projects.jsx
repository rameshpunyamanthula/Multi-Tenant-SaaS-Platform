import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { projectsAPI } from "../services/api";
import Navigation from "../components/Navigation";


export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
  });
  const [error, setError] = useState("");


  useEffect(() => {
    loadProjects();
  }, []);


  const loadProjects = async () => {
    try {
      const response = await projectsAPI.list();
      setProjects(response.data.data || []);
    } catch (err) {
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || "",
      status: project.status,
    });
    setShowModal(true);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");


    try {
      if (editingProject) {
        await projectsAPI.update(editingProject.id, formData);
      } else {
        await projectsAPI.create(formData);
      }
      setShowModal(false);
      setEditingProject(null);
      setFormData({ name: "", description: "", status: "active" });
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${editingProject ? 'update' : 'create'} project`);
    }
  };


  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData({ name: "", description: "", status: "active" });
    setError("");
  };


  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }


    try {
      await projectsAPI.archive(projectId);
      loadProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete project");
    }
  };


  if (loading) {
    return (
      <>
        <Navigation />
        <div className="loading-container">Loading projects...</div>
      </>
    );
  }


  // Filter projects: hide archived, apply search and status filter
  const filteredProjects = projects
    .filter((project) => project.status !== "archived")
    .filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });


  return (
    <>
      <Navigation />
      <div className="dashboard-container">
        <div className="page-header">
          <h1 className="page-title">Projects</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Create Project
          </button>
        </div>


        {/* Search and Filter Bar */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="filters-bar">
            <div className="search-box">
              <input
                type="text"
                className="form-input"
                placeholder="Search projects by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: 0 }}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Status:</label>
              <select
                className="form-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ marginBottom: 0 }}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>


        {filteredProjects.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-title">
                {searchTerm || statusFilter !== "all" ? "No projects found" : "No projects yet"}
              </div>
              <p>
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first project to get started!"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                  Create Project
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
                    <th>Project Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Creator</th>
                    <th>Tasks</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.id}>
                      <td className="font-semibold">{project.name}</td>
                      <td className="text-truncate">
                        {project.description || "-"}
                      </td>
                      <td>
                        <span
                          className={`badge badge-${
                            project.status === "active"
                              ? "success"
                              : project.status === "completed"
                              ? "info"
                              : "warning"
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td>
                        {project.createdBy?.fullName || project.createdBy?.full_name || "-"}
                      </td>
                      <td>{project.taskCount || 0}</td>
                      <td>{new Date(project.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link
                          to={`/projects/${project.id}`}
                          className="btn btn-small btn-secondary mr-2"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleEdit(project)}
                          className="btn btn-small btn-primary mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="btn btn-small btn-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* Create/Edit Project Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2 className="modal-title">
                {editingProject ? "Edit Project" : "Create New Project"}
              </h2>
              <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                  <label className="form-label">Project Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows="4"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                {error && <div className="alert alert-error">{error}</div>}
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingProject ? "Update Project" : "Create Project"}
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
