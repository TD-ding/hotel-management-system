import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({ type: '', minPrice: '', maxPrice: '' });

  useEffect(() => {
    const params = {};
    if (filters.type) params.type = filters.type;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    params.available = 1;
    api.get('/rooms', { params }).then(({ data }) => setRooms(data));
  }, [filters]);

  const types = ['all', 'standard', 'deluxe', 'suite', 'presidential', 'family', 'business'];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>客房一览</h1>
        <div style={styles.filterBar}>
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilters(f => ({ ...f, type: t === 'all' ? '' : t }))}
              style={filters.type === (t === 'all' ? '' : t) ? styles.activeFilter : styles.filterBtn}
            >
              {t === 'all' ? '全部' : typeLabel(t)}
            </button>
          ))}
          <input type="number" placeholder="最低价" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} style={styles.input} />
          <input type="number" placeholder="最高价" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} style={styles.input} />
        </div>
      </div>
      <div style={styles.grid}>
        {rooms.map(room => (
          <div key={room.id} style={styles.card}>
            <div style={styles.cardImg}>
              <span style={styles.badge}>{typeLabel(room.type)}</span>
              <span style={styles.capacityBadge}>{room.capacity}人</span>
            </div>
            <div style={styles.cardBody}>
              <h3 style={styles.cardTitle}>{room.name}</h3>
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
    </div>
  );
}

function typeLabel(type) {
  const map = { standard: '标准', deluxe: '豪华', suite: '套房', presidential: '总统套房', family: '家庭', business: '商务' };
  return map[type] || type;
}

const styles = {
  page: { maxWidth: 1200, margin: '0 auto', padding: '30px 20px' },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 700, color: '#1a1a2e', margin: '0 0 20px' },
  filterBar: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  filterBtn: { padding: '6px 14px', border: '1px solid #ddd', background: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 13, color: '#666' },
  activeFilter: { padding: '6px 14px', border: '1px solid #e6b800', background: '#e6b800', borderRadius: 4, cursor: 'pointer', fontSize: 13, color: '#1a1a2e', fontWeight: 600 },
  input: { padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, width: 80, fontSize: 13 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 },
  card: { background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  cardImg: { height: 180, background: 'linear-gradient(135deg, #2c3e50, #3498db)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 12 },
  badge: { background: '#e6b800', color: '#1a1a2e', padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 },
  capacityBadge: { background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '4px 10px', borderRadius: 4, fontSize: 12 },
  cardBody: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: 600, margin: 0 },
  desc: { color: '#666', fontSize: 14, lineHeight: 1.5, margin: '8px 0' },
  amenities: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  amenity: { background: '#f0f0f0', padding: '2px 8px', borderRadius: 3, fontSize: 12, color: '#555' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 22, fontWeight: 700, color: '#e6b800' },
  btn: { padding: '8px 24px', background: '#e6b800', color: '#1a1a2e', borderRadius: 4, textDecoration: 'none', fontWeight: 600, fontSize: 14 },
  empty: { textAlign: 'center', color: '#999', fontSize: 16, padding: 40 },
};