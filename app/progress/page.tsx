'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  LineChart,
  Trophy,
  Flame,
  Dumbbell,
  TrendingUp,
  Sparkles,
  Award,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLift, setSelectedLift] = useState('Barbell Bench Press');

  useEffect(() => {
    fetch('/api/progress')
      .then((res) => res.json())
      .then((json) => setData(json))
      .finally(() => setLoading(false));
  }, []);

  const strengthProgression = data?.strengthProgression || {};
  const liftOptions = Object.keys(strengthProgression);
  const currentLiftData = strengthProgression[selectedLift] || [];

  const weightData = (data?.weightLogs || []).map((w: any) => ({
    date: w.date.slice(5),
    weight: w.weightKg,
  }));

  const prs = data?.personalRecords || [];
  const stats = data?.stats || {};
  const insights = data?.insights || [];

  return (
    <AppShell>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Longitudinal Performance & Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
            Progress Analytics
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Data-backed verification of progressive overload, strength gains, and body composition
          </p>
        </div>

        {/* Factual Data-Driven Insights Banner */}
        {insights.length > 0 && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-yellow-950/40 border border-amber-500/30 shadow-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>Personalized Progress Insights</span>
            </div>
            <div className="space-y-1.5">
              {insights.map((ins: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-neutral-200">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{ins}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-[#0a0a0a] border border-neutral-800 shadow-xl">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold mb-1">
              <span>Consistency</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats.streakDays || 12} Days</div>
            <span className="text-[10px] text-amber-400 font-bold">Unbroken Streak 🔥</span>
          </div>

          <div className="p-5 rounded-3xl bg-[#0a0a0a] border border-neutral-800 shadow-xl">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold mb-1">
              <span>Total Workouts</span>
              <Dumbbell className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats.totalSessions || 8}</div>
            <span className="text-[10px] text-amber-400 font-bold">Sessions Logged</span>
          </div>

          <div className="p-5 rounded-3xl bg-[#0a0a0a] border border-neutral-800 shadow-xl">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold mb-1">
              <span>Avg Daily Steps</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{(stats.avgSteps ?? 0).toLocaleString()}</div>
            <span className="text-[10px] text-amber-400 font-bold">Active Movement</span>
          </div>

          <div className="p-5 rounded-3xl bg-[#0a0a0a] border border-neutral-800 shadow-xl">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold mb-1">
              <span>PRs Set</span>
              <Trophy className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-black text-white">{prs.length}</div>
            <span className="text-[10px] text-yellow-400 font-bold">Hall of Fame Lifts</span>
          </div>
        </div>

        {/* Strength Progression Chart */}
        <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-neutral-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Strength Progression (Progressive Overload)</h3>
              <p className="text-xs text-neutral-400">Working weight progression per session</p>
            </div>

            {/* Exercise Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {liftOptions.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedLift(name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedLift === name
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold shadow-md shadow-amber-500/20'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            {currentLiftData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-neutral-500">
                Log completed sets for {selectedLift} to view progression.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={currentLiftData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="date" stroke="#737373" fontSize={11} tickLine={false} />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke="#737373" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0a0a',
                      borderColor: '#262626',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} kg`, 'Max Working Weight']}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#f59e0b' }}
                    activeDot={{ r: 6, fill: '#fbbf24' }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Personal Records Hall of Fame */}
        <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Personal Records (PR) Hall of Fame</span>
            </h3>
            <span className="text-xs text-neutral-400">All-time max strength records</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {prs.map((pr: any) => (
              <div
                key={pr.id}
                className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 hover:border-amber-400/50 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{pr.exercise?.name}</span>
                  <Award className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-400">
                    {pr.maxWeightKg} kg
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    {pr.maxReps} reps • Est. 1RM: <strong>{pr.estimated1RM} kg</strong>
                  </div>
                </div>
                <div className="text-[10px] text-neutral-500 pt-1 border-t border-neutral-800/60">
                  Achieved {formatDate(pr.achievedAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
