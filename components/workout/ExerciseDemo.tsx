'use client';

import { useState } from 'react';
import { Play, Pause, Info, ShieldAlert, Sparkles, Activity, Eye, Zap, Sun, Moon } from 'lucide-react';
import AnatomyVisualizer, { getExerciseArchetype } from './AnatomyVisualizer';
import { getExerciseMedia } from '@/lib/exercises/exercise-media';

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
  const [viewMode, setViewMode] = useState<'realistic' | 'vector'>('realistic');
  const [backdrop, setBackdrop] = useState<'light' | 'dark'>('light');
  const [imgError, setImgError] = useState(false);

  const archetype = getExerciseArchetype(exerciseName, '', primaryMuscle, equipment);
  const exerciseMedia = getExerciseMedia(exerciseName);

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
            {/* View Mode Pill Switcher */}
            <div className="w-full flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_8px_#ef4444]" />
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-400">
                  Target Muscle (Red): {primaryMuscle}
                </span>
              </div>

              {exerciseMedia && !imgError && (
                <div className="flex items-center gap-1.5">
                  {viewMode === 'realistic' && (
                    <button
                      type="button"
                      title={backdrop === 'light' ? 'Switch to Dark Studio' : 'Switch to Medical White Studio'}
                      onClick={() => setBackdrop(backdrop === 'light' ? 'dark' : 'light')}
                      className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      {backdrop === 'light' ? (
                        <>
                          <Moon className="w-3 h-3 text-cyan-400" />
                          <span className="hidden sm:inline">Dark</span>
                        </>
                      ) : (
                        <>
                          <Sun className="w-3 h-3 text-amber-400" />
                          <span className="hidden sm:inline">White Studio</span>
                        </>
                      )}
                    </button>
                  )}

                  <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setViewMode('realistic')}
                      className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                        viewMode === 'realistic' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                      <span>Realistic Anatomy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('vector')}
                      className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                        viewMode === 'vector' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Biomechanical</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Main Visual Display */}
            {viewMode === 'realistic' && exerciseMedia && !imgError ? (
              <div
                className={`relative w-full max-w-[380px] h-[250px] rounded-2xl border shadow-2xl flex items-center justify-center overflow-hidden p-2 transition-all duration-300 ${
                  backdrop === 'light'
                    ? 'bg-gradient-to-b from-white via-slate-50 to-slate-100 border-slate-200/80 shadow-slate-950/20'
                    : 'bg-[#04060a] border-slate-800 shadow-slate-950/80'
                }`}
              >
                {/* Background Grid Accent for Dark Mode */}
                {backdrop === 'dark' && (
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />
                )}

                {/* Real Human Anatomy Exercise Animation (GymVisual) */}
                <img
                  src={isPlaying ? (exerciseMedia.localGif || exerciseMedia.cdnGif) : exerciseMedia.cdnImage}
                  alt={`${exerciseName} anatomy animation`}
                  className={`max-h-[235px] w-auto object-contain rounded-xl select-none transition-all ${
                    backdrop === 'light'
                      ? 'filter contrast-105'
                      : 'filter contrast-125 brightness-105'
                  }`}
                  onError={() => setImgError(true)}
                  loading="eager"
                />

                {/* Badge */}
                <div
                  className={`absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono border backdrop-blur-sm ${
                    backdrop === 'light'
                      ? 'bg-white/80 border-slate-200 text-slate-700 shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400'
                  }`}
                >
                  {exerciseMedia.datasetName.toUpperCase()}
                </div>
              </div>
            ) : (
              <AnatomyVisualizer
                archetype={archetype}
                exerciseName={exerciseName}
                primaryMuscle={primaryMuscle}
                isPlaying={isPlaying}
              />
            )}

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
