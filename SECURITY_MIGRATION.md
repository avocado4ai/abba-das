# 🔐 Security Migration Guide

**Status:** ⚠️ **URGENT** - Follow these steps immediately

---

## 🚨 What Was Fixed

✅ **Already Done:**
- Removed hardcoded credentials from code
- Added file upload authentication and validation
- Fixed GitHub Actions workflow configuration
- Removed deprecated ESLint configuration
- Fixed React hooks issues
- Removed backup files and unnecessary binaries

⚠️ **Still Required (Your Action):**
- Rotate exposed GitHub token
- Clean git history
- Configure GitHub Secrets for CI/CD
- Update production environment variables

---

## 📋 Step-by-Step Migration

### Step 1: Rotate GitHub Token (CRITICAL)

1. Go to GitHub: https://github.com/settings/tokens
2. Find and delete the token: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx` (your old token)
3. Create a new Personal Access Token with:
   - Scopes: `repo`, `gist`, `read:org`
   - Name: `abba-das-ci`
   - Expiration: 90 days

4. Copy the new token (you'll only see it once)

### Step 2: Remove Secrets from Git History (CRITICAL)

**Option A: Using git-filter-repo (Recommended)**

```bash
# Install git-filter-repo if not already installed
pip install git-filter-repo

# Navigate to your repo
cd /path/to/abba-das

# Remove .env files from history
git filter-repo --invert-paths --path .env --path .env.local

# If you still see push protection, use the GitHub web UI to allow the push
# Visit: https://github.com/avocado4ai/abba-das/security/secret-scanning/unblock-secret/
```

**Option B: Using BFG Repo-Cleaner**

```bash
# Install BFG
brew install bfg  # macOS
# or download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove sensitive files
bfg --delete-files .env
bfg --delete-files .env.local

# Refresh git
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# Force push
git push --force-all origin
```

### Step 3: Configure GitHub Secrets for CI/CD

1. Go to: https://github.com/avocado4ai/abba-das/settings/secrets/actions
2. Create these secrets:
   - `GITHUB_TOKEN` - Your new personal access token from Step 1
   - `GITHUB_OWNER` - `avocado4ai`
   - `GITHUB_REPO` - `abba-das`
   - `AUTH_SECRET` - Generate: `openssl rand -base64 32`

### Step 4: Set Production Environment Variables

On your hosting provider (Vercel, Railway, etc.):

```env
GITHUB_TOKEN=<new_token_from_step_1>
GITHUB_OWNER=avocado4ai
GITHUB_REPO=abba-das
AUTH_AUTHELIA_ID=abba-das
AUTH_AUTHELIA_SECRET=<your_production_secret>
AUTH_AUTHELIA_ISSUER=https://auth.avocado4ai.com
AUTH_SECRET=<your_production_secret>
MINIO_ENDPOINT=https://minio.yourdomain.com
MINIO_ACCESS_KEY=<production_key>
MINIO_SECRET_KEY=<production_key>
MINIO_BUCKET_NAME=abba-das-images
NEXT_PUBLIC_MINIO_URL=https://minio.yourdomain.com
```

### Step 5: Update Local Development Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your local development values:
   ```env
   GITHUB_TOKEN=<your_new_token>
   GITHUB_OWNER=avocado4ai
   GITHUB_REPO=abba-das
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=minioadmin
   MINIO_BUCKET_NAME=abba-das-images
   ```

3. **DO NOT COMMIT** `.env.local`

---

## ✅ Verification Checklist

After completing all steps:

- [ ] GitHub token rotated (old token deleted)
- [ ] Git history cleaned (if you had credentials before)
- [ ] GitHub Secrets configured
- [ ] Production env vars set on hosting platform
- [ ] Local `.env.local` configured
- [ ] CI/CD workflow passes with new secrets
- [ ] Upload functionality works with authentication

---

## 🔒 Security Best Practices Going Forward

1. **Never commit secrets** - Use `.env.local` and `.env.example`
2. **Use pre-commit hooks** to prevent accidents:
   ```bash
   npm install husky lint-staged --save-dev
   npx husky install
   npx husky add .husky/pre-commit "npm run lint"
   ```

3. **Rotate tokens regularly** - Every 90 days
4. **Use GitHub Secrets** for CI/CD, not `.env` files
5. **Review git log** occasionally for accidentally committed secrets
6. **Enable branch protection** - Require reviews before merge

---

## 📞 Need Help?

If you accidentally committed secrets again:

```bash
# Search your entire git history for potential secrets
git log --all --patch --oneline | grep -i "ghp_\|sk_\|secret"

# Or use dedicated tools
npx gitleaks detect --source=local --verbose
```

---

## 📊 What's Changed in This Commit

| Component | Change | Impact |
|-----------|--------|--------|
| Upload API | Added auth + validation | Prevents unauthorized/large uploads |
| S3 Client | Requires explicit env vars | No more hardcoded defaults |
| Admin Page | Fixed React hooks | Better performance, no warnings |
| GitHub Actions | Fixed node-version typo | Node.js 20 now properly configured |
| ESLint | Removed deprecated config | Modern ESLint format |

---

## ⏰ Timeline

- **Now:** Follow Steps 1-5 above
- **Today:** Verify all steps completed
- **Tomorrow:** Monitor CI/CD runs with new secrets
- **Weekly:** Review access logs

---

**Status: Ready for production once Steps 1-5 are completed.**
