# SiteHost Deployment Runbook

This runbook records the current production setup for BinRun on SiteHost Cloud Containers.

Do not commit private keys, passwords, full secret values, or raw database URLs to this file.

## Current Production Baseline

- Primary domain: `https://binrun.co.nz`
- Domain alias: `https://www.binrun.co.nz`
- Email mailbox: `admin@binrun.co.nz` through Google Workspace
- App container: SiteHost Nginx + NodeJS24 container
- Runtime: Node.js 24
- Database: SiteHost integrated MySQL
- App path on container: `/container/application/project`
- Public health check: `https://binrun.co.nz/api/health/db`

Known good public health response:

```json
{ "ok": true }
```

## DNS

The domain uses SiteHost nameservers:

- `ns1.sitehost.co.nz`
- `ns2.sitehost.co.nz`
- `ns3.sitehost.co.nz`
- `ns4.sitehost.co.nz`

Website records:

- `binrun.co.nz` resolves to the SiteHost container IP.
- `www.binrun.co.nz` resolves to `binrun.co.nz`.

Container routing:

- Container name / primary website: `binrun.co.nz`
- Container alias: `www.binrun.co.nz`

Email records:

- Google Workspace MX records are configured.
- Google Workspace DKIM is configured.
- SPF should include Google Workspace:

```txt
v=spf1 include:_spf.google.com ~all
```

- DMARC starts in monitoring mode:

```txt
v=DMARC1; p=none; rua=mailto:admin@binrun.co.nz; pct=100
```

## Required Environment Variables

Set production environment variables in SiteHost, not in a committed `.env` file.

Required now:

```txt
NODE_ENV=production
DATABASE_URL=mysql://...
```

Required when auth routes are enabled:

```txt
AUTH_SECRET=...
NEXTAUTH_URL=https://binrun.co.nz
NEXTAUTH_SECRET=...
```

`DATABASE_URL` should use the SiteHost integrated database hostname, database name, username, and URL-encoded password.

Example shape only:

```txt
DATABASE_URL=mysql://DB_USER:URL_ENCODED_DB_PASSWORD@mysql8:3306/DB_NAME
```

Required when payments are implemented:

```txt
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

Required when email/notification features are implemented:

```txt
EMAIL_FROM=admin@binrun.co.nz
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASSWORD=...
```

Local development uses `.env`. The committed `.env.example` contains placeholders only and must not contain real credentials.

Required config behavior:

- Missing `DATABASE_URL` fails clearly before Prisma Client initialization.
- Missing required subsystem vars fail clearly when that subsystem reads config.
- Production placeholder secret values fail validation.
- Secret-like `NEXT_PUBLIC_` names fail validation because public values are bundled into browser JavaScript.
- Server logs may include safe error diagnostics.
- Server logs must not include raw secret values or a full database connection string.

## GitHub Access From SiteHost

The SiteHost container has its own SSH deploy key.

GitHub location:

```txt
Repository settings -> Deploy keys
```

Deploy key settings:

- Title: SiteHost production container
- Write access: off

Test from the SiteHost container:

```bash
ssh -T git@github.com
```

Expected result is successful GitHub authentication with no shell access.

## Manual Deployment

SSH into the SiteHost container, then run:

```bash
cd /container/application/project
git pull
npm ci
npm run deploy:prepare
supervisorctl -c /container/config/supervisord.conf restart nodejs
```

If this is the first clone into an empty container:

```bash
cd /container/application
git clone git@github.com:angelacollings/binrun.git project
cd project
npm ci
npm run deploy:prepare
```

## App Build And Start

Important package scripts:

```bash
npm run deploy:prepare
npm start
```

`npm run deploy:prepare` applies committed Prisma migrations and builds Next.js.

`npm start` starts the Next.js standalone server:

```bash
node .next/standalone/server.js
```

The build also copies `.next/static` into `.next/standalone/.next/static` so the standalone server can serve Next.js assets.

## Supervisor

Supervisor config path:

```txt
/container/config/supervisord.conf
```

Current Node program block:

```ini
[program:nodejs]
environment=HOME=/container/application/project,NODE_ENV=production,PORT=3000,HOSTNAME=0.0.0.0
directory=/container/application/project
command=/bin/bash -lc "npm start"
stdout_logfile=/container/logs/supervisor/%(program_name)s-stdout.log
stderr_logfile=/container/logs/supervisor/%(program_name)s-stderr.log
```

Supervisor commands:

```bash
supervisorctl -c /container/config/supervisord.conf status nodejs
supervisorctl -c /container/config/supervisord.conf restart nodejs
```

Logs:

```bash
tail -n 120 /container/logs/supervisor/nodejs-stderr.log
tail -n 120 /container/logs/supervisor/nodejs-stdout.log
tail -n 120 /container/logs/supervisor/supervisord.log
```

SiteHost also exposes container logs in the control panel. Use the log files above for the fastest SSH diagnosis when deploys fail.

## Verification

Verify from a browser:

```txt
https://binrun.co.nz
https://www.binrun.co.nz
https://binrun.co.nz/api/health/db
```

Verify Supervisor:

```bash
supervisorctl -c /container/config/supervisord.conf status nodejs
```

Known note: `curl http://127.0.0.1:3000` from the SiteHost SSH shell did not work during initial setup, even while the public HTTPS app and DB health endpoint worked. Treat the public HTTPS health check and Supervisor status as the current source of truth unless this is investigated further.

## Rollback

Manual rollback to the previous commit:

```bash
cd /container/application/project
git log --oneline -5
git checkout COMMIT_SHA
npm ci
npm run deploy:prepare
supervisorctl -c /container/config/supervisord.conf restart nodejs
```

After rollback, verify:

```txt
https://binrun.co.nz/api/health/db
```

Return to `main` after the incident is resolved:

```bash
git checkout main
git pull
```
