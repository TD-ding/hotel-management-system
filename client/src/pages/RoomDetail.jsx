import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../auth.jsx';
import { useToast } from '../components/Toast.jsx';
import Loading from '../components/Loading.jsx';
import { typeLabel } from '../constants';
import { theme, layout } from '../theme';
import { calcNights, formatDate } from '../utils';

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [room, setRoom] = useState(null);
  const [booking, setBooking] = useState({ check_in: '', check_out: '', guests: 1 });
  const [loading, setLoading] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { m: d.getMonth() + 1, y: d.getFullYear() }; });
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    api.get(`/rooms/${id}`).then(({ data }) => setRoom(data));
    loadReviews();
    loadCalendar();
  }, [id]);

  const loadReviews = () => api.get(`/reviews/room/${id}`).then(({ data }) => setReviews(data));
  const loadCalendar = () => {
    api.get(`/notifications/room/${id}`, { params: { month: calMonth.m, year: calMonth.y } })
      .then(({ data }) => setBookedDates(data.bookedDates || []));
  };
  useEffect(loadCalendar, [calMonth]);

  const nights = calcNights(booking.check_in, booking.check_out);
  const totalPrice = room && nights > 0 ? room.price * nights : 0;

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login', { state: { from: location.pathname } }); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/bookings', { room_id: id, ...booking });
      toast.success(`预订成功！共 ${data.nights} 晚，总价 ¥${data.total_price}`);
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.error || '预订失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', { room_id: id, ...reviewForm });
      toast.success('评价成功');
      setReviewForm({ rating: 5, comment: '' });
      loadReviews();
      api.get(`/rooms/${id}`).then(({ data }) => setRoom(data));
    } catch (err) {
      toast.error(err.response?.data?.error || '评价失败');
    }
  };

  const calPrev = () => {
    setCalMonth(c => c.m === 1 ? { m: 12, y: c.y - 1 } : { m: c.m - 1, y: c.y });
  };
  const calNext = () => {
    setCalMonth(c => c.m === 12 ? { m: 1, y: c.y + 1 } : { m: c.m + 1, y: c.y });
  };

  const renderCalendar = () => {
    const { m, y } = calMonth;
    const firstDay = new Date(y, m - 1, 1).getDay();
    const daysInMonth = new Date(y, m, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    return (
      <div style={styles.calendar}>
        <div style={styles.calHeader}>
          <button onClick={calPrev} style={styles.calNav}>&lt;</button>
          <span style={styles.calTitle}>{y}年{m}月</span>
          <button onClick={calNext} style={styles.calNav}>&gt;</button>
        </div>
        <div style={styles.calGrid}>
          {['日','一','二','三','四','五','六'].map(d => (
            <div key={d} style={styles.calWeekday}>{d}</div>
          ))}
          {days.map((d, i) => {
            if (!d) return <div key={`e${i}`} />;
            const dateStr = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const isBooked = bookedDates.includes(dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            return (
              <div key={d} style={{
                ...styles.calDay,
                background: isBooked ? '#f8d7da' : isToday ? '#fff3cd' : 'transparent',
                color: isBooked ? '#721c24' : theme.text,
                fontWeight: isToday ? 700 : 400,
              }}>
                {d}
              </div>
            );
          })}
        </div>
        <div style={styles.calLegend}>
          <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#f8d7da' }} />已预订</span>
          <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#fff3cd' }} />今天</span>
          <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#d4edda' }} />可预订</span>
        </div>
      </div>
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<span key={i} style={{ color: i <= rating ? '#f5a623' : '#ddd', fontSize: 16 }}>{i <= rating ? '★' : '☆'}</span>);
    }
    return stars;
  };

  if (!room) return <Loading />;

  return (
    <div style={styles.page}>
      <div className="detail-layout" style={styles.layout}>
        <div style={styles.main}>
          <div style={room.image ? { ...styles.imgArea, backgroundImage: `url(${room.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : styles.imgArea}>
            <span style={styles.typeBadge}>{typeLabel(room.type)}</span>
          </div>
          <h1 style={styles.name}>{room.name}</h1>
          {room.avgRating && (
            <div style={styles.ratingRow}>
              {renderStars(Math.round(room.avgRating))}
              <span style={styles.ratingText}>{room.avgRating} 分</span>
              <span style={styles.reviewCount}>({room.reviewCount}条评价)</span>
            </div>
          )}
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

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>预订日历</h3>
            {renderCalendar()}
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>住客评价 {reviews.average && <span style={styles.avgBadge}>{reviews.average} ★</span>}</h3>
            {reviews.reviews?.length === 0 ? (
              <p style={styles.empty}>暂无评价</p>
            ) : (
              <div style={styles.reviewList}>
                {reviews.reviews?.map(r => (
                  <div key={r.id} style={styles.reviewCard}>
                    <div style={styles.reviewHeader}>
                      <span style={styles.reviewUser}>{r.username}</span>
                      <span style={styles.reviewStars}>{renderStars(r.rating)}</span>
                      <span style={styles.reviewTime}>{formatDate(r.created_at)}</span>
                    </div>
                    {r.comment && <p style={styles.reviewComment}>{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
            {user && (
              <form onSubmit={handleReview} style={styles.reviewForm}>
                <label style={styles.label}>评分</label>
                <div style={styles.starInput}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} onClick={() => setReviewForm(f => ({ ...f, rating: s }))} style={{ ...styles.starBtn, color: s <= reviewForm.rating ? '#f5a623' : '#ddd' }}>★</span>
                  ))}
                </div>
                <label style={styles.label}>评价内容</label>
                <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} style={styles.textarea} placeholder="分享您的入住体验..." />
                <button type="submit" style={styles.submitBtn}>提交评价</button>
              </form>
            )}
          </div>
        </div>
        <div className="detail-sidebar" style={styles.sidebar}>
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
              {nights > 0 && (
                <div style={styles.summary}>
                  <span>{nights} 晚</span>
                  <span style={styles.summaryPrice}>¥{totalPrice}</span>
                </div>
              )}
              <button type="submit" style={styles.bookBtn} disabled={!room.available || loading}>
                {loading ? '提交中...' : room.available ? '立即预订' : '暂不可订'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: layout.maxWidth, margin: '0 auto', padding: layout.pagePadding },
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 30 },
  main: {},
  imgArea: { height: 320, background: 'linear-gradient(135deg, #2c3e50, #3498db)', borderRadius: 8, position: 'relative', marginBottom: 24 },
  typeBadge: { position: 'absolute', top: 12, left: 12, background: theme.accent, color: theme.primary, padding: '4px 12px', borderRadius: 4, fontWeight: 600, fontSize: 13 },
  name: { fontSize: 28, fontWeight: 700, color: theme.primary, margin: 0 },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 },
  ratingText: { fontSize: 14, fontWeight: 600, color: '#f5a623' },
  reviewCount: { fontSize: 13, color: theme.textMuted },
  desc: { color: theme.textLight, lineHeight: 1.8, fontSize: 15, margin: '12px 0 24px' },
  amenities: { marginBottom: 24 },
  amenityGrid: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  amenity: { background: '#f0f0f0', padding: '6px 14px', borderRadius: 4, fontSize: 13, color: '#555' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  infoItem: { background: theme.bg, padding: 14, borderRadius: 6 },
  infoLabel: { display: 'block', fontSize: 12, color: theme.textMuted, marginBottom: 4 },
  priceText: { color: theme.accent, fontWeight: 700 },
  available: { color: theme.success, fontWeight: 600 },
  unavailable: { color: theme.danger, fontWeight: 600 },
  sidebar: {},
  bookingCard: { background: theme.white, padding: 24, borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', position: 'sticky', top: 84 },
  bookingTitle: { margin: '0 0 8px', fontSize: 18, fontWeight: 600 },
  priceBig: { fontSize: 32, fontWeight: 700, color: theme.accent, marginBottom: 20 },
  label: { display: 'block', fontSize: 13, color: theme.textLight, marginBottom: 4, marginTop: 12 },
  input: { width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 4, fontSize: 14, boxSizing: 'border-box' },
  summary: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', marginTop: 12, borderTop: `1px solid ${theme.border}`, fontSize: 15 },
  summaryPrice: { color: theme.accent, fontWeight: 700, fontSize: 20 },
  bookBtn: { width: '100%', padding: '12px', background: theme.accent, color: theme.primary, border: 'none', borderRadius: 4, fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 12 },
  section: { marginTop: 32 },
  sectionTitle: { fontSize: 20, fontWeight: 600, color: theme.primary, margin: '0 0 16px' },
  avgBadge: { fontSize: 14, background: '#fff3cd', color: '#856404', padding: '2px 8px', borderRadius: 4, marginLeft: 8 },
  calendar: { background: theme.white, padding: 16, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  calHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  calNav: { background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 14, color: theme.text },
  calTitle: { fontWeight: 600, fontSize: 15, color: theme.primary },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' },
  calWeekday: { fontSize: 12, color: theme.textMuted, padding: '4px 0', fontWeight: 600 },
  calDay: { padding: '6px 2px', borderRadius: 4, fontSize: 13, textAlign: 'center' },
  calLegend: { display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: theme.textLight },
  legendDot: { display: 'inline-block', width: 12, height: 12, borderRadius: 2 },
  empty: { textAlign: 'center', color: theme.textMuted, padding: 24, fontSize: 14 },
  reviewList: { display: 'flex', flexDirection: 'column', gap: 8 },
  reviewCard: { background: theme.white, padding: 14, borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  reviewHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  reviewUser: { fontWeight: 600, fontSize: 14, color: theme.primary },
  reviewStars: { display: 'flex' },
  reviewTime: { fontSize: 12, color: theme.textMuted, marginLeft: 'auto' },
  reviewComment: { fontSize: 14, color: theme.textLight, lineHeight: 1.6, margin: 0 },
  reviewForm: { marginTop: 16, background: theme.white, padding: 20, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  starInput: { display: 'flex', gap: 4 },
  starBtn: { fontSize: 28, cursor: 'pointer', transition: 'color 0.2s' },
  textarea: { width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 4, fontSize: 14, boxSizing: 'border-box', minHeight: 80, marginTop: 4 },
  submitBtn: { marginTop: 12, padding: '8px 20px', background: theme.accent, color: theme.primary, border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
};
