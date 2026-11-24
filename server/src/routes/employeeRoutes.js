const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeStats,
  getSingleEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getEmployeeStats);
router.route('/').get(getEmployees).post(createEmployee);
router
  .route('/:id')
  .get(getSingleEmployee)
  .put(updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
