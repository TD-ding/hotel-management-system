import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useToast } from '../components/Toast.jsx';
import Loading from '../components/Loading.jsx';
import Pagination from '../components/Pagination.jsx';
import { statusLabel, statusBadgeStyle } from '../constants';
import { theme, layout } from '../theme';
import { formatDate } from '../utils';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  const load = () => {
    const params = { page, limit: 15 };
    if (filter) params.status = filter;
    if (search) params.search = search;
    api.get('/bookings', { params }).then(({ data }) => {
      setBookings(data.data || data);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    });
  };
  useEffect(load, [filter, search, page]);

  const handleStatus = async (id, status) => {
    try {
      const statusLabels = {
        confirmed: '预订已确认',
        checked_in: '已办理入住',
        checked_out: '已办理退房',
        cancelled: '预订已取消',
      };
      await api.put(`/bookings/${id}`, { status });
      toast.success(statusLabels[status] || '操作成功');
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

  const handleExport = () => {
    const params = new URLSearchParams();
    if (filter) params.set('status', filter);
    if (search) params.set('search', search);
    const token = localStorage.getItem('token');
    window.open(`/api/export/bookings?${params.toString()}&token=${token}`, '_blank');
  };

  const statusFilters = ['', 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>预订管理</h1>
        <Link to="/admin" style={styles.backBtn}>返回面板</Link>
      </div>
      <div style={styles.toolbar}>
        <div style={styles.filterBar}>
          {statusFilters.map(s => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }} style={filter === s ? styles.activeBtn : styles.filterBtn}>
              {s === '' ? '全部' : statusLabel(s)}
            </button>
          ))}
        </div>
        <div style={styles.toolRight}>
          <input placeholder="搜索用户/房间..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={styles.searchInput} />
          <button onClick={handleExport} style={styles.exportBtn}>导出CSV</button>
        </div>
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
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {b.status === 'pending' && (
                        <button onClick={() => handleStatus(b.id, 'confirmed')} style={styles.confirmBtn}>确认</button>
                      )}
                      {b.status === 'confirmed' && (
                        <button onClick={() => handleStatus(b.id, 'checked_in')} style={styles.checkInBtn}>入住</button>
                      )}
                      {b.status === 'checked_in' && (
                        <button onClick={() => handleStatus(b.id, 'checked_out')} style={styles.checkOutBtn}>退房</button>
                      )}
                      {b.status !== 'cancelled' && b.status !== 'checked_out' && (
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
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
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
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  filterBar: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  toolRight: { display: 'flex', gap: 8, alignItems: 'center' },
  searchInput: { padding: '6px 10px', border: `1px solid ${theme.border}`, borderRadius: 4, width: 200, fontSize: 13 },
  filterBtn: { padding: '6px 14px', border: `1px solid ${theme.border}`, background: theme.white, borderRadius: 4, cursor: 'pointer', fontSize: 13, color: theme.textLight },
  activeBtn: { padding: '6px 14px', border: `1px solid ${theme.accent}`, background: theme.accent, borderRadius: 4, cursor: 'pointer', fontSize: 13, color: theme.primary, fontWeight: 600 },
  exportBtn: { padding: '6px 14px', background: theme.success, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse', background: theme.white, borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  confirmBtn: { padding: '4px 10px', background: theme.success, color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', marginRight: 4, fontSize: 12 },
  checkInBtn: { padding: '4px 10px', background: theme.info, color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', marginRight: 4, fontSize: 12 },
  checkOutBtn: { padding: '4px 10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', marginRight: 4, fontSize: 12 },
  cancelBtn: { padding: '4px 10px', background: theme.warning, color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', marginRight: 4, fontSize: 12 },
  delBtn: { padding: '4px 10px', background: theme.danger, color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 12 },
  empty: { textAlign: 'center', color: theme.textMuted, padding: 40 },
};
