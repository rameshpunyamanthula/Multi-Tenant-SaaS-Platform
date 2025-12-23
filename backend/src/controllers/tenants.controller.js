const pool = require('../config/db');

/**
 * API-5: Get Tenant Details
 * GET /api/tenants/:tenantId
 */
const getTenantDetails = async (req, res) => {
  const requestedTenantId = req.params.tenantId;
  const { tenantId, role } = req.user;

  if (role !== 'super_admin' && requestedTenantId !== tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized access to tenant data'
    });
  }

  try {
    const tenantResult = await pool.query(
      `SELECT id, name, subdomain, status, subscription_plan,
              max_users, max_projects, created_at
       FROM tenants
       WHERE id = $1`,
      [requestedTenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const usersCount = await pool.query(
      'SELECT COUNT(*) FROM users WHERE tenant_id = $1',
      [requestedTenantId]
    );

    const projectsCount = await pool.query(
      'SELECT COUNT(*) FROM projects WHERE tenant_id = $1',
      [requestedTenantId]
    );

    const tasksCount = await pool.query(
      'SELECT COUNT(*) FROM tasks WHERE tenant_id = $1',
      [requestedTenantId]
    );

    const tenant = tenantResult.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        status: tenant.status,
        subscriptionPlan: tenant.subscription_plan,
        maxUsers: tenant.max_users,
        maxProjects: tenant.max_projects,
        createdAt: tenant.created_at,
        stats: {
          totalUsers: Number(usersCount.rows[0].count),
          totalProjects: Number(projectsCount.rows[0].count),
          totalTasks: Number(tasksCount.rows[0].count)
        }
      }
    });
  } catch (error) {
    console.error('Get tenant error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * API-6: Update Tenant
 * PUT /api/tenants/:tenantId
 */
const updateTenant = async (req, res) => {
  const requestedTenantId = req.params.tenantId;
  const { tenantId, role } = req.user;

  if (role !== 'super_admin' && requestedTenantId !== tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized to update this tenant'
    });
  }

  const { name, status, subscriptionPlan, maxUsers, maxProjects } = req.body;

  if (role === 'tenant_admin') {
    if (
      status !== undefined ||
      subscriptionPlan !== undefined ||
      maxUsers !== undefined ||
      maxProjects !== undefined
    ) {
      return res.status(403).json({
        success: false,
        message: 'Tenant admin can only update tenant name'
      });
    }
  }

  try {
    const result = await pool.query(
      `UPDATE tenants
       SET
         name = COALESCE($1, name),
         status = COALESCE($2, status),
         subscription_plan = COALESCE($3, subscription_plan),
         max_users = COALESCE($4, max_users),
         max_projects = COALESCE($5, max_projects),
         updated_at = NOW()
       WHERE id = $6
       RETURNING id, name, updated_at`,
      [
        name || null,
        status || null,
        subscriptionPlan || null,
        maxUsers || null,
        maxProjects || null,
        requestedTenantId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Tenant updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update tenant error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * API-7: List All Tenants (super_admin only)
 * GET /api/tenants
 */
const listTenants = async (req, res) => {
  const { role } = req.user;

  if (role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const offset = (page - 1) * limit;

  const { status, subscriptionPlan } = req.query;

  try {
    const filters = [];
    const values = [];

    if (status) {
      values.push(status);
      filters.push(`t.status = $${values.length}`);
    }

    if (subscriptionPlan) {
      values.push(subscriptionPlan);
      filters.push(`t.subscription_plan = $${values.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const tenantsQuery = `
      SELECT
        t.id,
        t.name,
        t.subdomain,
        t.status,
        t.subscription_plan,
        t.created_at,
        COUNT(DISTINCT u.id) AS total_users,
        COUNT(DISTINCT p.id) AS total_projects
      FROM tenants t
      LEFT JOIN users u ON u.tenant_id = t.id
      LEFT JOIN projects p ON p.tenant_id = t.id
      ${whereClause}
      GROUP BY t.id
      ORDER BY t.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const tenantsResult = await pool.query(tenantsQuery, values);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM tenants t ${whereClause}`,
      values
    );

    const totalTenants = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(totalTenants / limit);

    return res.status(200).json({
      success: true,
      data: {
        tenants: tenantsResult.rows.map(t => ({
          id: t.id,
          name: t.name,
          subdomain: t.subdomain,
          status: t.status,
          subscriptionPlan: t.subscription_plan,
          totalUsers: Number(t.total_users),
          totalProjects: Number(t.total_projects),
          createdAt: t.created_at
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalTenants,
          limit
        }
      }
    });
  } catch (error) {
    console.error('List tenants error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getTenantDetails,
  updateTenant,
  listTenants
};
