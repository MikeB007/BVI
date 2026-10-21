export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

export function normalizeIdentifier(raw) {
  const value = String(raw || '').trim();
  if (!value) return null;
  if (value.includes('@')) {
    const email = value.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
    return { type: 'email', value: email };
  }
  const digits = value.replace(/[^\d+]/g, '').replace(/^00/, '+');
  if (digits.replace(/[^\d]/g, '').length < 7) return null;
  return { type: 'phone', value: digits };
}

export function generateCode() {
  const buf = new Uint32Array(1);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(buf);
  } else {
    buf[0] = Math.floor(Math.random() * 1e9);
  }
  return String(1000 + (buf[0] % 9000));
}

export function maskDestination(type, value) {
  if (type === 'email') {
    const [left, right] = value.split('@');
    const lead = left.slice(0, 2);
    return `${lead}${'*'.repeat(Math.max(1, left.length - 2))}@${right}`;
  }
  return value.replace(/.(?=.{2})/g, '•');
}

