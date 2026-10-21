import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { maskDestination, normalizeIdentifier } from '../lib/otp';

const ERR = {
  invalid: 'Enter a valid email or phone number.',
  invalid_code: 'Incorrect code.',
  expired: 'Code expired. Request a new one.',
  locked: 'Too many attempts. Request a new code.',
  no_pending: 'Request a code first.',
  name_required: 'Please provide your name.',
  contact_required: 'Contact is required.',
  twilio_not_configured: 'SMS service is not configured on the server.',
  sms_send_failed: 'Failed to send SMS code. Please try again.',
  send_failed: 'Failed to send code. Please try again.',
  verify_failed: 'Unable to verify code right now.',
  backend_unreachable: 'OTP server is not running. Start backend with: npm run server',
};

export default function Login() {
  const {
    requestOtp, verifyOtp, register, isAuthed, currentUser,
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';
  const [step, setStep] = useState('identify');
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState('crew');
  const [dest, setDest] = useState(null);
  const [demoCode, setDemoCode] = useState('');
  const [error, setError] = useState('');

  if (isAuthed) {
    return (
      <div className="card narrow">
        <h2>Already signed in</h2>
        <p className="muted">You are signed in as {currentUser.name}.</p>
        <Link to="/" className="btn btn-primary">Go to dashboard</Link>
      </div>
    );
  }

  const handleIdentify = async (e) => {
    e.preventDefault();
    setError('');
    const response = await requestOtp(identifier);
    if (!response.ok) {
      if (response.reason === 'not_found') {
        setStep('register');
        return;
      }
      setError(response.message || ERR[response.reason] || 'Unable to request code.');
      return;
    }
    setDest({ type: response.channel, value: response.destination });
    setDemoCode(response.demoCode || '');
    setStep('code');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    const norm = normalizeIdentifier(identifier);
    const response = await register({
      name: regName,
      role: regRole,
      email: norm?.type === 'email' ? norm.value : '',
      phone: norm?.type === 'phone' ? norm.value : '',
    });
    if (!response.ok) {
      setError(response.message || ERR[response.reason] || 'Unable to register.');
      return;
    }
    setDest({ type: response.channel, value: response.destination });
    setDemoCode(response.demoCode || '');
    setStep('code');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    const response = await verifyOtp(code);
    if (!response.ok) {
      setError(response.message || ERR[response.reason] || 'Unable to verify.');
      return;
    }
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="card narrow auth">
      <h1>Sign in</h1>
      <p className="muted">Passwordless login with a 4-digit code.</p>

      {step === 'identify' && (
        <form className="stack" onSubmit={handleIdentify}>
          <label className="field">
            <span>Email or phone</span>
            <input
              className="input"
              autoFocus
              placeholder="you@example.com or +13055550123"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" type="submit">Send code</button>
        </form>
      )}

      {step === 'register' && (
        <form className="stack" onSubmit={handleRegister}>
          <p className="notice">No account found for <strong>{identifier}</strong>.</p>
          <label className="field">
            <span>Full name</span>
            <input className="input" value={regName} onChange={(e) => setRegName(e.target.value)} />
          </label>
          <label className="field">
            <span>Join as</span>
            <select className="input" value={regRole} onChange={(e) => setRegRole(e.target.value)}>
              <option value="crew">Crew</option>
              <option value="guest">Guest</option>
            </select>
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" type="submit">Create account + send code</button>
          <button className="btn btn-ghost" type="button" onClick={() => setStep('identify')}>Back</button>
        </form>
      )}

      {step === 'code' && (
        <form className="stack" onSubmit={handleVerify}>
          <p className="notice">
            Code sent to <strong>{maskDestination(dest.type, dest.value)}</strong>.
          </p>
          <label className="field">
            <span>4-digit code</span>
            <input
              className="input"
              autoFocus
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, ''))}
            />
          </label>
          {demoCode && <p className="muted small">Demo code: <strong>{demoCode}</strong></p>}
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" type="submit">Verify</button>
          <button className="btn btn-ghost" type="button" onClick={() => setStep('identify')}>Start over</button>
        </form>
      )}
    </div>
  );
}
