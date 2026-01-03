import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectsAPI, tasksAPI } from "../services/api";
import Navigation from "../components/Navigation";


export default function Dashboard() {
  const { auth } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [taskStatusFilter, setTaskStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadDashboardData();
  }, []);


  const loadDashboardData = async () => {
    try {
      const projectsRes = await projectsAPI.list();
      const projects = projectsRes.data.data || [];

      setRecentProjects(projects);

      let totalTasks = 0;
      let completedTasks = 0;
      const allTasks = [];

      for (const project of projects) {
        try {
          const tasksRes = await tasksAPI.list({ 
            projectId: project.id,
            assignedTo: auth.user.id 
          });
          const tasks = tasksRes.data.data || [];

          allTasks.push(...tasks);
          
          totalTasks += tasks.length;
          completedTasks += tasks.filter(t => t.status === "completed").length;
        } catch (err) {
          console.error("Error loading tasks:", err);
        }
      }

      setMyTasks(allTasks.slice(0, 10));
      setStats({
  totalProjects: projects.filter(p => p.status !== "archived").length,
  totalTasks,
  completedTasks,
  pendingTasks: totalTasks - completedTasks,
});

    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <>
        <Navigation />
        <div className="loading-container">Loading dashboard...</div>
      </>
    );
  }


  const filteredTasks = myTasks.filter((task) => {
    return taskStatusFilter === "all" || task.status === taskStatusFilter;
  });


  return (
    <>
      <Navigation />
      <div className="dashboard-container">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {auth.user.fullName || auth.user.email}!
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Projects</div>
            <div className="stat-value">{stats.totalProjects}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Tasks</div>
            <div className="stat-value">{stats.totalTasks}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed Tasks</div>
            <div className="stat-value">{stats.completedTasks}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending Tasks</div>
            <div className="stat-value">{stats.pendingTasks}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Projects</h2>
            <Link to="/projects" className="btn btn-small btn-primary">
              View All
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No projects yet</div>
              <p>Create your first project to get started!</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Status</th>
                    <th>Tasks</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map((project) => (
                    <tr key={project.id}>
                      <td>{project.name}</td>
                      <td>
                        <span className={`badge badge-${
                          project.status === "active" ? "success" : 
                          project.status === "completed" ? "info" : "warning"
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td>{project.taskCount || 0}</td>
                      <td>{new Date(project.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/projects/${project.id}`} className="btn btn-small btn-secondary">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">My Tasks</h2>
          </div>

          {myTasks.length > 0 && (
            <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
              <div className="filter-group">
                <label className="filter-label">Filter by Status:</label>
                <select
                  className="form-input"
                  value={taskStatusFilter}
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                  style={{ marginBottom: 0, maxWidth: "200px" }}
                >
                  <option value="all">All Tasks</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          )}

          {filteredTasks.length === 0 && myTasks.length > 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No tasks match your filter</div>
              <p>Try selecting a different status</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No tasks assigned</div>
              <p>You don't have any tasks assigned to you yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td>{task.title}</td>
                      <td>
                        <span className={`badge badge-${
                          task.priority === "high" ? "danger" : 
                          task.priority === "medium" ? "warning" : "info"
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${
                          task.status === "completed" ? "success" : 
                          task.status === "in_progress" ? "warning" : "info"
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
