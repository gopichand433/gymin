'use client';

import Link from 'next/link';
import {
  Dumbbell,
  ArrowRight,
  Flame,
  Utensils,
  Bot,
  LineChart,
  PlayCircle,
  Footprints,
  Trophy,
  Target,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 selection:bg-amber-400 selection:text-black overflow-hidden">
      {/* Ambient Lighting Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-amber-500/15 via-yellow-500/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[140px] pointer-events-none" />

      {/* Navigation */}
      <header className="relative z-50 border-b border-neutral-800/80 backdrop-blur-xl bg-[#050505]/75 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Dumbbell className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">
                GYM<span className="text-amber-400">IN</span>
              </span>
              <span className="hidden sm:block text-[10px] tracking-widest uppercase text-neutral-400 font-semibold -mt-1">
                Personal Fitness Companion
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
            <a href="#features" className="hover:text-amber-400 transition-colors">Features</a>
            <a href="#nutrition" className="hover:text-amber-400 transition-colors">Food & Indian Dishes</a>
            <a href="#ai" className="hover:text-amber-400 transition-colors">Gymin AI</a>
            <a href="#analytics" className="hover:text-amber-400 transition-colors">Analytics</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2.5 rounded-xl border border-neutral-700/80 hover:border-neutral-500 text-sm font-semibold text-neutral-200 transition-all"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-bold text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Answers the daily question: "What should I do today?"</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white leading-[1.08]">
            GYMIN
          </h1>
          <p className="mt-4 text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            Your fitness journey. One place.
          </p>
          <p className="mt-6 text-base sm:text-lg text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            Personalized workout splits, sets & reps tracking, 110+ foods with authentic Indian dishes, progressive overload charts, and a grounded AI fitness assistant that actually knows your data.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel hover:bg-neutral-800/80 border border-neutral-700 text-white font-bold text-base flex items-center justify-center gap-2 transition-all"
            >
              <span>Login / Try Demo</span>
            </Link>
          </div>

          {/* Quick Stats Badges */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800">
              <div className="text-2xl font-black text-amber-400">55+</div>
              <div className="text-xs text-neutral-400">Exercises with Demos</div>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800">
              <div className="text-2xl font-black text-yellow-400">110+</div>
              <div className="text-xs text-neutral-400">Foods & Indian Dishes</div>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800">
              <div className="text-2xl font-black text-amber-300">100%</div>
              <div className="text-xs text-neutral-400">Grounded AI Coach</div>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800">
              <div className="text-2xl font-black text-yellow-500">Zero</div>
              <div className="text-xs text-neutral-400">Cookie-cutter Plans</div>
            </div>
          </div>
        </div>

        {/* Interactive Dashboard Live Mockup */}
        <div className="mt-16 relative mx-auto max-w-5xl">
          <div className="relative rounded-3xl p-6 sm:p-8 glass-panel-glow shadow-2xl border border-amber-500/30 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  Live Dashboard Preview
                </span>
                <h3 className="text-2xl font-black text-white mt-0.5">
                  Good morning, Alex 👋
                </h3>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                <Flame className="w-4 h-4 fill-amber-400" />
                <span>Daily Consistency Streak</span>
              </div>
            </div>

            {/* Dashboard Cards Grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Today's Workout Card */}
              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase">Today's Workout</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-400">
                    Day 1
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Chest + Triceps</h4>
                  <p className="text-xs text-neutral-400">5 exercises · ~55 min</p>
                </div>
                <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-extrabold text-center flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Start Workout</span>
                </div>
              </div>

              {/* Nutrition Ring */}
              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase">Calories</span>
                  <span className="text-xs font-bold text-amber-400">0 / 2,200 kcal</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-neutral-400 mb-1">
                      <span>Protein</span>
                      <span className="font-bold text-white">0 / 140 g</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full w-0" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-neutral-400 mb-1">
                      <span>Carbs</span>
                      <span className="font-bold text-white">0 / 250 g</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full w-0" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Steps & Assistant */}
              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase">Steps Today</span>
                  <span className="text-xs font-bold text-yellow-400">0 / 10,000</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
                  <Bot className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-neutral-300 leading-tight">
                    "Alex, your targets are ready! Start logging your meals or hit today's Chest & Triceps split."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid (Section 4 Requirements) */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-800/60">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
            Complete Ecosystem
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-2">
            Built for Real Results
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-3">
            Every feature is designed to keep you moving forward without guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Dumbbell,
              color: 'text-amber-400',
              title: 'Personalized Workouts',
              desc: 'Custom 3, 4, 5, or 6-day splits generated according to your experience, equipment, and duration.',
            },
            {
              icon: Utensils,
              color: 'text-yellow-400',
              title: 'Food & Calorie Tracking',
              desc: 'Over 110+ items with authentic Indian dishes, serving unit conversions (bowl, g, piece), and live macro totals.',
            },
            {
              icon: Bot,
              color: 'text-amber-300',
              title: 'Gymin AI Assistant',
              desc: 'Grounded in your actual database records. Answers questions about your workouts, protein, and consistency.',
            },
            {
              icon: LineChart,
              color: 'text-yellow-500',
              title: 'Progress Analytics',
              desc: 'Calculates progressive volume (Sets × Reps × Weight), body measurements, and 1RM strength progression.',
            },
            {
              icon: PlayCircle,
              color: 'text-amber-400',
              title: 'Exercise Demonstrations',
              desc: 'Visual animated anatomy guides highlighting targeted muscles with safety cues.',
            },
            {
              icon: Footprints,
              color: 'text-yellow-400',
              title: 'Step Tracking',
              desc: 'Daily targets, weekly averages, and trend charts designed for active movement tracking.',
            },
            {
              icon: Trophy,
              color: 'text-amber-400',
              title: 'Personal Records (PR)',
              desc: 'Automatic PR detection for every lift with celebratory alerts and complete strength history.',
            },
            {
              icon: Target,
              color: 'text-amber-300',
              title: 'Fitness Goals & Gamification',
              desc: 'Achievements, streaks, and calendar logging that reward your dedication and consistency.',
            },
          ].map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 hover:border-amber-500/40 transition-all hover:bg-neutral-900/90 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Indian Dishes & Nutrition Spotlight */}
      <section id="nutrition" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-800/60">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
              Comprehensive Food Database
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Track Real Indian Dishes & Global Staples Effortlessly
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base mt-4 leading-relaxed">
              No more trying to guess the calories in Paneer Butter Masala, Dal Tadka, Chana Masala, Idli Sambar, or Chicken Biryani. GYMIN features calibrated Indian dishes with multi-unit conversions (bowls, rotis, tablespoons, grams) and dynamic macro recalculation.
            </p>
            <div className="mt-6 space-y-3">
              {[
                '40+ Authentic Indian curries, rotis, rice, and breakfast staples',
                'Instant serving conversion: switch from grams to bowl or piece with 1 tap',
                'Mifflin-St Jeor formula estimates your daily calorie & protein targets',
                'Clearly labeled nutrition values as approximate estimates',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Paneer Butter Masala', cal: '230 kcal', p: '8.5g P', serving: '1 bowl' },
              { name: 'Chicken Biryani', cal: '180 kcal', p: '11.5g P', serving: '1 plate' },
              { name: 'Roti / Whole Wheat', cal: '90 kcal', p: '3g P', serving: '1 piece' },
              { name: 'Dal Tadka', cal: '115 kcal', p: '6.8g P', serving: '1 bowl' },
            ].map((dish, i) => (
              <div key={i} className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-400/50 transition-colors">
                <div className="text-xs font-bold text-white mb-1">{dish.name}</div>
                <div className="text-[11px] text-neutral-400">{dish.serving}</div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-amber-400 font-bold">{dish.cal}</span>
                  <span className="text-neutral-300">{dish.p}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Spotlight */}
      <section id="ai" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-800/60">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-neutral-950 via-[#141414] to-neutral-950 border border-amber-500/30 relative overflow-hidden">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Bot className="w-3.5 h-3.5" />
              <span>Grounded Fitness Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Meet GYMIN AI: Your Personal Trainer That Actually Knows Your Numbers
            </h2>
            <p className="mt-4 text-sm sm:text-base text-neutral-400 leading-relaxed">
              Unlike generic chatbots that hallucinate random stats, GYMIN AI directly inspects your real logged sets, weights, streak, and today's nutrition to provide factual answers.
            </p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {[
                "What is my workout today?",
                "How much protein have I eaten?",
                "Did I beat my previous bench press?",
                "Give me a high-protein dinner idea",
              ].map((prompt, i) => (
                <div key={i} className="px-3.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 font-medium">
                  "{prompt}"
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all"
              >
                <span>Try GYMIN AI Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-black font-bold">
              <Dumbbell className="w-4 h-4" />
            </div>
            <span className="font-extrabold tracking-tight text-white text-lg">
              GYM<span className="text-amber-400">IN</span>
            </span>
          </div>

          <div className="text-xs text-neutral-500 text-center sm:text-right max-w-md">
            <p>© {new Date().getFullYear()} GYMIN Inc. All rights reserved.</p>
            <p className="mt-1 text-[11px] text-neutral-600">
              Health Disclaimer: Calorie estimations, exercises, and AI insights are approximations for informational fitness purposes and should not be treated as medical advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
