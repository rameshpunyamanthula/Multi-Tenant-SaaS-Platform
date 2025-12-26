const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const taskController = require("../controllers/taskController");

const router = express.Router();

// all task routes require auth
router.use(authMiddleware);

/**
 * GET /api/tasks
 */
router.get(
  "/",
  roleMiddleware("super_admin", "tenant_admin", "user"),
  taskController.getTasks
);

/**
 * POST /api/tasks
 */
router.post(
  "/",
  roleMiddleware("tenant_admin", "user", "super_admin"),
  tenantMiddleware,
  taskController.createTask
);


/**
 * PATCH /api/tasks/:taskId
 */
router.patch(
  "/:taskId",
  tenantMiddleware,
  taskController.updateTask
);

/**
 * DELETE /api/tasks/:taskId
 */
router.delete(
  "/:taskId",
  tenantMiddleware,
  taskController.deleteTask
);

module.exports = router;
