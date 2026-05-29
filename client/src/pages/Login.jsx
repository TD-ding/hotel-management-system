import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(form.username, form.password);
      navigate(data.user.role === 'admin' ? '/admin' : '/profile');
    } catch (err) {
      setError(err.response?.data?.error || '登录失败');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>用户登录</h2>
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>用户名</label>
          <input required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} style={styles.input} />
          <label style={styles.label}>密码</label>
          <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={styles.input} />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.btn}>登录</button>
        </form>
        <p style={styles.footer}>还没有账号？<Link to="/register" style={styles.link}>立即注册</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' },
  card: { background: '#fff', padding: 40, borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', width: 400 },
  title: { margin: '0 0 24px', textAlign: 'center', fontSize: 24, fontWeight: 600, color: '#1a1a2e' },
  label: { display: 'block', fontSize: 13, color: '#666', marginBottom: 4, marginTop: 14 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' },
  btn: { width: '100%', padding: '12px', background: '#e6b800', color: '#1a1a2e', border: 'none', borderRadius: 4, fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 20 },
  error: { color: '#e74c3c', fontSize: 14, marginTop: 8 },
  footer: { textAlign: 'center', marginTop: 16, color: '#999', fontSize: 14 },
  link: { color: '#e6b800', textDecoration: 'none', fontWeight: 500 },
};
