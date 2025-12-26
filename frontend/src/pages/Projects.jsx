import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import React from 'react';
const Projects = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const loadProjects = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/projects', {
        params: {
          search: search || undefined,
          status: status || undefined
        }
      });

      const data = res.data.data.projects || res.data.data;
      setProjects(data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async projectId => {
    const confirm = window.confirm(
      'Are you sure you want to delete this project?'
    );
    if (!confirm) return;

    try {
      await api.delete(`/projects/${projectId}`);
      loadProjects();
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Projects</h2>

      {/* Filters */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{ marginLeft: 10 }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="completed">Completed</option>
        </select>

        <button onClick={loadProjects} style={{ marginLeft: 10 }}>
          Apply
        </button>
      </div>

      {/* Project List */}
      {projects.length === 0 ? (
        <p>No projects found</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {projects.map(project => (
              <tr key={project.id}>
                <td>{project.name}</td>
                <td>{project.description || '-'}</td>
                <td>{project.status}</td>
                <td>
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    style={{ marginLeft: 5 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Projects;
