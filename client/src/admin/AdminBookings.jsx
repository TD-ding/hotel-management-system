import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('');

  const load = () => {
    const params = filter ? { status: filter } : {};
    api.get('/bookings', { params }).then(({ data }) => setBookings(data));
  };
  useEffect(load, [filter]);

  const handleStatus = async (id, status) => {
    await api.put(`/bookings/${id}`, { status });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('确定删除此预订？')) return;
    await api.delete(`/bookings/${id}`); load();
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>预订管理</h1>
        <Link to="/admin" style={styles.backBtn}>返回面板</Link>
      </div>
      <div style={styles.filterBar}>
        {['', 'pending', 'confirmed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={filter === s ? styles.activeBtn : styles.filterBtn}>
            {s === '' ? '全部' : statusLabel(s)}
          </button>
        ))}
      </div>
      <table style={styles.table}>
        <thead><tr><th>ID</th><th>用户</th><th>房间</th><th>入住</th><th>退房</th><th>人数</th><th>金额</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td>{b.id}</td><td>{b.username}</td><td>{b.room_name}</td>
              <td>{b.check_in}</td><td>{b.check_out}</td><td>{b.guests}</td>
              <td style={{ color: '#e6b800', fontWeight: 600 }}>¥{b.total_price}</td>
              <td><span style={statusBadge(b.status)}>{statusLabel(b.status)}</span></td>
              <td>
                {b.status === 'pending' && (
                  <button onClick={() => handleStatus(b.id, 'confirmed')} style={styles.confirmBtn}>确认</button>
                )}
                {b.status !== 'cancelled' && (
                  <button onClick={() => handleStatus(b.id, 'cancelled')} style={styles.cancelBtn}>取消</button>
                )}
                <button onClick={() => handleDelete(b.id)} style={styles.delBtn}>删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {bookings.length === 0 && <p style={styles.empty}>暂无预订记录</p>}
    </div>
  );
}

function statusLabel(s) { return { pending: '待确认', confirmed: '已确认', cancelled: '已取消' }[s] || s; }
function statusBadge(s) {
  const base = { padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 };
  if (s === 'confirmed') return { ...base, background: '#d4edda', color: '#155724' };
  if (s === 'cancelled') return { ...base, background: '#f8d7da', color: '#721c24' };
  return { ...base, background: '#fff3cd', color: '#856404' };
}

const styles = {
  page: { maxWidth: 1200, margin: '0 auto', padding: '30px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 700, color: '#1a1a2e', margin: 0 },
  backBtn: { color: '#e6b800', textDecoration: 'none', fontWeight: 500 },
  filterBar: { display: 'flex', gap: 8, marginBottom: 16 },
  filterBtn: { padding: '6px 14px', border: '1px solid #ddd', background: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 13, color: '#666' },
  activeBtn: { padding: '6px 14px', border: '1px solid #e6b800', background: '#e6b800', borderRadius: 4, cursor: 'pointer', fontSize: 13, color: '#1a1a2e', fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  confirmBtn: { padding: '4px 10px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', marginRight: 4, fontSize: 12 },
  cancelBtn: { padding: '4px 10px', background: '#f39c12', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', marginRight: 4, fontSize: 12 },
  delBtn: { padding: '4px 10px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 12 },
  empty: { textAlign: 'center', color: '#999', padding: 40 },
};
