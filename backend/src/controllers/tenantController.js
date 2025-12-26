// backend/src/controllers/tenantController.js
const db = require("../config/db");

/**
 * GET /api/tenants
 * Super admin only: list all tenants with stats + pagination.
 * Spec response: { success, data: { tenants: [...], pagination: {...} } }
 */
exports.getAllTenants = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      100
    );
    const offset = (page - 1) * limit;

    const { status, subscriptionPlan } = req.query;

    const filters = [];
    const params = [];
    let idx = 1;

    if (status) {
      filters.push(`t.status = $${idx++}`);
      params.push(status);
    }
    if (subscriptionPlan) {
      filters.push(`t.subscription_plan = $${idx++}`);
      params.push(subscriptionPlan);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    // main list with stats
    const tenantsQuery = `
      SELECT
        t.id,
        t.name,
        t.subdomain,
        t.status,
        t.subscription_plan AS "subscriptionPlan",
        t.max_users        AS "maxUsers",
        t.max_projects     AS "maxProjects",
        t.created_at       AS "createdAt",
        t.updated_at       AS "updatedAt",
        COALESCE(u_counts.total_users, 0)      AS "totalUsers",
        COALESCE(p_counts.total_projects, 0)   AS "totalProjects"
      FROM tenants t
      LEFT JOIN (
        SELECT tenant_id, COUNT(*) AS total_users
        FROM users
        GROUP BY tenant_id
      ) u_counts ON u_counts.tenant_id = t.id
      LEFT JOIN (
        SELECT tenant_id, COUNT(*) AS total_projects
        FROM projects
        GROUP BY tenant_id
      ) p_counts ON p_counts.tenant_id = t.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT $${idx++} OFFSET $${idx}
    `;

    const tenantsParams = [...params, limit, offset];

    const [tenantsResult, countResult] = await Promise.all([
      db.query(tenantsQuery, tenantsParams),
      db.query(
        `SELECT COUNT(*)::int AS total
         FROM tenants t
         ${whereClause}`,
        params
      ),
    ]);

    const totalTenants = countResult.rows[0].total;
    const totalPages = Math.max(Math.ceil(totalTenants / limit), 1);

    return res.status(200).json({
      success: true,
      data: {
        tenants: tenantsResult.rows,
        pagination: {
          currentPage: page,
          totalPages,
          totalTenants,
          limit,
        },
      },
    });
  } catch (err) {
    console.error("GET ALL TENANTS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tenants",
    });
  }
};

/**
 * GET /api/tenants/:tenantId
 * Tenant admin can view own tenant; super admin can view any.
 * Spec: includes stats { totalUsers, totalProjects, totalTasks }.
 */
exports.getTenantById = async (req, res) => {
  try {
    const { tenantId } = req.params;

    if (req.user.role !== "super_admin" && req.user.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: "You cannot view other tenants",
      });
    }

    const result = await db.query(
      `
      SELECT
        t.id,
        t.name,
        t.subdomain,
        t.status,
        t.subscription_plan AS "subscriptionPlan",
        t.max_users        AS "maxUsers",
        t.max_projects     AS "maxProjects",
        t.created_at       AS "createdAt",
        t.updated_at       AS "updatedAt",
        COALESCE(u_counts.total_users, 0)    AS "totalUsers",
        COALESCE(p_counts.total_projects, 0) AS "totalProjects",
        COALESCE(task_counts.total_tasks, 0) AS "totalTasks"
      FROM tenants t
      LEFT JOIN (
        SELECT tenant_id, COUNT(*) AS total_users
        FROM users
        GROUP BY tenant_id
      ) u_counts ON u_counts.tenant_id = t.id
      LEFT JOIN (
        SELECT tenant_id, COUNT(*) AS total_projects
        FROM projects
        GROUP BY tenant_id
      ) p_counts ON p_counts.tenant_id = t.id
      LEFT JOIN (
        SELECT tenant_id, COUNT(*) AS total_tasks
        FROM tasks
        GROUP BY tenant_id
      ) task_counts ON task_counts.tenant_id = t.id
      WHERE t.id = $1
    `,
      [tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const row = result.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        id: row.id,
        name: row.name,
        subdomain: row.subdomain,
        status: row.status,
        subscriptionPlan: row.subscriptionPlan,
        maxUsers: row.maxUsers,
        maxProjects: row.maxProjects,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        stats: {
          totalUsers: row.totalUsers,
          totalProjects: row.totalProjects,
          totalTasks: row.totalTasks,
        },
      },
    });
  } catch (err) {
    console.error("GET TENANT BY ID ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tenant",
    });
  }
};

/**
 * PUT /api/tenants/:tenantId
 * Super admin can update any tenant.
 * Tenant admin can update limited fields of own tenant (name only).
 */
exports.updateTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const {
      name,
      status,
      subscriptionPlan, // camelCase for request
      maxUsers,
      maxProjects,
    } = req.body;

    const isSuperAdmin = req.user.role === "super_admin";
    const isOwnTenant = req.user.tenantId === tenantId;

    if (!isSuperAdmin && !isOwnTenant) {
      return res.status(403).json({
        success: false,
        message: "You cannot update other tenants",
      });
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }

    if (status !== undefined) {
      if (!["active", "suspended", "trial"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }
      if (!isSuperAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only super admins can change status",
        });
      }
      fields.push(`status = $${idx++}`);
      values.push(status);
    }

    if (subscriptionPlan !== undefined) {
      if (!["free", "pro", "enterprise"].includes(subscriptionPlan)) {
        return res.status(400).json({
          success: false,
          message: "Invalid subscription plan",
        });
      }
      if (!isSuperAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only super admins can change subscription plan",
        });
      }
      fields.push(`subscription_plan = $${idx++}`);
      values.push(subscriptionPlan);
    }

    if (maxUsers !== undefined) {
      if (!isSuperAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only super admins can change limits",
        });
      }
      fields.push(`max_users = $${idx++}`);
      values.push(maxUsers);
    }

    if (maxProjects !== undefined) {
      if (!isSuperAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only super admins can change limits",
        });
      }
      fields.push(`max_projects = $${idx++}`);
      values.push(maxProjects);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    fields.push(`updated_at = NOW()`);

    values.push(tenantId);

    const query = `
      UPDATE tenants
      SET ${fields.join(", ")}
      WHERE id = $${values.length}
      RETURNING
        id,
        name,
        subdomain,
        status,
        subscription_plan AS "subscriptionPlan",
        max_users        AS "maxUsers",
        max_projects     AS "maxProjects",
        created_at       AS "createdAt",
        updated_at       AS "updatedAt"
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tenant updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("UPDATE TENANT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update tenant",
    });
  }
};
