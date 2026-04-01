# Credential Rotation Guide

## Overview
This guide provides step-by-step instructions to rotate all exposed credentials after being committed to git history.

## CRITICAL: Priority 1 - Generate New NEXTAUTH_SECRET

### For macOS/Linux:
```bash
openssl rand -base64 32
```

### For Windows (PowerShell):
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
```

**Or use Node.js (all platforms):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Then update your `.env` file:
```
NEXTAUTH_SECRET=<your-new-secret-here>
```

---

## Priority 2 - Rotate Google OAuth Credentials

### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **Credentials** → Find your OAuth 2.0 Client IDs
4. Delete the old one or mark it as "Regenerate" (regenerate button varies by project version)
5. Create a new OAuth 2.0 Client (Web application)
   - Authorized JavaScript origins: Your domain + localhost:3000
   - Authorized redirect URIs: 
     - `http://localhost:3000/api/auth/callback/google`
     - `https://yourdomain.com/api/auth/callback/google`
6. Copy new Client ID and Client Secret
7. Update `.env`:
```
GOOGLE_CLIENT_ID=<new-client-id>
GOOGLE_CLIENT_SECRET=<new-client-secret>
```
8. Delete the old credentials from Google Console

---

## Priority 3 - Rotate Facebook App Credentials

### Steps:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app
3. Navigate to **Settings** → **Basic** to find your App ID and App Secret
4. **For App Secret rotation:**
   - Go to **Settings** → **Basic**
   - Click "Show" next to App Secret
   - Click "Regenerate"
   - Confirm the action
5. **Authorize redirect URIs** in Settings:
   - Add `http://localhost:3000/api/auth/callback/facebook` (dev)
   - Add `https://yourdomain.com/api/auth/callback/facebook` (prod)
6. Copy new App ID and App Secret
7. Update `.env`:
```
FACEBOOK_CLIENT_ID=<new-app-id>
FACEBOOK_CLIENT_SECRET=<new-app-secret>
```

---

## Priority 4 - Database Credentials (PostgreSQL)

### If using pgBouncer/managed database:
1. Log into your database provider (Vercel Postgres, Railway, Supabase, etc.)
2. Reset the database password in the provider's console
3. Copy the new connection string
4. Update `.env`:
```
DATABASE_URL=<new-connection-string>
DIRECT_URL=<new-direct-connection-string>
```

### For local PostgreSQL:
```sql
ALTER USER your_user WITH PASSWORD 'new-strong-password';
```

---

## Priority 5 - Clean Git History (Optional but Recommended)

### Option A: Using BFG Repo-Cleaner (Recommended)
```bash
# Install bfg (macOS)
brew install bfg

# Or download from: https://rtyley.github.io/bfg-repo-cleaner/

# Create a file with secrets to remove
echo "sk_test_51SPPjo4DtPVuhqnv*" > secrets.txt
echo "your-hardcoded-secret-key*" >> secrets.txt

# Clean history
bfg --replace-text secrets.txt

# Remove unreferenced objects
git reflog expire --expire=now --all
git gc --prune=now

# Force push clean history
git push --force-with-lease
```

### Option B: Using git filter-branch
```bash
# Backup your repo first!
git clone --mirror https://github.com/yourusername/DROPLER.git DROPLER-backup

# Remove sensitive data
git filter-branch --tree-filter 'rm -f .env' -- --all

# Clean reflog
git reflog expire --expire=now --all

# Force push
git push --force-with-lease
```

**⚠️ WARNING**: Force push requires coordination if working in a team. All team members must re-clone the repository after this operation.

---

## Stripe Webhook Secret (Already Removed - Only Use If Needed)

If Stripe is re-enabled in the future:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/account/webhooks)
2. Create a new webhook endpoint (or regenerate existing)
3. Select events: `customer.subscription.updated`, `customer.subscription.deleted`, `customer.deleted`
4. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
5. Copy the Signing Secret
6. Update `.env`:
```
STRIPE_WEBHOOK_SECRET=<new-signing-secret>
```

---

## Verification Checklist

After rotating all credentials:

- [ ] Generated new NEXTAUTH_SECRET
- [ ] Rotated Google OAuth credentials
- [ ] Rotated Facebook OAuth credentials
- [ ] Updated database credentials
- [ ] Updated `.env` file locally (DO NOT commit)
- [ ] Tested login with Google OAuth
- [ ] Tested login with Facebook OAuth
- [ ] Tested database connection
- [ ] Confirmed `.env` is in `.gitignore`
- [ ] Pushed new code to repository
- [ ] Deployed updated `.env` to production (via hosting provider, not git)
- [ ] Verified production works with new credentials
- [ ] (Optional) Cleaned git history with BFG

---

## Deployment Notes

### Environment Variable Setup by Provider:

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Update all variables for Production, Preview, Development
3. Redeploy project

**Railway:**
1. Go to Variables tab in your Environment
2. Update each variable
3. Deploy new version

**Docker/Self-hosted:**
1. Update `.env` file on server (never commit)
2. Restart containers/services
3. Verify with `echo $NEXTAUTH_SECRET`

---

## Security Best Practices Going Forward

1. **Never commit .env files** - confirmed in `.gitignore`
2. **Use .env.example** as template (already created)
3. **Rotate secrets periodically** (every 3-6 months minimum)
4. **Use different secrets per environment** (dev, staging, production)
5. **Enable 2FA on all provider accounts** (Google, Facebook, Database providers)
6. **Monitor git history** for accidental commits: `git log --all --full-history -- .env`
7. **Tag all deployments** with `git tag deployment-v1.x.x` for traceability

---

## Troubleshooting

**OAuth login fails after rotation:**
- Confirm redirect URIs match in provider settings
- Check `.env` has correct format (no extra spaces)
- Restart application: `npm run dev`
- Check browser console for error messages

**Database connection fails:**
- Test connection string manually: `psql <connection-string>`
- Confirm variables have no trailing spaces
- Check network policies/firewall if using cloud database

**Git force-push fails:**
- Ensure all team members are notified
- Coordinate so no one is pushing at same time
- Confirm you have permission to force-push to main branch
- Test on a branch first if possible
