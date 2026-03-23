# HWL Assistant Widget

A React chat widget that connects to the HWL AI backend.

---

## Prerequisites

- Node.js 18+ (or [Bun](https://bun.sh))
- Access to the HWL backend API URL
- A valid signed JWT (see below)

---

## Install & Run Locally

```bash
# 1. Install dependencies
npm install        # or: bun install

# 2. Create your local env file
cp .env .env.local

# 3. Start the dev server
npm run dev        # or: bun dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | URL of the HWL backend, e.g. `https://helpbot-backend.example.ai/` |
| `VITE_JWT_SECRET` | ✅ | HMAC secret used to sign JWTs (must match the backend) |
| `VITE_DEV_TOKEN` | Dev only | A pre-signed JWT to skip auth during local development |

Set these in `.env.local` (never commit this file):

```env
VITE_API_URL=https://helpbot-backend.example.ai/
VITE_JWT_SECRET=your-secret-here
VITE_DEV_TOKEN=eyJhbGci...   # dev only
```

---

## JWT Authentication

The widget requires a signed JWT to identify the user. There are three ways it picks up a token, in order:

### 1. URL query param (production / host app)

The host application redirects the user to the widget URL with the token appended:

```
https://your-widget-host/?token=eyJhbGci...
```

The widget reads `?token=`, stores it in `sessionStorage`, and strips it from the URL.

### 2. sessionStorage (returning users)

On subsequent page loads within the same browser tab, the widget reuses the token from `sessionStorage` automatically — no redirect needed.

### 3. `VITE_DEV_TOKEN` (local development only)

To avoid needing a host app redirect during development, put a valid JWT in `.env.local`:

```env
VITE_DEV_TOKEN=eyJhbGci...
```

> ⚠️ **Never set `VITE_DEV_TOKEN` in production.** It is only picked up when explicitly defined in your local env file.

### JWT payload shape

The token must be a standard HS256-signed JWT containing at minimum:

```json
{
  "sub": "user-id",
  "name": "Display Name",
  "email": "user@example.com",
  "iat": 1700000000,
  "exp": 1800000000
}
```

`name` or `email` is used as the display name in the sidebar. `sub` is used as the user identifier sent to the backend.
