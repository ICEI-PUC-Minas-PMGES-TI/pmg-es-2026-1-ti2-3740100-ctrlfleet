import { useEffect, useState } from 'react';

let _addToast = null;

export function toast(message, type = 'success') {
  _addToast?.({ message, type, id: Date.now() });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _addToast = (t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 4000);
    };
    return () => { _addToast = null; };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem',
      display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 9999
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          color: '#fff',
          background: t.type === 'error' ? '#dc2626' : t.type === 'warning' ? '#d97706' : '#16a34a',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxWidth: '320px'
        }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}