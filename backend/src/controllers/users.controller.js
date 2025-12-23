const pool = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * API-8: Add User to Tenant
 */
const addUserToTenant = async (req, res) => {
  const requestedTenantId = req.params.tenantId;
  const { tenantId, role } = req.user;

  if (role !== 'tenant_admin' || requestedTenantId !== tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Only tenant admin can add users to this tenant'
    });
  }

  const { email, password, fullName, role: newUserRole } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and fullName are required'
    });
  }

  try {
    const tenantResult = await pool.query(
      'SELECT max_users FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const maxUsers = tenantResult.rows[0].max_users;

    const userCountResult = await pool.query(
      'SELECT COUNT(*) FROM users WHERE tenant_id = $1',
      [tenantId]
    );

    if (Number(userCountResult.rows[0].count) >= maxUsers) {
      return res.status(403).json({
        success: false,
        message: 'Subscription user limit reached'
      });
    }

    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND tenant_id = $2',
      [email, tenantId]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists in this tenant'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (
        id, tenant_id, email, password_hash, full_name, role, is_active
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, true
      )
      RETURNING id, email, full_name, role, is_active, created_at`,
      [
        tenantId,
        email,
        passwordHash,
        fullName,
        newUserRole || 'user'
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        fullName: result.rows[0].full_name,
        role: result.rows[0].role,
        tenantId,
        isActive: result.rows[0].is_active,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Add user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * API-9: List Tenant Users
 */
const listTenantUsers = async (req, res) => {
  const requestedTenantId = req.params.tenantId;
  const { tenantId } = req.user;

  if (requestedTenantId !== tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized access to tenant users'
    });
  }

  const { search, role } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const offset = (page - 1) * limit;

  try {
    const filters = ['tenant_id = $1'];
    const values = [tenantId];

    if (search) {
      values.push(`%${search.toLowerCase()}%`);
      filters.push(
        `(LOWER(full_name) LIKE $${values.length} OR LOWER(email) LIKE $${values.length})`
      );
    }

    if (role) {
      values.push(role);
      filters.push(`role = $${values.length}`);
    }

    const whereClause = `WHERE ${filters.join(' AND ')}`;

    const usersQuery = `
      SELECT id, email, full_name, role, is_active, created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const usersResult = await pool.query(usersQuery, values);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      values
    );

    const total = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: {
        users: usersResult.rows.map(u => ({
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          role: u.role,
          isActive: u.is_active,
          createdAt: u.created_at
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
    console.error('List users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * API-10: Update User
 */
const updateUser = async (req, res) => {
  const targetUserId = req.params.userId;
  const { userId, tenantId, role } = req.user;
  const { fullName, role: newRole, isActive } = req.body;

  try {
    const userResult = await pool.query(
      'SELECT id, tenant_id FROM users WHERE id = $1',
      [targetUserId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const targetUser = userResult.rows[0];

    if (targetUser.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access'
      });
    }

    const isSelf = userId === targetUserId;
    const isTenantAdmin = role === 'tenant_admin';

    if (!isTenantAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    if (!isTenantAdmin && (newRole !== undefined || isActive !== undefined)) {
      return res.status(403).json({
        success: false,
        message: 'Only tenant admin can update role or status'
      });
    }

    const updates = [];
    const values = [];

    if (fullName) {
      values.push(fullName);
      updates.push(`full_name = $${values.length}`);
    }

    if (isTenantAdmin && newRole) {
      values.push(newRole);
      updates.push(`role = $${values.length}`);
    }

    if (isTenantAdmin && typeof isActive === 'boolean') {
      values.push(isActive);
      updates.push(`is_active = $${values.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    values.push(targetUserId);

    const updateQuery = `
      UPDATE users
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${values.length}
      RETURNING id, full_name, role, is_active, updated_at
    `;

    const updatedUser = await pool.query(updateQuery, values);

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: updatedUser.rows[0].id,
        fullName: updatedUser.rows[0].full_name,
        role: updatedUser.rows[0].role,
        isActive: updatedUser.rows[0].is_active,
        updatedAt: updatedUser.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * API-11: Delete User
 * DELETE /api/users/:userId
 */
const deleteUser = async (req, res) => {
  const targetUserId = req.params.userId;
  const { userId, tenantId, role } = req.user;

  if (role !== 'tenant_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only tenant admin can delete users'
    });
  }

  if (userId === targetUserId) {
    return res.status(403).json({
      success: false,
      message: 'Cannot delete yourself'
    });
  }

  try {
    const userResult = await pool.query(
      'SELECT id, tenant_id FROM users WHERE id = $1',
      [targetUserId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const targetUser = userResult.rows[0];

    if (targetUser.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized tenant access'
      });
    }

    // Unassign tasks
    await pool.query(
      'UPDATE tasks SET assigned_to = NULL WHERE assigned_to = $1',
      [targetUserId]
    );

    // Delete user
    await pool.query(
      'DELETE FROM users WHERE id = $1',
      [targetUserId]
    );

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  addUserToTenant,
  listTenantUsers,
  updateUser,
  deleteUser
};
