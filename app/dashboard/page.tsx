'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import {
  Dumbbell,
  Utensils,
  Footprints,
  Scale,
  Flame,
  Droplets,
  Play,
  Plus,
  LineChart,
  Bot,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Trophy,
} from 'lucide-react';
import { getGreeting } from '@/lib/utils';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [waterMl, setWaterMl] = useState(2250);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        if (json?.water?.current) setWaterMl(json.water.current);
      })
      .finally(() => setLoading(false));
  }, []);

  const addWater = () => {
    setWaterMl((prev) => Math.min(prev + 250, 5000));
  };

  const userName = data?.userName || 'Alex';
  const streak = data?.streakDays || 12;
  const workout = data?.todayWorkout || {
    dayName: 'Chest + Triceps',
    exerciseCount: 5,
    durationMin: 55,
    isCompleted: false,
  };
  const nutrition = data?.nutrition || {
    calories: 1620,
    calorieTarget: 2200,
    protein: 105,
    proteinTarget: 140,
    carbs: 160,
    carbsTarget: 250,
    fat: 45,
    fatTarget: 70,
  };
  const steps = data?.steps || { current: 7450, target: 10000 };
  const weight = data?.weight || { current: 76.5, change: -1.7 };

  return (
    <AppShell>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Top Greeting & Streak Flame Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Today's Overview
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-0.5">
              {getGreeting(userName)}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              "What should I do today, what should I eat, and am I actually progressing?"
            </p>
          </div>

          {/* Consistency Streak Card */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 self-start sm:self-auto shadow-lg shadow-amber-500/5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="text-base font-black text-white flex items-center gap-1.5">
                <span>{streak} Day Streak</span>
                <span className="text-amber-400">🔥</span>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Workout & Habit Consistency
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Quick Actions (Section 8) */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Quick Actions
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <Link
              href="/workouts/active"
              className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform flex flex-col items-center justify-center gap-2 text-center"
            >
              <Dumbbell className="w-5 h-5" />
              <span>Start Workout</span>
            </Link>

            <Link
              href="/nutrition"
              className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs transition-all flex flex-col items-center justify-center gap-2 text-center"
            >
              <Utensils className="w-5 h-5 text-teal-400" />
              <span>Log Food</span>
            </Link>

            <Link
              href="/weight"
              className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs transition-all flex flex-col items-center justify-center gap-2 text-center"
            >
              <Scale className="w-5 h-5 text-cyan-400" />
              <span>Log Weight</span>
            </Link>

            <Link
              href="/steps"
              className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs transition-all flex flex-col items-center justify-center gap-2 text-center"
            >
              <Footprints className="w-5 h-5 text-amber-400" />
              <span>Add Steps</span>
            </Link>

            <Link
              href="/progress"
              className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs transition-all flex flex-col items-center justify-center gap-2 text-center"
            >
              <LineChart className="w-5 h-5 text-purple-400" />
              <span>View Progress</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                const btn = document.querySelector('button[title="Ask Gymin AI"]') as HTMLElement;
                if (btn) btn.click();
              }}
              className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/30 text-emerald-400 font-bold text-xs transition-all flex flex-col items-center justify-center gap-2 text-center"
            >
              <Bot className="w-5 h-5 text-emerald-400" />
              <span>Ask Gymin AI</span>
            </button>
          </div>
        </div>

        {/* Today's Overview Cards (Section 7) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Today's Workout */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Today's Workout
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  Scheduled
                </span>
              </div>
              <h3 className="text-2xl font-black text-white mt-2">
                {workout.dayName}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {workout.exerciseCount} exercises · ~{workout.durationMin} min
              </p>
            </div>

            <Link
              href="/workouts/active"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-[1.01]"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Start Workout</span>
            </Link>
          </div>

          {/* Card 2: Calories & Macro Fuel */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Daily Calories
                </span>
                <Flame className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white mt-1">
                {nutrition.calories.toLocaleString()}{' '}
                <span className="text-sm font-semibold text-slate-400">
                  / {nutrition.calorieTarget.toLocaleString()} kcal
                </span>
              </div>
              <p className="text-xs text-emerald-400 font-bold mt-0.5">
                {Math.max(0, nutrition.calorieTarget - nutrition.calories)} kcal remaining
              </p>
            </div>

            {/* Protein bar */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Protein Target</span>
                <span className="font-extrabold text-white">
                  {nutrition.protein} / {nutrition.proteinTarget} g
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (nutrition.protein / nutrition.proteinTarget) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Steps */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Steps Count
                </span>
                <Footprints className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white mt-1">
                {steps.current.toLocaleString()}{' '}
                <span className="text-sm font-semibold text-slate-400">
                  / {steps.target.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-cyan-400 font-bold mt-0.5">
                {Math.round((steps.current / steps.target) * 100)}% daily step target
              </p>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, (steps.current / steps.target) * 100)}%` }}
              />
            </div>
          </div>

          {/* Card 4: Water Tracking */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Water Hydration
                </span>
                <Droplets className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-black text-white mt-1">
                {waterMl.toLocaleString()}{' '}
                <span className="text-sm font-semibold text-slate-400">/ 3,000 ml</span>
              </div>
              <p className="text-xs text-blue-400 font-bold mt-0.5">
                {Math.round((waterMl / 3000) * 100)}% optimal hydration
              </p>
            </div>

            <button
              type="button"
              onClick={addWater}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log +250ml Glass</span>
            </button>
          </div>

          {/* Card 5: Current Weight & Trend */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Current Weight
                </span>
                <Scale className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-white mt-1">
                {weight.current} kg
              </div>
              <p className="text-xs text-emerald-400 font-bold mt-0.5">
                {weight.change < 0 ? `${weight.change} kg` : `+${weight.change} kg`} net from baseline
              </p>
            </div>

            <Link
              href="/weight"
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View full weight progression</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 6: AI Companion Insight */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0e172a] to-slate-900 border border-emerald-500/25 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Gymin AI Insight
                </span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                "Alex, you're on a 12-day streak! You've logged 105g of protein so far today. A high-protein dinner like chicken breast or paneer curry will easily close out your macros."
              </p>
            </div>

            <Link
              href="/progress"
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Analyze my detailed progress</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Section: Next Up on Split */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                Ready for {workout.dayName}?
              </h3>
              <p className="text-xs text-slate-400">
                Bench Press, Incline Dumbbell Press, Cable Flyes, and Tricep Pushdowns are ready.
              </p>
            </div>
          </div>

          <Link
            href="/workouts/active"
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Launch Active Workout</span>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
