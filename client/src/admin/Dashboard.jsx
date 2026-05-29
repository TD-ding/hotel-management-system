import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/stats').then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <div style={styles.loading}>加载中...</div>;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>管理面板</h1>
      <div style={styles.grid}>
        <StatCard label="总用户" value={stats.totalUsers} icon="👥" color="#3498db" />
        <StatCard label="总房间" value={stats.totalRooms} icon="🏨" color="#2ecc71" />
        <StatCard label="可用房间" value={stats.availableRooms} icon="✅" color="#27ae60" />
        <StatCard label="总预订" value={stats.totalBookings} icon="📋" color="#e67e22" />
        <StatCard label="待确认" value={stats.pendingBookings} icon="⏳" color="#f39c12" />
        <StatCard label="总收入" value={`¥${stats.totalRevenue.toLocaleString()}`} icon="💰" color="#e6b800" />
      </div>

      <div style={styles.row}>
        <div style={styles.half}>
          <h3 style={styles.subTitle}>预订统计</h3>
          <div style={styles.barRow}>
            <Bar label="已确认" value={stats.confirmedBookings} color="#27ae60" />
            <Bar label="待确认" value={stats.pendingBookings} color="#f39c12" />
            <Bar label="已取消" value={stats.cancelledBookings} color="#e74c3c" />
          </div>
        </div>
        <div style={styles.half}>
          <h3 style={styles.subTitle}>房型收入</h3>
          {stats.revenueByType.map(r => (
            <div key={r.type} style={styles.revRow}>
              <span>{typeLabel(r.type)}</span>
              <span style={{ color: '#e6b800', fontWeight: 600 }}>¥{r.revenue.toLocaleString()}</span>
              <span style={{ color: '#999', fontSize: 13 }}>({r.count}单)</span>
            </div>
          ))}
        </div>
      </div>

      <h3 style={styles.subTitle}>最近预订</h3>
      <table style={styles.table}>
        <thead>
          <tr><th>用户</th><th>房间</th><th>入住</th><th>退房</th><th>金额</th><th>状态</th></tr>
        </thead>
        <tbody>
          {stats.recentBookings.map(b => (
            <tr key={b.id}>
              <td>{b.username}</td><td>{b.room_name}</td><td>{b.check_in}</td><td>{b.check_out}</td>
              <td style={{ color: '#e6b800', fontWeight: 600 }}>¥{b.total_price}</td>
              <td><span style={statusBadge(b.status)}>{statusLabel(b.status)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.quickLinks}>
        <Link to="/admin/rooms" style={styles.qlBtn}>管理房间</Link>
        <Link to="/admin/bookings" style={styles.qlBtn}>管理预订</Link>
        <Link to="/admin/users" style={styles.qlBtn}>管理用户</Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}>
      <span style={styles.statIcon}>{icon}</span>
      <div><div style={styles.statValue}>{value}</div><div style={styles.statLabel}>{label}</div></div>
    </div>
  );
}

function Bar({ label, value, color }) {
  return (
    <div style={styles.barItem}>
      <span style={styles.barLabel}>{label}</span>
      <div style={styles.barTrack}><div style={{ ...styles.barFill, width: `${Math.max(value * 10, 4)}%`, background: color }} /></div>
      <span style={styles.barValue}>{value}</span>
    </div>
  );
}

function typeLabel(t) { return { standard: '标准', deluxe: '豪华', suite: '套房', presidential: '总统套房', family: '家庭', business: '商务' }[t] || t; }
function statusLabel(s) { return { pending: '待确认', confirmed: '已确认', cancelled: '已取消' }[s] || s; }
function statusBadge(s) {
  const base = { padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 };
  if (s === 'confirmed') return { ...base, background: '#d4edda', color: '#155724' };
  if (s === 'cancelled') return { ...base, background: '#f8d7da', color: '#721c24' };
  return { ...base, background: '#fff3cd', color: '#856404' };
}

const styles = {
  page: { maxWidth: 1200, margin: '0 auto', padding: '30px 20px' },
  title: { fontSize: 28, fontWeight: 700, color: '#1a1a2e', margin: '0 0 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 30 },
  statCard: { background: '#fff', padding: 16, borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12 },
  statIcon: { fontSize: 28 },
  statValue: { fontSize: 22, fontWeight: 700, color: '#1a1a2e' },
  statLabel: { fontSize: 13, color: '#999' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 },
  half: { background: '#fff', padding: 20, borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  subTitle: { margin: '0 0 16px', fontSize: 18, fontWeight: 600, color: '#1a1a2e' },
  barRow: { display: 'flex', flexDirection: 'column', gap: 10 },
  barItem: { display: 'flex', alignItems: 'center', gap: 8 },
  barLabel: { width: 50, fontSize: 13, color: '#666' },
  barTrack: { flex: 1, height: 20, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4, transition: 'width 0.3s' },
  barValue: { width: 30, fontSize: 13, fontWeight: 600 },
  revRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 },
  'table th': { background: '#f8f9fa' },
  quickLinks: { display: 'flex', gap: 12 },
  qlBtn: { padding: '10px 24px', background: '#1a1a2e', color: '#e6b800', borderRadius: 4, textDecoration: 'none', fontWeight: 600 },
  loading: { textAlign: 'center', padding: 60, color: '#999' },
};
