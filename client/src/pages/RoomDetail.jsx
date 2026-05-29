import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../auth.jsx';

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [booking, setBooking] = useState({ check_in: '', check_out: '', guests: 1 });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/rooms/${id}`).then(({ data }) => setRoom(data));
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setError(''); setMsg('');
    try {
      const { data } = await api.post('/bookings', { room_id: id, ...booking });
      setMsg(`预订成功！共 ${data.nights} 晚，总价 ¥${data.total_price}`);
    } catch (err) {
      setError(err.response?.data?.error || '预订失败');
    }
  };

  if (!room) return <div style={styles.loading}>加载中...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.layout}>
        <div style={styles.main}>
          <div style={styles.imgArea}>
            <span style={styles.typeBadge}>{typeLabel(room.type)}</span>
          </div>
          <h1 style={styles.name}>{room.name}</h1>
          <p style={styles.desc}>{room.description}</p>
          <div style={styles.amenities}>
            <h3>房间设施</h3>
            <div style={styles.amenityGrid}>
              {room.amenities?.split(',').map(a => (
                <span key={a} style={styles.amenity}>{a}</span>
              ))}
            </div>
          </div>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}><span style={styles.infoLabel}>房型</span><span>{typeLabel(room.type)}</span></div>
            <div style={styles.infoItem}><span style={styles.infoLabel}>容纳</span><span>{room.capacity} 人</span></div>
            <div style={styles.infoItem}><span style={styles.infoLabel}>价格</span><span style={styles.priceText}>¥{room.price}/晚</span></div>
            <div style={styles.infoItem}><span style={styles.infoLabel}>状态</span><span style={room.available ? styles.available : styles.unavailable}>{room.available ? '可预订' : '已满'}</span></div>
          </div>
        </div>
        <div style={styles.sidebar}>
          <div style={styles.bookingCard}>
            <h3 style={styles.bookingTitle}>预订此房间</h3>
            <div style={styles.priceBig}>¥{room.price}<small>/晚</small></div>
            <form onSubmit={handleBook}>
              <label style={styles.label}>入住日期</label>
              <input type="date" required value={booking.check_in} onChange={e => setBooking(b => ({ ...b, check_in: e.target.value }))} style={styles.input} min={new Date().toISOString().split('T')[0]} />
              <label style={styles.label}>退房日期</label>
              <input type="date" required value={booking.check_out} onChange={e => setBooking(b => ({ ...b, check_out: e.target.value }))} style={styles.input} min={booking.check_in || new Date().toISOString().split('T')[0]} />
              <label style={styles.label}>入住人数</label>
              <input type="number" min={1} max={room.capacity} value={booking.guests} onChange={e => setBooking(b => ({ ...b, guests: Number(e.target.value) }))} style={styles.input} />
              <button type="submit" style={styles.bookBtn} disabled={!room.available}>
                {room.available ? '立即预订' : '暂不可订'}
              </button>
            </form>
            {msg && <p style={styles.success}>{msg}</p>}
            {error && <p style={styles.error}>{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function typeLabel(type) {
  const map = { standard: '标准', deluxe: '豪华', suite: '套房', presidential: '总统套房', family: '家庭', business: '商务' };
  return map[type] || type;
}

const styles = {
  page: { maxWidth: 1200, margin: '0 auto', padding: '30px 20px' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 30 },
  main: {},
  imgArea: { height: 320, background: 'linear-gradient(135deg, #2c3e50, #3498db)', borderRadius: 8, position: 'relative', marginBottom: 24 },
  typeBadge: { position: 'absolute', top: 12, left: 12, background: '#e6b800', color: '#1a1a2e', padding: '4px 12px', borderRadius: 4, fontWeight: 600, fontSize: 13 },
  name: { fontSize: 28, fontWeight: 700, color: '#1a1a2e', margin: 0 },
  desc: { color: '#666', lineHeight: 1.8, fontSize: 15, margin: '12px 0 24px' },
  amenities: { marginBottom: 24 },
  amenityGrid: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  amenity: { background: '#f0f0f0', padding: '6px 14px', borderRadius: 4, fontSize: 13, color: '#555' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  infoItem: { background: '#f8f9fa', padding: 14, borderRadius: 6 },
  infoLabel: { display: 'block', fontSize: 12, color: '#999', marginBottom: 4 },
  priceText: { color: '#e6b800', fontWeight: 700 },
  available: { color: '#27ae60', fontWeight: 600 },
  unavailable: { color: '#e74c3c', fontWeight: 600 },
  sidebar: {},
  bookingCard: { background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', position: 'sticky', top: 84 },
  bookingTitle: { margin: '0 0 8px', fontSize: 18, fontWeight: 600 },
  priceBig: { fontSize: 32, fontWeight: 700, color: '#e6b800', marginBottom: 20 },
  label: { display: 'block', fontSize: 13, color: '#666', marginBottom: 4, marginTop: 12 },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' },
  bookBtn: { width: '100%', padding: '12px', background: '#e6b800', color: '#1a1a2e', border: 'none', borderRadius: 4, fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 20 },
  success: { color: '#27ae60', marginTop: 12, fontSize: 14 },
  error: { color: '#e74c3c', marginTop: 12, fontSize: 14 },
  loading: { textAlign: 'center', padding: 60, color: '#999' },
};
