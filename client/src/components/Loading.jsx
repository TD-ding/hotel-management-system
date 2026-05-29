import { theme } from '../theme';

export default function Loading({ text = '加载中...' }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.spinner} />
      <p style={styles.text}>{text}</p>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12 },
  spinner: { width: 32, height: 32, border: `3px solid ${theme.border}`, borderTopColor: theme.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  text: { color: theme.textMuted, fontSize: 14 },
};
