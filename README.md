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
- **GYMIN AI Assistant**: Grounded AI assistant drawer referencing actual user database logs to prevent hallucinations.
- **Gamification**: Badges, consistency streaks, and celebration confetti.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) & React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 5.22
- **Data Visualization**: Recharts
- **Animations**: Framer Motion & Canvas Confetti
- **AI**: @google/genai (Gemini 2.5/3.7 Flash)

---

## 🌐 Cloud Deployment Guide

### Option 1: Deploy to Vercel (Recommended)

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: GYMIN production release"
   git remote add origin https://github.com/YOUR_USERNAME/gymin.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `gymin` repository.
4. Add the following **Environment Variables** under Project Settings:
   - `DATABASE_URL`: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`
   - `DIRECT_URL`: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`
   - `JWT_SECRET`: A secure random string (e.g. `gymin_jwt_super_secure_secret_2026`)
   - `NEXT_PUBLIC_APP_URL`: Your Vercel production URL (e.g. `https://gymin.vercel.app`)
   - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API key
5. Click **Deploy**. Vercel will automatically run `prisma generate` and build the application.

---

### Option 2: Deploy via Vercel CLI (Directly from Terminal)

Run directly in the terminal:
```bash
npx vercel
```
Follow the interactive prompts to link your Vercel account and set your environment variables.
