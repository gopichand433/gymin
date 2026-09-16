'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import {
  Footprints,
  Plus,
  Flame,
  TrendingUp,
  Award,
  Calendar,
  X,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export default function StepsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stepInput, setStepInput] = useState<number>(0);
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchSteps();
  }, []);

  const fetchSteps = async () => {
    try {
      const res = await fetch('/api/steps');
      const json = await res.json();
      setData(json);
      if (json.todaySteps !== undefined) setStepInput(json.todaySteps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSteps = async () => {
    try {
      const res = await fetch('/api/steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps: stepInput, date: dateInput }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchSteps();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const todaySteps = data?.todaySteps ?? 0;
  const target = data?.target || 10000;
  const averageSteps = data?.averageSteps ?? 0;
  const percent = Math.min(100, Math.round((todaySteps / target) * 100));

  // Format history for chart
  const chartData = (data?.history || []).map((h: any) => ({
    date: h.date.slice(5), // MM-DD
    steps: h.steps,
  }));

  return (
    <AppShell>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Activity & Non-Exercise Activity (NEAT)
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
              Daily Step Tracker
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Maintain consistent daily movement for metabolic cardiovascular longevity
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Steps Manually</span>
          </button>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Today's Step Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Today's Count
              </span>
              <Footprints className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-3xl font-black text-white">
                {todaySteps.toLocaleString()}{' '}
                <span className="text-sm font-semibold text-slate-400">
                  / {target.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-emerald-400 font-bold mt-1">
                {percent}% of daily goal completed
              </p>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Average Steps Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                14-Day Average
              </span>
              <TrendingUp className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <div className="text-3xl font-black text-white">
                {averageSteps.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">Consistent daily rhythm</p>
            </div>
            <div className="text-xs text-slate-500">
              Equivalent to ~{(averageSteps * 0.0008).toFixed(1)} km daily distance
            </div>
          </div>

          {/* Calorie Burn Equivalent */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Est. Energy Burned
              </span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-3xl font-black text-amber-400">
                ~{Math.round(todaySteps * 0.04)} kcal
              </div>
              <p className="text-xs text-slate-400 mt-1">Active step expenditure</p>
            </div>
            <div className="text-xs text-slate-500">
              Fueling natural metabolic baseline
            </div>
          </div>
        </div>

        {/* 14-Day Activity Chart */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Daily Step Progression</h3>
              <p className="text-xs text-slate-400">Rolling 14-day history with 10,000 target reference line</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Goal: 10k
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} steps`, 'Count']}
                />
                <ReferenceLine y={10000} stroke="#10b981" strokeDasharray="3 3" />
                <Bar dataKey="steps" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wearable Integrations Extension Point */}
        <div className="p-5 rounded-3xl bg-slate-900/50 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Apple Health & Google Health Connect</h4>
              <p className="text-xs text-slate-400">
                GYMIN architecture is prepared for native background sync with iOS HealthKit and Android Health Connect.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold whitespace-nowrap self-start sm:self-auto">
            Ready for Integration
          </span>
        </div>
      </div>

      {/* MANUAL ENTRY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0d14] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Log Steps Manually</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Steps Count
              </label>
              <input
                type="number"
                step="100"
                value={stepInput}
                onChange={(e) => setStepInput(parseInt(e.target.value, 10) || 0)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-extrabold text-lg focus:border-emerald-400"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveSteps}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              Save Steps Entry
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
