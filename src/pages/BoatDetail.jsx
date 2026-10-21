import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { RoleBadge, StatusBadge } from '../components/Badge';

export default function BoatDetail() {
  const { id } = useParams();
  const {
    boatById, userById, users, currentUser,
  } = useApp();
  const boat = boatById(id);

  if (!boat) return <div className="card">Vessel not found.</div>;

  const captain = boat.captainId ? userById(boat.captainId) : null;
  const crew = users.filter((u) => u.boatId === boat.id && u.role === 'crew');

  return (
    <div className="page">
      <Link to="/boats" className="link">← Back to fleet</Link>
      <div className="page-head">
        <div>
          <h1>{boat.type === 'catamaran' ? '⛵' : '🚤'} {boat.name}</h1>
          <p className="muted">{boat.registration} • {boat.homePort}</p>
        </div>
        {currentUser?.role === 'admin' && <Link className="btn btn-ghost" to="/admin/boats">Edit in admin</Link>}
      </div>
      <div className="two-col">
        <section className="card">
          <h3>Vessel</h3>
          <p><strong>Type:</strong> {boat.type}</p>
          <p><strong>Capacity:</strong> {boat.capacity}</p>
          <p><strong>Length:</strong> {boat.lengthFt || '—'} ft</p>
          <p><strong>Status:</strong> <StatusBadge status={boat.status} /></p>
        </section>
        <section className="card">
          <h3>Captain</h3>
          {captain ? (
            <p>{captain.name} <RoleBadge role={captain.role} /></p>
          ) : <p className="muted">No captain assigned</p>}
          <h3>Crew ({crew.length})</h3>
          <ul>
            {crew.map((c) => <li key={c.id}>{c.name} <span className="muted">({c.position || 'Crew'})</span></li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}

