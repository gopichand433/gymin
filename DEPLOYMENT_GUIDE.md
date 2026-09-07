# 🚀 GYMIN Full Deployment Guide (GitHub + Vercel + Mobile PWA)

This guide walks you through deploying **GYMIN** to **GitHub** and **Vercel** with full Supabase cloud database connectivity and mobile install capabilities.

---

## 📋 Pre-configured Credentials

Your cloud database is already provisioned on **Supabase**:
* **Supabase Project Ref**: `cjdouitjfabgwlqcwqcl`
* **Region**: `ap-south-1` (Mumbai)
* **Pooled Connection URL (Port 6543)**:
  `postgresql://postgres.cjdouitjfabgwlqcwqcl:24BFA33317CHANDU@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
* **Direct Connection URL (Port 5432)**:
  `postgresql://postgres:24BFA33317CHANDU@db.cjdouitjfabgwlqcwqcl.supabase.co:5432/postgres`
* **JWT Secret**:
  `gymin_ultra_secure_jwt_secret_token_key_2026_fitness`

---

## Part 1: Push Code to GitHub

1. Open your browser and go to [github.com/new](https://github.com/new).
2. Create a new repository:
   * **Repository name**: `gymin`
   * **Visibility**: Public or Private
   * **Do NOT check** "Initialize with README", .gitignore, or license (the project already has them).
   * Click **Create repository**.
3. Copy your repository URL (e.g. `https://github.com/YOUR_USERNAME/gymin.git`).
4. In your terminal inside `C:\Users\chand\.gemini\antigravity\scratch\gymin`, run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/gymin.git
git branch -M main
git push -u origin main
```

*(If you are prompted for credentials, log in with your GitHub Personal Access Token or browser authentication).*

---

## Part 2: Deploy to Vercel (Live Website)

Vercel is the creator and official cloud platform for Next.js. Deploying on Vercel is 100% free and takes less than 2 minutes.

### Method A: Via Vercel Web Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** -> **"Project"**.
3. Under **Import Git Repository**, find your `gymin` repository and click **Import**.
4. In the configuration screen:
   * **Framework Preset**: Next.js (automatically detected)
   * **Root Directory**: `./` (leave default)
   * **Build Command**: `npm run build` (or leave default: `prisma generate && next build`)
5. Open the **Environment Variables** accordion and add these 3 variables:

| Variable Name | Value |
|---|---|
| `DATABASE_URL` | `postgresql://postgres.cjdouitjfabgwlqcwqcl:24BFA33317CHANDU@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres:24BFA33317CHANDU@db.cjdouitjfabgwlqcwqcl.supabase.co:5432/postgres` |
| `JWT_SECRET` | `gymin_ultra_secure_jwt_secret_token_key_2026_fitness` |

6. Click **Deploy**!
7. Within ~60 seconds, your site will be live at `https://gymin-xxxx.vercel.app`.

### Method B: Via Vercel CLI (From your Terminal)

If you prefer terminal deployment:
1. Run:
   ```bash
   npx vercel
   ```
2. Follow the interactive prompts:
   - Log in via browser
   - Set project name to `gymin`
   - Link existing directory
3. Add your environment variables:
   ```bash
   npx vercel env add DATABASE_URL production
   npx vercel env add DIRECT_URL production
   npx vercel env add JWT_SECRET production
   ```
4. Deploy to production:
   ```bash
   npx vercel --prod
   ```

---

## Part 3: Install as a Mobile App (iOS & Android)

GYMIN is configured as a **Progressive Web App (PWA)** with `app/manifest.ts`:

* **On iPhone / iPad (iOS)**:
  1. Open your live Vercel URL in **Safari**.
  2. Tap the **Share** button (box with upward arrow).
  3. Scroll down and tap **"Add to Home Screen"**.
  4. The GYMIN app icon will appear on your phone screen, launching in fullscreen without browser bars.

* **On Android (Google Chrome)**:
  1. Open your live Vercel URL in **Chrome**.
  2. Tap the **three-dot menu** (top right) or the banner **"Add GYMIN to Home Screen"**.
  3. Tap **Install App**.
  4. GYMIN will install as an independent mobile app.
