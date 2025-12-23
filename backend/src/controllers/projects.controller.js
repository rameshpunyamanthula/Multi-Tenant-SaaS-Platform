const pool = require('../config/db');

/**
 * API-12: Create Project
 */
const createProject = async (req, res) => {
  const { tenantId, userId, role } = req.user;
  const { name, description, status } = req.body;

  if (role === 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin cannot create tenant projects'
    });
  }

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Project name is required'
    });
  }

  try {
    const tenantResult = await pool.query(
      'SELECT max_projects FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const maxProjects = tenantResult.rows[0].max_projects;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM projects WHERE tenant_id = $1',
      [tenantId]
    );

    if (Number(countResult.rows[0].count) >= maxProjects) {
      return res.status(403).json({
        success: false,
        message: 'Project limit reached for current subscription plan'
      });
    }

    const result = await pool.query(
      `INSERT INTO projects (
        id, tenant_id, name, description, status, created_by
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5
      )
      RETURNING id, tenant_id, name, description, status, created_by, created_at`,
      [
        tenantId,
        name,
        description || null,
        status || 'active',
        userId
      ]
    );

    const project = result.rows[0];

    return res.status(201).json({
      success: true,
      data: {
        id: project.id,
        tenantId: project.tenant_id,
        name: project.name,
        description: project.description,
        status: project.status,
        createdBy: project.created_by,
        createdAt: project.created_at
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * API-13: List Projects
 */
const listProjects = async (req, res) => {
  const { tenantId, role } = req.user;

  if (role === 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin cannot list tenant projects'
    });
  }

  const { status, search } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = (page - 1) * limit;

  try {
    const filters = ['p.tenant_id = $1'];
    const values = [tenantId];

    if (status) {
      values.push(status);
      filters.push(`p.status = $${values.length}`);
    }

    if (search) {
      values.push(`%${search.toLowerCase()}%`);
      filters.push(`LOWER(p.name) LIKE $${values.length}`);
    }

    const whereClause = `WHERE ${filters.join(' AND ')}`;

    const projectsQuery = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.status,
        p.created_at,
        u.id AS creator_id,
        u.full_name AS creator_name,
        COUNT(t.id) AS task_count,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS completed_task_count
      FROM projects p
      JOIN users u ON u.id = p.created_by
      LEFT JOIN tasks t ON t.project_id = p.id
      ${whereClause}
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const projectsResult = await pool.query(projectsQuery, values);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM projects p ${whereClause}`,
      values
    );

    const total = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: {
        projects: projectsResult.rows.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status,
          createdBy: {
            id: p.creator_id,
            fullName: p.creator_name
          },
          taskCount: Number(p.task_count),
          completedTaskCount: Number(p.completed_task_count),
          createdAt: p.created_at
        })),
        total,
        pagination: {
          currentPage: page,
          totalPages,
          limit
        }
      }
    });
  } catch (error) {
    console.error('List projects error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * API-14: Update Project
 */
const updateProject = async (req, res) => {
  const projectId = req.params.projectId;
  const { tenantId, userId, role } = req.user;
  const { name, description, status } = req.body;

  try {
    const projectResult = await pool.query(
      'SELECT id, tenant_id, created_by FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = projectResult.rows[0];

    if (project.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access'
      });
    }

    const isCreator = project.created_by === userId;
    const isTenantAdmin = role === 'tenant_admin';

    if (!isCreator && !isTenantAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    const updates = [];
    const values = [];

    if (name) {
      values.push(name);
      updates.push(`name = $${values.length}`);
    }

    if (description !== undefined) {
      values.push(description);
      updates.push(`description = $${values.length}`);
    }

    if (status) {
      values.push(status);
      updates.push(`status = $${values.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    values.push(projectId);

    const updateQuery = `
      UPDATE projects
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${values.length}
      RETURNING id, name, description, status, updated_at
    `;

    const updated = await pool.query(updateQuery, values);

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        id: updated.rows[0].id,
        name: updated.rows[0].name,
        description: updated.rows[0].description,
        status: updated.rows[0].status,
        updatedAt: updated.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * API-15: Delete Project
 * DELETE /api/projects/:projectId
 */
const deleteProject = async (req, res) => {
  const projectId = req.params.projectId;
  const { tenantId, userId, role } = req.user;

  try {
    const projectResult = await pool.query(
      'SELECT id, tenant_id, created_by FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = projectResult.rows[0];

    if (project.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access'
      });
    }

    const isCreator = project.created_by === userId;
    const isTenantAdmin = role === 'tenant_admin';

    if (!isCreator && !isTenantAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    await pool.query(
      'DELETE FROM projects WHERE id = $1',
      [projectId]
    );

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createProject,
  listProjects,
  updateProject,
  deleteProject
};
