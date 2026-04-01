# Dropler - Dropshipping SaaS

Yeah, it's a dropshipping platform. Store owners get a dashboard to manage their stuff. Customers get a storefront to buy things. Backend handles orders, inventory, analytics, the whole shebang.

Built with Next.js 14, PostgreSQL, Prisma. Hosted on Vercel. Pretty standard setup.

---

## What's Been Fixed (April 1, 2026)

-  JWT secrets now actually secret (env var required, crashes if missing)
-  OAuth providers validate credentials before registering
-  Orders validate prices/quantities (no negative garbage)
-  JSON parsing won't crash the app anymore (5 components fixed)
-  Stripe webhook handler created and ready
-  OAuth signup can't leave orphaned records (wrapped in transaction)

See `SECURITY_AUDIT.md` for the full rundown.

---

## What You Gotta Do Next

**Today:**
- [ ] Rotate credentials (see `CREDENTIAL_ROTATION.md`)
- [ ] Test logins work
- [ ] Deploy to production

**This Week (if you got time):**
- [ ] Email service (orders need confirmation emails)
- [ ] Environment validation at startup
- [ ] Rate limiting on auth endpoints
- [ ] Product price/inventory bounds checking
- [ ] URL sanitization (no SSRF attacks)

See `SECURITY_AUDIT.md` for priority breakdown and time estimates.

---

## Tech Stack

- **Framework:** Next.js 14 (React)
- **Database:** PostgreSQL (via Neon) + Prisma ORM
- **Auth:** NextAuth.js (store owners) + JWT (customers)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel

---

## Getting Started (Local Dev)

### 1. Install dependencies
```bash
npm install
```

