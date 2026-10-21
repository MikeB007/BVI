import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/Badge';

export default function Boats() {
  const { boats, users, userById } = useApp();
  const [type, setType] = useState('all');
  const [q, setQ] = useState('');

  const filtered = boats.filter((b) => {
    if (type !== 'all' && b.type !== type) return false;
    const hay = `${b.name} ${b.registration} ${b.homePort}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="page">
      <div className="page-head">
        <h1>Fleet</h1>
        <div className="row">
          <input className="input" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All types</option>
            <option value="catamaran">Catamarans</option>
            <option value="boat">Boats</option>
          </select>
        </div>
      </div>

      <div className="card-grid">
        {filtered.map((b) => (
          <Link className="card" key={b.id} to={`/boats/${b.id}`}>
            <div className="between">
              <span>{b.type === 'catamaran' ? '⛵' : '🚤'} {b.name}</span>
              <StatusBadge status={b.status} />
            </div>
            <p className="muted small">{b.type} • {b.registration} • {b.homePort}</p>
            <p className="small">Captain: <strong>{b.captainId ? userById(b.captainId)?.name : 'Unassigned'}</strong></p>
            <p className="muted small">{users.filter((u) => u.boatId === b.id && u.role === 'crew').length} crew assigned</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

