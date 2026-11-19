const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeStats,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getEmployeeStats);
router.get('/', getEmployees);

module.exports = router;
