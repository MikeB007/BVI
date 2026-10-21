import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import twilio from 'twilio';
import {
  ensureSchema, getState, replaceState, resetToSeed, seedIfEmpty,
} from './store.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const fromNumber = process.env.TWILIO_FROM_NUMBER || '';
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID || '';
const twilioEnabled = Boolean(
  accountSid && authToken && (fromNumber || messagingServiceSid),
);
const twilioClient = twilioEnabled ? twilio(accountSid, authToken) : null;

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const otpByPhone = new Map();
let dbReady = false;

function normalizePhone(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;
  const normalized = raw.replace(/[^\d+]/g, '');
  if (!/^\+?[1-9]\d{6,14}$/.test(normalized)) return null;
  return normalized.startsWith('+') ? normalized : `+${normalized}`;
}

function generateCode() {
  return String(1000 + Math.floor(Math.random() * 9000));
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    twilioEnabled,
    dbReady,
  });
});

app.get('/api/state', async (_req, res) => {
  if (!dbReady) return res.status(503).json({ ok: false, reason: 'db_not_ready' });
  try {
    const state = await getState();
    return res.json({ ok: true, state });
  } catch (error) {
    return res.status(500).json({ ok: false, reason: 'db_read_failed', message: error?.message || 'Failed to read DB' });
  }
});

app.put('/api/state', async (req, res) => {
  if (!dbReady) return res.status(503).json({ ok: false, reason: 'db_not_ready' });
  try {
    await replaceState(req.body?.state || {});
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, reason: 'db_write_failed', message: error?.message || 'Failed to write DB' });
  }
});

app.post('/api/state/reset', async (_req, res) => {
  if (!dbReady) return res.status(503).json({ ok: false, reason: 'db_not_ready' });
  try {
    await resetToSeed();
    const state = await getState();
    return res.json({ ok: true, state });
  } catch (error) {
    return res.status(500).json({ ok: false, reason: 'db_reset_failed', message: error?.message || 'Failed to reset DB' });
  }
});

app.post('/api/otp/send', async (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  if (!phone) return res.status(400).json({ ok: false, reason: 'invalid_phone' });
  if (!twilioEnabled) return res.status(503).json({ ok: false, reason: 'twilio_not_configured' });

  const code = generateCode();
  const expiresAt = Date.now() + OTP_TTL_MS;
  otpByPhone.set(phone, { code, expiresAt, attempts: 0 });

  try {
    const messagePayload = {
      to: phone,
      body: `Your Blue Crew verification code is ${code}. It expires in 5 minutes.`,
    };
    if (messagingServiceSid) {
      messagePayload.messagingServiceSid = messagingServiceSid;
    } else {
      messagePayload.from = fromNumber;
    }
    await twilioClient.messages.create(messagePayload);
    return res.json({ ok: true });
  } catch (error) {
    otpByPhone.delete(phone);
    const message = error?.message || 'Twilio send failed';
    return res.status(502).json({ ok: false, reason: 'sms_send_failed', message });
  }
});

app.post('/api/otp/verify', (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  const code = String(req.body?.code || '').trim();

  if (!phone) return res.status(400).json({ ok: false, reason: 'invalid_phone' });
  if (!/^\d{4}$/.test(code)) return res.status(400).json({ ok: false, reason: 'invalid_code' });

  const record = otpByPhone.get(phone);
  if (!record) return res.status(400).json({ ok: false, reason: 'no_pending' });
  if (Date.now() > record.expiresAt) {
    otpByPhone.delete(phone);
    return res.status(400).json({ ok: false, reason: 'expired' });
  }
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    otpByPhone.delete(phone);
    return res.status(400).json({ ok: false, reason: 'locked' });
  }
  if (record.code !== code) {
    record.attempts += 1;
    otpByPhone.set(phone, record);
    return res.status(400).json({ ok: false, reason: 'invalid_code' });
  }

  otpByPhone.delete(phone);
  return res.json({ ok: true });
});

async function start() {
  try {
    await ensureSchema();
    await seedIfEmpty();
    dbReady = true;
    // eslint-disable-next-line no-console
    console.log('MySQL connected and sail_ schema ready');
  } catch (error) {
    dbReady = false;
    // eslint-disable-next-line no-console
    console.error('MySQL initialization failed:', error?.message || error);
  }

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Blue Crew OTP server running on http://localhost:${port}`);
  });
}

start();
