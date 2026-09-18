# ATHR on Windows

## Requirements

Install Node.js 20 or newer, Git, and pnpm. In PowerShell, the easiest pnpm setup is:

```powershell
corepack enable
corepack prepare pnpm@10.4.1 --activate
```

## Install and configure

```powershell
git clone <your-repository-url>
cd athr-digital-solutions
pnpm install
Copy-Item .env.example .env
```

Fill `.env` with the project values supplied by the Manus project environment. Never commit `.env` or paste secrets into frontend code.

```env
DATABASE_URL=mysql://...
JWT_SECRET=use-a-long-random-secret
VITE_APP_ID=...
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im
OWNER_OPEN_ID=...
OWNER_NAME=...

# Resend (preferred when both providers are configured)
RESEND_API_KEY=re_...
RESEND_FROM=ATHR <hello@your-domain.com>
EMAIL_FROM=ATHR <hello@your-domain.com>

# Optional custom SMTP fallback
SMTP_HOST=smtp.your-domain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASSWORD=...
```

The welcome email uses **Resend first** when `RESEND_API_KEY` and `EMAIL_FROM`/`RESEND_FROM` are present. If Resend is not configured, it falls back to the SMTP values. If neither is configured, account creation still works and the user receives the in-app welcome notification.

## Run locally

```powershell
pnpm dev
```

Open `http://localhost:3000`. The Windows-safe scripts use `cross-env`, so no Bash-specific `NODE_ENV=...` syntax is required.

## Validate and build

```powershell
pnpm check
pnpm test
pnpm build
pnpm start
```

## Open the admin dashboard

1. Open the app and choose **Sign in** or **Continue with Google**.
2. Complete OAuth authentication.
3. Open `/admin` after login.
4. The sidebar is filtered by role: `SUPER_ADMIN/ADMIN`, `MANAGER`, `EDITOR`, `FINANCE`, and `SUPPORT` each receive only their permitted sections.

The backend enforces the same permissions; hiding a navigation item is not the security boundary.
