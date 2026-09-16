'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import {
  Scale,
  Plus,
  TrendingDown,
  TrendingUp,
  Ruler,
  Calendar,
  X,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { formatDate } from '@/lib/utils';

export default function WeightPage() {
  const [weightData, setWeightData] = useState<any>(null);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Weight Entry Modal
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [weightInput, setWeightInput] = useState<number>(76.5);
  const [weightNotes, setWeightNotes] = useState('');
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);

  // Measurement Entry Modal
  const [isMeasureModalOpen, setIsMeasureModalOpen] = useState(false);
  const [chestCm, setChestCm] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [hipsCm, setHipsCm] = useState('');
  const [armsCm, setArmsCm] = useState('');
  const [thighsCm, setThighsCm] = useState('');
  const [calvesCm, setCalvesCm] = useState('');

  useEffect(() => {
    fetchWeight();
    fetchMeasurements();
  }, []);

  const fetchWeight = async () => {
    try {
      const res = await fetch('/api/weight');
      const data = await res.json();
      setWeightData(data);
      if (data.currentWeight) setWeightInput(data.currentWeight);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeasurements = async () => {
    try {
      const res = await fetch('/api/measurements');
      const data = await res.json();
      if (data?.measurements) setMeasurements(data.measurements);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveWeight = async () => {
    try {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weightKg: weightInput,
          date: weightDate,
          notes: weightNotes || undefined,
        }),
      });
      if (res.ok) {
        setIsWeightModalOpen(false);
        fetchWeight();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveMeasurements = async () => {
    try {
      const res = await fetch('/api/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chestCm,
          waistCm,
          hipsCm,
          armsCm,
          thighsCm,
          calvesCm,
        }),
      });
      if (res.ok) {
        setIsMeasureModalOpen(false);
        fetchMeasurements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const current = weightData?.currentWeight || 76.5;
  const start = weightData?.startingWeight || 78.2;
  const change = weightData?.change || -1.7;

  // Chart data
  const chartData = (weightData?.history || []).map((h: any) => ({
    date: h.date.slice(5),
    weight: h.weightKg,
  }));

  return (
    <AppShell>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Body Composition & Biometrics
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
              Weight & Measurements
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Track longitudinal body mass trends and circumferential muscular dimensions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMeasureModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-neutral-800 hover:border-amber-500/40 bg-neutral-900 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
            >
              <Ruler className="w-3.5 h-3.5 text-amber-400" />
              <span>Log Measurements</span>
            </button>
            <button
              type="button"
              onClick={() => setIsWeightModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 text-black text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
            >
              <Scale className="w-4 h-4" />
              <span>Log Weigh-In</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-neutral-800 shadow-xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Current Weight</span>
            <div className="text-3xl font-black text-white">{current} kg</div>
            <p className="text-xs text-neutral-400">Most recent recorded weigh-in</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-neutral-800 shadow-xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Starting Weight</span>
            <div className="text-3xl font-black text-neutral-300">{start} kg</div>
            <p className="text-xs text-neutral-400">Baseline established at onboarding</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-neutral-800 shadow-xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Net Change</span>
            <div className={`text-3xl font-black flex items-center gap-2 ${change < 0 ? 'text-amber-400' : 'text-yellow-400'}`}>
              {change < 0 ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
              <span>{change > 0 ? `+${change}` : change} kg</span>
            </div>
            <p className="text-xs text-neutral-400">Steady body recomposition</p>
          </div>
        </div>

        {/* Weight Progression Chart */}
        <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Weight Progression Line</h3>
              <p className="text-xs text-neutral-400">Consistent multi-week weigh-in trend</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#737373" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0a0a',
                    borderColor: '#262626',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} kg`, 'Weight']}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#f59e0b' }}
                  activeDot={{ r: 6, fill: '#fbbf24' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Body Measurements Section */}
        <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Ruler className="w-4 h-4 text-amber-400" />
              <span>Circumference Measurements (cm)</span>
            </h3>
            <span className="text-xs text-neutral-400">{measurements.length} logs recorded</span>
          </div>

          {measurements.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-neutral-950/40 border border-dashed border-neutral-800 text-neutral-400 text-xs">
              No measurements logged yet. Tap "Log Measurements" to record chest, waist, arms, and thighs.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400">
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Chest</th>
                    <th className="pb-3 font-semibold">Waist</th>
                    <th className="pb-3 font-semibold">Hips</th>
                    <th className="pb-3 font-semibold">Arms</th>
                    <th className="pb-3 font-semibold">Thighs</th>
                    <th className="pb-3 font-semibold">Calves</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {measurements.map((m) => (
                    <tr key={m.id} className="text-neutral-200">
                      <td className="py-3 font-medium text-white">{formatDate(m.date)}</td>
                      <td className="py-3">{m.chestCm ? `${m.chestCm} cm` : '—'}</td>
                      <td className="py-3">{m.waistCm ? `${m.waistCm} cm` : '—'}</td>
                      <td className="py-3">{m.hipsCm ? `${m.hipsCm} cm` : '—'}</td>
                      <td className="py-3">{m.armsCm ? `${m.armsCm} cm` : '—'}</td>
                      <td className="py-3">{m.thighsCm ? `${m.thighsCm} cm` : '—'}</td>
                      <td className="py-3">{m.calvesCm ? `${m.calvesCm} cm` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-neutral-300">
          <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Privacy Guarantee:</strong> All weight data, measurements, and optional progress records are stored strictly in your private authenticated vault and never shared publicly.
          </span>
        </div>
      </div>

      {/* LOG WEIGH-IN MODAL */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white">Record Weigh-In</h3>
              <button
                type="button"
                onClick={() => setIsWeightModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={weightDate}
                onChange={(e) => setWeightDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Weight (KG)
              </label>
              <input
                type="number"
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-extrabold text-xl focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={weightNotes}
                onChange={(e) => setWeightNotes(e.target.value)}
                placeholder="e.g. Weighed morning fasted"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:border-amber-400"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveWeight}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all"
            >
              Save Weigh-In
            </button>
          </div>
        </div>
      )}

      {/* LOG MEASUREMENTS MODAL */}
      {isMeasureModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white">Log Body Measurements</h3>
              <button
                type="button"
                onClick={() => setIsMeasureModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                  Chest (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={chestCm}
                  onChange={(e) => setChestCm(e.target.value)}
                  placeholder="e.g. 102"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                  Waist (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={waistCm}
                  onChange={(e) => setWaistCm(e.target.value)}
                  placeholder="e.g. 82"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                  Hips (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={hipsCm}
                  onChange={(e) => setHipsCm(e.target.value)}
                  placeholder="e.g. 98"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                  Arms / Biceps (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={armsCm}
                  onChange={(e) => setArmsCm(e.target.value)}
                  placeholder="e.g. 38"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                  Thighs (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={thighsCm}
                  onChange={(e) => setThighsCm(e.target.value)}
                  placeholder="e.g. 58"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                  Calves (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={calvesCm}
                  onChange={(e) => setCalvesCm(e.target.value)}
                  placeholder="e.g. 39"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveMeasurements}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all"
            >
              Save Measurements
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
