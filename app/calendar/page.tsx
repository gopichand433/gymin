'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Utensils,
  Footprints,
  Scale,
  X,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function CalendarPage() {
  const [calendarMap, setCalendarMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDaySummary, setSelectedDaySummary] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/calendar')
      .then((res) => res.json())
      .then((data) => {
        if (data?.calendarMap) setCalendarMap(data.calendarMap);
      })
      .finally(() => setLoading(false));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate days in month
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon...
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (dayNumber: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    const dayData = calendarMap[formattedDate] || {
      date: formattedDate,
      workouts: [],
      calories: 0,
      protein: 0,
      steps: 0,
    };
    setSelectedDaySummary(dayData);
  };

  // Calendar cells
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return (
    <AppShell>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Habit & Consistency Logging
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
              Fitness Calendar
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Tap any date to inspect workouts, meals, steps, and weight logs
            </p>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-extrabold text-xs sm:text-sm text-white px-2">
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Workout Done</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <span>Meals Logged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Steps Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            <span>Rest Day</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="grid grid-cols-7 text-center text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-20 sm:h-24" />;
              }

              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayData = calendarMap[dateKey];
              const hasWorkout = dayData?.workouts && dayData.workouts.length > 0;
              const hasFood = dayData?.calories > 0;
              const hasSteps = dayData?.steps > 0;
              const hasWeight = dayData?.weight !== undefined;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`h-20 sm:h-24 p-2 rounded-2xl border text-left flex flex-col justify-between transition-all group ${
                    hasWorkout
                      ? 'bg-emerald-500/10 border-emerald-500/40 hover:bg-emerald-500/15'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white group-hover:text-emerald-400">
                      {day}
                    </span>
                    {hasWorkout && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </div>

                  {/* Day activity icons */}
                  <div className="space-y-1">
                    {hasWorkout && (
                      <div className="text-[10px] font-bold text-emerald-400 truncate hidden sm:block">
                        {dayData.workouts[0].dayName}
                      </div>
                    )}
                    {hasFood && (
                      <div className="text-[9px] text-slate-400 truncate hidden sm:block">
                        {Math.round(dayData.calories)} kcal
                      </div>
                    )}
                    {hasSteps && (
                      <div className="text-[9px] text-cyan-400 truncate hidden sm:block">
                        {dayData.steps.toLocaleString()} steps
                      </div>
                    )}
                  </div>

                  {/* Mobile mini dots */}
                  <div className="flex items-center gap-1 sm:hidden">
                    {hasWorkout && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    {hasFood && <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />}
                    {hasSteps && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* DAY DETAIL MODAL */}
      {selectedDaySummary && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0d14] border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Daily Overview
                </span>
                <h3 className="text-lg font-black text-white">
                  {formatDate(selectedDaySummary.date)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDaySummary(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Workout Details */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                <span>Workout Session</span>
              </div>
              {selectedDaySummary.workouts?.length > 0 ? (
                selectedDaySummary.workouts.map((w: any, idx: number) => (
                  <div key={idx} className="text-xs text-slate-300">
                    <div className="font-semibold text-white">{w.dayName}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {w.totalSets} sets • {w.totalVolumeKg?.toLocaleString()} kg volume • ~{w.caloriesBurned} kcal
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">Rest day / Active recovery</p>
              )}
            </div>

            {/* Nutrition Details */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Utensils className="w-4 h-4 text-teal-400" />
                <span>Nutrition & Macros</span>
              </div>
              {selectedDaySummary.calories > 0 ? (
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white">
                    {Math.round(selectedDaySummary.calories)} kcal consumed
                  </span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Protein: {Math.round(selectedDaySummary.protein)}g
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No meal logs recorded on this date</p>
              )}
            </div>

            {/* Steps & Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Steps</span>
                <div className="text-base font-black text-cyan-400 mt-0.5">
                  {selectedDaySummary.steps ? `${selectedDaySummary.steps.toLocaleString()}` : '—'}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Weigh-in</span>
                <div className="text-base font-black text-white mt-0.5">
                  {selectedDaySummary.weight ? `${selectedDaySummary.weight} kg` : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
