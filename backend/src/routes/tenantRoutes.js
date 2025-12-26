const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const tenantController = require("../controllers/tenantController");

const router = express.Router();

router.get("/test-ping", (req, res) => {
  res.json({ success: true, message: "tenantRoutes mounted" });
});

// All tenant routes require auth
router.use(authMiddleware);

/**
 * GET /api/tenants
 * Only super_admin can list all tenants.
 */
router.get(
  "/",
  roleMiddleware("super_admin"),
  tenantController.getAllTenants
);

/**
 * GET /api/tenants/:tenantId
 * super_admin: any tenant
 * tenant_admin: own tenant only (enforced in controller + tenantMiddleware)
 */
router.get(
  "/:tenantId",
  tenantMiddleware,
  tenantController.getTenantById
);

/**
 * PATCH /api/tenants/:tenantId
 * super_admin: full control
 * tenant_admin: limited fields of own tenant
 */
// backend/src/routes/tenantRoutes.js

// ...

// UPDATE tenant
router.put(
  "/:tenantId",
  tenantMiddleware,
  tenantController.updateTenant
);


module.exports = router;
