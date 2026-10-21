import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function RequireRole({ roles, children }) {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(currentUser.role)) {
    return (
      <div className="card">
        <h2>🔒 Not authorised</h2>
        <p className="muted">Allowed roles: {roles.join(', ')}</p>
      </div>
    );
  }

  return children;
}

