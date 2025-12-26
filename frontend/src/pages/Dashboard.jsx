import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../auth/AuthContext';
import React from 'react';
const Dashboard = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });

  const [recentProjects, setRecentProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // 1. Get projects
        const projectsRes = await api.get('/projects');
        const projects = projectsRes.data.data.projects || projectsRes.data.data;

        // 2. Recent projects (top 5)
        setRecentProjects(projects.slice(0, 5));

        let totalTasks = 0;
        let completedTasks = 0;
        let pendingTasks = 0;
        let assignedTasks = [];

        // 3. For each project, get tasks
        for (const project of projects) {
          const tasksRes = await api.get(
            `/projects/${project.id}/tasks`
          );
          const tasks = tasksRes.data.data.tasks || tasksRes.data.data;

          totalTasks += tasks.length;

          tasks.forEach(task => {
            if (task.status === 'completed') {
              completedTasks++;
            } else {
              pendingTasks++;
            }

            if (task.assignedTo && task.assignedTo.id === user.id) {
              assignedTasks.push({
                ...task,
                projectName: project.name
              });
            }
          });
        }

        setStats({
          totalProjects: projects.length,
          totalTasks,
          completedTasks,
          pendingTasks
        });

        setMyTasks(assignedTasks);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user.id]);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>

      <p>
        Welcome <b>{user.fullName}</b> ({user.role})
      </p>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
        <StatCard title="Projects" value={stats.totalProjects} />
        <StatCard title="Total Tasks" value={stats.totalTasks} />
        <StatCard title="Completed" value={stats.completedTasks} />
        <StatCard title="Pending" value={stats.pendingTasks} />
      </div>

      {/* Recent Projects */}
      <section style={{ marginTop: 40 }}>
        <h3>Recent Projects</h3>
        {recentProjects.length === 0 ? (
          <p>No projects found</p>
        ) : (
          <ul>
            {recentProjects.map(project => (
              <li key={project.id}>
                {project.name} ({project.status})
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* My Tasks */}
      <section style={{ marginTop: 40 }}>
        <h3>My Tasks</h3>
        {myTasks.length === 0 ? (
          <p>No tasks assigned to you</p>
        ) : (
          <ul>
            {myTasks.map(task => (
              <li key={task.id}>
                <b>{task.title}</b> — {task.projectName} ({task.status})
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div
    style={{
      padding: 16,
      border: '1px solid #ccc',
      borderRadius: 8,
      minWidth: 120,
      textAlign: 'center'
    }}
  >
    <h4>{title}</h4>
    <p style={{ fontSize: 24 }}>{value}</p>
  </div>
);

export default Dashboard;
