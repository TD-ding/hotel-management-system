import { theme } from '../theme';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div style={styles.wrap}>
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} style={styles.btn}>上一页</button>
      {start > 1 && <><button onClick={() => onChange(1)} style={styles.btn}>1</button>{start > 2 && <span style={styles.dots}>...</span>}</>}
      {pages.map(p => (
        <button key={p} onClick={() => onChange(p)} style={p === page ? styles.active : styles.btn}>{p}</button>
      ))}
      {end < totalPages && <>{end < totalPages - 1 && <span style={styles.dots}>...</span>}<button onClick={() => onChange(totalPages)} style={styles.btn}>{totalPages}</button></>}
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} style={styles.btn}>下一页</button>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' },
  btn: { padding: '4px 10px', border: `1px solid ${theme.border}`, background: theme.white, borderRadius: 4, cursor: 'pointer', fontSize: 13, color: theme.textLight, minWidth: 32 },
  active: { padding: '4px 10px', border: `1px solid ${theme.accent}`, background: theme.accent, borderRadius: 4, cursor: 'pointer', fontSize: 13, color: theme.primary, fontWeight: 600, minWidth: 32 },
  dots: { color: theme.textMuted, fontSize: 13 },
};
