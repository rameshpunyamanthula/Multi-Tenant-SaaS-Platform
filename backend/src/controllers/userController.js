const db = require("../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

/**
 * GET /api/users
 * tenant_admin: list users in own tenant
 * super_admin: list users across all tenants (optional filter by tenantId query)
 */
exports.getUsers = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === "super_admin";
    const { tenantId: tokenTenantId } = req.user;
    const { tenantId: queryTenantId } = req.query;

    let query = `
      SELECT
        u.id,
        u.email,
        u.full_name,
        u.role,
        u.is_active,
        u.tenant_id,
        t.name AS tenant_name,
        t.subdomain
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
    `;
    const params = [];

    if (isSuperAdmin && queryTenantId) {
      query += " WHERE u.tenant_id = $1";
      params.push(queryTenantId);
    } else if (!isSuperAdmin) {
      query += " WHERE u.tenant_id = $1";
      params.push(tokenTenantId);
    }

    query += " ORDER BY u.created_at DESC";

    const result = await db.query(query, params);

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

/**
 * POST /api/users
 * tenant_admin: create user in own tenant.
 * super_admin: create user in any tenant (requires tenantId in body).
 */
exports.createUser = async (req, res) => {
  try {
    const { email, password, fullName, role, tenantId: bodyTenantId } = req.body;
    const isSuperAdmin = req.user.role === "super_admin";

    // determine target tenant
    let tenantId;
    if (isSuperAdmin) {
      // super_admin can specify tenantId in body, or defaults to their own
      tenantId = bodyTenantId || req.user.tenantId;
    } else {
      // tenant_admin can only create in their own tenant
      tenantId = req.user.tenantId;
    }

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({
        success: false,
        message: "email, password, fullName and role are required",
      });
    }

    if (!["tenant_admin", "user"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // enforce max_users limit
    const tenantResult = await db.query(
      `SELECT max_users,
              (SELECT COUNT(*) FROM users WHERE tenant_id = $1 AND is_active = TRUE) AS active_users
       FROM tenants
       WHERE id = $1`,
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const { max_users, active_users } = tenantResult.rows[0];

    if (max_users !== null && active_users >= max_users) {
      return res.status(403).json({
        success: false,
        message: "User limit reached for this tenant",
      });
    }

    const existing = await db.query(
      "SELECT id FROM users WHERE email = $1 AND tenant_id = $2",
      [email, tenantId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists in this tenant",
      });
    }

    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users
       (id, tenant_id, email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)
       RETURNING id, email, full_name, role, is_active, tenant_id`,
      [userId, tenantId, email, passwordHash, fullName, role]
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

/**
 * PATCH /api/users/:userId
 * tenant_admin: update users in own tenant.
 * user: can update own profile (only fullName, password).
 * super_admin: can update any user.
 */
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, fullName, role, isActive, password } = req.body;

    const requester = req.user;
    const isSuperAdmin = requester.role === "super_admin";
    const isSelf = requester.userId === userId;

    // fetch user with tenant
    const userResult = await db.query(
      `SELECT id, tenant_id, email, full_name, role, is_active
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const targetUser = userResult.rows[0];

    // permission checks
    if (!isSuperAdmin) {
      if (targetUser.tenant_id !== requester.tenantId) {
        return res.status(403).json({
          success: false,
          message: "You cannot modify users from another tenant",
        });
      }

      if (!isSelf && requester.role !== "tenant_admin") {
        return res.status(403).json({
          success: false,
          message: "Only tenant admins can manage other users",
        });
      }
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (email !== undefined) {
      if (!isSuperAdmin && requester.role !== "tenant_admin") {
        return res.status(403).json({
          success: false,
          message: "You cannot change email",
        });
      }
      updates.push(`email = $${idx++}`);
      values.push(email);
    }

    if (fullName !== undefined) {
      updates.push(`full_name = $${idx++}`);
      values.push(fullName);
    }

    if (role !== undefined) {
      if (!["super_admin", "tenant_admin", "user"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }
      if (!isSuperAdmin && requester.role !== "tenant_admin") {
        return res.status(403).json({
          success: false,
          message: "You cannot change roles",
        });
      }
      updates.push(`role = $${idx++}`);
      values.push(role);
    }

    if (isActive !== undefined) {
      if (!isSuperAdmin && requester.role !== "tenant_admin") {
        return res.status(403).json({
          success: false,
          message: "You cannot change active status",
        });
      }
      updates.push(`is_active = $${idx++}`);
      values.push(isActive);
    }

    if (password !== undefined) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${idx++}`);
      values.push(passwordHash);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    updates.push("updated_at = NOW()");
    values.push(userId);

    const query = `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = $${values.length}
      RETURNING id, email, full_name, role, is_active, tenant_id
    `;

    const result = await db.query(query, values);

    return res.json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

/**
 * DELETE /api/users/:userId
 * Soft delete: set is_active = false.
 * tenant_admin: own tenant.
 * super_admin: any.
 */
exports.deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const requester = req.user;
    const isSuperAdmin = requester.role === "super_admin";

    const userResult = await db.query(
      `SELECT id, tenant_id, is_active
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const targetUser = userResult.rows[0];

    if (!isSuperAdmin && targetUser.tenant_id !== requester.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You cannot deactivate users from another tenant",
      });
    }

    if (!isSuperAdmin && requester.role !== "tenant_admin") {
      return res.status(403).json({
        success: false,
        message: "Only tenant admins can deactivate users",
      });
    }

    if (!targetUser.is_active) {
      return res.status(400).json({
        success: false,
        message: "User is already inactive",
      });
    }

    await db.query(
      `UPDATE users
       SET is_active = FALSE, updated_at = NOW()
       WHERE id = $1`,
      [userId]
    );

    return res.json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (err) {
    console.error("DEACTIVATE USER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to deactivate user",
    });
  }
};
