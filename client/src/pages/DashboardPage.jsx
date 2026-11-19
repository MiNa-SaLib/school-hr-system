import { useEffect, useState } from 'react';
import {
  Building2,
  LogOut,
  Users,
  UserCheck,
  Clock,
  Wallet,
  Search,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const deptLabels = {
  Teaching: 'هيئة التدريس',
  Administration: 'الشؤون الإدارية',
  IT: 'تكنولوجيا المعلومات',
  Operations: 'التشغيل والخدمات',
  Finance: 'المالية والحسابات',
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
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, statsRes] = await Promise.all([
        api.get('/employees', { params: { search, department } }),
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
  }, [search, department]);

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
              كود المدرسة: {user?.school?.code} | الباقة: {user?.school?.plan?.toUpperCase()}
            </div>
          </div>
          <span className="school-badge">بيئة معزولة (Multi-Tenant)</span>
        </div>

        <div className="nav-actions">
          <div style={{ textAlign: 'left', fontSize: '13px' }}>
            <div style={{ fontWeight: '600' }}>{user?.name}</div>
            <div style={{ color: 'var(--muted)', fontSize: '12px' }}>{user?.email}</div>
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
            <div className="kpi-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
              <Users size={22} />
            </div>
          </div>

          <div className="kpi-card">
            <div>
              <div className="kpi-label">على رأس العمل</div>
              <div className="kpi-value">{stats.activeCount}</div>
            </div>
            <div className="kpi-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
              <UserCheck size={22} />
            </div>
          </div>

          <div className="kpi-card">
            <div>
              <div className="kpi-label">في إجازة</div>
              <div className="kpi-value">{stats.onLeaveCount}</div>
            </div>
            <div className="kpi-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
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
            <div className="kpi-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
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
                يتم عرض الموظفين التابعين لهذه المدرسة فقط تلقائياً
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
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>
                      جاري تحميل بيانات المدرسة...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>
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
                      <td>{emp.jobTitle}</td>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
