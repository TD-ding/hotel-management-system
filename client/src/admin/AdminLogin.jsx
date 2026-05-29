import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { useToast } from '../components/Toast.jsx';
import { theme } from '../theme';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.username, form.password);
      if (data.user.role !== 'admin') { setError('该账号不是管理员'); return; }
      toast.success('管理员登录成功');
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div className="auth-card" style={styles.card}>
        <h2 style={styles.title}>管理员登录</h2>
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>用户名</label>
          <input required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} style={styles.input} />
          <label style={styles.label}>密码</label>
          <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={styles.input} />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.btn} disabled={loading}>{loading ? '登录中...' : '登录'}</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.primary, padding: 20 },
  card: { background: theme.white, padding: 40, borderRadius: 8, width: 400, maxWidth: '100%' },
  title: { margin: '0 0 24px', textAlign: 'center', fontSize: 24, fontWeight: 600, color: theme.primary },
  label: { display: 'block', fontSize: 13, color: theme.textLight, marginBottom: 4, marginTop: 14 },
  input: { width: '100%', padding: '10px 12px', border: `1px solid ${theme.border}`, borderRadius: 4, fontSize: 14, boxSizing: 'border-box' },
  btn: { width: '100%', padding: '12px', background: theme.primary, color: theme.accent, border: 'none', borderRadius: 4, fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 20 },
  error: { color: theme.danger, fontSize: 14, marginTop: 8 },
};
