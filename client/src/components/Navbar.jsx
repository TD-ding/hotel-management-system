import { Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { theme, layout } from '../theme';

export default function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>云顶大酒店</Link>
        <div style={styles.links}>
          <Link to="/" style={styles.link}>首页</Link>
          <Link to="/rooms" style={styles.link}>客房</Link>
          {user ? (
            <>
              <Link to="/profile" style={styles.link}>我的预订</Link>
              {user.role === 'admin' && <Link to="/admin" style={styles.link}>管理面板</Link>}
              <span style={styles.user}>{user.username}</span>
              <button onClick={handleLogout} style={styles.btn}>退出</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>登录</Link>
              <Link to="/register" style={styles.linkBtn}>注册</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: { background: theme.primary, padding: '0 20px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 10px rgba(0,0,0,0.3)' },
  container: { maxWidth: layout.maxWidth, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 },
  logo: { color: theme.accent, fontSize: 22, fontWeight: 700, textDecoration: 'none', letterSpacing: 2 },
  links: { display: 'flex', alignItems: 'center', gap: 20 },
  link: { color: '#ccc', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' },
  linkBtn: { color: theme.primary, background: theme.accent, padding: '6px 16px', borderRadius: 4, textDecoration: 'none', fontSize: 14, fontWeight: 500 },
  user: { color: theme.accent, fontSize: 14 },
  btn: { background: 'transparent', color: '#ccc', border: '1px solid #555', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 13 },
};
