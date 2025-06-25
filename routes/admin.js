const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// POST /admin/login - login endpoint
router.post('/login', adminController.login);

// GET /admin/check-auth - protected test endpoint
router.get('/check-auth', auth, adminController.checkAuth);

module.exports = router;