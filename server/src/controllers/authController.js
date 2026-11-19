const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('../models/School');

const generateToken = (userId, schoolId, role) => {
  return jwt.sign({ userId, schoolId, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Login user & return JWT + School context
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('schoolId', 'name code plan isActive');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة',
      });
    }

    if (!user.isActive || !user.schoolId?.isActive) {
      return res.status(403).json({
        success: false,
        message: 'الحساب أو المدرسة غير نشطين حالياً',
      });
    }

    const token = generateToken(user._id, user.schoolId._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        school: user.schoolId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في السيرفر أثناء تسجيل الدخول',
      error: error.message,
    });
  }
};

// @desc    Get current authenticated user & school
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      school: req.user.schoolId,
    },
  });
};
