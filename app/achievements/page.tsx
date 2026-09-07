'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import {
  Trophy,
  Flame,
  Dumbbell,
  Zap,
  Crown,
  Award,
  Footprints,
  Apple,
  Lock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/achievements')
      .then((res) => res.json())
      .then((data) => {
        if (data?.achievements) setAchievements(data.achievements);
      })
      .finally(() => setLoading(false));
  }, []);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length || 8;
  const percentUnlocked = Math.round((unlockedCount / totalCount) * 100);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy': return Trophy;
      case 'Flame': return Flame;
      case 'Dumbbell': return Dumbbell;
      case 'Zap': return Zap;
      case 'Crown': return Crown;
      case 'Award': return Award;
      case 'Footprints': return Footprints;
      case 'Apple': return Apple;
      default: return Trophy;
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Gamification & Milestones
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
              Achievements & Badges
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Earn badges for workout volume, consistency streaks, and strength personal records
            </p>
          </div>
        </div>

        {/* Milestone Progress Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0d1527] to-slate-900 border border-emerald-500/25 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Completion Rate
            </span>
            <span className="text-xs font-bold text-white">
              {unlockedCount} of {totalCount} Badges Unlocked
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
              style={{ width: `${percentUnlocked}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">
            Keep hitting your daily routines to unlock the remaining badges!
          </p>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((ach) => {
            const Icon = getIcon(ach.icon);
            return (
              <div
                key={ach.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  ach.isUnlocked
                    ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/50 border-slate-800/80 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        ach.isUnlocked
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-black shadow-md shadow-emerald-500/20'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    {ach.isUnlocked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-600" />
                    )}
                  </div>

                  <h3 className="font-extrabold text-base text-white">{ach.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {ach.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 text-[10px] text-slate-500">
                  {ach.isUnlocked ? (
                    <span className="text-emerald-400 font-semibold">
                      Unlocked on {formatDate(ach.unlockedAt)}
                    </span>
                  ) : (
                    <span>Locked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
