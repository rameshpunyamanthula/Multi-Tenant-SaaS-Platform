const express = require('express');
const {
  addUserToTenant,
  listTenantUsers,
  updateUser,
  deleteUser
} = require('../controllers/users.controller');
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

// Tenant user management
router.post('/tenants/:tenantId/users', authenticate, addUserToTenant);
router.get('/tenants/:tenantId/users', authenticate, listTenantUsers);

// Individual user actions
router.put('/users/:userId', authenticate, updateUser);
router.delete('/users/:userId', authenticate, deleteUser);

module.exports = router;
