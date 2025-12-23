const pool = require('../config/db');

/**
 * API-16: Create Task
 */
const createTask = async (req, res) => {
  const projectId = req.params.projectId;
  const { tenantId, role } = req.user;
  const { title, description, assignedTo, priority, dueDate } = req.body;

  if (role === 'super_admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  if (!title) {
    return res.status(400).json({ success: false, message: 'Title required' });
  }

  try {
    const project = await pool.query(
      'SELECT tenant_id FROM projects WHERE id = $1',
      [projectId]
    );

    if (!project.rows.length || project.rows[0].tenant_id !== tenantId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (assignedTo) {
      const user = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
        [assignedTo, tenantId]
      );
      if (!user.rows.length) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user invalid'
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO tasks (
        id, project_id, tenant_id, title, description,
        status, priority, assigned_to, due_date
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4,
        'todo', $5, $6, $7
      )
      RETURNING *`,
      [
        projectId,
        tenantId,
        title,
        description || null,
        priority || 'medium',
        assignedTo || null,
        dueDate || null
      ]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * API-17: List Project Tasks
 */
const listProjectTasks = async (req, res) => {
  const { projectId } = req.params;
  const { tenantId } = req.user;

  try {
    const project = await pool.query(
      'SELECT tenant_id FROM projects WHERE id = $1',
      [projectId]
    );

    if (!project.rows.length || project.rows[0].tenant_id !== tenantId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const tasks = await pool.query(
      `SELECT t.*, u.full_name, u.email
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [projectId]
    );

    return res.status(200).json({ success: true, data: tasks.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * API-18: Update Task Status
 */
const updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;
  const { tenantId } = req.user;

  const allowed = ['todo', 'in_progress', 'completed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const task = await pool.query(
      'SELECT tenant_id FROM tasks WHERE id = $1',
      [taskId]
    );

    if (!task.rows.length || task.rows[0].tenant_id !== tenantId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const result = await pool.query(
      `UPDATE tasks SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING id, status, updated_at`,
      [status, taskId]
    );

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * API-19: Update Task (FULL UPDATE)
 */
const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { tenantId, role } = req.user;
  const { title, description, status, priority, assignedTo, dueDate } = req.body;

  if (role === 'super_admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  try {
    const taskResult = await pool.query(
      'SELECT tenant_id FROM tasks WHERE id = $1',
      [taskId]
    );

    if (!taskResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (taskResult.rows[0].tenant_id !== tenantId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (assignedTo !== undefined && assignedTo !== null) {
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
        [assignedTo, tenantId]
      );
      if (!userCheck.rows.length) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user invalid'
        });
      }
    }

    const result = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        assigned_to = $5,
        due_date = $6,
        updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        title || null,
        description || null,
        status || null,
        priority || null,
        assignedTo === undefined ? null : assignedTo,
        dueDate || null,
        taskId
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createTask,
  listProjectTasks,
  updateTaskStatus,
  updateTask
};
