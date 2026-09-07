'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import ExerciseDemo from '@/components/workout/ExerciseDemo';
import { Search, Dumbbell, Filter, Sparkles, X, ChevronRight } from 'lucide-react';

const MUSCLE_GROUPS = [
  'ALL',
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Glutes',
  'Calves',
  'Abs',
  'Cardio',
  'Full Body',
];

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMuscle, setSelectedMuscle] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);

  useEffect(() => {
    fetchExercises();
  }, [selectedMuscle, searchQuery]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedMuscle !== 'ALL') params.set('muscle', selectedMuscle);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/exercises?${params.toString()}`);
      const data = await res.json();
      if (data?.exercises) {
        setExercises(data.exercises);
        if (!selectedExercise && data.exercises.length > 0) {
          setSelectedExercise(data.exercises[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Exercise Library
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Explore 55+ biomechanically vetted movements with interactive form demonstrations
            </p>
          </div>
        </div>

        {/* Search & Muscle Group Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercise by name (e.g. Bench Press, Squats, Pull Ups)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:border-emerald-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {MUSCLE_GROUPS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMuscle(m)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedMuscle === m
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Grid & Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Exercise List */}
          <div className="lg:col-span-6 space-y-2.5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Found {exercises.length} Exercises
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
                ))}
              </div>
            ) : exercises.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
                No exercises match your search criteria.
              </div>
            ) : (
              exercises.map((ex) => {
                const isSelected = selectedExercise?.id === ex.id;
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => setSelectedExercise(ex)}
                    className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-400 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-emerald-400 text-black' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                          {ex.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          <span className="text-emerald-400 font-medium">{ex.primaryMuscle}</span>
                          <span>•</span>
                          <span>{ex.equipment}</span>
                          <span>•</span>
                          <span className="capitalize">{ex.difficulty.toLowerCase()}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
                  </button>
                );
              })
            )}
          </div>

          {/* Demonstration Sticky Panel */}
          <div className="lg:col-span-6">
            <div className="sticky top-6">
              {selectedExercise ? (
                <ExerciseDemo
                  exerciseName={selectedExercise.name}
                  primaryMuscle={selectedExercise.primaryMuscle}
                  secondaryMuscles={
                    selectedExercise.secondaryMuscles
                      ? JSON.parse(selectedExercise.secondaryMuscles)
                      : []
                  }
                  equipment={selectedExercise.equipment}
                  targetSets={selectedExercise.recommendedSets}
                  targetReps={String(selectedExercise.recommendedReps)}
                  instructions={
                    selectedExercise.instructions
                      ? JSON.parse(selectedExercise.instructions)
                      : []
                  }
                  safetyTips={
                    selectedExercise.safetyTips
                      ? JSON.parse(selectedExercise.safetyTips)
                      : []
                  }
                />
              ) : (
                <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs">
                  Select an exercise to preview movement mechanics.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
