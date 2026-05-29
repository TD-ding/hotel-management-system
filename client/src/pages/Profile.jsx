import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../auth.jsx';
import { statusLabel, statusBadgeStyle } from '../constants';
import { theme, layout } from '../theme';

export default function Profile() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get('/bookings/my').then(({ data }) => setBookings(data));
  }, []);

  const handleCancel = async (id) => {
    try {
      await api.put(`/bookings/${id}`, { status: 'cancelled' });
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch {}
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>我的预订</h1>
      <div style={styles.info}>
        <p><strong>{user?.username}</strong> | {user?.email}</p>
      </div>
      {bookings.length === 0 ? (
        <p style={styles.empty}>暂无预订记录</p>
      ) : (
        <div style={styles.list}>
          {bookings.map(b => (
            <div key={b.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.roomName}>{b.room_name}</h3>
                <span style={statusBadgeStyle(b.status)}>{statusLabel(b.status)}</span>
              </div>
              <div style={styles.cardBody}>
                <p>入住：{b.check_in} ~ 退房：{b.check_out}</p>
                <p>人数：{b.guests}人 | 总价：<strong style={{ color: theme.accent }}>¥{b.total_price}</strong></p>
              </div>
              {b.status !== 'cancelled' && b.status !== 'confirmed' && (
                <button onClick={() => handleCancel(b.id)} style={styles.cancelBtn}>取消预订</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 800, margin: '0 auto', padding: layout.pagePadding },
  title: { fontSize: 28, fontWeight: 700, color: theme.primary, margin: 0 },
  info: { background: theme.white, padding: 16, borderRadius: 6, marginTop: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  list: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 },
  card: { background: theme.white, padding: 16, borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  roomName: { margin: 0, fontSize: 16, fontWeight: 600 },
  cardBody: { color: theme.textLight, fontSize: 14, lineHeight: 1.8, marginTop: 8 },
  cancelBtn: { marginTop: 8, padding: '6px 16px', background: theme.white, color: theme.danger, border: `1px solid ${theme.danger}`, borderRadius: 4, cursor: 'pointer', fontSize: 13 },
  empty: { textAlign: 'center', color: theme.textMuted, padding: 40 },
};
