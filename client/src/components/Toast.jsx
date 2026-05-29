import { useState, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const success = useCallback((msg) => show(msg, 'success'), [show]);
  const error = useCallback((msg) => show(msg, 'error'), [show]);
  const info = useCallback((msg) => show(msg, 'info'), [show]);

  return (
    <ToastContext.Provider value={{ show, success, error, info }}>
      {children}
      <div style={styles.container}>
        {toasts.map(t => (
          <div key={t.id} style={{ ...styles.toast, ...(t.type === 'success' ? styles.success : t.type === 'error' ? styles.error : styles.infoToast) }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = {
  container: { position: 'fixed', top: 80, right: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 },
  toast: { padding: '12px 20px', borderRadius: 6, fontSize: 14, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', animation: 'slideIn 0.3s ease', maxWidth: 360 },
  success: { background: '#d4edda', color: '#155724' },
  error: { background: '#f8d7da', color: '#721c24' },
  infoToast: { background: '#d1ecf1', color: '#0c5460' },
};
