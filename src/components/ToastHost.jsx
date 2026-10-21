import React from 'react';
import { useApp } from '../context/AppContext';

export default function ToastHost() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="toast-host">
      {toasts.map((t) => (
        <button
          key={t.id}
          className={`toast ${t.kind}`}
          onClick={() => dismissToast(t.id)}
          title="Dismiss"
          type="button"
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}

