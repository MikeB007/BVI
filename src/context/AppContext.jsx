import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { seedBoats, seedUsers, seedWaitlist } from '../data/seed';
import { load, save, uid } from '../lib/storage';
import {
  generateCode, normalizeIdentifier, OTP_MAX_ATTEMPTS, OTP_TTL_MS,
} from '../lib/otp';
import { sendSmsOtp, verifySmsOtp } from '../lib/otpApi';
import { fetchServerState, resetServerState, saveServerState } from '../lib/stateApi';

const K = {
  users: 'bc.users',
  boats: 'bc.boats',
  waitlist: 'bc.waitlist',
  session: 'bc.session',
};

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [users, setUsers] = useState(() => load(K.users, seedUsers));
  const [boats, setBoats] = useState(() => load(K.boats, seedBoats));
  const [waitlist, setWaitlist] = useState(() => load(K.waitlist, seedWaitlist));
  const [session, setSession] = useState(() => load(K.session, null));
  const [toasts, setToasts] = useState([]);
  const [pendingOtp, setPendingOtp] = useState(null);
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const skipNextSyncRef = useRef(false);

  useEffect(() => save(K.users, users), [users]);
  useEffect(() => save(K.boats, boats), [boats]);
  useEffect(() => save(K.waitlist, waitlist), [waitlist]);
  useEffect(() => save(K.session, session), [session]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const remote = await fetchServerState();
      if (!cancelled && remote.ok && remote.state) {
        setUsers(Array.isArray(remote.state.users) ? remote.state.users : seedUsers);
        setBoats(Array.isArray(remote.state.boats) ? remote.state.boats : seedBoats);
        setWaitlist(Array.isArray(remote.state.waitlist) ? remote.state.waitlist : seedWaitlist);
        skipNextSyncRef.current = true;
      }
      if (!cancelled) setRemoteLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!remoteLoaded) return;
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }
    saveServerState({ users, boats, waitlist });
  }, [users, boats, waitlist, remoteLoaded]);

  const pushToast = useCallback((message, kind = 'info', ttl = 4000) => {
    const id = uid('t');
    setToasts((prev) => [...prev, { id, kind, message }]);
    if (ttl > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, ttl);
    }
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const userById = useCallback((id) => users.find((u) => u.id === id) || null, [users]);
  const boatById = useCallback((id) => boats.find((b) => b.id === id) || null, [boats]);
  const currentUser = useMemo(() => userById(session?.userId), [session, userById]);
  const isAuthed = Boolean(currentUser);

  const issueOtp = useCallback(async (user, channel) => {
    const destination = channel === 'email' ? user.email : user.phone;
    if (channel === 'phone') {
      const sms = await sendSmsOtp(destination);
      if (!sms.ok) return sms;
      setPendingOtp({
        channel,
        destination,
        userId: user.id,
        remote: true,
      });
      pushToast('SMS code sent', 'otp', 6000);
      return { ok: true, channel, destination };
    }

    const code = generateCode();
    setPendingOtp({
      code,
      channel,
      destination,
      userId: user.id,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
      remote: false,
    });
    pushToast(
      `📧 Email demo code to ${destination}: ${code}`,
      'otp',
      20000,
    );
    return { ok: true, demoCode: code, channel, destination };
  }, [pushToast]);

  const requestOtp = useCallback(async (rawIdentifier) => {
    const norm = normalizeIdentifier(rawIdentifier);
    if (!norm) return { ok: false, reason: 'invalid' };

    const found = users.find((u) => (
      norm.type === 'email'
        ? (u.email || '').toLowerCase() === norm.value
        : (u.phone || '').replace(/[^\d+]/g, '') === norm.value
    ));
    if (!found) return { ok: false, reason: 'not_found' };
    return issueOtp(found, norm.type);
  }, [issueOtp, users]);

  const verifyOtp = useCallback(async (code) => {
    if (!pendingOtp) return { ok: false, reason: 'no_pending' };
    if (pendingOtp.remote) {
      const verified = await verifySmsOtp(pendingOtp.destination, code);
      if (!verified.ok) return verified;
      setSession({ userId: pendingOtp.userId, since: Date.now() });
      setPendingOtp(null);
      return { ok: true };
    }
    if (Date.now() > pendingOtp.expiresAt) {
      setPendingOtp(null);
      return { ok: false, reason: 'expired' };
    }
    if (pendingOtp.attempts >= OTP_MAX_ATTEMPTS) {
      setPendingOtp(null);
      return { ok: false, reason: 'locked' };
    }
    if (String(code).trim() !== pendingOtp.code) {
      setPendingOtp((prev) => ({ ...prev, attempts: prev.attempts + 1 }));
      return { ok: false, reason: 'invalid_code' };
    }

    setSession({ userId: pendingOtp.userId, since: Date.now() });
    setPendingOtp(null);
    return { ok: true };
  }, [pendingOtp]);

  const register = useCallback(async ({
    name, role, email, phone,
  }) => {
    const cleanName = String(name || '').trim();
    if (!cleanName) return { ok: false, reason: 'name_required' };
    if (!email && !phone) return { ok: false, reason: 'contact_required' };

    const user = {
      id: uid('u'),
      name: cleanName,
      role: role === 'crew' ? 'crew' : 'guest',
      email: email || '',
      phone: phone || '',
      boatId: null,
      position: role === 'crew' ? 'Crew' : 'Guest',
      createdAt: Date.now(),
    };
    setUsers((prev) => [...prev, user]);
    return issueOtp(user, user.email ? 'email' : 'phone');
  }, [issueOtp]);

  const logout = useCallback(() => setSession(null), []);

  const saveBoat = useCallback((draft) => {
    const normalized = {
      ...draft,
      name: String(draft.name || '').trim(),
      registration: String(draft.registration || '').trim(),
      homePort: String(draft.homePort || '').trim(),
      capacity: Number(draft.capacity || 0),
      lengthFt: Number(draft.lengthFt || 0),
    };
    setBoats((prev) => {
      if (!normalized.id) {
        const boat = { ...normalized, id: uid('b'), createdAt: Date.now() };
        return [...prev, boat];
      }
      return prev.map((b) => (b.id === normalized.id ? normalized : b));
    });
    setUsers((prev) => prev.map((u) => {
      if (u.id === normalized.captainId) return { ...u, role: 'captain', boatId: normalized.id };
      if (u.role === 'captain' && u.boatId === normalized.id && u.id !== normalized.captainId) {
        return { ...u, role: 'crew', boatId: null };
      }
      return u;
    }));
    pushToast('Boat saved', 'ok');
  }, [pushToast]);

  const deleteBoat = useCallback((id) => {
    setBoats((prev) => prev.filter((b) => b.id !== id));
    setUsers((prev) => prev.map((u) => (u.boatId === id ? { ...u, boatId: null } : u)));
    setWaitlist((prev) => prev.map((w) => (
      w.requestedBoatId === id ? { ...w, requestedBoatId: null } : w
    )));
    pushToast('Boat removed', 'ok');
  }, [pushToast]);

  const saveUser = useCallback((draft) => {
    const normalized = {
      ...draft,
      name: String(draft.name || '').trim(),
      email: String(draft.email || '').trim().toLowerCase(),
      phone: String(draft.phone || '').trim(),
      boatId: draft.boatId || null,
      position: String(draft.position || '').trim(),
    };

    setUsers((prev) => {
      if (!normalized.id) return [...prev, { ...normalized, id: uid('u'), createdAt: Date.now() }];
      return prev.map((u) => (u.id === normalized.id ? normalized : u));
    });
    pushToast('Person saved', 'ok');
  }, [pushToast]);

  const deleteUser = useCallback((id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setWaitlist((prev) => prev.filter((w) => w.userId !== id));
    pushToast('Person removed', 'ok');
  }, [pushToast]);

  const requestJoinWaitlist = useCallback(({ requestedBoatId, note, partySize }) => {
    if (!currentUser) return { ok: false, reason: 'auth' };
    const alreadyPending = waitlist.find((w) => w.userId === currentUser.id && w.status === 'pending');
    if (alreadyPending) return { ok: false, reason: 'pending_exists' };
    const normalizedPartySize = Math.max(1, Math.min(5, Number(partySize || 1)));

    setWaitlist((prev) => [...prev, {
      id: uid('w'),
      userId: currentUser.id,
      requestedBoatId: requestedBoatId || null,
      assignedBoatId: null,
      partySize: normalizedPartySize,
      note: String(note || '').trim(),
      status: 'pending',
      requestedAt: Date.now(),
      decidedBy: null,
      decidedAt: null,
    }]);
    pushToast('Added to waiting list', 'ok');
    return { ok: true };
  }, [currentUser, pushToast, waitlist]);

  const decideWaitlist = useCallback((entryId, decision, assignedBoatId = null) => {
    if (!currentUser || !['admin', 'captain'].includes(currentUser.role)) {
      return { ok: false, reason: 'forbidden' };
    }
    setWaitlist((prev) => prev.map((w) => {
      if (w.id !== entryId) return w;
      return {
        ...w,
        status: decision,
        assignedBoatId: decision === 'approved' ? (assignedBoatId || w.requestedBoatId || null) : null,
        decidedBy: currentUser.id,
        decidedAt: Date.now(),
      };
    }));

    if (decision === 'approved') {
      setWaitlist((prev) => {
        const item = prev.find((w) => w.id === entryId);
        if (!item) return prev;
        const finalBoat = assignedBoatId || item.requestedBoatId;
        if (!finalBoat) return prev;
        setUsers((uPrev) => uPrev.map((u) => (u.id === item.userId ? { ...u, boatId: finalBoat, role: 'crew' } : u)));
        return prev;
      });
    }
    pushToast(`Request ${decision}`, 'ok');
    return { ok: true };
  }, [currentUser, pushToast]);

  const resetDemo = useCallback(async () => {
    const remote = await resetServerState();
    if (remote.ok && remote.state) {
      setUsers(Array.isArray(remote.state.users) ? remote.state.users : seedUsers);
      setBoats(Array.isArray(remote.state.boats) ? remote.state.boats : seedBoats);
      setWaitlist(Array.isArray(remote.state.waitlist) ? remote.state.waitlist : seedWaitlist);
      skipNextSyncRef.current = true;
    } else {
      setUsers(seedUsers);
      setBoats(seedBoats);
      setWaitlist(seedWaitlist);
    }
    setSession(null);
    setPendingOtp(null);
    pushToast('Demo reset complete', 'ok');
  }, [pushToast]);

  const value = {
    users,
    boats,
    waitlist,
    toasts,
    currentUser,
    isAuthed,
    userById,
    boatById,
    dismissToast,
    requestOtp,
    verifyOtp,
    register,
    logout,
    saveBoat,
    deleteBoat,
    saveUser,
    deleteUser,
    requestJoinWaitlist,
    decideWaitlist,
    resetDemo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
