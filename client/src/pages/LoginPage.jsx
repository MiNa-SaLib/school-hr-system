import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('hr@alnoor.edu');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'تعذر الاتصال بالسيرفر، تأكد من البيانات'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const quickLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('123456');
    setError('');
    setSubmitting(true);
    try {
      await login(demoEmail, '123456');
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'تأكد من تشغيل أمر npm run seed في السيرفر'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            className="brand-icon"
            style={{ margin: '0 auto 12px', width: '52px', height: '52px' }}
          >
            <Building2 size={28} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700' }}>
            بوابة الموارد البشرية للمدارس
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            نظام سحابي متعدد المدارس (Multi-Tenant HR)
          </p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
            />
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={submitting}
          >
            <LogIn size={18} />
            {submitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="demo-box">
          <p style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center' }}>
            تجربة سريعة لاختبار عزل البيانات بين المدارس:
          </p>
          <div className="demo-grid">
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '12px', padding: '8px' }}
              onClick={() => quickLogin('hr@alnoor.edu')}
              disabled={submitting}
            >
              مدرسة النور الدولية
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '12px', padding: '8px' }}
              onClick={() => quickLogin('hr@leaders.edu')}
              disabled={submitting}
            >
              أكاديمية الرواد
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
