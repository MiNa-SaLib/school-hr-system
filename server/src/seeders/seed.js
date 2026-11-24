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

    await Employee.deleteMany({});
    await User.deleteMany({});
    await School.deleteMany({});
    console.log('Cleared old data...');

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

    const alNoorEmployees = [
      {
        schoolId: school1._id,
        employeeCode: 'EMP-101',
        fullName: 'أحمد محمد عبد الله',
        nationalId: '29005140102345',
        email: 'ahmed.math@alnoor.edu',
        phone: '01012345671',
        address: 'الشيخ زايد - الحي الثاني',
        qualification: 'بكالوريوس علوم وتربية - رياضيات',
        department: 'Teaching',
        jobTitle: 'معلم أول رياضيات',
        subject: 'الرياضيات',
        stage: 'Secondary',
        employmentType: 'Full-Time',
        baseSalary: 12500,
        leaveBalance: 21,
        status: 'Active',
        notes: 'مشرف عام مادة الرياضيات للمرحلة الثانوية',
      },
      {
        schoolId: school1._id,
        employeeCode: 'EMP-102',
        fullName: 'نهى حسن إبراهيم',
        nationalId: '29308220105678',
        email: 'noha.eng@alnoor.edu',
        phone: '01012345672',
        address: 'حدائق الأهرام - البوابة الأولى',
        qualification: 'ليسانس آداب وتربية - لغة إنجليزية',
        department: 'Teaching',
        jobTitle: 'معلمة لغة إنجليزية',
        subject: 'اللغة الإنجليزية',
        stage: 'Prep',
        employmentType: 'Full-Time',
        baseSalary: 11800,
        leaveBalance: 19,
        status: 'Active',
      },
      {
        schoolId: school1._id,
        employeeCode: 'EMP-103',
        fullName: 'محمود عادل السيد',
        nationalId: '29511030109876',
        email: 'mahmoud.it@alnoor.edu',
        phone: '01012345673',
        address: 'مدينة 6 أكتوبر - الحي السابع',
        qualification: 'بكالوريوس حاسبات ومعلومات',
        department: 'IT',
        jobTitle: 'مسؤول شبكات وأنظمة',
        stage: 'General',
        employmentType: 'Full-Time',
        baseSalary: 14000,
        leaveBalance: 21,
        status: 'Active',
      },
      {
        schoolId: school1._id,
        employeeCode: 'EMP-104',
        fullName: 'هدير سامي فؤاد',
        nationalId: '29604190103321',
        email: 'hadeer.admin@alnoor.edu',
        phone: '01012345674',
        address: 'الهرم - شارع فيصل',
        qualification: 'بكالوريوس تجارة',
        department: 'Administration',
        jobTitle: 'منسقة شؤون طلاب',
        stage: 'Primary',
        employmentType: 'Full-Time',
        baseSalary: 8500,
        leaveBalance: 15,
        status: 'On Leave',
      },
      {
        schoolId: school1._id,
        employeeCode: 'EMP-105',
        fullName: 'طارق نبيل جرجس',
        nationalId: '28809100107741',
        email: 'tarek.fin@alnoor.edu',
        phone: '01012345675',
        address: 'المهندسين - شارع جامعة الدول',
        qualification: 'بكالوريوس تجارة - شعبة محاسبة',
        department: 'Finance',
        jobTitle: 'محاسب رواتب',
        stage: 'General',
        employmentType: 'Full-Time',
        baseSalary: 11000,
        leaveBalance: 21,
        status: 'Active',
      },
    ];

    const leadersEmployees = [
      {
        schoolId: school2._id,
        employeeCode: 'EMP-101',
        fullName: 'ياسمين مصطفى كامل',
        nationalId: '28903150104412',
        email: 'yasmin.sci@leaders.edu',
        phone: '01122334451',
        address: 'التجمع الخامس - الحي الثالث',
        qualification: 'ماجستير في الكيمياء الحيوية',
        department: 'Teaching',
        jobTitle: 'رئيسة قسم العلوم',
        subject: 'العلوم والكيمياء',
        stage: 'Secondary',
        employmentType: 'Full-Time',
        baseSalary: 15500,
        leaveBalance: 21,
        status: 'Active',
      },
      {
        schoolId: school2._id,
        employeeCode: 'EMP-102',
        fullName: 'عمر خالد الشناوي',
        nationalId: '29407080106654',
        email: 'omar.pe@leaders.edu',
        phone: '01122334452',
        address: 'مدينة نصر - المنطقة الثامنة',
        qualification: 'بكالوريوس تربية رياضية',
        department: 'Teaching',
        jobTitle: 'مدرب تربية رياضية',
        subject: 'التربية الرياضية',
        stage: 'Primary',
        employmentType: 'Part-Time',
        baseSalary: 7500,
        leaveBalance: 14,
        status: 'Active',
      },
      {
        schoolId: school2._id,
        employeeCode: 'EMP-103',
        fullName: 'مريم وجيه حنا',
        nationalId: '29112250108890',
        email: 'mariam.ops@leaders.edu',
        phone: '01122334453',
        address: 'مصر الجديدة - روكسي',
        qualification: 'ليسانس حقوق',
        department: 'Operations',
        jobTitle: 'مشرفة حركة وباصات',
        stage: 'General',
        employmentType: 'Full-Time',
        baseSalary: 9200,
        leaveBalance: 20,
        status: 'Active',
      },
      {
        schoolId: school2._id,
        employeeCode: 'EMP-104',
        fullName: 'باسم أشرف رزق',
        nationalId: '29206110101129',
        email: 'bassem.fr@leaders.edu',
        phone: '01122334454',
        address: 'المعادي - دجلة',
        qualification: 'ليسانس ألسن - لغة فرنسية',
        department: 'Teaching',
        jobTitle: 'معلم لغة فرنسية',
        subject: 'اللغة الفرنسية',
        stage: 'Prep',
        employmentType: 'Contract',
        baseSalary: 10500,
        leaveBalance: 18,
        status: 'On Leave',
      },
    ];

    await Employee.insertMany([...alNoorEmployees, ...leadersEmployees]);

    console.log('Seeded 2 Schools, 2 HR Managers, and 9 Full-Profile Employees');
    console.log('Database Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
