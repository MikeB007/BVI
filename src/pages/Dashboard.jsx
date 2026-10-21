import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="muted small">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { boats, users, waitlist } = useApp();
  const captains = users.filter((u) => u.role === 'captain').length;
  const crew = users.filter((u) => u.role === 'crew').length;
  const pending = waitlist.filter((w) => w.status === 'pending').length;
  const active = boats.filter((b) => b.status === 'active').length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Blue Crew Dashboard</h1>
          <p className="muted">Read-only public overview</p>
        </div>
      </div>
      <div className="stats-grid">
        <Stat label="Vessels" value={boats.length} />
        <Stat label="Active Vessels" value={active} />
        <Stat label="Captains" value={captains} />
        <Stat label="Crew Members" value={crew} />
        <Stat label="Pending Waitlist" value={pending} />
      </div>
      <div className="card-grid">
        <div className="card">
          <h3>Fleet</h3>
          <p className="muted">View boats and catamarans, captain, and capacity.</p>
          <Link to="/boats" className="link">Open fleet →</Link>
        </div>
        <div className="card">
          <h3>People</h3>
          <p className="muted">See crew makeup and role distribution.</p>
          <Link to="/crew" className="link">Open crew list →</Link>
        </div>
        <div className="card">
          <h3>Waiting List</h3>
          <p className="muted">Public can view current queue.</p>
          <Link to="/waiting-list" className="link">Open waitlist →</Link>
        </div>
      </div>
    </div>
  );
}

