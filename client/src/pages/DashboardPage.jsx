import api from "../api/axios";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import {
  Building2,
  LogOut,
  Users,
  UserCheck,
  Clock,
  Wallet,
  Search,
  Plus,
  Pencil,
  UserX,
  X,
  AlertTriangle,
  Eye,
} from 'lucide-react';

const deptLabels = {
  Teaching: 'هيئة التدريس',
  Administration: 'الشؤون الإدارية',
  IT: 'تكنولوجيا المعلومات',
  Operations: 'التشغيل والخدمات',
  Finance: 'المالية والحسابات',
};

const stageLabels = {
  KG: 'رياض أطفال (KG)',
  Primary: 'المرحلة الابتدائية',
  Prep: 'المرحلة الإعدادية',
  Secondary: 'المرحلة الثانوية',
  General: 'عام / إداري',
};

const initialForm = {
  employeeCode: '',
  fullName: '',
  nationalId: '',
  phone: '',
  email: '',
  address: '',
  qualification: '',
  department: 'Teaching',
  jobTitle: '',
  subject: '',
  stage: 'General',
  employmentType: 'Full-Time',
  baseSalary: '',
  leaveBalance: 21,
  hireDate: '',
  status: 'Active',
  notes: '',
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeCount: 0,
    onLeaveCount: 0,
    totalMonthlyPayroll: 0,
  });
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Full Profile View Modal State
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [viewError, setViewError] = useState('');

  // Terminate Confirmation Modal State
  const [terminateTarget, setTerminateTarget] = useState(null);
  const [terminating, setTerminating] = useState(false);
  const [terminateError, setTerminateError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, statsRes] = await Promise.all([
        api.get('/employees', { params: { search, department,status: statusFilter } }),
        api.get('/employees/stats'),
      ]);
      setEmployees(empRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching school data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, department, statusFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData(initialForm);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setEditingId(emp._id);
    setFormData({
      employeeCode: emp.employeeCode || '',
      fullName: emp.fullName || '',
      nationalId: emp.nationalId || '',
      phone: emp.phone || '',
      email: emp.email || '',
      address: emp.address || '',
      qualification: emp.qualification || '',
      department: emp.department || 'Teaching',
      jobTitle: emp.jobTitle || '',
      subject: emp.subject || '',
      stage: emp.stage || 'General',
      employmentType: emp.employmentType || 'Full-Time',
      baseSalary: emp.baseSalary ?? '',
      leaveBalance: emp.leaveBalance ?? 21,
      hireDate: emp.hireDate
        ? new Date(emp.hireDate).toISOString().split('T')[0]
        : '',
      status: emp.status || 'Active',
      notes: emp.notes || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      const payload = {
        ...formData,
        baseSalary: Number(formData.baseSalary),
        leaveBalance:
          formData.leaveBalance === '' ? 21 : Number(formData.leaveBalance),
      };

      if (!payload.hireDate) {
        delete payload.hireDate;
      }

      if (editingId) {
        await api.put(`/employees/${editingId}`, payload);
      } else {
        await api.post('/employees', payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'حدث خطأ أثناء حفظ بيانات الموظف'
      );
    } finally {
      setSaving(false);
    }
  };

  const openViewModal = async (empId) => {
    setIsViewOpen(true);
    setLoadingProfile(true);
    setViewError('');
    setViewEmployee(null);

    try {
      const { data } = await api.get(`/employees/${empId}`);
      setViewEmployee(data.data);
    } catch (err) {
      setViewError(err.response?.data?.message || 'فشل تحميل بيانات الموظف');
    } finally {
      setLoadingProfile(false);
    }
  };

  const openTerminateModal = (emp) => {
    setTerminateTarget(emp);
    setTerminateError('');
  };

  const confirmTerminate = async () => {
    if (!terminateTarget) return;
    setTerminating(true);
    setTerminateError('');

    try {
      await api.delete(`/employees/${terminateTarget._id}`);
      setTerminateTarget(null);
      fetchData();
    } catch (err) {
      setTerminateError(
        err.response?.data?.message || 'فشل تنفيذ إجراء إنهاء الخدمة'
      );
    } finally {
      setTerminating(false);
    }
  };

  return (
    <div>
      {/* Top Navbar */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>
              {user?.school?.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
              كود المدرسة: {user?.school?.code} | الباقة:{' '}
              {user?.school?.plan?.toUpperCase()}
            </div>
          </div>
          <span className="school-badge">بيئة معزولة (Multi-Tenant)</span>
        </div>

        <div className="nav-actions">
          <div style={{ textAlign: 'left', fontSize: '13px' }}>
            <div style={{ fontWeight: '600' }}>{user?.name}</div>
            <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
              {user?.email}
            </div>
          </div>
          <button onClick={logout} className="btn btn-danger-ghost">
            <LogOut size={16} />
            خروج
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        {/* KPI Cards */}
        <section className="kpi-grid">
          <div className="kpi-card">
            <div>
              <div className="kpi-label">إجمالي الموظفين</div>
              <div className="kpi-value">{stats.totalEmployees}</div>
            </div>
            <div
              className="kpi-icon"
              style={{ background: '#eff6ff', color: '#1d4ed8' }}
            >
              <Users size={22} />
            </div>
          </div>

          <div className="kpi-card">
            <div>
              <div className="kpi-label">على رأس العمل</div>
              <div className="kpi-value">{stats.activeCount}</div>
            </div>
            <div
              className="kpi-icon"
              style={{ background: '#dcfce7', color: '#15803d' }}
            >
              <UserCheck size={22} />
            </div>
          </div>

          <div className="kpi-card">
            <div>
              <div className="kpi-label">في إجازة</div>
              <div className="kpi-value">{stats.onLeaveCount}</div>
            </div>
            <div
              className="kpi-icon"
              style={{ background: '#fef3c7', color: '#b45309' }}
            >
              <Clock size={22} />
            </div>
          </div>

          <div className="kpi-card">
            <div>
              <div className="kpi-label">إجمالي الرواتب الأساسية</div>
              <div className="kpi-value">
                {stats.totalMonthlyPayroll.toLocaleString()} ج.م
              </div>
            </div>
            <div
              className="kpi-icon"
              style={{ background: '#f3e8ff', color: '#7e22ce' }}
            >
              <Wallet size={22} />
            </div>
          </div>
        </section>

        {/* Employees Directory Table */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>
                دليل موظفي {user?.school?.name}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                إدارة كاملة للموظفين المعزولين داخل المدرسة
              </p>
            </div>

            <div className="filters">
              <div style={{ position: 'relative' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--muted)',
                  }}
                />
                <input
                  type="text"
                  className="input"
                  style={{ paddingRight: '36px' }}
                  placeholder="بحث بالاسم أو الكود..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="ALL">كل الأقسام</option>
                <option value="Teaching">هيئة التدريس</option>
                <option value="Administration">الشؤون الإدارية</option>
                <option value="IT">تكنولوجيا المعلومات</option>
                <option value="Operations">التشغيل والخدمات</option>
                <option value="Finance">المالية والحسابات</option>
              </select>
              <select
                className="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">كل الحالات</option>
                <option value="Active">نشط</option>
                <option value="On Leave">في إجازة</option>
                <option value="Terminated">منتهي الخدمة</option>
              </select>

              <button onClick={openAddModal} className="btn btn-primary">
                <Plus size={18} />
                إضافة موظف
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>اسم الموظف</th>
                  <th>المسمى الوظيفي</th>
                  <th>القسم</th>
                  <th>نوع التعاقد</th>
                  <th>الراتب الأساسي</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>
                      جاري تحميل بيانات المدرسة...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>
                      لا يوجد موظفون مطابقون للبحث
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp._id}>
                      <td style={{ fontWeight: '600' }}>{emp.employeeCode}</td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{emp.fullName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          {emp.phone}
                        </div>
                      </td>
                      <td>
                        <div>{emp.jobTitle}</div>
                        {emp.subject && (
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                            مادة: {emp.subject}
                          </div>
                        )}
                      </td>
                      <td>{deptLabels[emp.department] || emp.department}</td>
                      <td>{emp.employmentType}</td>
                      <td style={{ fontWeight: '600' }}>
                        {emp.baseSalary.toLocaleString()} ج.م
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            emp.status === 'Active'
                              ? 'badge-active'
                              : emp.status === 'On Leave'
                              ? 'badge-leave'
                              : 'badge-terminated'
                          }`}
                        >
                          {emp.status === 'Active'
                            ? 'نشط'
                            : emp.status === 'On Leave'
                            ? 'في إجازة'
                            : 'منتهي الخدمة'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="icon-btn"
                            title="عرض كل البيانات"
                            onClick={() => openViewModal(emp._id)}
                          >
                            <Eye size={15} color="#0f172a" />
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            title="تعديل البيانات"
                            onClick={() => openEditModal(emp)}
                          >
                            <Pencil size={15} color="#1d4ed8" />
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            title="إنهاء الخدمة"
                            disabled={emp.status === 'Terminated'}
                            onClick={() => openTerminateModal(emp)}
                          >
                            <UserX size={15} color="#b91c1c" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
                {editingId ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
              </h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {formError && <div className="alert-error">{formError}</div>}

            <form onSubmit={handleSave}>
              <div className="modal-grid">
                <div className="form-group">
                  <label>الاسم بالكامل *</label>
                  <input
                    type="text"
                    className="input"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>كود الموظف (يُولّد تلقائياً إذا تُرك فارغاً)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="مثال: EMP-106"
                    value={formData.employeeCode}
                    onChange={(e) =>
                      setFormData({ ...formData, employeeCode: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>المسمى الوظيفي *</label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="مثال: معلم رياضيات"
                    value={formData.jobTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, jobTitle: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>القسم</label>
                  <select
                    className="select"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                  >
                    <option value="Teaching">هيئة التدريس</option>
                    <option value="Administration">الشؤون الإدارية</option>
                    <option value="IT">تكنولوجيا المعلومات</option>
                    <option value="Operations">التشغيل والخدمات</option>
                    <option value="Finance">المالية والحسابات</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>المادة الدراسية (للمعلمين)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="مثال: الرياضيات / اللغة الإنجليزية"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>المرحلة الدراسية</label>
                  <select
                    className="select"
                    value={formData.stage}
                    onChange={(e) =>
                      setFormData({ ...formData, stage: e.target.value })
                    }
                  >
                    <option value="General">عام / إداري</option>
                    <option value="KG">رياض أطفال (KG)</option>
                    <option value="Primary">المرحلة الابتدائية</option>
                    <option value="Prep">المرحلة الإعدادية</option>
                    <option value="Secondary">المرحلة الثانوية</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>الراتب الأساسي (ج.م) *</label>
                  <input
                    type="number"
                    className="input"
                    required
                    min="0"
                    value={formData.baseSalary}
                    onChange={(e) =>
                      setFormData({ ...formData, baseSalary: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>نوع التعاقد</label>
                  <select
                    className="select"
                    value={formData.employmentType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employmentType: e.target.value,
                      })
                    }
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>رقم الهاتف</label>
                  <input
                    type="text"
                    className="input"
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>البريد الإلكتروني</label>
                  <input
                    type="email"
                    className="input"
                    dir="ltr"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>الرقم القومي</label>
                  <input
                    type="text"
                    className="input"
                    dir="ltr"
                    maxLength={14}
                    value={formData.nationalId}
                    onChange={(e) =>
                      setFormData({ ...formData, nationalId: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>المؤهل الدراسي</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="مثال: بكالوريوس علوم وتربية"
                    value={formData.qualification}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qualification: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>تاريخ التعيين</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.hireDate}
                    onChange={(e) =>
                      setFormData({ ...formData, hireDate: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>رصيد الإجازات السنوي (أيام)</label>
                  <input
                    type="number"
                    className="input"
                    min="0"
                    value={formData.leaveBalance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        leaveBalance: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>العنوان</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>

                {editingId && (
                  <div className="form-group">
                    <label>حالة الموظف</label>
                    <select
                      className="select"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="Active">نشط (Active)</option>
                      <option value="On Leave">في إجازة (On Leave)</option>
                      <option value="Terminated">
                        منتهي الخدمة (Terminated)
                      </option>
                    </select>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: '4px' }}>
                <label>ملاحظات إضافية</label>
                <textarea
                  rows="2"
                  className="textarea"
                  placeholder="أي ملاحظات إدارية خاصة بالموظف..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? 'جاري الحفظ...'
                    : editingId
                    ? 'حفظ التعديلات'
                    : 'إضافة الموظف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Employee Profile Modal */}
      {isViewOpen && (
        <div className="modal-backdrop" onClick={() => setIsViewOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
                ملف بيانات الموظف الكامل
              </h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setIsViewOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {loadingProfile ? (
              <p
                style={{
                  textAlign: 'center',
                  padding: '24px',
                  color: 'var(--muted)',
                }}
              >
                جاري تحميل ملف الموظف...
              </p>
            ) : viewError ? (
              <div className="alert-error">{viewError}</div>
            ) : viewEmployee ? (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#eff6ff',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    marginBottom: '16px',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: '700' }}>
                      {viewEmployee.fullName}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                      {viewEmployee.jobTitle} • كود: {viewEmployee.employeeCode}
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      viewEmployee.status === 'Active'
                        ? 'badge-active'
                        : viewEmployee.status === 'On Leave'
                        ? 'badge-leave'
                        : 'badge-terminated'
                    }`}
                  >
                    {viewEmployee.status === 'Active'
                      ? 'نشط'
                      : viewEmployee.status === 'On Leave'
                      ? 'في إجازة'
                      : 'منتهي الخدمة'}
                  </span>
                </div>

                <div className="modal-grid">
                  <div className="profile-item">
                    <div className="profile-item-label">القسم</div>
                    <div className="profile-item-value">
                      {deptLabels[viewEmployee.department] ||
                        viewEmployee.department}
                    </div>
                  </div>

                  <div className="profile-item">
                    <div className="profile-item-label">نوع التعاقد</div>
                    <div className="profile-item-value">
                      {viewEmployee.employmentType}
                    </div>
                  </div>

                  <div className="profile-item">
                    <div className="profile-item-label">المادة الدراسية</div>
                    <div className="profile-item-value">
                      {viewEmployee.subject || 'غير محدد'}
                    </div>
                  </div>

                  <div className="profile-item">
                    <div className="profile-item-label">المرحلة الدراسية</div>
                    <div className="profile-item-value">
                      {stageLabels[viewEmployee.stage] || 'عام / إداري'}
                    </div>
                  </div>

                  <div className="profile-item">
                    <div className="profile-item-label">الراتب الأساسي</div>
                    <div className="profile-item-value">
                      {viewEmployee.baseSalary?.toLocaleString()} ج.م
                    </div>
                  </div>

                  <div className="profile-item">
                    <div className="profile-item-label">رصيد الإجازات السنوي</div>
                    <div className="profile-item-value">
                      {viewEmployee.leaveBalance ?? 21} يوم
                    </div>
                  </div>

                  <div className="profile-item">
                    <div className="profile-item-label">رقم الهاتف</div>
                    <div className="profile-item-value" dir="ltr">
                      {viewEmployee.phone || 'غير مسجل'}
                    </div>
                  </div>

                  <div className="profile-item">
                    <div className="profile-item-label">البريد الإلكتروني</div>
                    <div className="profile-item-value" dir="ltr">
                      {viewEmployee.email || 'غير مسجل'}
                    </div>
                  </div>

                  <div className="profile-item">
                    <div className="profile-item-label">الرقم القومي</div>
                    <div className="profile-item-value" dir="ltr">
                      {viewEmployee.nationalId || 'غير مسجل'}
                    </div>
                  </div>

                  <div className="profile-item">
                    <div className="profile-item-label">المؤهل الدراسي</div>
                    <div className="profile-item-value">
                      {viewEmployee.qualification || 'غير مسجل'}
                    </div>
                  </div>

                  <div className="profile-item">
                    <div className="profile-item-label">تاريخ التعيين</div>
                    <div className="profile-item-value">
                      {viewEmployee.hireDate
                        ? new Date(viewEmployee.hireDate).toLocaleDateString(
                            'ar-EG'
                          )
                        : 'غير محدد'}
                    </div>
                  </div>

                  <div className="profile-item">
                    <div className="profile-item-label">العنوان</div>
                    <div className="profile-item-value">
                      {viewEmployee.address || 'غير مسجل'}
                    </div>
                  </div>

                  <div className="profile-item">
                    <div className="profile-item-label">تاريخ الإضافة للنظام</div>
                    <div className="profile-item-value">
                      {new Date(viewEmployee.createdAt).toLocaleDateString(
                        'ar-EG'
                      )}
                    </div>
                  </div>

                  <div className="profile-item">
                    <div className="profile-item-label">آخر تحديث</div>
                    <div className="profile-item-value">
                      {new Date(viewEmployee.updatedAt).toLocaleDateString(
                        'ar-EG'
                      )}
                    </div>
                  </div>
                </div>

                {viewEmployee.notes && (
                  <div className="profile-item" style={{ marginTop: '12px' }}>
                    <div className="profile-item-label">ملاحظات إدارية</div>
                    <div className="profile-item-value">
                      {viewEmployee.notes}
                    </div>
                  </div>
                )}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setIsViewOpen(false)}
                  >
                    إغلاق
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setIsViewOpen(false);
                      openEditModal(viewEmployee);
                    }}
                  >
                    <Pencil size={15} />
                    تعديل البيانات
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Terminate Confirmation Modal */}
      {terminateTarget && (
        <div
          className="modal-backdrop"
          onClick={() => !terminating && setTerminateTarget(null)}
        >
          <div
            className="modal-card"
            style={{ maxWidth: '420px', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-icon-wrap">
              <AlertTriangle size={24} />
            </div>

            <h3
              style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '8px',
              }}
            >
              تأكيد إنهاء الخدمة
            </h3>

            <p
              style={{
                fontSize: '14px',
                color: 'var(--muted)',
                marginBottom: '16px',
              }}
            >
              هل أنت متأكد من إنهاء خدمة الموظف{' '}
              <strong style={{ color: 'var(--text)' }}>
                "{terminateTarget.fullName}"
              </strong>{' '}
              ({terminateTarget.employeeCode})؟ سيتم تحويل حالته إلى منتهي الخدمة
              وإيقاف احتسابه في الرواتب.
            </p>

            {terminateError && (
              <div className="alert-error" style={{ textAlign: 'right' }}>
                {terminateError}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '20px',
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                disabled={terminating}
                onClick={() => setTerminateTarget(null)}
              >
                تراجع
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={terminating}
                onClick={confirmTerminate}
              >
                {terminating ? 'جاري التنفيذ...' : 'نعم، إنهاء الخدمة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
