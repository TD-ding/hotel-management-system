import { Link } from 'react-router-dom';
import { theme } from '../theme';

export default function NotFound() {
  return (
    <div style={styles.page}>
      <h1 style={styles.code}>404</h1>
      <p style={styles.msg}>页面不存在</p>
      <Link to="/" style={styles.btn}>返回首页</Link>
    </div>
  );
}

const styles = {
  page: { minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 },
  code: { fontSize: 96, fontWeight: 700, color: theme.primary, margin: 0 },
  msg: { fontSize: 20, color: theme.textMuted },
  btn: { padding: '10px 28px', background: theme.accent, color: theme.primary, borderRadius: 4, textDecoration: 'none', fontWeight: 600, fontSize: 14, marginTop: 12 },
};
