import React, { useState } from 'react';
import RequireRole from '../components/RequireRole';
import { useApp } from '../context/AppContext';

function WaitingListTable({ manage = false }) {
  const {
    waitlist, userById, boatById, currentUser, requestJoinWaitlist, boats, decideWaitlist,
  } = useApp();
  const [boatId, setBoatId] = useState('');
  const [partySize, setPartySize] = useState(1);
  const [note, setNote] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const result = requestJoinWaitlist({
      requestedBoatId: boatId || null,
      note,
      partySize,
    });
    if (!result.ok) {
      setFormMessage(result.reason === 'pending_exists'
        ? 'You already have a pending request.'
        : 'Please sign in first.');
      return;
    }
    setFormMessage('Added to waiting list.');
    setBoatId('');
    setPartySize(1);
    setNote('');
  };

  return (
    <div className="stack">
      {!manage && currentUser && ['crew', 'guest'].includes(currentUser.role) && (
        <form className="card stack" onSubmit={submit}>
          <h3>Join waiting list</h3>
          <p className="muted small">Choose 1 for yourself, or up to 5 total people.</p>
          <select className="input" value={boatId} onChange={(e) => setBoatId(e.target.value)}>
            <option value="">No preference</option>
            {boats.map((b) => <option value={b.id} key={b.id}>{b.name}</option>)}
          </select>
          <label className="field">
            <span>Party size (1-5)</span>
            <select className="input" value={partySize} onChange={(e) => setPartySize(Number(e.target.value))}>
              <option value={1}>1 (myself)</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </label>
          <input className="input" value={note} placeholder="Availability / notes" onChange={(e) => setNote(e.target.value)} />
          <button type="submit" className="btn btn-primary">Join waiting list</button>
          {formMessage && <p className="muted small">{formMessage}</p>}
        </form>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Person</th>
              <th>Party</th>
              <th>Requested Boat</th>
              <th>Status</th>
              <th>Note</th>
              {manage && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {waitlist.map((w) => (
              <tr key={w.id}>
                <td>{userById(w.userId)?.name || 'Unknown'}</td>
                <td>{w.partySize || 1}</td>
                <td>{w.requestedBoatId ? boatById(w.requestedBoatId)?.name : 'No preference'}</td>
                <td className="cap">{w.status}</td>
                <td>{w.note || '—'}</td>
                {manage && (
                  <td className="row">
                    <button className="btn btn-sm" type="button" onClick={() => decideWaitlist(w.id, 'approved', w.requestedBoatId)}>Approve</button>
                    <button className="btn btn-sm btn-ghost" type="button" onClick={() => decideWaitlist(w.id, 'rejected')}>Reject</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function WaitingList() {
  return (
    <div className="page">
      <h1>Waiting List</h1>
      <WaitingListTable />
    </div>
  );
}

export function AssignmentQueue() {
  return (
    <RequireRole roles={['admin', 'captain']}>
      <div className="page">
        <h1>Assignments Approval</h1>
        <WaitingListTable manage />
      </div>
    </RequireRole>
  );
}
