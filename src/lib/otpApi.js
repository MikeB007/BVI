export async function sendSmsOtp(phone) {
  try {
    const response = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, reason: data.reason || 'send_failed', message: data.message || '' };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: 'backend_unreachable' };
  }
}

export async function verifySmsOtp(phone, code) {
  try {
    const response = await fetch('/api/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, reason: data.reason || 'verify_failed', message: data.message || '' };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: 'backend_unreachable' };
  }
}
