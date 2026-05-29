import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { theme } from '../theme';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('两次密码不一致'); return; }
    if (form.password.length < 6) { setError('密码至少6位'); return; }
    try {
      await register(form.username, form.email, form.password);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || '注册失败');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>用户注册</h2>
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>用户名</label>
          <input required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} style={styles.input} />
          <label style={styles.label}>邮箱</label>
          <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={styles.input} />
          <label style={styles.label}>密码</label>
          <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={styles.input} />
          <label style={styles.label}>确认密码</label>
          <input type="password" required value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} style={styles.input} />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.btn}>注册</button>
        </form>
        <p style={styles.footer}>已有账号？<Link to="/login" style={styles.link}>立即登录</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg },
  card: { background: theme.white, padding: 40, borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', width: 400 },
  title: { margin: '0 0 24px', textAlign: 'center', fontSize: 24, fontWeight: 600, color: theme.primary },
  label: { display: 'block', fontSize: 13, color: theme.textLight, marginBottom: 4, marginTop: 14 },
  input: { width: '100%', padding: '10px 12px', border: `1px solid ${theme.border}`, borderRadius: 4, fontSize: 14, boxSizing: 'border-box' },
  btn: { width: '100%', padding: '12px', background: theme.accent, color: theme.primary, border: 'none', borderRadius: 4, fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 20 },
  error: { color: theme.danger, fontSize: 14, marginTop: 8 },
  footer: { textAlign: 'center', marginTop: 16, color: theme.textMuted, fontSize: 14 },
  link: { color: theme.accent, textDecoration: 'none', fontWeight: 500 },
};
