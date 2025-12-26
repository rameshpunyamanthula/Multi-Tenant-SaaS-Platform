import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectsAPI, tasksAPI, usersAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navigation from "../components/Navigation";


export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedTo: "",
    dueDate: "",
  });
  const [projectFormData, setProjectFormData] = useState({
    name: "",
    description: "",
    status: "active",
  });
  const [error, setError] = useState("");


  useEffect(() => {
    loadProjectData();
  }, [projectId]);


  const loadProjectData = async () => {
    try {
      const projectRes = await projectsAPI.getById(projectId);
      setProject(projectRes.data.data);
      const tasksRes = await tasksAPI.list({ projectId });
      setTasks(tasksRes.data.data || []);
      const usersRes = await usersAPI.list();
      setUsers(usersRes.data.data || []);
    } catch (err) {
      console.error("Error loading project:", err);
      alert("Failed to load project details");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };


  const handleEditProject = () => {
    setProjectFormData({
      name: project.name,
      description: project.description || "",
      status: project.status,
    });
    setShowProjectModal(true);
  };


  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await projectsAPI.update(projectId, projectFormData);
      setShowProjectModal(false);
      loadProjectData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update project");
    }
  };


  const handleDeleteProject = async () => {
    if (!window.confirm("Are you sure you want to delete this project? All tasks will be deleted.")) {
      return;
    }
    try {
      await projectsAPI.archive(projectId);
      navigate("/projects");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete project");
    }
  };


  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      assignedTo: task.assigned_to?.id || "",
      dueDate: task.due_date ? task.due_date.split('T')[0] : "",
    });
    setShowTaskModal(true);
  };


  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingTask) {
        await tasksAPI.update(editingTask.id, {
          title: taskFormData.title,
          description: taskFormData.description,
          priority: taskFormData.priority,
          assignedTo: taskFormData.assignedTo || null,
          dueDate: taskFormData.dueDate || null,
        });
      } else {
        await tasksAPI.create({
          ...taskFormData,
          projectId,
          assignedTo: taskFormData.assignedTo || null,
          dueDate: taskFormData.dueDate || null,
        });
      }
      setShowTaskModal(false);
      setEditingTask(null);
      setTaskFormData({
        title: "",
        description: "",
        priority: "medium",
        assignedTo: "",
        dueDate: "",
      });
      loadProjectData();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${editingTask ? 'update' : 'create'} task`);
    }
  };


  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
    setTaskFormData({
      title: "",
      description: "",
      priority: "medium",
      assignedTo: "",
      dueDate: "",
    });
    setError("");
  };


  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      loadProjectData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update task status");
    }
  };


  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }
    try {
      await tasksAPI.delete(taskId);
      loadProjectData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };


  if (loading) {
    return (
      <>
        <Navigation />
        <div className="loading-container">Loading project details...</div>
      </>
    );
  }


  if (!project) {
    return (
      <>
        <Navigation />
        <div className="dashboard-container">
          <div className="alert alert-error">Project not found</div>
        </div>
      </>
    );
  }


  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesAssigned = 
      assignedFilter === "all" || 
      (assignedFilter === "unassigned" && !task.assigned_to) ||
      (task.assigned_to?.id === assignedFilter);
    return matchesStatus && matchesPriority && matchesAssigned;
  });
  return (
    <>
      <Navigation />
      <div className="dashboard-container">
        <div className="card">
          <div className="card-header">
            <div>
              <h1 className="page-title" style={{ marginBottom: "8px" }}>
                {project.name}
              </h1>
              <span className={`badge badge-${
                project.status === "active" ? "success" : 
                project.status === "completed" ? "info" : "warning"
              }`}>
                {project.status}
              </span>
            </div>
            <div>
              <button className="btn btn-secondary mr-2" onClick={handleEditProject}>
                Edit Project
              </button>
              <button className="btn btn-danger mr-2" onClick={handleDeleteProject}>
                Delete Project
              </button>
              <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
                + Add Task
              </button>
            </div>
          </div>
          {project.description && (
            <p style={{ color: "#718096", marginTop: "16px" }}>
              {project.description}
            </p>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Tasks ({tasks.length})</h2>
          </div>

          {tasks.length > 0 && (
            <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
              <div className="filters-bar">
                <div className="filter-group">
                  <label className="filter-label">Status:</label>
                  <select
                    className="form-input"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ marginBottom: 0 }}
                  >
                    <option value="all">All</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label">Priority:</label>
                  <select
                    className="form-input"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    style={{ marginBottom: 0 }}
                  >
                    <option value="all">All</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label">Assigned:</label>
                  <select
                    className="form-input"
                    value={assignedFilter}
                    onChange={(e) => setAssignedFilter(e.target.value)}
                    style={{ marginBottom: 0 }}
                  >
                    <option value="all">All</option>
                    <option value="unassigned">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {filteredTasks.length === 0 && tasks.length > 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No tasks match your filters</div>
              <p>Try adjusting your filter criteria</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No tasks yet</div>
              <p>Add your first task to get started!</p>
              <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
                Add Task
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <div className="font-semibold">{task.title}</div>
                        {task.description && (
                          <div style={{ fontSize: "12px", color: "#718096", marginTop: "4px" }}>
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${
                          task.priority === "high" ? "danger" : 
                          task.priority === "medium" ? "warning" : "info"
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-input"
                          value={task.status}
                          onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                          style={{ padding: "6px", fontSize: "13px" }}
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td>
                        {task.assigned_to ? task.assigned_to.full_name : "Unassigned"}
                      </td>
                      <td>
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}
                      </td>
                      <td>
                        <button
                          onClick={() => handleEditTask(task)}
                          className="btn btn-small btn-primary mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
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
          )}
        </div>

        {showProjectModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2 className="modal-title">Edit Project</h2>
              <form onSubmit={handleUpdateProject} className="form">
                <div className="form-group">
                  <label className="form-label">Project Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={projectFormData.name}
                    onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows="4"
                    value={projectFormData.description}
                    onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={projectFormData.status}
                    onChange={(e) => setProjectFormData({ ...projectFormData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                {error && <div className="alert alert-error">{error}</div>}
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    Update Project
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowProjectModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showTaskModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2 className="modal-title">
                {editingTask ? "Edit Task" : "Create New Task"}
              </h2>
              <form onSubmit={handleCreateTask} className="form">
                <div className="form-group">
                  <label className="form-label">Task Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={taskFormData.title}
                    onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={taskFormData.description}
                    onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-input"
                    value={taskFormData.priority}
                    onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign To</label>
                  <select
                    className="form-input"
                    value={taskFormData.assignedTo}
                    onChange={(e) => setTaskFormData({ ...taskFormData, assignedTo: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={taskFormData.dueDate}
                    onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                  />
                </div>
                {error && <div className="alert alert-error">{error}</div>}
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingTask ? "Update Task" : "Create Task"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseTaskModal}
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
