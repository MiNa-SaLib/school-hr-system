const Employee = require('../models/Employee');

// @desc    Get all employees for the logged-in user's school ONLY
// @route   GET /api/employees
exports.getEmployees = async (req, res) => {
  try {
    const { search, department, status } = req.query;

    // Tenant isolation enforced via req.schoolId
    const filter = { schoolId: req.schoolId };

    if (department && department !== 'ALL') {
      filter.department = department;
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { employeeCode: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await Employee.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل تحميل بيانات الموظفين',
      error: error.message,
    });
  }
};

// @desc    Get HR summary KPIs for the logged-in school ONLY
// @route   GET /api/employees/stats
exports.getEmployeeStats = async (req, res) => {
  try {
    const employees = await Employee.find({ schoolId: req.schoolId });

    const totalEmployees = employees.length;
    const activeCount = employees.filter((e) => e.status === 'Active').length;
    const onLeaveCount = employees.filter((e) => e.status === 'On Leave').length;
    const totalMonthlyPayroll = employees
      .filter((e) => e.status !== 'Terminated')
      .reduce((sum, e) => sum + (e.baseSalary || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeCount,
        onLeaveCount,
        totalMonthlyPayroll,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل تحميل الإحصائيات',
      error: error.message,
    });
  }
};
