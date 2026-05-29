import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { theme, layout } from '../theme';
import api from '../api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user) {
      api.get('/notifications/my/unread').then(({ data }) => setUnread(data.count)).catch(() => {});
      const timer = setInterval(() => {
        api.get('/notifications/my/unread').then(({ data }) => setUnread(data.count)).catch(() => {});
      }, 30000);
      return () => clearInterval(timer);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const close = () => setMenuOpen(false);

  return (
    <nav className="nav-bar">
      <div style={styles.container}>
        <Link to="/" style={styles.logo} onClick={close}>云顶大酒店</Link>
        <button className="nav-hamburger" style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="菜单">
          <span style={{ ...styles.bar, transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ opacity: menuOpen ? 0 : 1, ...styles.bar }} />
          <span style={{ ...styles.bar, transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
        <div className={`nav-links ${menuOpen ? 'nav-links-open' : 'nav-links-closed'}`} style={styles.links}>
          <Link to="/" style={styles.link} onClick={close}>首页</Link>
          <Link to="/rooms" style={styles.link} onClick={close}>客房</Link>
          {user ? (
            <>
              <Link to="/profile" style={styles.link} onClick={close}>个人中心</Link>
              <Link to="/notifications" style={styles.notifLink} onClick={close}>
                通知{unread > 0 && <span style={styles.badge}>{unread > 99 ? '99+' : unread}</span>}
              </Link>
              {user.role === 'admin' && <Link to="/admin" style={styles.link} onClick={close}>管理面板</Link>}
              <span style={styles.user}>{user.username}</span>
              <button onClick={handleLogout} style={styles.btn}>退出</button>
            </>
          ) : (
            <>
              <Link to="/login" state={{ from: location.pathname }} style={styles.link} onClick={close}>登录</Link>
              <Link to="/register" style={{ ...styles.linkBtn, textAlign: 'center' }} onClick={close}>注册</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  container: { maxWidth: layout.maxWidth, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, position: 'relative' },
  logo: { color: theme.accent, fontSize: 22, fontWeight: 700, textDecoration: 'none', letterSpacing: 2 },
  hamburger: { display: 'none', flexDirection: 'column', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 4 },
  bar: { display: 'block', width: 24, height: 2, background: '#ccc', borderRadius: 1, transition: 'all 0.3s' },
  links: { display: 'flex', alignItems: 'center', gap: 20 },
  link: { color: '#ccc', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' },
  notifLink: { color: '#ccc', textDecoration: 'none', fontSize: 14, position: 'relative' },
  badge: { position: 'absolute', top: -8, right: -12, background: theme.danger, color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 8, minWidth: 16, textAlign: 'center' },
  linkBtn: { color: theme.primary, background: theme.accent, padding: '6px 16px', borderRadius: 4, textDecoration: 'none', fontSize: 14, fontWeight: 500 },
  user: { color: theme.accent, fontSize: 14 },
  btn: { background: 'transparent', color: '#ccc', border: '1px solid #555', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 13 },
};
