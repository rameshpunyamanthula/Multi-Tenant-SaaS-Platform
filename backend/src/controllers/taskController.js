const db = require("../config/db");
const crypto = require("crypto");

/**
 * GET /api/tasks
 * List tasks for current tenant, optionally filtered by projectId and status.
 */
exports.getTasks = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === "super_admin";
    const { tenantId: tokenTenantId } = req.user;
    const { projectId, status, tenantId: queryTenantId } = req.query;

    let query = `
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.project_id,
        t.tenant_id,
        t.assigned_to,
        t.created_at,
        t.updated_at
      FROM tasks t
    `;
    const params = [];
    const conditions = [];

    if (isSuperAdmin && queryTenantId) {
      conditions.push(`t.tenant_id = $${params.length + 1}`);
      params.push(queryTenantId);
    } else if (!isSuperAdmin) {
      conditions.push(`t.tenant_id = $${params.length + 1}`);
      params.push(tokenTenantId);
    }

    if (projectId) {
      conditions.push(`t.project_id = $${params.length + 1}`);
      params.push(projectId);
    }

    if (status) {
      conditions.push(`t.status = $${params.length + 1}`);
      params.push(status);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY t.created_at DESC";

    const result = await db.query(query, params);

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("GET TASKS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};

/**
 * POST /api/tasks
 * Create task in a project.
 * super_admin: can create in any tenant's project.
 * tenant_admin/user: only in own tenant's project.
 */
exports.createTask = async (req, res) => {
  try {
    const { projectId, title, description, priority, dueDate, assignedTo } =
      req.body;
    const isSuperAdmin = req.user.role === "super_admin";
    const tokenTenantId = req.user.tenantId;

    if (!projectId || !title) {
      return res.status(400).json({
        success: false,
        message: "projectId and title are required",
      });
    }

    // verify project exists
    const projectResult = await db.query(
      `SELECT id, tenant_id
       FROM projects
       WHERE id = $1`,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Project not found",
      });
    }

    const project = projectResult.rows[0];

    // tenant check: super_admin can create anywhere, others only in own tenant
    if (!isSuperAdmin && project.tenant_id !== tokenTenantId) {
      return res.status(403).json({
        success: false,
        message: "You cannot create tasks in another tenant's project",
      });
    }

    // use the project's tenant_id for the task
    const tenantId = project.tenant_id;

    if (priority && !["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority",
      });
    }

    if (assignedTo) {
      const userResult = await db.query(
        `SELECT id, tenant_id
         FROM users
         WHERE id = $1`,
        [assignedTo]
      );

      if (
        userResult.rows.length === 0 ||
        userResult.rows[0].tenant_id !== tenantId
      ) {
        return res.status(400).json({
          success: false,
          message: "Assigned user not found in this tenant",
        });
      }
    }

    const taskId = crypto.randomUUID();

    const result = await db.query(
      `INSERT INTO tasks
       (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date)
       VALUES ($1, $2, $3, $4, $5, 'todo', $6, $7, $8)
       RETURNING id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at, updated_at`,
      [
        taskId,
        projectId,
        tenantId,
        title,
        description || null,
        priority || "medium",
        assignedTo || null,
        dueDate || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
};

/**
 * PATCH /api/tasks/:taskId
 * Update task.
 * super_admin: can update any task.
 * tenant_admin/user: only in own tenant.
 */
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, dueDate, assignedTo } =
      req.body;
    const isSuperAdmin = req.user.role === "super_admin";
    const tokenTenantId = req.user.tenantId;

    const taskResult = await db.query(
      `SELECT id, tenant_id
       FROM tasks
       WHERE id = $1`,
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const task = taskResult.rows[0];

    if (!isSuperAdmin && task.tenant_id !== tokenTenantId) {
      return res.status(403).json({
        success: false,
        message: "You cannot modify tasks from another tenant",
      });
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) {
      updates.push(`title = $${idx++}`);
      values.push(title);
    }

    if (description !== undefined) {
      updates.push(`description = $${idx++}`);
      values.push(description);
    }

    if (status !== undefined) {
      if (!["todo", "in_progress", "completed"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }
      updates.push(`status = $${idx++}`);
      values.push(status);
    }

    if (priority !== undefined) {
      if (!["low", "medium", "high"].includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid priority",
        });
      }
      updates.push(`priority = $${idx++}`);
      values.push(priority);
    }

    if (dueDate !== undefined) {
      updates.push(`due_date = $${idx++}`);
      values.push(dueDate);
    }

    if (assignedTo !== undefined) {
      if (assignedTo) {
        const userResult = await db.query(
          `SELECT id, tenant_id
           FROM users
           WHERE id = $1`,
          [assignedTo]
        );

        if (
          userResult.rows.length === 0 ||
          userResult.rows[0].tenant_id !== task.tenant_id
        ) {
          return res.status(400).json({
            success: false,
            message: "Assigned user not found in this tenant",
          });
        }
      }
      updates.push(`assigned_to = $${idx++}`);
      values.push(assignedTo);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    updates.push("updated_at = NOW()");
    values.push(taskId);

    const query = `
      UPDATE tasks
      SET ${updates.join(", ")}
      WHERE id = $${values.length}
      RETURNING id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at, updated_at
    `;

    const result = await db.query(query, values);

    return res.json({
      success: true,
      message: "Task updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("UPDATE TASK ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
};

/**
 * DELETE /api/tasks/:taskId
 * Hard delete.
 * super_admin: can delete any task.
 * tenant_admin/user: only in own tenant.
 */
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const isSuperAdmin = req.user.role === "super_admin";
    const tokenTenantId = req.user.tenantId;

    const taskResult = await db.query(
      `SELECT id, tenant_id
       FROM tasks
       WHERE id = $1`,
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const task = taskResult.rows[0];

    if (!isSuperAdmin && task.tenant_id !== tokenTenantId) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete tasks from another tenant",
      });
    }

    await db.query("DELETE FROM tasks WHERE id = $1", [taskId]);

    return res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (err) {
    console.error("DELETE TASK ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete task",
    });
  }
};
