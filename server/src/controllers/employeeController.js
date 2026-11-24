const Employee = require('../models/Employee');

// Helper: Generate next employee code per school (e.g. EMP-101 -> EMP-102)
const generateEmployeeCode = async (schoolId) => {
  const lastEmployee = await Employee.findOne({ schoolId })
    .sort({ _id: -1 })
    .select('employeeCode');

  if (!lastEmployee || !lastEmployee.employeeCode) {
    return 'EMP-101';
  }

  const parts = lastEmployee.employeeCode.split('-');
  const lastNumber = parseInt(parts[1], 10);

  if (isNaN(lastNumber)) {
    return 'EMP-101';
  }

  return `EMP-${lastNumber + 1}`;
};

// @desc    Get all employees for the logged-in user's school ONLY
// @route   GET /api/employees
exports.getEmployees = async (req, res) => {
  try {
    const { search, department, status } = req.query;

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

// @desc    Get single employee full profile by ID (isolated by schoolId)
// @route   GET /api/employees/:id
exports.getSingleEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      schoolId: req.schoolId,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'الموظف غير موجود في هذه المدرسة',
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'صيغة رقم الموظف غير صحيحة',
      });
    }
    res.status(500).json({
      success: false,
      message: 'فشل تحميل بيانات الموظف',
      error: error.message,
    });
  }
};

// @desc    Create new employee for logged-in school
// @route   POST /api/employees
exports.createEmployee = async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload.schoolId;

    if (!payload.hireDate) {
      delete payload.hireDate;
    }

    const finalCode =
      payload.employeeCode?.trim() || (await generateEmployeeCode(req.schoolId));

    const employee = await Employee.create({
      ...payload,
      schoolId: req.schoolId,
      employeeCode: finalCode,
    });

    res.status(201).json({
      success: true,
      message: 'تم إضافة الموظف بنجاح',
      data: employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'كود الموظف مستخدم بالفعل داخل هذه المدرسة',
      });
    }
    res.status(400).json({
      success: false,
      message: 'فشل إضافة الموظف، تأكد من الحقول المطلوبة',
      error: error.message,
    });
  }
};

// @desc    Update employee details (isolated by schoolId)
// @route   PUT /api/employees/:id
exports.updateEmployee = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.schoolId;


    if (!updates.employeeCode?.trim()) {
      delete updates.employeeCode;
    }
    if (updates.hireDate === '') {
      delete updates.hireDate;
    }

    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.schoolId },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'الموظف غير موجود في هذه المدرسة',
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات الموظف بنجاح',
      data: employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'كود الموظف مستخدم بالفعل لموظف آخر في هذه المدرسة',
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'صيغة رقم الموظف غير صحيحة',
      });
    }
    res.status(400).json({
      success: false,
      message: 'فشل تحديث بيانات الموظف',
      error: error.message,
    });
  }
};

// @desc    Soft delete employee (set status to Terminated)
// @route   DELETE /api/employees/:id
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.schoolId },
      { status: 'Terminated' },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'الموظف غير موجود في هذه المدرسة',
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم إنهاء خدمة الموظف بنجاح',
      data: employee,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'صيغة رقم الموظف غير صحيحة',
      });
    }
    res.status(500).json({
      success: false,
      message: 'فشل تنفيذ الإجراء',
      error: error.message,
    });
  }
};
