const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ success: true, message: "Auth routes mounted" });
});

/* REGISTER TENANT */
router.post(
  "/register-tenant",
  [
    body("tenantName").notEmpty(),
    body("subdomain").notEmpty(),
    body("adminEmail").isEmail(),
    body("adminPassword").isLength({ min: 8 }),
    body("adminFullName").notEmpty(),
  ],
  authController.registerTenant
);

/* LOGIN */
router.post("/login", authController.login);

/* ME */
router.get("/me", authMiddleware, authController.getMe);

/* LOGOUT */
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;
