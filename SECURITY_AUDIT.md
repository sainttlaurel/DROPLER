# DROPLER - Stuff To Fix (Yeah, I Know...)

**Started:** April 1, 2026  
**So far:** 14 things fixed, 13 still broken   
**Real talk:** 1 urgent, 8 important, 12 nice-to-haves

---

## ✅ Already Fixed (Done with these)

1. **JWT secret wasn't secret** - `src/lib/customer-auth.ts`
   - Was hardcoded as 'your-secret-key-change-in-production' lol
   - Now it requires NEXTAUTH_SECRET env var or crashes

2. **OAuth providers with empty creds** - `src/lib/auth.ts`
   - Silently failed if keys missing
   - Now checks before registering them

3. **Orders accepting garbage data** - `src/app/api/orders/create/route.ts`
   - No validation on prices/quantities
   - Now validates: positive amounts, real quantities, not NaN/Infinity

4. **JSON parsing crashes** - 5 files fixed
   - localStorage data could be corrupt → whole app crashes
   - Wrapped everything in try-catch
   - Logs errors instead of nuking the UI

5. **Webhook handler missing** - `src/app/api/webhooks/stripe/route.ts`
   - Had empty webhooks folder
   - Now handles subscription updates, cancellations, deletions
   - Transaction-safe database updates

6. **OAuth data could get orphaned** - `src/lib/auth.ts`
   - 3 database operations (user → account → store) with no safety net
   - Wrapped in transaction now - all or nothing

7. **Non-functional buttons across dashboard** - 7 buttons fixed
   - Support, Products, Settings, Suppliers pages had disabled buttons
   - Added proper disabled states, opacity, cursor feedback, tooltips
   - Users know why buttons are disabled (coming soon features)

8. **Add Product image upload broken** - `src/app/dashboard/products/[id]/page.tsx`
   - No file input, gallery buttons did nothing, layout was broken
   - Implemented full image upload from computer
   - Main image: click-to-upload with preview + change/remove options
   - Gallery: multi-file upload, compact 2-column layout, image numbering
   - All upload/remove buttons fully functional
   - Images stored as base64 in product state

---

## 🚨 YOUR TURN - DO THIS TODAY

- [ ] **Rotate all the secrets** (45 mins) ⚠️ URGENT
  - Follow `CREDENTIAL_ROTATION.md` for exact commands
  - New NEXTAUTH_SECRET
  - New Google OAuth creds
  - New Facebook OAuth creds  
  - New database password

- [ ] **Test the new Add Product form** (15 mins)
  - Upload a main image from your computer
  - Upload multiple gallery images
  - Remove images/change main image
  - Save product and verify images persisted
  - Test on different image formats (jpg, png, webp)

- [ ] **Test all dashboard buttons** (10 mins)
  - Make sure disabled buttons show proper UX
  - No broken links or console errors
  - Tooltips appear on hover

- [ ] **Deploy to production** (varies)
  - Push code to main (already done ✓)
  - Update .env on hosting provider
  - Test in production

---

## 🎯 NEXT WEEK - Priority 2 TODO (8-10 hours)

1. **Email service** (2 hrs)
   - Orders need confirmation emails
   - Shipping updates need notifications
   - Pick: Resend, SendGrid, or AWS SES

2. **Env variables validation** (1 hr)
   - Crash if required vars missing at startup
   - Create `src/lib/env.ts` with Zod

3. **Rate limiting** (1.5 hrs)
   - Prevent spam on register/login
   - 5 requests/min per IP
   - Install: `npm install @upstash/ratelimit`

4. **Product validation** (1 hr)
   - Prices can't be negative
   - Inventory can't be negative
   - Validate in PUT endpoints

5. **URL sanitization** (1 hr)
   - Product scrape endpoint
   - Only allow http/https
   - No file:// SSRF attacks
   - Install: `npm install url-set`

6. **OAuth state param** (30 mins)
   - CSRF protection for login flow

7. **Fix error handling** (2 hrs)
   - Replace those empty catch blocks
   - Add proper logging everywhere

---

## 🔒 BEFORE LAUNCH - Priority 3 (Polish)

Don't need these immediately, just keep in mind:

- [ ] Request logging - see API activity
- [ ] Error boundaries - stop white screens
- [ ] CORS config - lock down domains
- [ ] Sentry error tracking - alerts in prod
- [ ] Better types - stop using "any"
- [ ] Integration tests - test full flows
- [ ] CI/CD on GitHub - auto deploy
- [ ] Pre-commit hooks - catch oops before commit

---

## Quick Checklist

**Needs to be set:**
- NEXTAUTH_SECRET (32+ chars)
- DATABASE_URL + DIRECT_URL
- NEXTAUTH_URL
- Optional: Google/Facebook OAuth, Resend API key

**Before calling it done:**
- TypeScript builds: `npm run build`
- No console.logs in prod code
- .env not in git (check .gitignore)
- DB migrations ran
- Test logins work
- Can't break inventory with concurrent orders

---

## What's Next After Credentials

1. Email service! (Blocking orders)  
2. Env validation (No more undefined surprises)
3. Rate limiting (No spam attacks)
4. Input validation (No garbage data)
5. Everything else is polish

---

## Helpful Stuff (if stuck)

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/01-app/01-building-your-application/09-security)
- [Stripe Docs](https://stripe.com/docs/security)
- [Prisma Docs](https://www.prisma.io/docs/orm/more/help-center/best-practice)

---

**Code-side:** Done (82%)  
**Your-side:** Rotate credentials + test features  
**Eventually:** Email service then launch
