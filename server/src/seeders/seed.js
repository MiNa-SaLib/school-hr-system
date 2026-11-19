require('dotenv').config();
const mongoose = require('mongoose');
const School = require('../models/School');
const User = require('../models/User');
const Employee = require('../models/Employee');

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing in server/.env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clear existing data
    await Employee.deleteMany({});
    await User.deleteMany({});
    await School.deleteMany({});
    console.log('Cleared old data...');

    // 1. Create Two Isolated Schools (Tenants)
    const school1 = await School.create({
      name: 'مدرسة النور الدولية',
      code: 'ALNOOR',
      address: 'الحي المتميز - مدينة 6 أكتوبر',
      phone: '01001112233',
      plan: 'pro',
    });

    const school2 = await School.create({
      name: 'أكاديمية الرواد للغات',
      code: 'LEADERS',
      address: 'التجمع الخامس - القاهرة الجديدة',
      phone: '01114445566',
      plan: 'enterprise',
    });

    // 2. Create HR Manager for each school
    await User.create({
      schoolId: school1._id,
      name: 'أ. سارة محمود',
      email: 'hr@alnoor.edu',
      password: '123456',
      role: 'hr_manager',
    });

    await User.create({
      schoolId: school2._id,
      name: 'أ. كريم طارق',
      email: 'hr@leaders.edu',
      password: '123456',
      role: 'hr_manager',
    });

    // 3. Create Employees for School 1 (Al-Noor)
    const alNoorEmployees = [
      {
        schoolId: school1._id,
        employeeCode: 'EMP-101',
        fullName: 'أحمد محمد عبد الله',
        email: 'ahmed.math@alnoor.edu',
        phone: '01012345671',
        department: 'Teaching',
        jobTitle: 'معلم أول رياضيات',
        employmentType: 'Full-Time',
        baseSalary: 12500,
        status: 'Active',
      },
      {
        schoolId: school1._id,
        employeeCode: 'EMP-102',
        fullName: 'نهى حسن إبراهيم',
        email: 'noha.eng@alnoor.edu',
        phone: '01012345672',
        department: 'Teaching',
        jobTitle: 'معلمة لغة إنجليزية',
        employmentType: 'Full-Time',
        baseSalary: 11800,
        status: 'Active',
      },
      {
        schoolId: school1._id,
        employeeCode: 'EMP-103',
        fullName: 'محمود عادل السيد',
        email: 'mahmoud.it@alnoor.edu',
        phone: '01012345673',
        department: 'IT',
        jobTitle: 'مسؤول شبكات وأنظمة',
        employmentType: 'Full-Time',
        baseSalary: 14000,
        status: 'Active',
      },
      {
        schoolId: school1._id,
        employeeCode: 'EMP-104',
        fullName: 'هدير سامي فؤاد',
        email: 'hadeer.admin@alnoor.edu',
        phone: '01012345674',
        department: 'Administration',
        jobTitle: 'منسقة شؤون طلاب',
        employmentType: 'Full-Time',
        baseSalary: 8500,
        status: 'On Leave',
      },
      {
        schoolId: school1._id,
        employeeCode: 'EMP-105',
        fullName: 'طارق نبيل جرجس',
        email: 'tarek.fin@alnoor.edu',
        phone: '01012345675',
        department: 'Finance',
        jobTitle: 'محاسب رواتب',
        employmentType: 'Full-Time',
        baseSalary: 11000,
        status: 'Active',
      },
    ];

    // 4. Create Employees for School 2 (Leaders Academy)
    const leadersEmployees = [
      {
        schoolId: school2._id,
        employeeCode: 'EMP-101',
        fullName: 'ياسمين مصطفى كامل',
        email: 'yasmin.sci@leaders.edu',
        phone: '01122334451',
        department: 'Teaching',
        jobTitle: 'رئيسة قسم العلوم',
        employmentType: 'Full-Time',
        baseSalary: 15500,
        status: 'Active',
      },
      {
        schoolId: school2._id,
        employeeCode: 'EMP-102',
        fullName: 'عمر خالد الشناوي',
        email: 'omar.pe@leaders.edu',
        phone: '01122334452',
        department: 'Teaching',
        jobTitle: 'مدرب تربية رياضية',
        employmentType: 'Part-Time',
        baseSalary: 7500,
        status: 'Active',
      },
      {
        schoolId: school2._id,
        employeeCode: 'EMP-103',
        fullName: 'مريم وجيه حنا',
        email: 'mariam.ops@leaders.edu',
        phone: '01122334453',
        department: 'Operations',
        jobTitle: 'مشرفة حركة وباصات',
        employmentType: 'Full-Time',
        baseSalary: 9200,
        status: 'Active',
      },
      {
        schoolId: school2._id,
        employeeCode: 'EMP-104',
        fullName: 'باسم أشرف رزق',
        email: 'bassem.fr@leaders.edu',
        phone: '01122334454',
        department: 'Teaching',
        jobTitle: 'معلم لغة فرنسية',
        employmentType: 'Contract',
        baseSalary: 10500,
        status: 'On Leave',
      },
    ];

    await Employee.insertMany([...alNoorEmployees, ...leadersEmployees]);

    console.log('Seeded 2 Schools, 2 HR Managers, and 9 Employees');
    console.log('Database Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
