'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import {
  User,
  Settings,
  Shield,
  Bell,
  Save,
  LogOut,
  Sparkles,
  CheckCircle2,
  Moon,
  Sun,
  Dumbbell,
  Loader2,
} from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      window.location.href = '/auth/login';
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    mainGoal: 'BUILD_MUSCLE',
    experienceLevel: 'INTERMEDIATE',
    workoutDaysPerWeek: 4,
    workoutDurationMinutes: 45,
    heightCm: 175,
    weightKg: 75,
    targetWeightKg: 75,
    units: 'METRIC',
    theme: 'dark',
    emailNotifications: true,
    pushNotifications: true,
  });

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          const p = data.user.profile || {};
          setFormData({
            name: data.user.name || '',
            mainGoal: p.mainGoal || 'BUILD_MUSCLE',
            experienceLevel: p.experienceLevel || 'INTERMEDIATE',
            workoutDaysPerWeek: p.workoutDaysPerWeek || 4,
            workoutDurationMinutes: p.workoutDurationMinutes || 45,
            heightCm: p.heightCm || 175,
            weightKg: p.weightKg || 75,
            targetWeightKg: p.targetWeightKg || 75,
            units: p.units || 'METRIC',
            theme: p.theme || 'dark',
            emailNotifications: p.emailNotifications ?? true,
            pushNotifications: p.pushNotifications ?? true,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccessMsg('Profile and preferences successfully updated!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell user={user}>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Account & Configuration
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
              Athlete Profile & Settings
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Manage your personal goals, biometrics, measurement units, and security
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-4 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{loggingOut ? 'Logging out...' : 'Log Out'}</span>
          </button>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Identity & Avatar Card */}
          <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-neutral-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>Personal Identity</span>
            </h2>

            <div className="flex items-center gap-4 pb-4 border-b border-neutral-800">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/25">
                {formData.name ? formData.name[0].toUpperCase() : 'A'}
              </div>
              <div>
                <div className="text-base font-extrabold text-white">{formData.name || 'Athlete'}</div>
                <div className="text-xs text-neutral-400">{user?.email}</div>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  GYMIN Pro Athlete
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-medium text-xs sm:text-sm focus:border-amber-400"
              />
            </div>
          </div>

          {/* Fitness Goal & Experience */}
          <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-neutral-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-amber-400" />
              <span>Fitness Goals & Parameters</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Main Goal
                </label>
                <select
                  value={formData.mainGoal}
                  onChange={(e) => setFormData({ ...formData, mainGoal: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:border-amber-400"
                >
                  <option value="BUILD_MUSCLE">Build Muscle (Hypertrophy)</option>
                  <option value="IMPROVE_STRENGTH">Improve Strength (Power)</option>
                  <option value="IMPROVE_FITNESS">Improve Fitness & Conditioning</option>
                  <option value="MAINTAIN_WEIGHT">Maintain Weight & Muscle</option>
                  <option value="LOSE_WEIGHT">Lose Weight & Lean Out</option>
                  <option value="GENERAL_HEALTH">General Health & Longevity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Experience Level
                </label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:border-amber-400"
                >
                  <option value="BEGINNER">Beginner (&lt; 6 months)</option>
                  <option value="INTERMEDIATE">Intermediate (6m - 2 years)</option>
                  <option value="ADVANCED">Advanced (2+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Workout Days Per Week
                </label>
                <input
                  type="number"
                  min="2"
                  max="7"
                  value={formData.workoutDaysPerWeek}
                  onChange={(e) =>
                    setFormData({ ...formData, workoutDaysPerWeek: parseInt(e.target.value, 10) || 4 })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Average Duration (Minutes)
                </label>
                <input
                  type="number"
                  step="5"
                  min="20"
                  max="120"
                  value={formData.workoutDurationMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workoutDurationMinutes: parseInt(e.target.value, 10) || 45,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Physical Stats */}
          <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-neutral-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Biometrics & Units</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Units System
                </label>
                <select
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:border-amber-400"
                >
                  <option value="METRIC">Metric (kg, cm, ml)</option>
                  <option value="IMPERIAL">Imperial (lbs, inches, oz)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications & Toggles */}
          <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-neutral-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Reminders & Notifications</span>
            </h2>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-white">Daily Workout Reminder</div>
                  <div className="text-[11px] text-neutral-400">"Today's workout is waiting for you 💪"</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.pushNotifications}
                  onChange={(e) => setFormData({ ...formData, pushNotifications: e.target.checked })}
                  className="w-4 h-4 accent-amber-400 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-white">Nutrition & Meal Reminders</div>
                  <div className="text-[11px] text-neutral-400">Reminders to log lunch and dinner to maintain your streak</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.emailNotifications}
                  onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                  className="w-4 h-4 accent-amber-400 rounded"
                />
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-500/25 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
