'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import {
  Dumbbell,
  Play,
  Plus,
  Calendar,
  Clock,
  Flame,
  ChevronRight,
  Trophy,
  History,
  Layers,
} from 'lucide-react';
import { formatTime, formatDate } from '@/lib/utils';

export default function WorkoutsPage() {
  const [plan, setPlan] = useState<any>(null);
  const [todayDay, setTodayDay] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/workouts/active-plan').then((res) => res.json()),
      fetch('/api/workouts/history').then((res) => res.json()),
    ])
      .then(([planData, historyData]) => {
        if (planData?.plan) {
          setPlan(planData.plan);
          setTodayDay(planData.todayDay);
        }
        if (historyData?.sessions) {
          setHistory(historyData.sessions);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Workout System
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
              My Training Plan
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Follow your split, track progressive overload, or customize your routines
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/workouts/builder"
              className="px-4 py-2.5 rounded-xl border border-neutral-700 hover:border-amber-400/50 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Customize Split</span>
            </Link>
            <Link
              href="/workouts/active"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black text-xs font-extrabold transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Start Today's Session</span>
            </Link>
          </div>
        </div>

        {/* Active Split Summary Banner */}
        {plan && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-neutral-950 via-[#141414] to-neutral-950 border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  Active Split
                </span>
                <span className="text-xs text-neutral-400">{plan.splitType.replace(/_/g, ' ')}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{plan.name}</h2>
              <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
                {plan.description || 'Tailored to balance volume, recovery, and hypertrophy.'}
              </p>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-neutral-800 pt-4 md:pt-0 md:pl-6">
              <div className="text-center">
                <div className="text-2xl font-black text-amber-400">{plan.days?.length || 5}</div>
                <div className="text-[10px] uppercase font-bold text-neutral-400">Weekly Days</div>
              </div>
              <div className="text-center pl-4 border-l border-neutral-800">
                <div className="text-2xl font-black text-white">
                  {plan.days?.reduce((acc: number, d: any) => acc + (d.exercises?.length || 0), 0) || 20}
                </div>
                <div className="text-[10px] uppercase font-bold text-neutral-400">Exercises</div>
              </div>
            </div>
          </div>
        )}

        {/* Days in Current Split */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Days In This Split</span>
            </h3>
            <span className="text-xs text-neutral-400">
              Tap any day to preview routines
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plan?.days?.map((day: any, idx: number) => {
              const isToday = todayDay?.id === day.id;
              return (
                <div
                  key={day.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isToday
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'bg-neutral-900/70 border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Day {idx + 1}
                    </span>
                    {isToday && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-400 to-yellow-500 text-black">
                        Today's Split
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-extrabold text-white mb-1">{day.name}</h4>
                  <p className="text-xs text-neutral-400 mb-4">
                    {day.exercises?.length || 0} exercises · ~50 min
                  </p>

                  {/* Exercise list snippet */}
                  <div className="space-y-1.5 border-t border-neutral-800/80 pt-3">
                    {day.exercises?.map((we: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs text-neutral-300">
                        <span className="truncate pr-2">{we.exercise?.name}</span>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {we.targetSets}×{we.targetReps}
                        </span>
                      </div>
                    ))}
                  </div>

                  {isToday && (
                    <Link
                      href="/workouts/active"
                      className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-amber-500/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Start Workout</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Workout History */}
        <div className="space-y-4 pt-4 border-t border-neutral-800">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <span>Recent Completed Sessions</span>
            </h3>
            <span className="text-xs text-neutral-400">{history.length} logged sessions</span>
          </div>

          <div className="space-y-3">
            {history.map((session: any) => (
              <div
                key={session.id}
                className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{session.dayName}</span>
                    <span className="text-[11px] text-neutral-500">•</span>
                    <span className="text-xs text-neutral-400">{formatDate(session.createdAt)}</span>
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    {session.totalSets} completed sets · {formatTime(session.durationSec)} duration
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="text-right">
                    <div className="text-amber-400">{session.totalVolumeKg.toLocaleString()} kg</div>
                    <div className="text-[10px] text-neutral-500 font-normal">Volume</div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400">~{session.caloriesBurned} kcal</div>
                    <div className="text-[10px] text-neutral-500 font-normal">Burned</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
