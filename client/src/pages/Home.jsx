import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get('/rooms?available=1').then(({ data }) => setFeatured(data.slice(0, 3)));
  }, []);

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.heroOverlay}>
          <h1 style={styles.heroTitle}>云顶大酒店</h1>
          <p style={styles.heroSub}>尊享品质 · 奢华体验</p>
          <Link to="/rooms" style={styles.heroBtn}>浏览客房</Link>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>精选房型</h2>
        <div style={styles.grid}>
          {featured.map(room => (
            <div key={room.id} style={styles.card}>
              <div style={styles.cardImg}>
                <span style={styles.cardType}>{typeLabel(room.type)}</span>
              </div>
              <div style={styles.cardBody}>
                <h3>{room.name}</h3>
                <p style={styles.cardDesc}>{room.description}</p>
                <div style={styles.cardFooter}>
                  <span style={styles.price}>¥{room.price}<small>/晚</small></span>
                  <Link to={`/rooms/${room.id}`} style={styles.cardBtn}>查看详情</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>我们的优势</h2>
        <div style={styles.featureGrid}>
          {[
            { icon: '🏨', title: '豪华客房', desc: '精心设计的舒适空间' },
            { icon: '🍽️', title: '美食餐饮', desc: '中西合璧的味蕾盛宴' },
            { icon: '🏊', title: '休闲设施', desc: '泳池、健身、SPA一应俱全' },
            { icon: '🛎️', title: '贴心服务', desc: '24小时管家式服务' },
          ].map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function typeLabel(type) {
  const map = { standard: '标准', deluxe: '豪华', suite: '套房', presidential: '总统套房', family: '家庭', business: '商务' };
  return map[type] || type;
}

const styles = {
  hero: { height: 500, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  heroOverlay: { textAlign: 'center', color: '#fff' },
  heroTitle: { fontSize: 48, fontWeight: 700, color: '#e6b800', margin: 0, letterSpacing: 6 },
  heroSub: { fontSize: 18, color: '#ccc', marginTop: 12, letterSpacing: 4 },
  heroBtn: { display: 'inline-block', marginTop: 24, padding: '12px 36px', background: '#e6b800', color: '#1a1a2e', borderRadius: 4, textDecoration: 'none', fontWeight: 600, fontSize: 16 },
  section: { maxWidth: 1200, margin: '60px auto', padding: '0 20px' },
  sectionTitle: { textAlign: 'center', fontSize: 28, fontWeight: 600, marginBottom: 40, color: '#1a1a2e' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 },
  card: { background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', transition: 'transform 0.2s', cursor: 'pointer' },
  cardImg: { height: 200, background: 'linear-gradient(135deg, #2c3e50, #3498db)', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 12 },
  cardType: { background: 'rgba(230,184,0,0.9)', color: '#1a1a2e', padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 },
  cardBody: { padding: 20 },
  cardDesc: { color: '#666', fontSize: 14, lineHeight: 1.6, margin: '8px 0 16px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 22, fontWeight: 700, color: '#e6b800' },
  cardBtn: { padding: '8px 20px', border: '1px solid #e6b800', color: '#e6b800', borderRadius: 4, textDecoration: 'none', fontSize: 14, fontWeight: 500 },
  features: { background: '#f8f9fa', padding: '60px 20px' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24, maxWidth: 1200, margin: '0 auto' },
  featureCard: { textAlign: 'center', padding: 30, background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
  featureIcon: { fontSize: 36 },
};
