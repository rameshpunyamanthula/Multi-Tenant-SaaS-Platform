const { body } = require("express-validator");

module.exports = [
  body("tenantName").notEmpty().withMessage("Tenant name is required"),
  body("subdomain").notEmpty().withMessage("Subdomain is required"),
  body("adminEmail").isEmail().withMessage("Valid admin email is required"),
  body("adminPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("adminFullName").notEmpty().withMessage("Admin full name is required"),
];
