import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Loading from '../components/Loading.jsx';
import Pagination from '../components/Pagination.jsx';
import { typeLabel } from '../constants';
import { theme, layout } from '../theme';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', minPrice: '', maxPrice: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const params = { page, limit: 12 };
    if (filters.type) params.type = filters.type;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    params.available = 1;
    api.get('/rooms', { params }).then(({ data }) => {
      setRooms(data.data || data);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    });
  }, [filters, page]);

  const types = ['all', 'standard', 'deluxe', 'suite', 'presidential', 'family', 'business'];

  const renderStars = (rating) => {
    if (!rating) return null;
    const r = Math.round(rating);
    return <span style={{ color: '#f5a623', fontSize: 12 }}>{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>;
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>客房一览</h1>
        <div style={styles.filterBar}>
          {types.map(t => (
            <button
              key={t}
              onClick={() => { setFilters(f => ({ ...f, type: t === 'all' ? '' : t })); setPage(1); }}
              style={filters.type === (t === 'all' ? '' : t) ? styles.activeFilter : styles.filterBtn}
            >
              {t === 'all' ? '全部' : typeLabel(t)}
            </button>
          ))}
          <input type="number" placeholder="最低价" value={filters.minPrice} onChange={e => { setFilters(f => ({ ...f, minPrice: e.target.value })); setPage(1); }} style={styles.input} />
          <input type="number" placeholder="最高价" value={filters.maxPrice} onChange={e => { setFilters(f => ({ ...f, maxPrice: e.target.value })); setPage(1); }} style={styles.input} />
        </div>
      </div>
      {loading ? <Loading /> : (
        <>
          <div style={styles.grid}>
            {rooms.map(room => (
              <div key={room.id} className="room-card" style={styles.card}>
                <div style={room.image ? { ...styles.cardImg, backgroundImage: `url(${room.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : styles.cardImg}>
                  <span style={styles.badge}>{typeLabel(room.type)}</span>
                  <span style={styles.capacityBadge}>{room.capacity}人</span>
                </div>
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{room.name}</h3>
                  <div style={styles.ratingRow}>
                    {room.avgRating ? (
                      <>{renderStars(Number(room.avgRating))} <span style={styles.ratingText}>{room.avgRating}</span> <span style={styles.reviewCount}>({room.reviewCount})</span></>
                    ) : <span style={styles.noRating}>暂无评价</span>}
                  </div>
                  <p style={styles.desc}>{room.description}</p>
                  <div style={styles.amenities}>
                    {room.amenities?.split(',').slice(0, 4).map(a => (
                      <span key={a} style={styles.amenity}>{a}</span>
                    ))}
                  </div>
                  <div style={styles.footer}>
                    <span style={styles.price}>¥{room.price}<small>/晚</small></span>
                    <Link to={`/rooms/${room.id}`} style={styles.btn}>预订</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {rooms.length === 0 && <p style={styles.empty}>暂无符合条件的房间</p>}
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: layout.maxWidth, margin: '0 auto', padding: layout.pagePadding },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 700, color: theme.primary, margin: '0 0 20px' },
  filterBar: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  filterBtn: { padding: '6px 14px', border: `1px solid ${theme.border}`, background: theme.white, borderRadius: 4, cursor: 'pointer', fontSize: 13, color: theme.textLight },
  activeFilter: { padding: '6px 14px', border: `1px solid ${theme.accent}`, background: theme.accent, borderRadius: 4, cursor: 'pointer', fontSize: 13, color: theme.primary, fontWeight: 600 },
  input: { padding: '6px 10px', border: `1px solid ${theme.border}`, borderRadius: 4, width: 80, fontSize: 13 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 },
  card: { background: theme.white, borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  cardImg: { height: 180, background: 'linear-gradient(135deg, #2c3e50, #3498db)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 12 },
  badge: { background: theme.accent, color: theme.primary, padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 },
  capacityBadge: { background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '4px 10px', borderRadius: 4, fontSize: 12 },
  cardBody: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: 600, margin: '0 0 4px' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 },
  ratingText: { fontSize: 13, fontWeight: 600, color: '#f5a623' },
  reviewCount: { fontSize: 12, color: theme.textMuted },
  noRating: { fontSize: 12, color: theme.textMuted },
  desc: { color: theme.textLight, fontSize: 14, lineHeight: 1.5, margin: '8px 0' },
  amenities: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  amenity: { background: '#f0f0f0', padding: '2px 8px', borderRadius: 3, fontSize: 12, color: '#555' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 22, fontWeight: 700, color: theme.accent },
  btn: { padding: '8px 24px', background: theme.accent, color: theme.primary, borderRadius: 4, textDecoration: 'none', fontWeight: 600, fontSize: 14 },
  empty: { textAlign: 'center', color: theme.textMuted, fontSize: 16, padding: 40 },
};
