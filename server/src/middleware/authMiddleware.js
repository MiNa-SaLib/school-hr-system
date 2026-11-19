const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح بالدخول — يرجى تسجيل الدخول أولاً',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate(
      'schoolId',
      'name code plan isActive'
    );

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'الحساب غير موجود أو موقوف',
      });
    }

    if (!user.schoolId || !user.schoolId.isActive) {
      return res.status(403).json({
        success: false,
        message: 'اشتراك المدرسة غير نشط',
      });
    }

    // Strict Multi-Tenant isolation context attached to every request
    req.user = user;
    req.schoolId = user.schoolId._id;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'جلسة الدخول منتهية أو غير صالحة',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتنفيذ هذا الإجراء',
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
