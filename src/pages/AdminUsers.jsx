import React, { useMemo, useState } from 'react';
import RequireRole from '../components/RequireRole';
import Modal from '../components/Modal';
import { useApp } from '../context/AppContext';

const emptyUser = {
  id: '',
  name: '',
  role: 'crew',
  email: '',
  phone: '',
  boatId: '',
  position: '',
};

export default function AdminUsers() {
  const {
    users, boats, saveUser, deleteUser,
  } = useApp();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(emptyUser);
  const editableUsers = useMemo(() => users, [users]);

  const onEdit = (user) => {
    setDraft({ ...user });
    setOpen(true);
  };
  const onNew = () => {
    setDraft(emptyUser);
    setOpen(true);
  };
  const submit = (e) => {
    e.preventDefault();
    saveUser(draft);
    setOpen(false);
  };

  return (
    <RequireRole roles={['admin']}>
      <div className="page">
        <div className="page-head">
          <h1>Manage People</h1>
          <button type="button" className="btn btn-primary" onClick={onNew}>Add person</button>
        </div>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Boat</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {editableUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.role}</td>
                  <td>{u.email || '—'}</td>
                  <td>{u.phone || '—'}</td>
                  <td>{u.boatId ? boats.find((b) => b.id === u.boatId)?.name : '—'}</td>
                  <td className="row">
                    <button type="button" className="btn btn-sm" onClick={() => onEdit(u)}>Edit</button>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => deleteUser(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal open={open} title={draft.id ? 'Edit Person' : 'Add Person'} onClose={() => setOpen(false)}>
          <form className="stack" onSubmit={submit}>
            <input className="input" placeholder="Name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            <div className="row">
              <select className="input" value={draft.role} onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}>
                <option value="admin">admin</option>
                <option value="captain">captain</option>
                <option value="crew">crew</option>
                <option value="guest">guest</option>
              </select>
              <input className="input" placeholder="Position" value={draft.position || ''} onChange={(e) => setDraft((d) => ({ ...d, position: e.target.value }))} />
            </div>
            <input className="input" placeholder="Email" value={draft.email || ''} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
            <input className="input" placeholder="Phone" value={draft.phone || ''} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} />
            <select className="input" value={draft.boatId || ''} onChange={(e) => setDraft((d) => ({ ...d, boatId: e.target.value || null }))}>
              <option value="">Unassigned</option>
              {boats.map((b) => <option value={b.id} key={b.id}>{b.name}</option>)}
            </select>
            <div className="row">
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      </div>
    </RequireRole>
  );
}

