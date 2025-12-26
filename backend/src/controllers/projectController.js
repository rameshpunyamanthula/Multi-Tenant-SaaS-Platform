const db = require("../config/db");
const crypto = require("crypto");

/**
 * GET /api/projects
 * List projects in current tenant.
 * super_admin: can optionally filter by tenantId query.
 */
exports.getProjects = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === "super_admin";
    const { tenantId: tokenTenantId } = req.user;
    const { tenantId: queryTenantId } = req.query;

    let query = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.status,
        p.tenant_id,
        p.created_by,
        p.created_at,
        p.updated_at
      FROM projects p
    `;
    const params = [];

    if (isSuperAdmin && queryTenantId) {
      query += " WHERE p.tenant_id = $1 AND p.status != 'archived'";
      params.push(queryTenantId);
    } else if (!isSuperAdmin) {
      query += " WHERE p.tenant_id = $1 AND p.status != 'archived'";
      params.push(tokenTenantId);
    }

    query += " ORDER BY p.created_at DESC";

    const result = await db.query(query, params);

    return res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error("GET PROJECTS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects"
    });
  }
};


/**
 * POST /api/projects
 * Create project in current tenant.
 * tenant_admin and user allowed (within limits).
 */
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const tenantId = req.user.tenantId;
    const createdBy = req.user.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required"
      });
    }

    // enforce max_projects limit
    const tenantResult = await db.query(
      `SELECT max_projects,
              (SELECT COUNT(*) FROM projects WHERE tenant_id = $1) AS project_count
       FROM tenants
       WHERE id = $1`,
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tenant not found"
      });
    }

    const { max_projects, project_count } = tenantResult.rows[0];

    if (max_projects !== null && project_count >= max_projects) {
      return res.status(403).json({
        success: false,
        message: "Project limit reached for this tenant"
      });
    }

    const projectId = crypto.randomUUID();

    const result = await db.query(
      `INSERT INTO projects
       (id, tenant_id, name, description, status, created_by)
       VALUES ($1, $2, $3, $4, 'active', $5)
       RETURNING id, tenant_id, name, description, status, created_by, created_at, updated_at`,
      [projectId, tenantId, name, description || null, createdBy]
    );

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create project"
    });
  }
};

/**
 * GET /api/projects/:projectId
 * Must belong to current tenant unless super_admin.
 */
exports.getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const requester = req.user;

    const result = await db.query(
      `SELECT id, tenant_id, name, description, status, created_by, created_at, updated_at
       FROM projects
       WHERE id = $1`,
      [projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const project = result.rows[0];

    if (
      requester.role !== "super_admin" &&
      project.tenant_id !== requester.tenantId
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot access projects from another tenant"
      });
    }

    return res.json({
      success: true,
      data: project
    });
  } catch (err) {
    console.error("GET PROJECT BY ID ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch project"
    });
  }
};

/**
 * PATCH /api/projects/:projectId
 * tenant_admin and user can update projects in own tenant.
 */
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, status } = req.body;
    const requester = req.user;

    const projectResult = await db.query(
      `SELECT id, tenant_id, status
       FROM projects
       WHERE id = $1`,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const project = projectResult.rows[0];

    if (
      requester.role !== "super_admin" &&
      project.tenant_id !== requester.tenantId
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot modify projects from another tenant"
      });
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(name);
    }

    if (description !== undefined) {
      updates.push(`description = $${idx++}`);
      values.push(description);
    }

    if (status !== undefined) {
      if (!["active", "archived", "completed"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status"
        });
      }
      updates.push(`status = $${idx++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update"
      });
    }

    updates.push("updated_at = NOW()");
    values.push(projectId);

    const query = `
      UPDATE projects
      SET ${updates.join(", ")}
      WHERE id = $${values.length}
      RETURNING id, tenant_id, name, description, status, created_by, created_at, updated_at
    `;

    const result = await db.query(query, values);

    return res.json({
      success: true,
      message: "Project updated successfully",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("UPDATE PROJECT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update project"
    });
  }
};

/**
 * DELETE /api/projects/:projectId
 * Soft delete by setting status = 'archived'.
 */
exports.archiveProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const requester = req.user;

    const projectResult = await db.query(
      `SELECT id, tenant_id, status
       FROM projects
       WHERE id = $1`,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const project = projectResult.rows[0];

    if (
      requester.role !== "super_admin" &&
      project.tenant_id !== requester.tenantId
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot archive projects from another tenant"
      });
    }

    if (project.status === "archived") {
      return res.status(400).json({
        success: false,
        message: "Project is already archived"
      });
    }

    await db.query(
      `UPDATE projects
       SET status = 'archived', updated_at = NOW()
       WHERE id = $1`,
      [projectId]
    );

    return res.json({
      success: true,
      message: "Project archived successfully"
    });
  } catch (err) {
    console.error("ARCHIVE PROJECT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to archive project"
    });
  }
};
