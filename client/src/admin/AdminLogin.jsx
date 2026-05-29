import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(form.username, form.password);
      if (data.user.role !== 'admin') { setError('该账号不是管理员'); return; }
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || '登录失败');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>管理员登录</h2>
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>用户名</label>
          <input required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} style={styles.input} />
          <label style={styles.label}>密码</label>
          <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={styles.input} />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.btn}>登录</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e' },
  card: { background: '#fff', padding: 40, borderRadius: 8, width: 400 },
  title: { margin: '0 0 24px', textAlign: 'center', fontSize: 24, fontWeight: 600, color: '#1a1a2e' },
  label: { display: 'block', fontSize: 13, color: '#666', marginBottom: 4, marginTop: 14 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' },
  btn: { width: '100%', padding: '12px', background: '#1a1a2e', color: '#e6b800', border: 'none', borderRadius: 4, fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 20 },
  error: { color: '#e74c3c', fontSize: 14, marginTop: 8 },
};
