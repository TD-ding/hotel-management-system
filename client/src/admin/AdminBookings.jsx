import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useToast } from '../components/Toast.jsx';
import Loading from '../components/Loading.jsx';
import { statusLabel, statusBadgeStyle } from '../constants';
import { theme, layout } from '../theme';
import { formatDate } from '../utils';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = () => {
    const params = filter ? { status: filter } : {};
    api.get('/bookings', { params }).then(({ data }) => { setBookings(data); setLoading(false); });
  };
  useEffect(load, [filter]);

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      toast.success(status === 'confirmed' ? '预订已确认' : '预订已取消');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定删除此预订？')) return;
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('预订已删除');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || '删除失败');
    }
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
      {loading ? <Loading /> : (
        <>
          <div className="table-wrap">
            <table style={styles.table}>
              <thead><tr><th>ID</th><th>用户</th><th>房间</th><th>入住</th><th>退房</th><th>人数</th><th>金额</th><th>状态</th><th>操作</th></tr></thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>{b.id}</td><td>{b.username}</td><td>{b.room_name}</td>
                    <td>{formatDate(b.check_in)}</td><td>{formatDate(b.check_out)}</td><td>{b.guests}</td>
                    <td style={{ color: theme.accent, fontWeight: 600 }}>¥{b.total_price}</td>
                    <td><span style={statusBadgeStyle(b.status)}>{statusLabel(b.status)}</span></td>
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
          </div>
          {bookings.length === 0 && <p style={styles.empty}>暂无预订记录</p>}
        </>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: layout.maxWidth, margin: '0 auto', padding: layout.pagePadding },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 700, color: theme.primary, margin: 0 },
  backBtn: { color: theme.accent, textDecoration: 'none', fontWeight: 500 },
  filterBar: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterBtn: { padding: '6px 14px', border: `1px solid ${theme.border}`, background: theme.white, borderRadius: 4, cursor: 'pointer', fontSize: 13, color: theme.textLight },
  activeBtn: { padding: '6px 14px', border: `1px solid ${theme.accent}`, background: theme.accent, borderRadius: 4, cursor: 'pointer', fontSize: 13, color: theme.primary, fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse', background: theme.white, borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  confirmBtn: { padding: '4px 10px', background: theme.success, color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', marginRight: 4, fontSize: 12 },
  cancelBtn: { padding: '4px 10px', background: theme.warning, color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', marginRight: 4, fontSize: 12 },
  delBtn: { padding: '4px 10px', background: theme.danger, color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 12 },
  empty: { textAlign: 'center', color: theme.textMuted, padding: 40 },
};
