const express = require('express');
const {
  getTenantDetails,
  updateTenant,
  listTenants
} = require('../controllers/tenants.controller');
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

// Protected
router.get('/tenants', authenticate, listTenants);
router.get('/tenants/:tenantId', authenticate, getTenantDetails);
router.put('/tenants/:tenantId', authenticate, updateTenant);

module.exports = router;
