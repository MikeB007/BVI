import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RoleBadge } from '../components/Badge';

export default function Crew() {
  const { users, boatById, currentUser } = useApp();
  const [roleFilter, setRoleFilter] = useState('all');
  const canSeeContacts = currentUser && ['admin', 'captain'].includes(currentUser.role);

  const list = users.filter((u) => roleFilter === 'all' || u.role === roleFilter);

  return (
    <div className="page">
      <div className="page-head">
        <h1>Crew & Users</h1>
        <select className="input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="captain">Captain</option>
          <option value="crew">Crew</option>
          <option value="guest">Guest</option>
        </select>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Boat</th>
              <th>Position</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td><RoleBadge role={u.role} /></td>
                <td>{u.boatId ? boatById(u.boatId)?.name : '—'}</td>
                <td>{u.position || '—'}</td>
                <td>
                  {canSeeContacts ? (
                    <span className="small muted">{u.email || u.phone || '—'}</span>
                  ) : (
                    <span className="small muted">Hidden</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

