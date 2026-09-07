'use client';

import { useState } from 'react';
import { Play, Pause, Info, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import AnatomyVisualizer, { getExerciseArchetype } from './AnatomyVisualizer';

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

  const archetype = getExerciseArchetype(exerciseName, '', primaryMuscle, equipment);

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
      {/* Header with Exercise Info */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.25)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
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
          className={`flex-1 py-2.5 text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'visual' ? 'text-red-400 border-b-2 border-red-500 bg-red-500/5' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Anatomy & Motion</span>
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
          <div className="relative rounded-2xl bg-[#080b12] border border-slate-800/80 p-4 flex flex-col items-center justify-center overflow-hidden">
            {/* Real Biomechanical Anatomy Demonstration with Red Targeted Muscle */}
            <AnatomyVisualizer
              archetype={archetype}
              exerciseName={exerciseName}
              primaryMuscle={primaryMuscle}
              isPlaying={isPlaying}
            />

            {/* Play / Pause Controls & Action Bar */}
            <div className="mt-4 flex items-center justify-between w-full pt-3 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-red-400" /> : <Play className="w-3.5 h-3.5 text-red-400" />}
                <span>{isPlaying ? 'Pause Motion' : 'Play Motion'}</span>
              </button>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Target: {primaryMuscle}</span>
                </div>
                {secondaryMuscles.slice(0, 2).map((m, idx) => (
                  <div key={idx} className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-800/90 px-2 py-1 rounded-lg border border-slate-700/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
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
