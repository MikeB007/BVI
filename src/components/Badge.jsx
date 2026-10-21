import React from 'react';

export function RoleBadge({ role }) {
  return <span className={`badge role-${role}`}>{role}</span>;
}

export function StatusBadge({ status }) {
  return <span className={`badge status-${status}`}>{status}</span>;
}

