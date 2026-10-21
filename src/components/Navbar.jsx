import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { RoleBadge } from './Badge';

export default function Navbar() {
  const {
    isAuthed, currentUser, logout, resetDemo,
  } = useApp();
  const navigate = useNavigate();
  const isStaff = currentUser && ['admin', 'captain'].includes(currentUser.role);
  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">⛵ Blue Crew</Link>
        <nav className="nav-links">
          <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
          <NavLink to="/boats" className={linkClass}>Fleet</NavLink>
          <NavLink to="/crew" className={linkClass}>Crew</NavLink>
          <NavLink to="/waiting-list" className={linkClass}>Waiting List</NavLink>
          {isStaff && <NavLink to="/assignments" className={linkClass}>Assignments</NavLink>}
          {currentUser?.role === 'admin' && (
            <>
              <NavLink to="/admin/boats" className={linkClass}>Manage Boats</NavLink>
              <NavLink to="/admin/users" className={linkClass}>Manage People</NavLink>
            </>
          )}
        </nav>
        <div className="nav-right">
          {!isAuthed && <Link className="btn btn-primary btn-sm" to="/login">Sign in</Link>}
          {isAuthed && (
            <>
              <span className="muted small">{currentUser.name}</span>
              <RoleBadge role={currentUser.role} />
              {currentUser.role === 'admin' && (
                <button className="btn btn-ghost btn-sm" type="button" onClick={resetDemo}>Reset demo</button>
              )}
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

