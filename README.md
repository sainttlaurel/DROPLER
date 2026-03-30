# Dropler

A dropshipping SaaS platform built with Next.js 14, Prisma, and PostgreSQL (Neon).

Store owners get a dashboard to manage products, orders, suppliers, categories, and analytics. Each store gets a public-facing storefront where customers can browse, buy, and track orders.

UI/UX design was AI-assisted (layout and component structure), converted and integrated into the system manually.

---

## Stack

- **Framework** — Next.js 14 (App Router)
- **Database** — PostgreSQL via Neon + Prisma ORM
- **Auth** — NextAuth.js (admin) + custom JWT (storefront customers)
- **Styling** — Tailwind CSS (brutalist/neo-brutalist design system)
- **Hosting** — Vercel

---

## Local Development

```bash
npm install
```

Copy `.env.local` and fill in your Neon connection strings and NextAuth secret.

```bash
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Opens at `http://localhost:3000`.

---

## Deploy to Vercel + Neon

### 1. Create a Neon database

Go to [neon.tech](https://neon.tech), create a free project, and grab two connection strings from the dashboard:

- **Pooled connection** (for `DATABASE_URL`) — has `?pgbouncer=true`
- **Direct connection** (for `DIRECT_URL`) — no pgbouncer param

### 2. Run migrations against Neon

Set your local `.env.local` with the Neon URLs, then:

```bash
npx prisma migrate deploy
npx prisma db seed
```

### 3. Push to GitHub

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/yourname/dropler.git
git push -u origin main
```

### 4. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
2. Add these environment variables in the Vercel dashboard:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `DIRECT_URL` | Neon direct connection string |
| `NEXTAUTH_SECRET` | Random 32-char string |
| `NEXTAUTH_URL` | Your Vercel deployment URL |

3. Deploy.

---

## Project Structure

```
src/
  app/
    api/          — API routes
    auth/         — Admin login/register
    dashboard/    — Store owner dashboard
    stores/[slug] — Customer-facing storefront
  components/
    account/      — Customer account UI
    auth/         — Auth forms
    checkout/     — Checkout flow
    dashboard/    — Dashboard components
    layout/       — Shared layouts and nav
    support/      — Support ticket UI
    ui/           — Base UI components
  lib/
    utils/        — Formatting, cart, calculations
    validations/  — Zod schemas
  types/          — TypeScript types
prisma/
  schema.prisma   — Database schema
  seed.ts         — Demo seed data
bat/              — Windows utility scripts
```

---

## Features

- Product management with categories, suppliers, bulk actions
- Order management with status tracking
- Real-time analytics — revenue, profit, orders (cancelled orders excluded)
- Customer storefront with cart, checkout, and account
- Support inbox — customers message the store, owner replies from dashboard
- Appearance editor for storefront hero, trust badges, SEO
- Notification bell with live data (new orders, low stock, new customers)

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npx prisma studio` | Open database GUI |
| `npx prisma migrate dev` | Create and apply a new migration |
| `npx prisma migrate deploy` | Apply migrations (production) |
| `bat/START.bat` | Start dev server (Windows) |
| `bat/UTILS.bat` | Database utilities (Windows) |
