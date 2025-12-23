const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

/**
 * API-2: User Login
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const { email, password, tenantSubdomain } = req.body;

  if (!email || !password || !tenantSubdomain) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and tenantSubdomain are required'
    });
  }

  try {
    // 1. Find tenant by subdomain
    const tenantResult = await pool.query(
      'SELECT * FROM tenants WHERE subdomain = $1',
      [tenantSubdomain]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const tenant = tenantResult.rows[0];

    if (tenant.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Tenant is not active'
      });
    }

    // 2. Find user within tenant
    const userResult = await pool.query(
      `SELECT id, email, password_hash, full_name, role, is_active, tenant_id
       FROM users
       WHERE email = $1 AND tenant_id = $2`,
      [email, tenant.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // 3. Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 4. Generate JWT
    const token = generateToken({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role
    });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: user.tenant_id
        },
        token,
        expiresIn: 86400
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * API-3: Get Current User
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
  const { userId, tenantId, role } = req.user;

  try {
    let query;
    let params;

    if (role === 'super_admin') {
      query = `
        SELECT id, email, full_name, role, is_active, created_at
        FROM users
        WHERE id = $1
      `;
      params = [userId];
    } else {
      query = `
        SELECT
          u.id,
          u.email,
          u.full_name,
          u.role,
          u.is_active,
          t.id AS tenant_id,
          t.name AS tenant_name,
          t.subdomain,
          t.subscription_plan,
          t.max_users,
          t.max_projects
        FROM users u
        JOIN tenants t ON u.tenant_id = t.id
        WHERE u.id = $1 AND u.tenant_id = $2
      `;
      params = [userId, tenantId];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isActive: user.is_active,
        tenant: role === 'super_admin'
          ? null
          : {
              id: user.tenant_id,
              name: user.tenant_name,
              subdomain: user.subdomain,
              subscriptionPlan: user.subscription_plan,
              maxUsers: user.max_users,
              maxProjects: user.max_projects
            }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * API-4: Logout
 * POST /api/auth/logout
 * JWT-only: client removes token
 */
const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  login,
  getCurrentUser,
  logout
};
a