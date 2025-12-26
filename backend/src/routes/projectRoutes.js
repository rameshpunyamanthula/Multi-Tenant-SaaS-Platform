const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const projectController = require("../controllers/projectController");

const router = express.Router();

// all project routes require auth
router.use(authMiddleware);

/**
 * GET /api/projects
 */
router.get(
  "/",
  roleMiddleware("super_admin", "tenant_admin", "user"),
  projectController.getProjects
);

/**
 * POST /api/projects
 */
router.post(
  "/",
  roleMiddleware("tenant_admin", "user", "super_admin"),
  tenantMiddleware,
  projectController.createProject
);


/**
 * GET /api/projects/:projectId
 */
router.get(
  "/:projectId",
  tenantMiddleware,
  projectController.getProjectById
);

/**
 * PATCH /api/projects/:projectId
 */
router.patch(
  "/:projectId",
  tenantMiddleware,
  projectController.updateProject
);

/**
 * DELETE /api/projects/:projectId
 * Archive project.
 */
router.delete(
  "/:projectId",
  tenantMiddleware,
  projectController.archiveProject
);

module.exports = router;
