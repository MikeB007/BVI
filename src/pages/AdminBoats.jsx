import React, { useMemo, useState } from 'react';
import RequireRole from '../components/RequireRole';
import Modal from '../components/Modal';
import { useApp } from '../context/AppContext';

const empty = {
  id: '',
  name: '',
  type: 'catamaran',
  registration: '',
  capacity: 6,
  homePort: '',
  status: 'active',
  captainId: '',
  lengthFt: 30,
};

export default function AdminBoats() {
  const {
    boats, users, saveBoat, deleteBoat,
  } = useApp();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(empty);
  const captains = useMemo(() => users.filter((u) => ['captain', 'crew'].includes(u.role)), [users]);

  const onEdit = (boat) => {
    setDraft({ ...boat });
    setOpen(true);
  };
  const onNew = () => {
    setDraft(empty);
    setOpen(true);
  };
  const submit = (e) => {
    e.preventDefault();
    saveBoat(draft);
    setOpen(false);
  };

  return (
    <RequireRole roles={['admin']}>
      <div className="page">
        <div className="page-head">
          <h1>Manage Boats</h1>
          <button className="btn btn-primary" type="button" onClick={onNew}>Add boat</button>
        </div>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Reg</th>
                <th>Port</th>
                <th>Captain</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {boats.map((b) => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td>{b.type}</td>
                  <td>{b.registration}</td>
                  <td>{b.homePort}</td>
                  <td>{users.find((u) => u.id === b.captainId)?.name || 'Unassigned'}</td>
                  <td className="row">
                    <button className="btn btn-sm" type="button" onClick={() => onEdit(b)}>Edit</button>
                    <button className="btn btn-sm btn-ghost" type="button" onClick={() => deleteBoat(b.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Modal open={open} title={draft.id ? 'Edit Boat' : 'Add Boat'} onClose={() => setOpen(false)}>
          <form className="stack" onSubmit={submit}>
            <input className="input" placeholder="Name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            <div className="row">
              <select className="input" value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}>
                <option value="catamaran">Catamaran</option>
                <option value="boat">Boat</option>
              </select>
              <input className="input" placeholder="Registration" value={draft.registration} onChange={(e) => setDraft((d) => ({ ...d, registration: e.target.value }))} />
            </div>
            <div className="row">
              <input className="input" placeholder="Home port" value={draft.homePort} onChange={(e) => setDraft((d) => ({ ...d, homePort: e.target.value }))} />
              <input className="input" type="number" min="1" placeholder="Capacity" value={draft.capacity} onChange={(e) => setDraft((d) => ({ ...d, capacity: Number(e.target.value) }))} />
            </div>
            <div className="row">
              <input className="input" type="number" min="1" placeholder="Length ft" value={draft.lengthFt} onChange={(e) => setDraft((d) => ({ ...d, lengthFt: Number(e.target.value) }))} />
              <select className="input" value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}>
                <option value="active">active</option>
                <option value="maintenance">maintenance</option>
              </select>
            </div>
            <select className="input" value={draft.captainId || ''} onChange={(e) => setDraft((d) => ({ ...d, captainId: e.target.value || null }))}>
              <option value="">No captain</option>
              {captains.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="row">
              <button className="btn btn-primary" type="submit">Save</button>
              <button className="btn btn-ghost" type="button" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      </div>
    </RequireRole>
  );
}

