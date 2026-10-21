# Blue Crew

Boat/catamaran crew management app with passwordless OTP login.

## Twilio SMS setup

This project now sends OTP codes by SMS for phone logins through a backend server.
Email logins still use demo-mode OTP in the UI.

### 1) Configure environment variables

1. Copy [.env.example](./.env.example) to `.env`
2. Fill in real Twilio credentials:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - One of:
     - `TWILIO_FROM_NUMBER` (a Twilio SMS-enabled number), or
     - `TWILIO_MESSAGING_SERVICE_SID` (recommended if you use Twilio Messaging Service)

Do **not** commit `.env`.

### 2) Install dependencies

```bash
npm install
```

### 3) Run backend + frontend

In terminal #1:

```bash
npm run server
```

In terminal #2:

```bash
npm run dev
```

Frontend requests to `/api/*` are proxied to `http://localhost:3001`.

### 4) Verify

- Enter a known phone number from seeded users (for example `+13055550101`) on the login page.
- OTP should arrive via SMS.
- Enter the code to sign in.

## Waitlist behavior

- Guest and crew users can add **one pending waitlist request** for themselves.
- Each request includes **party size** from **1 to 5** (`1` = self only).

If your DB schema already exists, apply this migration before reseeding:

```bash
mysql -h localhost -P 3306 -u kogutc -p finviz_db < sql/alter_sail_waitlist_add_party_size.sql
```
