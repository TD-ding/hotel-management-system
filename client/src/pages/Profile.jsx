import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../auth.jsx';
import { useToast } from '../components/Toast.jsx';
import Loading from '../components/Loading.jsx';
import { statusLabel, statusBadgeStyle } from '../constants';
import { theme, layout } from '../theme';
import { formatDate } from '../utils';

export default function Profile() {
  const { user, login } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('bookings');
  const [editForm, setEditForm] = useState({ username: user?.username || '', email: user?.email || '' });
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const toast = useToast();

  useEffect(() => {
    api.get('/bookings/my').then(({ data }) => { setBookings(data); setLoading(false); });
  }, []);

  const handleCancel = async (id) => {
    try {
      await api.put(`/bookings/${id}`, { status: 'cancelled' });
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      toast.success('预订已取消');
    } catch (err) {
      toast.error(err.response?.data?.error || '取消失败');
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/users/me', editForm);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('信息更新成功');
    } catch (err) {
      toast.error(err.response?.data?.error || '更新失败');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) { toast.error('两次密码不一致'); return; }
    if (pwForm.new_password.length < 6) { toast.error('新密码至少6位'); return; }
    try {
      await api.put('/users/me/password', { old_password: pwForm.old_password, new_password: pwForm.new_password });
      toast.success('密码修改成功');
      setPwForm({ old_password: '', new_password: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || '密码修改失败');
    }
  };

  if (loading) return <Loading />;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>个人中心</h1>
      <div style={styles.tabs}>
        <button onClick={() => setTab('bookings')} style={tab === 'bookings' ? styles.activeTab : styles.tab}>我的预订</button>
        <button onClick={() => setTab('profile')} style={tab === 'profile' ? styles.activeTab : styles.tab}>修改信息</button>
        <button onClick={() => setTab('password')} style={tab === 'password' ? styles.activeTab : styles.tab}>修改密码</button>
      </div>

      {tab === 'bookings' && (
        bookings.length === 0 ? <p style={styles.empty}>暂无预订记录</p> : (
          <div style={styles.list}>
            {bookings.map(b => (
              <div key={b.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.roomName}>{b.room_name}</h3>
                  <span style={statusBadgeStyle(b.status)}>{statusLabel(b.status)}</span>
                </div>
                <div style={styles.cardBody}>
                  <p>入住：{formatDate(b.check_in)} ~ 退房：{formatDate(b.check_out)}</p>
                  <p>人数：{b.guests}人 | 总价：<strong style={{ color: theme.accent }}>¥{b.total_price}</strong></p>
                </div>
                {b.status !== 'cancelled' && b.status !== 'confirmed' && b.status !== 'checked_in' && b.status !== 'checked_out' && (
                  <button onClick={() => handleCancel(b.id)} style={styles.cancelBtn}>取消预订</button>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'profile' && (
        <form onSubmit={handleEditProfile} style={styles.formCard}>
          <label style={styles.label}>用户名</label>
          <input value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))} style={styles.input} />
          <label style={styles.label}>邮箱</label>
          <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} style={styles.input} />
          <button type="submit" style={styles.saveBtn}>保存修改</button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={handleChangePassword} style={styles.formCard}>
          <label style={styles.label}>旧密码</label>
          <input type="password" required value={pwForm.old_password} onChange={e => setPwForm(f => ({ ...f, old_password: e.target.value }))} style={styles.input} />
          <label style={styles.label}>新密码</label>
          <input type="password" required value={pwForm.new_password} onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} style={styles.input} />
          <label style={styles.label}>确认新密码</label>
          <input type="password" required value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} style={styles.input} />
          <button type="submit" style={styles.saveBtn}>修改密码</button>
        </form>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 800, margin: '0 auto', padding: layout.pagePadding },
  title: { fontSize: 28, fontWeight: 700, color: theme.primary, margin: 0 },
  tabs: { display: 'flex', gap: 8, marginTop: 16, marginBottom: 16 },
  tab: { padding: '8px 20px', border: `1px solid ${theme.border}`, background: theme.white, borderRadius: 4, cursor: 'pointer', fontSize: 14, color: theme.textLight },
  activeTab: { padding: '8px 20px', border: `1px solid ${theme.accent}`, background: theme.accent, borderRadius: 4, cursor: 'pointer', fontSize: 14, color: theme.primary, fontWeight: 600 },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: theme.white, padding: 16, borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  roomName: { margin: 0, fontSize: 16, fontWeight: 600 },
  cardBody: { color: theme.textLight, fontSize: 14, lineHeight: 1.8, marginTop: 8 },
  cancelBtn: { marginTop: 8, padding: '6px 16px', background: theme.white, color: theme.danger, border: `1px solid ${theme.danger}`, borderRadius: 4, cursor: 'pointer', fontSize: 13 },
  empty: { textAlign: 'center', color: theme.textMuted, padding: 40 },
  formCard: { background: theme.white, padding: 24, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  label: { display: 'block', fontSize: 13, color: theme.textLight, marginBottom: 4, marginTop: 14 },
  input: { width: '100%', padding: '10px 12px', border: `1px solid ${theme.border}`, borderRadius: 4, fontSize: 14, boxSizing: 'border-box' },
  saveBtn: { marginTop: 20, padding: '10px 24px', background: theme.accent, color: theme.primary, border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
};
