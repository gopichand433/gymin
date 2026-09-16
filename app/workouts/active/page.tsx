'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Timer,
  Dumbbell,
  CheckCircle2,
  SkipForward,
  Flame,
  Trophy,
  ArrowLeft,
  X,
  Plus,
  Minus,
  Sparkles,
  ChevronRight,
  Clock,
  Volume2,
  Loader2,
} from 'lucide-react';
import ExerciseDemo from '@/components/workout/ExerciseDemo';
import { formatTime } from '@/lib/utils';

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState<any>(null);
  const [todayDay, setTodayDay] = useState<any>(null);
  const [previousPerformance, setPreviousPerformance] = useState<Record<string, any>>({});

  // Active workout state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Set Tracking Inputs
  const [weightInput, setWeightInput] = useState<number>(60);
  const [repsInput, setRepsInput] = useState<number>(10);
  const [completedSets, setCompletedSets] = useState<any[]>([]);

  // Rest Timer State
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);
  const [restDuration, setRestDuration] = useState<number>(60);
  const [restCompleteAlert, setRestCompleteAlert] = useState(false);

  // Workout Finish Modal
  const [isFinished, setIsFinished] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [finishError, setFinishError] = useState('');

  // Load Workout Plan & Exercises
  useEffect(() => {
    fetch('/api/workouts/active-plan')
      .then((res) => res.json())
      .then((data) => {
        if (data?.todayDay) {
          setPlanData(data.plan);
          setTodayDay(data.todayDay);
          const firstEx = data.todayDay.exercises[0]?.exercise;
          if (firstEx && previousPerformance[firstEx.id]) {
            setWeightInput(previousPerformance[firstEx.id].weightKg);
            setRepsInput(previousPerformance[firstEx.id].reps);
          }
        }
      })
      .finally(() => setLoading(false));

    fetch('/api/workouts/history')
      .then((res) => res.json())
      .then((data) => {
        if (data?.previousPerformance) {
          setPreviousPerformance(data.previousPerformance);
        }
      });
  }, []);

  // Workout duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Rest interval countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (restTimerSeconds !== null && restTimerSeconds > 0) {
      timer = setInterval(() => {
        setRestTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
    } else if (restTimerSeconds === 0) {
      setRestCompleteAlert(true);
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      } catch (e) {}

      setTimeout(() => {
        setRestTimerSeconds(null);
        setRestCompleteAlert(false);
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [restTimerSeconds]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <div className="flex items-center gap-3 text-sm text-neutral-400">
          <Dumbbell className="w-5 h-5 animate-spin text-amber-400" />
          <span>Setting up your workout environment...</span>
        </div>
      </div>
    );
  }

  const currentWorkoutExercise = todayDay?.exercises[currentExerciseIndex];
  const currentExercise = currentWorkoutExercise?.exercise;
  const totalExercises = todayDay?.exercises?.length || 0;
  const totalSetsForCurrent = currentWorkoutExercise?.targetSets || 3;
  const prevPerf = currentExercise ? previousPerformance[currentExercise.id] : null;

  const startRestTimer = (seconds: number) => {
    setRestDuration(seconds);
    setRestTimerSeconds(seconds);
    setRestCompleteAlert(false);
  };

  const handleCompleteSet = () => {
    if (!currentExercise) return;

    const setRecord = {
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.name,
      setNumber: currentSetNumber,
      weightKg: weightInput,
      actualReps: repsInput,
      targetReps: currentWorkoutExercise.targetReps,
      isCompleted: true,
    };

    const nextCompletedSets = [...completedSets, setRecord];
    setCompletedSets(nextCompletedSets);

    // Move to next set or next exercise
    if (currentSetNumber < totalSetsForCurrent) {
      setCurrentSetNumber((prev) => prev + 1);
      startRestTimer(currentWorkoutExercise.targetRestSec || 60);
    } else if (currentExerciseIndex < totalExercises - 1) {
      // Move to next exercise
      const nextIdx = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIdx);
      setCurrentSetNumber(1);
      const nextEx = todayDay.exercises[nextIdx]?.exercise;
      if (nextEx && previousPerformance[nextEx.id]) {
        setWeightInput(previousPerformance[nextEx.id].weightKg);
        setRepsInput(previousPerformance[nextEx.id].reps);
      }
      startRestTimer(90);
    } else {
      // Finished all exercises
      handleFinishWorkout(nextCompletedSets);
    }
  };

  const handleSkipExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      const nextIdx = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIdx);
      setCurrentSetNumber(1);
    } else {
      handleFinishWorkout();
    }
  };

  const handleFinishWorkout = async (overrideSets?: any[]) => {
    setIsTimerRunning(false);
    setSaving(true);
    setFinishError('');

    // If no sets completed yet, auto-record current set so workout volume is logged
    let setsToSubmit = overrideSets || completedSets;
    if (setsToSubmit.length === 0 && currentExercise) {
      setsToSubmit = [
        {
          exerciseId: currentExercise.id,
          exerciseName: currentExercise.name,
          setNumber: currentSetNumber,
          weightKg: weightInput,
          actualReps: repsInput,
          targetReps: currentWorkoutExercise?.targetReps || '10',
          isCompleted: true,
        },
      ];
    }

    try {
      const res = await fetch('/api/workouts/complete-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: planData?.id,
          dayName: todayDay?.name || 'Daily Workout',
          durationSec: Math.max(elapsedSeconds, 60),
          sets: setsToSubmit,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete session');
      }

      if (data?.summary) {
        setWorkoutSummary(data.summary);
        setIsFinished(true);
        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          console.warn('Confetti notification ignored:', e);
        }
      }
    } catch (err: any) {
      console.error(err);
      setFinishError(err.message || 'Error finishing workout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 flex flex-col justify-between max-w-4xl mx-auto px-4 py-4 sm:py-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <button
          type="button"
          onClick={() => router.push('/workouts')}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Workout</span>
        </button>

        {/* Workout Timer */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-bold text-amber-400">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>

        <button
          type="button"
          onClick={() => handleFinishWorkout()}
          disabled={saving}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black text-xs font-extrabold transition-colors shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1.5"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Finish Workout</span>
          )}
        </button>
      </div>

      {/* Error notification banner if any */}
      {finishError && (
        <div className="mt-3 p-3 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-semibold flex items-center justify-between shadow-lg">
          <span>{finishError}</span>
          <button
            type="button"
            onClick={() => setFinishError('')}
            className="p-1 rounded-lg text-neutral-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Exercise View */}
      <div className="flex-1 py-4 space-y-6">
        {/* Day & Progress Line */}
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              {todayDay?.name}
            </span>
            <div className="font-extrabold text-white text-base">
              Exercise {currentExerciseIndex + 1} of {totalExercises}
            </div>
          </div>
          <div className="text-right text-neutral-400 font-semibold">
            Set <span className="text-amber-400 font-bold text-sm">{currentSetNumber}</span> of {totalSetsForCurrent}
          </div>
        </div>

        {/* Exercise Demonstration Component */}
        {currentExercise && (
          <ExerciseDemo
            exerciseName={currentExercise.name}
            primaryMuscle={currentExercise.primaryMuscle}
            secondaryMuscles={
              currentExercise.secondaryMuscles
                ? JSON.parse(currentExercise.secondaryMuscles)
                : []
            }
            equipment={currentExercise.equipment}
            targetSets={totalSetsForCurrent}
            targetReps={currentWorkoutExercise.targetReps}
            instructions={
              currentExercise.instructions
                ? JSON.parse(currentExercise.instructions)
                : []
            }
            safetyTips={
              currentExercise.safetyTips
                ? JSON.parse(currentExercise.safetyTips)
                : []
            }
          />
        )}

        {/* Previous Performance Memory Note */}
        {prevPerf && (
          <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-400">Previous Session Benchmark:</span>
            <span className="font-bold text-amber-400">
              {prevPerf.weightKg} kg × {prevPerf.reps} reps
            </span>
          </div>
        )}

        {/* Set Logger Card */}
        <div className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Current Working Set
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Target: {currentWorkoutExercise?.targetReps} Reps
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Weight Input */}
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Weight (KG)
              </span>
              <div className="flex items-center justify-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setWeightInput((w) => Math.max(0, w - 2.5))}
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  step="0.5"
                  value={weightInput}
                  onChange={(e) => setWeightInput(parseFloat(e.target.value) || 0)}
                  className="w-20 text-center text-2xl font-black bg-transparent text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setWeightInput((w) => w + 2.5)}
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Reps Input */}
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Actual Reps
              </span>
              <div className="flex items-center justify-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setRepsInput((r) => Math.max(1, r - 1))}
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={repsInput}
                  onChange={(e) => setRepsInput(parseInt(e.target.value, 10) || 0)}
                  className="w-16 text-center text-2xl font-black bg-transparent text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setRepsInput((r) => r + 1)}
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Complete Set / Skip Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCompleteSet}
              className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Complete Set {currentSetNumber}</span>
            </button>
            <button
              type="button"
              onClick={handleSkipExercise}
              className="py-4 px-4 rounded-2xl border border-neutral-700 hover:border-neutral-600 text-neutral-400 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <SkipForward className="w-4 h-4" />
              <span>Skip</span>
            </button>
          </div>
        </div>

        {/* Rest Timer Banner */}
        {restTimerSeconds !== null && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-extrabold text-sm">
                {restTimerSeconds}s
              </div>
              <div>
                <div className="text-xs font-bold text-white">Resting between sets</div>
                <div className="text-[10px] text-neutral-400">Deep breaths & hydrate</div>
              </div>
            </div>

            {/* Quick adjust presets */}
            <div className="flex items-center gap-1.5">
              {[30, 60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => startRestTimer(sec)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                    restDuration === sec
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
              <button
                type="button"
                onClick={() => setRestTimerSeconds(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Rest Complete Notification Toast */}
        {restCompleteAlert && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-black font-extrabold text-sm text-center shadow-2xl animate-bounce">
            REST COMPLETE — NEXT SET 💪
          </div>
        )}
      </div>

      {/* WORKOUT COMPLETION MODAL */}
      {isFinished && workoutSummary && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30">
              <Trophy className="w-8 h-8 text-black" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Workout Complete 🎉
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Outstanding effort! All sets and volume have been saved to your records.
              </p>
            </div>

            {/* New PR celebration if detected */}
            {workoutSummary.newPrs?.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-400 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>🏆 NEW PERSONAL RECORD!</span>
                </div>
                {workoutSummary.newPrs.map((pr: any, i: number) => (
                  <div key={i} className="text-xs text-neutral-200">
                    • <strong>{pr.exerciseName}</strong>: {pr.weightKg} kg × {pr.reps} reps
                  </div>
                ))}
              </div>
            )}

            {/* Stats Breakdown */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Duration</span>
                <div className="text-lg font-black text-white mt-0.5">
                  {formatTime(workoutSummary.durationSec)}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Total Volume</span>
                <div className="text-lg font-black text-amber-400 mt-0.5">
                  {workoutSummary.totalVolumeKg} kg
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Total Sets</span>
                <div className="text-lg font-black text-white mt-0.5">
                  {workoutSummary.totalSets}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Est. Calories</span>
                <div className="text-lg font-black text-yellow-400 mt-0.5">
                  ~{workoutSummary.caloriesBurned} kcal
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
