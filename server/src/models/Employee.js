const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'Employee must belong to a school'],
      index: true,
    },
    employeeCode: {
      type: String,
      required: [true, 'Employee code is required'],
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    nationalId: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    qualification: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      enum: ['Teaching', 'Administration', 'IT', 'Operations', 'Finance'],
      default: 'Teaching',
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
      default: '',
    },
    stage: {
      type: String,
      enum: ['KG', 'Primary', 'Prep', 'Secondary', 'General'],
      default: 'General',
    },
    employmentType: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Contract'],
      default: 'Full-Time',
    },
    baseSalary: {
      type: Number,
      required: [true, 'Base salary is required'],
      min: 0,
    },
    leaveBalance: {
      type: Number,
      default: 21,
      min: 0,
    },
    hireDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Terminated'],
      default: 'Active',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// Unique employee code per school (Multi-Tenant safe)
employeeSchema.index({ schoolId: 1, employeeCode: 1 }, { unique: true });

module.exports = mongoose.model('Employee', employeeSchema);
