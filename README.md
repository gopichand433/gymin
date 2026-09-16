# GYMIN — All-in-One Personal Fitness Companion ⚡

GYMIN is a production-grade personal fitness companion application that answers:
> **"What should I do today, what should I eat, and am I actually progressing?"**

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, Prisma ORM, and Supabase PostgreSQL.

---

## 🚀 Features

- **Personalized Onboarding**: 7-step onboarding calculating BMR, TDEE, Calorie targets, and automatic workout splits.
- **Active Workout Tracking**: Real-time workout duration timer, set-by-set tracker with previous session benchmarks, rest timer with alerts, and volume analytics.
- **Exercise Demonstrations**: 55+ exercises with animated vector demonstrations, muscle highlights, and step-by-step cues.
- **Nutrition & Food Database**: 110+ foods with 42 calibrated Indian dishes, dynamic serving converter (bowl, cup, piece, g), and macro breakdowns.
- **Progress Analytics & PR Hall of Fame**: Longitudinal charts for body weight, measurements, volume progression, and 1RM tracking.
- **GYMIN AI Personal Agent**: Powered by **Google Gemini (Gemini 2.5 Flash)** or **OpenAI ChatGPT (GPT-4o)** with grounded real-time database context (daily calories, remaining macros, workout splits, steps, streaks, and PRs) with interactive UI cards.
- **Gamification**: Badges, consistency streaks, and celebration confetti.

---

## 🤖 AI Personal Agent Setup (Gemini & ChatGPT)

GYMIN includes a context-grounded AI fitness companion that you can power with **Google Gemini** or **OpenAI ChatGPT**:

### 1. Google Gemini (Recommended - Free Tier Available)
1. Get a free API key at: **[https://aistudio.google.com](https://aistudio.google.com)**
2. Set in your `.env` or Vercel Environment Variables:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   ```

### 2. OpenAI ChatGPT (Alternative)
1. Get an API key at: **[https://platform.openai.com](https://platform.openai.com)**
2. Set in your `.env` or Vercel Environment Variables:
   ```env
   OPENAI_API_KEY="sk-proj-..."
   ```

### 3. Provider Switching
By default (`AI_PROVIDER="auto"`), GYMIN automatically detects which key you provide. You can explicitly set:
```env
AI_PROVIDER="gemini"   # or "openai"
```
*Note: If no API key is provided, GYMIN uses its built-in zero-config grounded analytical engine, ensuring full functionality without external API dependencies.*

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) & React 18
- **Language**: TypeScript
- **Styling**: Luxury Gold & Obsidian Black (Tailwind CSS & Lucide Icons)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 5.22
- **Data Visualization**: Recharts
- **Animations**: Framer Motion & Canvas Confetti
- **AI Agent**: Google GenAI SDK (`@google/genai`) & OpenAI API

---

## 🌐 Cloud Deployment Guide (Vercel & GitHub)

Your repository is connected and ready at **[https://github.com/gopichand433/gymin](https://github.com/gopichand433/gymin)**.

### Deploy to Vercel (1-Click Setup)

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub (`gopichand433`).
2. Click **"Add New..."** → **"Project"** and select **`gymin`**.
3. In the **Environment Variables** section, add:
   * `DATABASE_URL` = `postgresql://postgres.cjdouitjfabgwlqcwqcl:24BFA33317CHANDU@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
   * `DIRECT_URL` = `postgresql://postgres.cjdouitjfabgwlqcwqcl:24BFA33317CHANDU@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`
   * `JWT_SECRET` = `gymin_ultra_secure_jwt_secret_token_key_2026_fitness`
   * `NEXT_PUBLIC_APP_URL` = `https://your-app-name.vercel.app`
   * `GEMINI_API_KEY` = `(Your Google Gemini key from https://aistudio.google.com)`
   * `OPENAI_API_KEY` = `(Optional: Your OpenAI key from https://platform.openai.com)`
   * `AI_PROVIDER` = `auto` (or `gemini` / `openai`)
4. Click **Deploy**. Vercel will automatically run `prisma generate`, build the project, and assign a live production URL with automatic HTTPS and continuous deployment on every Git push!

