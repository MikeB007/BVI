export async function fetchServerState() {
  try {
    const response = await fetch('/api/state');
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, reason: data.reason || 'state_read_failed' };
    return { ok: true, state: data.state };
  } catch {
    return { ok: false, reason: 'backend_unreachable' };
  }
}

export async function saveServerState(state) {
  try {
    const response = await fetch('/api/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, reason: data.reason || 'state_write_failed' };
    return { ok: true };
  } catch {
    return { ok: false, reason: 'backend_unreachable' };
  }
}

export async function resetServerState() {
  try {
    const response = await fetch('/api/state/reset', { method: 'POST' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, reason: data.reason || 'state_reset_failed' };
    return { ok: true, state: data.state };
  } catch {
    return { ok: false, reason: 'backend_unreachable' };
  }
}

