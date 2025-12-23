const express = require('express');
const {
  login,
  getCurrentUser,
  logout
} = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

// Public
router.post('/auth/login', login);

// Protected
router.get('/auth/me', authenticate, getCurrentUser);
router.post('/auth/logout', authenticate, logout);

module.exports = router;