### 2. Setup database
Get a free PostgreSQL at [neon.tech](https://neon.tech). You'll need two connection strings:
- **Pooled** (for `DATABASE_URL`) — has `?pgbouncer=true`
- **Direct** (for `DIRECT_URL`) — no pgbouncer stuff

### 3. Setup secrets
Copy `.env.example` to `.env.local` and fill in:

```bash
# Database
DATABASE_URL=postgresql://user:pass@neon.tech/db?pgbouncer=true
DIRECT_URL=postgresql://user:pass@neon.tech/db

# Auth
NEXTAUTH_SECRET=<generate one: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))">
NEXTAUTH_URL=http://localhost:3000

# OAuth (optional - only works if you have real keys)
GOOGLE_CLIENT_ID=your-google-oauth-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
FACEBOOK_CLIENT_ID=your-fb-app-id
FACEBOOK_CLIENT_SECRET=your-fb-app-secret

# Email (optional - for sending confirmations)
RESEND_API_KEY=your-resend-key-if-you-want-emails
```

### 4. Setup database
```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Start it
```bash
npm run dev
```

Visit `http://localhost:3000`. Done.

---

## Deploying to Production

### 1. Push to GitHub
```bash
git add .
git commit -m "ready for production"
git push origin main
```

### 2. Create Neon database (if not done)
Go to [neon.tech](https://neon.tech), make a project, grab both connection strings.

### 3. Deploy on Vercel
1. Go [vercel.com](https://vercel.com) → New Project → Connect your GitHub repo
2. Add environment variables:

| Variable | Where To Get It |
|---|---|
| `DATABASE_URL` | Neon pooled connection (with pgbouncer) |
| `DIRECT_URL` | Neon direct connection (no pgbouncer) |
| `NEXTAUTH_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXTAUTH_URL` | Your Vercel domain (e.g., dropler.vercel.app) |
| `GOOGLE_CLIENT_ID` | Google OAuth credentials (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth credentials (optional) |
| `FACEBOOK_CLIENT_ID` | Facebook app ID (optional) |
| `FACEBOOK_CLIENT_SECRET` | Facebook app secret (optional) |

3. Click Deploy. Vercel handles the rest.

### 4. Run migrations on production database
```bash
DATABASE_URL=<your-neon-connection> DIRECT_URL=<your-direct-url> npx prisma migrate deploy
```

### 5. Optional: Seed production data
```bash
DATABASE_URL=<your-neon-connection> DIRECT_URL=<your-direct-url> npx prisma db seed
```

Done. Your app is live.

---

## Important Security Notes

**Never commit `.env` files to git.** They're in `.gitignore` already. Good. Don't change that.

If you accidentally committed secrets (whoops), check `CREDENTIAL_ROTATION.md` on how to rotate them and clean git history.

---

## Project Structure

```
src/
  app/
    api/              — API endpoints
    auth/             — Admin login/register pages
    dashboard/        — Store owner dashboard
    stores/[slug]/    — Customer storefront (public)
  components/
    account/          — Customer account stuff
    auth/             — Login/register forms
    checkout/         — Checkout flow
    dashboard/        — Dashboard UI components
    layout/           — Page layouts and navigation
    support/          — Support ticket UI
    ui/               — Base UI components (buttons, inputs, etc)
  lib/
    auth.ts           — NextAuth setup
    stripe.ts         — Stripe integration (currently unused)
    email.ts          — Email sending (placeholder)
    prisma.ts         — Database client
    utils/            — Helpers (formatting, cart, calculations)
    validations/      — Zod validation schemas
  types/              — TypeScript type definitions
prisma/
  schema.prisma       — Database schema
  seed.ts             — Demo data for testing
  migrations/         — Database version control
```

---

## Features

- **Dashboard** — Store owners manage products, orders, suppliers, categories
- **Orders** — Full lifecycle: pending → shipped → delivered
- **Inventory** — Product stock tracking, low stock alerts
- **Analytics** — Revenue, profit, orders dashboard (with real math)
- **Storefront** — Public-facing store with cart, checkout, customer accounts
- **Support** — Built-in messaging between customers and store owners
- **Customization** — Edit storefront hero, trust badges, SEO stuff
- **Real-time** — Notification bell shows new orders, low stock, new customers

---

## Common Commands

| Command | What It Does |
|---|---|
| `npm run dev` | Start dev server (localhost:3000) |
| `npm run build` | Build for production |
| `npm run lint` | Check code quality |
| `npx prisma studio` | Open database GUI (web-based) |
| `npx prisma migrate dev` | Create new database migration |
| `npx prisma migrate deploy` | Apply migrations on production |
| `npx prisma db seed` | Load demo data |
| `npm test` | Run tests (if you add some) |

**Windows users:** Check `bat/` folder for utility scripts:
- `START.bat` — Starts dev server
- `UTILS.bat` — Database utilities

---

## Troubleshooting

**"NEXTAUTH_SECRET is required"**
- Generate one: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- Add it to `.env.local`

**"DATABASE_URL is not set"**
- You need a Neon account and connection strings
- See setup section above

**Migrations won't run**
- Make sure `DIRECT_URL` is set (not just `DATABASE_URL`)
- Run locally first to test: `npx prisma migrate dev`

**OAuth login isn't working**
- Do you have real OAuth credentials? Check your `.env.local`
- Redirect URIs configured in Google/Facebook console?
- Visit [these setup docs](https://next-auth.js.org/providers/google)

**Email not sending**
- Email service is currently a placeholder
- To fix: Add `RESEND_API_KEY` and implement in `src/lib/email.ts`

---

## What's Different From Standard Next.js

Nothing weird. It's just:
- Multi-tenant (each store gets its own slug URL)
- Dual auth (NextAuth for admins, JWT for customers)
- PostgreSQL for data (Prisma ORM)
- Tailwind for styling

Pretty standard modern stack.

---

## Before You Deploy

Make sure:
- [ ] `.env` file is in `.gitignore` (don't commit secrets)
- [ ] Database migrations have been run
- [ ] You've generated a real `NEXTAUTH_SECRET`
- [ ] OAuth credentials are real (if using them)
- [ ] TypeScript builds: `npm run build`
- [ ] No console.logs left in production code

---

## Status

**Currently:** 6 critical issues fixed, 21 things still on the TODO list.

Check these:
- `SECURITY_AUDIT.md` — What's broken, what's fixed, what's next
- `CREDENTIAL_ROTATION.md` — How to safely rotate secrets
- `TODAY_PROGRESS.md` — Session summary of what got done

**Next priorities:** Email service, environment validation, rate limiting, then launch.

---

## Need Help?

- [Next.js docs](https://nextjs.org/docs)
- [Prisma docs](https://www.prisma.io/docs)
- [NextAuth.js docs](https://next-auth.js.org)
- [Neon docs](https://neon.tech/docs)
- [Vercel docs](https://vercel.com/docs)
