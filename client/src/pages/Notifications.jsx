import { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../components/Toast.jsx';
import Loading from '../components/Loading.jsx';
import { theme, layout } from '../theme';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = () => {
    api.get('/notifications/my').then(({ data }) => { setNotifications(data); setLoading(false); });
  };
  useEffect(load, []);

  const markRead = async () => {
    await api.put('/notifications/my/read');
    setNotifications(ns => ns.map(n => ({ ...n, read: 1 })));
    toast.success('已全部标记为已读');
  };

  if (loading) return <Loading />;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>消息通知</h1>
        {notifications.some(n => !n.read) && (
          <button onClick={markRead} style={styles.markBtn}>全部已读</button>
        )}
      </div>
      {notifications.length === 0 ? (
        <p style={styles.empty}>暂无通知</p>
      ) : (
        <div style={styles.list}>
          {notifications.map(n => (
            <div key={n.id} style={{ ...styles.card, borderLeft: n.read ? '3px solid #ddd' : `3px solid ${theme.accent}` }}>
              <p style={styles.message}>{n.message}</p>
              <span style={styles.time}>{n.created_at}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 800, margin: '0 auto', padding: layout.pagePadding },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 700, color: theme.primary, margin: 0 },
  markBtn: { padding: '6px 16px', background: theme.accent, color: theme.primary, border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  card: { background: theme.white, padding: 14, borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  message: { fontSize: 14, margin: '0 0 4px', color: theme.text },
  time: { fontSize: 12, color: theme.textMuted },
  empty: { textAlign: 'center', color: theme.textMuted, padding: 40 },
};
