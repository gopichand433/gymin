'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Dumbbell,
  Clock,
  Search,
  X,
  Sparkles,
  Layers,
  Loader2,
} from 'lucide-react';

interface DayExercise {
  exerciseId: string;
  exerciseName: string;
  primaryMuscle: string;
  targetSets: number;
  targetReps: string;
  targetRestSec: number;
}

interface SplitDay {
  id: string;
  name: string;
  exercises: DayExercise[];
}

export default function PlanBuilderPage() {
  const router = useRouter();
  const [planName, setPlanName] = useState('My Custom Split');
  const [planDescription, setPlanDescription] = useState('Personalized bodybuilding and strength routine');
  const [days, setDays] = useState<SplitDay[]>([
    {
      id: 'day-1',
      name: 'Push (Chest, Shoulders, Triceps)',
      exercises: [],
    },
    {
      id: 'day-2',
      name: 'Pull (Back, Biceps)',
      exercises: [],
    },
    {
      id: 'day-3',
      name: 'Legs & Core',
      exercises: [],
    },
  ]);

  // Exercise picker modal
  const [allExercises, setAllExercises] = useState<any[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [targetDayIndex, setTargetDayIndex] = useState<number | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/exercises')
      .then((res) => res.json())
      .then((data) => {
        if (data?.exercises) setAllExercises(data.exercises);
      });
  }, []);

  const addDay = () => {
    const newDayNumber = days.length + 1;
    setDays((prev) => [
      ...prev,
      {
        id: `day-${Date.now()}`,
        name: `Day ${newDayNumber} - Workout`,
        exercises: [],
      },
    ]);
  };

  const removeDay = (index: number) => {
    if (days.length <= 1) return;
    setDays((prev) => prev.filter((_, i) => i !== index));
  };

  const updateDayName = (index: number, newName: string) => {
    setDays((prev) =>
      prev.map((d, i) => (i === index ? { ...d, name: newName } : d))
    );
  };

  const openAddExercise = (dayIndex: number) => {
    setTargetDayIndex(dayIndex);
    setIsPickerOpen(true);
    setPickerSearch('');
  };

  const selectExercise = (exercise: any) => {
    if (targetDayIndex === null) return;

    setDays((prev) =>
      prev.map((day, idx) => {
        if (idx !== targetDayIndex) return day;
        return {
          ...day,
          exercises: [
            ...day.exercises,
            {
              exerciseId: exercise.id,
              exerciseName: exercise.name,
              primaryMuscle: exercise.primaryMuscle,
              targetSets: exercise.recommendedSets || 3,
              targetReps: String(exercise.recommendedReps || 10),
              targetRestSec: exercise.recommendedRestSec || 60,
            },
          ],
        };
      })
    );

    setIsPickerOpen(false);
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dayIdx) return d;
        return {
          ...d,
          exercises: d.exercises.filter((_, idx) => idx !== exIdx),
        };
      })
    );
  };

  const updateExerciseParam = (
    dayIdx: number,
    exIdx: number,
    field: 'targetSets' | 'targetReps' | 'targetRestSec',
    value: any
  ) => {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dayIdx) return d;
        return {
          ...d,
          exercises: d.exercises.map((e, idx) => {
            if (idx !== exIdx) return e;
            return { ...e, [field]: value };
          }),
        };
      })
    );
  };

  const handleSavePlan = async () => {
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/workouts/custom-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: planName,
          description: planDescription,
          days,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save custom plan.');

      router.push('/workouts');
    } catch (err: any) {
      setError(err.message || 'Error saving custom split.');
    } finally {
      setSaving(false);
    }
  };

  const filteredExercises = allExercises.filter(
    (e) =>
      e.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      e.primaryMuscle.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/workouts')}
              className="p-2 rounded-xl bg-[#0a0a0a] border border-neutral-800 text-neutral-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Workout Plan Builder</h1>
              <p className="text-xs text-neutral-400">Design your own splits, routines, and rest intervals</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSavePlan}
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save & Set Active Plan</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Plan Details Card */}
        <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-neutral-800 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Plan Title
            </label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-bold text-sm focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <input
              type="text"
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:border-amber-400"
            />
          </div>
        </div>

        {/* Split Days */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Workout Days ({days.length})</span>
            </h2>

            <button
              type="button"
              onClick={addDay}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Another Day</span>
            </button>
          </div>

          {days.map((day, dayIdx) => (
            <div
              key={day.id}
              className="p-6 rounded-3xl bg-[#0a0a0a] border border-neutral-800 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black text-xs flex items-center justify-center flex-shrink-0">
                    {dayIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={day.name}
                    onChange={(e) => updateDayName(dayIdx, e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-bold text-sm focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openAddExercise(dayIdx)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/25 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Exercise</span>
                  </button>

                  {days.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDay(dayIdx)}
                      className="p-2 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Day's Exercises */}
              {day.exercises.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-neutral-950/40 border border-dashed border-neutral-800 text-neutral-500 text-xs">
                  No exercises added to this day yet. Click "+ Add Exercise" above.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {day.exercises.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <Dumbbell className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-white">{ex.exerciseName}</div>
                          <div className="text-[10px] text-neutral-400">{ex.primaryMuscle}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-neutral-400 text-[11px]">Sets:</span>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={ex.targetSets}
                            onChange={(e) =>
                              updateExerciseParam(
                                dayIdx,
                                exIdx,
                                'targetSets',
                                parseInt(e.target.value, 10) || 3
                              )
                            }
                            className="w-12 px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-center text-xs font-bold text-white"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-neutral-400 text-[11px]">Reps:</span>
                          <input
                            type="text"
                            value={ex.targetReps}
                            onChange={(e) =>
                              updateExerciseParam(dayIdx, exIdx, 'targetReps', e.target.value)
                            }
                            className="w-16 px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-center text-xs font-bold text-white"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-neutral-400 text-[11px]">Rest:</span>
                          <input
                            type="number"
                            step="15"
                            value={ex.targetRestSec}
                            onChange={(e) =>
                              updateExerciseParam(
                                dayIdx,
                                exIdx,
                                'targetRestSec',
                                parseInt(e.target.value, 10) || 60
                              )
                            }
                            className="w-14 px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-center text-xs font-bold text-white"
                          />
                          <span className="text-[10px] text-neutral-500">s</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeExercise(dayIdx, exIdx)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* EXERCISE PICKER MODAL */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white">Select Exercise</h3>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Search exercise or muscle..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:border-amber-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredExercises.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => selectExercise(ex)}
                  className="w-full p-3 rounded-xl bg-neutral-950/60 hover:bg-neutral-900/80 border border-neutral-800 text-left flex items-center justify-between transition-colors group"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                      {ex.name}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      {ex.primaryMuscle} • {ex.equipment}
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-neutral-500 group-hover:text-amber-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
