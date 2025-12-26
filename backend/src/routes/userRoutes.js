const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const userController = require("../controllers/userController");

const router = express.Router();

// all user routes require auth
router.use(authMiddleware);

/**
 * GET /api/users
 * super_admin or tenant_admin.
 */
router.get(
  "/",
  roleMiddleware("super_admin", "tenant_admin"),
  userController.getUsers
);

/**
 * POST /api/users
 * tenant_admin only, within own tenant.
 */
router.post(
  "/",
  roleMiddleware("tenant_admin", "super_admin"),
  tenantMiddleware,
  userController.createUser
);

/**
 * PATCH /api/users/:userId
 */
router.patch(
  "/:userId",
  tenantMiddleware,
  userController.updateUser
);

/**
 * DELETE /api/users/:userId
 * Soft delete.
 */
router.delete(
  "/:userId",
  tenantMiddleware,
  userController.deactivateUser
);

module.exports = router;
