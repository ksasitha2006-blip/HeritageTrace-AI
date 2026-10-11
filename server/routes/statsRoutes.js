const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/statsController');

// GET /api/stats — Dashboard statistics
router.get('/', getDashboardStats);

module.exports = router;
