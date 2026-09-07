'use client';

import { useState } from 'react';
import { Play, Pause, RotateCcw, Info, ShieldAlert, Sparkles } from 'lucide-react';

interface ExerciseDemoProps {
  exerciseName: string;
  primaryMuscle: string;
  secondaryMuscles?: string[];
  equipment: string;
  targetSets?: number | string;
  targetReps?: string;
  instructions?: string[];
  safetyTips?: string[];
}

export default function ExerciseDemo({
  exerciseName,
  primaryMuscle,
  secondaryMuscles = [],
  equipment,
  targetSets = 3,
  targetReps = '10',
  instructions = [],
  safetyTips = [],
}: ExerciseDemoProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState<'visual' | 'instructions' | 'safety'>('visual');

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
      {/* Header with Exercise Info */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {primaryMuscle}
            </span>
            <span className="text-xs text-slate-400">{equipment}</span>
          </div>
          <h3 className="font-extrabold text-base text-white mt-1">{exerciseName}</h3>
        </div>

        <div className="text-right">
          <div className="text-xs font-bold text-emerald-400">{targetSets} Sets</div>
          <div className="text-[11px] text-slate-400">{targetReps} Reps</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('visual')}
          className={`flex-1 py-2.5 text-center transition-colors ${
            activeTab === 'visual' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Demonstration
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('instructions')}
          className={`flex-1 py-2.5 text-center transition-colors ${
            activeTab === 'instructions' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Instructions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('safety')}
          className={`flex-1 py-2.5 text-center transition-colors ${
            activeTab === 'safety' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Form & Safety
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'visual' && (
          <div className="relative rounded-2xl bg-[#080b12] border border-slate-800/80 p-6 flex flex-col items-center justify-center min-h-[220px] overflow-hidden">
            {/* SVG Visual Demonstration */}
            <div className="relative w-48 h-40 flex items-center justify-center">
              <svg viewBox="0 0 200 160" className="w-full h-full">
                {/* Bench or Ground Plane */}
                <rect x="30" y="125" width="140" height="8" rx="4" fill="#1e293b" />
                <rect x="50" y="133" width="10" height="20" rx="2" fill="#0f172a" />
                <rect x="140" y="133" width="10" height="20" rx="2" fill="#0f172a" />

                {/* Animated Athlete Figure */}
                <g className={isPlaying ? 'animate-bounce' : ''} style={{ animationDuration: '2.5s' }}>
                  {/* Head */}
                  <circle cx="100" cy="50" r="14" fill="#38bdf8" opacity="0.9" />

                  {/* Spine / Torso */}
                  <line x1="100" y1="64" x2="100" y2="105" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" />

                  {/* Primary Active Muscle Highlight (Chest/Shoulders/Back) */}
                  <rect x="90" y="68" width="20" height="18" rx="4" fill="#10b981" />

                  {/* Arms & Barbell Motion */}
                  <line x1="75" y1="75" x2="100" y2="75" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
                  <line x1="100" y1="75" x2="125" y2="75" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />

                  {/* Weight / Barbell */}
                  <line x1="50" y1="70" x2="150" y2="70" stroke="#f59e0b" strokeWidth="4" />
                  <rect x="44" y="60" width="8" height="20" rx="2" fill="#ef4444" />
                  <rect x="148" y="60" width="8" height="20" rx="2" fill="#ef4444" />

                  {/* Motion Trajectory Indicator */}
                  <line
                    x1="100"
                    y1="40"
                    x2="100"
                    y2="95"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    opacity="0.6"
                  />
                </g>
              </svg>
            </div>

            {/* Play / Pause Controls */}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isPlaying ? 'Pause Motion' : 'Play Motion'}</span>
              </button>
            </div>

            {/* Target Muscle Badges */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/25">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Primary: {primaryMuscle}</span>
              </div>
              {secondaryMuscles.map((m, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'instructions' && (
          <div className="space-y-2.5 py-2">
            {instructions.length > 0 ? (
              instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Perform exercise with steady control and continuous core engagement.</p>
            )}
          </div>
        )}

        {activeTab === 'safety' && (
          <div className="space-y-2.5 py-2">
            {safetyTips.length > 0 ? (
              safetyTips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300">
                  <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))
            ) : (
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800 text-xs text-slate-300">
                <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Keep wrists aligned and avoid hyperextending joints at the top of movement.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
