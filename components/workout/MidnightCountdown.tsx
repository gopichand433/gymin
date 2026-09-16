'use client';

import { useState, useEffect } from 'react';
import { Clock, Lock, Moon, Sparkles, ShieldCheck, Dumbbell } from 'lucide-react';

interface MidnightCountdownProps {
  variant?: 'card' | 'compact' | 'button' | 'minimal';
  onUnlock?: () => void;
  nextWorkout?: {
    dayName?: string;
    exerciseCount?: number;
  } | null;
  className?: string;
}

export default function MidnightCountdown({
  variant = 'card',
  onUnlock,
  nextWorkout,
  className = '',
}: MidnightCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isUnlocked: boolean;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isUnlocked: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Target is next midnight: 00:00:00 AM of tomorrow
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        0
      );

      const diffMs = midnight.getTime() - now.getTime();

      if (diffMs <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, isUnlocked: true };
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return { hours, minutes, seconds, isUnlocked: false };
    };

    // Initialize
    const initial = calculateTimeLeft();
    setTimeLeft(initial);
    if (initial.isUnlocked && onUnlock) {
      onUnlock();
    }

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining.isUnlocked) {
        clearInterval(timer);
        if (onUnlock) onUnlock();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [onUnlock]);

  const pad = (n: number) => String(n).padStart(2, '0');

  // Minimal variant: Just digital numbers
  if (variant === 'minimal') {
    return (
      <span className={`font-mono font-black ${className}`}>
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </span>
    );
  }

  // Button variant: Disabled locked action button with ticking timer
  if (variant === 'button') {
    return (
      <button
        type="button"
        disabled
        className={`w-full py-3.5 px-4 rounded-2xl bg-neutral-900/90 border border-amber-500/30 text-neutral-300 font-extrabold text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-90 shadow-inner ${className}`}
      >
        <Lock className="w-4 h-4 text-amber-400" />
        <span>Next Workout Unlocks in:</span>
        <span className="font-mono text-amber-400 bg-black/50 px-2.5 py-1 rounded-xl border border-amber-500/30">
          {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </span>
      </button>
    );
  }

  // Compact variant: Horizontal pill/banner
  if (variant === 'compact') {
    return (
      <div
        className={`px-3.5 py-2 rounded-2xl bg-gradient-to-r from-neutral-900 via-[#141209] to-neutral-900 border border-amber-500/30 flex items-center justify-between gap-3 text-xs shadow-md ${className}`}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-white text-[11px] flex items-center gap-1">
              <span>Next Workout at 12:00 AM Midnight</span>
              <span className="text-[10px] text-amber-400 font-semibold">• Rest Window</span>
            </div>
            {nextWorkout?.dayName && (
              <div className="text-[10px] text-neutral-400 truncate max-w-[200px]">
                Up next: {nextWorkout.dayName}
              </div>
            )}
          </div>
        </div>

        <div className="font-mono font-black text-amber-400 bg-black/60 px-2.5 py-1 rounded-xl border border-amber-500/30 text-xs">
          {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </div>
      </div>
    );
  }

  // Full Card variant: High-impact obsidian & gold countdown module
  return (
    <div
      className={`p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-neutral-950 via-[#12110a] to-neutral-950 border border-amber-500/30 shadow-xl space-y-4 text-center sm:text-left ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3.5">
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
            <Moon className="w-3 h-3 text-amber-400" />
            <span>Rest & Recovery Window Active</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-semibold justify-center sm:justify-end">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Today's Workout Complete</span>
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="text-base sm:text-lg font-black text-white flex items-center justify-center sm:justify-start gap-2">
          <span>Next Workout Unlocks at 12:00 AM Midnight</span>
          <Lock className="w-4 h-4 text-amber-400" />
        </h4>
        <p className="text-xs text-neutral-400">
          Exercise science demonstrates that muscles rebuild and strengthen during rest. You can start tomorrow's session immediately after midnight 12:00 AM!
        </p>
      </div>

      {/* 3 Digital Countdown Clock Boxes */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 max-w-sm mx-auto sm:mx-0">
        <div className="p-3 sm:p-3.5 rounded-2xl bg-neutral-900/90 border border-amber-500/30 text-center shadow-lg">
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
            {pad(timeLeft.hours)}
          </div>
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
            Hours
          </span>
        </div>

        <div className="p-3 sm:p-3.5 rounded-2xl bg-neutral-900/90 border border-amber-500/30 text-center shadow-lg">
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
            {pad(timeLeft.minutes)}
          </div>
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
            Minutes
          </span>
        </div>

        <div className="p-3 sm:p-3.5 rounded-2xl bg-neutral-900/90 border border-amber-500/30 text-center shadow-lg">
          <div className="text-2xl sm:text-3xl font-black text-yellow-400 font-mono tracking-tight">
            {pad(timeLeft.seconds)}
          </div>
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
            Seconds
          </span>
        </div>
      </div>

      {/* Next Day Preview Pill */}
      {nextWorkout?.dayName && (
        <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800/90 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-amber-400" />
            <span className="text-neutral-400">Scheduled for Tomorrow:</span>
            <strong className="text-white font-bold">{nextWorkout.dayName}</strong>
          </div>
          {nextWorkout.exerciseCount && (
            <span className="text-[10px] text-neutral-400">
              {nextWorkout.exerciseCount} exercises
            </span>
          )}
        </div>
      )}
    </div>
  );
}
