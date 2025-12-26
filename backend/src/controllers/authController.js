// backend/src/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const db = require("../config/db");

const JWT_EXPIRES_IN_SECONDS = 24 * 60 * 60; // 24 hours

// helper to generate JWT
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN_SECONDS,
  });
}

// helper to map subscription plan limits
function getPlanDefaults(plan = "free") {
  switch (plan) {
    case "pro":
      return { maxUsers: 25, maxProjects: 15 };
    case "enterprise":
      return { maxUsers: 100, maxProjects: 50 };
    case "free":
    default:
      return { maxUsers: 5, maxProjects: 3 };
  }
}

// POST /api/auth/register-tenant
exports.registerTenant = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      data: { errors: errors.array() },
    });
  }

  const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } =
    req.body;

  try {
    // check if subdomain or email already exists
    const existing = await db.query(
      `
      SELECT t.id AS tenant_id, u.id AS user_id
      FROM tenants t
      LEFT JOIN users u
        ON u.tenant_id = t.id
       AND LOWER(u.email) = LOWER($2)
      WHERE LOWER(t.subdomain) = LOWER($1)
    `,
      [subdomain, adminEmail]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Subdomain or admin email already exists",
      });
    }

    const client = await db.getClient();
    try {
      await client.query("BEGIN");

      const plan = "free";
      const { maxUsers, maxProjects } = getPlanDefaults(plan);

      // create tenant
      const tenantResult = await client.query(
        `
        INSERT INTO tenants
          (name, subdomain, status, subscription_plan, max_users, max_projects)
        VALUES
          ($1, $2, 'active', $3, $4, $5)
        RETURNING id, name, subdomain, subscription_plan AS "subscriptionPlan",
                  max_users AS "maxUsers", max_projects AS "maxProjects"
      `,
        [tenantName, subdomain, plan, maxUsers, maxProjects]
      );

      const tenant = tenantResult.rows[0];

      // hash password
      const passwordHash = await bcrypt.hash(adminPassword, 10);

      // create tenant admin user
      const userResult = await client.query(
        `
        INSERT INTO users
          (tenant_id, email, password_hash, full_name, role, is_active)
        VALUES
          ($1, $2, $3, $4, 'tenant_admin', true)
        RETURNING id, email, full_name AS "fullName", role
      `,
        [tenant.id, adminEmail, passwordHash, adminFullName]
      );

      const adminUser = userResult.rows[0];

      // optional: audit log
      await client.query(
        `
        INSERT INTO audit_logs
          (tenant_id, user_id, action, entity_type, entity_id, ip_address)
        VALUES
          ($1, $2, $3, $4, $5, $6)
      `,
        [
          tenant.id,
          adminUser.id,
          "REGISTER_TENANT",
          "tenant",
          tenant.id,
          req.ip || null,
        ]
      );

      await client.query("COMMIT");

      return res.status(201).json({
        success: true,
        message: "Tenant registered successfully",
        data: {
          tenantId: tenant.id,
          subdomain: tenant.subdomain,
          adminUser: {
            id: adminUser.id,
            email: adminUser.email,
            fullName: adminUser.fullName,
            role: adminUser.role,
          },
        },
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("registerTenant error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to register tenant",
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("registerTenant outer error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password, tenantSubdomain, tenantId } = req.body;

  if (!email || !password || (!tenantSubdomain && !tenantId)) {
    return res.status(400).json({
      success: false,
      message: "email, password and tenantSubdomain or tenantId are required",
    });
  }

  try {
    // find tenant
    const tenantResult = await db.query(
      `
      SELECT id, status
      FROM tenants
      WHERE ${tenantId ? "id = $1" : "LOWER(subdomain) = LOWER($1)"}
    `,
      [tenantId || tenantSubdomain]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const tenant = tenantResult.rows[0];

    if (tenant.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Tenant is not active",
      });
    }

    // find user in that tenant
    const userResult = await db.query(
      `
      SELECT
        id,
        email,
        password_hash,
        full_name AS "fullName",
        role,
        is_active AS "isActive"
      FROM users
      WHERE tenant_id = $1
        AND LOWER(email) = LOWER($2)
    `,
      [tenant.id, email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = userResult.rows[0];

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    // normal password check
   // normal password check
const passwordMatch = await bcrypt.compare(password, user.password_hash);


if (!passwordMatch) {
  return res.status(401).json({
    success: false,
    message: "Invalid credentials",
  });
}

    const tokenPayload = {
      userId: user.id,
      tenantId: tenant.id,
      role: user.role,
    };

    const token = generateToken(tokenPayload);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          tenantId: tenant.id,
        },
        token,
        expiresIn: JWT_EXPIRES_IN_SECONDS,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  const { userId } = req.user;

  try {
    const result = await db.query(
      `
      SELECT
        u.id,
        u.email,
        u.full_name       AS "fullName",
        u.role,
        u.is_active       AS "isActive",
        t.id              AS "tenantId",
        t.name            AS "tenantName",
        t.subdomain,
        t.subscription_plan AS "subscriptionPlan",
        t.max_users       AS "maxUsers",
        t.max_projects    AS "maxProjects"
      FROM users u
      LEFT JOIN tenants t
        ON u.tenant_id = t.id
      WHERE u.id = $1
    `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const row = result.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        id: row.id,
        email: row.email,
        fullName: row.fullName,
        role: row.role,
        isActive: row.isActive,
        tenant: row.tenantId
          ? {
              id: row.tenantId,
              name: row.tenantName,
              subdomain: row.subdomain,
              subscriptionPlan: row.subscriptionPlan,
              maxUsers: row.maxUsers,
              maxProjects: row.maxProjects,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    const { userId, tenantId } = req.user;

    await db.query(
      `
      INSERT INTO audit_logs
        (tenant_id, user_id, action, entity_type, entity_id, ip_address)
      VALUES
        ($1, $2, 'LOGOUT', 'user', $2, $3)
    `,
      [tenantId || null, userId, req.ip || null]
    );
  } catch (err) {
    console.error("logout audit error:", err);
  }

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
