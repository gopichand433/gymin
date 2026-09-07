'use client';

import React from 'react';

export type ExerciseArchetype =
  | 'BENCH_PRESS'
  | 'TRICEP_PUSHDOWN'
  | 'BICEP_CURL'
  | 'SQUAT'
  | 'DEADLIFT'
  | 'OVERHEAD_PRESS'
  | 'LATERAL_RAISE'
  | 'LAT_PULLDOWN'
  | 'BENT_OVER_ROW'
  | 'LEG_EXTENSION_CURL'
  | 'CALF_RAISE'
  | 'CORE_ABS';

interface AnatomyVisualizerProps {
  archetype: ExerciseArchetype;
  exerciseName: string;
  primaryMuscle: string;
  isPlaying: boolean;
}

export function getExerciseArchetype(
  name: string = '',
  slug: string = '',
  primaryMuscle: string = '',
  equipment: string = ''
): ExerciseArchetype {
  const text = `${name} ${slug} ${primaryMuscle} ${equipment}`.toLowerCase();

  // 1. Specific Tricep Movements
  if (
    text.includes('pushdown') ||
    text.includes('tricep') ||
    text.includes('skull-crush') ||
    text.includes('skull crush') ||
    text.includes('kickback') ||
    text.includes('diamond-push') ||
    text.includes('diamond push')
  ) {
    return 'TRICEP_PUSHDOWN';
  }

  // 2. Chest Press / Push Movements
  if (
    text.includes('bench-press') ||
    text.includes('bench press') ||
    text.includes('incline-dumbbell-press') ||
    text.includes('incline') ||
    text.includes('push-up') ||
    text.includes('push up') ||
    text.includes('fly') ||
    text.includes('flyes') ||
    text.includes('dips') ||
    text.includes('pullover') ||
    (primaryMuscle.toLowerCase() === 'chest' && !text.includes('curl'))
  ) {
    return 'BENCH_PRESS';
  }

  // 3. Biceps
  if (text.includes('curl') || text.includes('bicep') || text.includes('preacher') || text.includes('hammer')) {
    return 'BICEP_CURL';
  }

  // 4. Squat & Quad/Glute Push
  if (
    text.includes('squat') ||
    text.includes('leg-press') ||
    text.includes('leg press') ||
    text.includes('lunge') ||
    text.includes('split-squat') ||
    text.includes('split squat') ||
    text.includes('hack')
  ) {
    return 'SQUAT';
  }

  // 5. Deadlift & Hip Hinge
  if (
    text.includes('deadlift') ||
    text.includes('rdl') ||
    text.includes('hip-thrust') ||
    text.includes('hip thrust') ||
    text.includes('good morning')
  ) {
    return 'DEADLIFT';
  }

  // 6. Overhead Press
  if (
    text.includes('overhead') ||
    text.includes('military') ||
    text.includes('arnold') ||
    (text.includes('shoulder') && text.includes('press')) ||
    text.includes('ohp')
  ) {
    return 'OVERHEAD_PRESS';
  }

  // 7. Lateral / Deltoid Raises
  if (
    text.includes('lateral') ||
    text.includes('raise') ||
    text.includes('face pull') ||
    text.includes('face-pull') ||
    text.includes('rear delt') ||
    text.includes('shrug')
  ) {
    return 'LATERAL_RAISE';
  }

  // 8. Lat Pulldowns & Pull-ups
  if (text.includes('pulldown') || text.includes('pull-up') || text.includes('pull up') || text.includes('chin-up') || text.includes('chin up')) {
    return 'LAT_PULLDOWN';
  }

  // 9. Rows
  if (text.includes('row') || text.includes('t-bar') || text.includes('bent over')) {
    return 'BENT_OVER_ROW';
  }

  // 10. Leg Extension & Curls
  if (text.includes('leg-extension') || text.includes('leg extension') || text.includes('leg-curl') || text.includes('leg curl')) {
    return 'LEG_EXTENSION_CURL';
  }

  // 11. Calves
  if (text.includes('calf') || text.includes('calves')) {
    return 'CALF_RAISE';
  }

  // 12. Core & Abs
  if (
    text.includes('plank') ||
    text.includes('abs') ||
    text.includes('ab ') ||
    text.includes('crunch') ||
    text.includes('leg-raise') ||
    text.includes('leg raise') ||
    text.includes('russian') ||
    text.includes('woodchopper') ||
    text.includes('wheel')
  ) {
    return 'CORE_ABS';
  }

  // Default muscle category mappings
  const pm = primaryMuscle.toLowerCase();
  if (pm.includes('chest')) return 'BENCH_PRESS';
  if (pm.includes('tricep')) return 'TRICEP_PUSHDOWN';
  if (pm.includes('bicep')) return 'BICEP_CURL';
  if (pm.includes('shoulder')) return 'OVERHEAD_PRESS';
  if (pm.includes('back')) return 'LAT_PULLDOWN';
  if (pm.includes('leg') || pm.includes('glute')) return 'SQUAT';
  if (pm.includes('calf') || pm.includes('calves')) return 'CALF_RAISE';
  if (pm.includes('ab') || pm.includes('core')) return 'CORE_ABS';

  return 'BENCH_PRESS';
}

export default function AnatomyVisualizer({
  archetype,
  exerciseName,
  primaryMuscle,
  isPlaying,
}: AnatomyVisualizerProps) {
  const playState = isPlaying ? 'running' : 'paused';

  return (
    <div className="w-full flex flex-col items-center justify-center select-none">
      {/* Target Muscle Spotlight Header */}
      <div className="w-full flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_8px_#ef4444]" />
          </span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-400">
            Target Muscle Active: {primaryMuscle}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/50">
          <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
          <span>Body: Stabilizers (White/Grey)</span>
        </div>
      </div>

      {/* Interactive Anatomy Canvas */}
      <div className="relative w-full max-w-[380px] h-[240px] rounded-2xl bg-gradient-to-b from-[#090d16] via-[#06080e] to-[#040508] border border-slate-800/90 shadow-2xl flex items-center justify-center overflow-hidden">
        {/* Subtle Anatomical Grid / Backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
        
        {/* Central Anatomical Floor Grid Line */}
        <div className="absolute bottom-6 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />

        {/* Global SVG Anatomy Canvas */}
        <svg
          viewBox="0 0 340 240"
          className="relative w-full h-full"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Vivid Red Glowing Muscle Filter */}
            <filter id="redMuscleGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ef4444" floodOpacity="0.95" />
              <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#dc2626" floodOpacity="0.75" />
            </filter>

            {/* Subtle Bone / Body Joint Shadow */}
            <filter id="jointShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.6" />
            </filter>

            {/* Red Muscle Linear Gradient for Dynamic Muscle Belly Contraction */}
            <linearGradient id="activeRedMuscle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff4d4d" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>

            {/* White / Grey Anatomical Body Gradient */}
            <linearGradient id="bodyBoneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="60%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            <linearGradient id="inactiveMuscleGrey" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            {/* Steel Equipment Gradient */}
            <linearGradient id="steelBar" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            <linearGradient id="weightPlateRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
          </defs>

          {/* Embedded Styles for Smooth Biomechanical Keyframes */}
          <style>{`
            /* Muscle Pulsing Glow Animation */
            @keyframes muscleContractPulse {
              0%, 100% {
                filter: url(#redMuscleGlow);
                opacity: 0.92;
                transform: scale(1);
              }
              50% {
                filter: drop-shadow(0 0 12px #ff2b2b) drop-shadow(0 0 4px #ffffff);
                opacity: 1;
                transform: scale(1.06);
              }
            }

            /* 1. BENCH PRESS BIOMECHANICS */
            @keyframes benchPressArmMotion {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(28px);
              }
            }
            @keyframes benchPecContraction {
              0%, 100% {
                transform: scale(1.08);
                filter: drop-shadow(0 0 10px #ef4444);
              }
              50% {
                transform: scale(0.95);
                filter: drop-shadow(0 0 4px #dc2626);
              }
            }

            /* 2. TRICEP PUSHDOWN BIOMECHANICS */
            @keyframes tricepForearmHinge {
              0%, 100% {
                transform: rotate(50deg);
              }
              50% {
                transform: rotate(-10deg);
              }
            }
            @keyframes tricepMuscleContract {
              0%, 100% {
                transform: scale(0.96);
                filter: drop-shadow(0 0 3px #dc2626);
              }
              50% {
                transform: scale(1.12);
                filter: drop-shadow(0 0 12px #ff3b3b);
              }
            }

            /* 3. BICEP CURL BIOMECHANICS */
            @keyframes bicepForearmCurl {
              0%, 100% {
                transform: rotate(-65deg);
              }
              50% {
                transform: rotate(45deg);
              }
            }
            @keyframes bicepPeakContraction {
              0%, 100% {
                transform: scale(1.18);
                filter: drop-shadow(0 0 12px #ff2b2b);
              }
              50% {
                transform: scale(0.92);
                filter: drop-shadow(0 0 3px #dc2626);
              }
            }

            /* 4. SQUAT BIOMECHANICS */
            @keyframes squatTorsoKneeDrop {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(32px);
              }
            }
            @keyframes quadGluteBurn {
              0%, 100% {
                transform: scale(1.08);
                filter: drop-shadow(0 0 12px #ff2b2b);
              }
              50% {
                transform: scale(0.96);
                filter: drop-shadow(0 0 4px #dc2626);
              }
            }

            /* 5. DEADLIFT BIOMECHANICS */
            @keyframes deadliftHingeMotion {
              0%, 100% {
                transform: translateY(0px) rotate(0deg);
              }
              50% {
                transform: translateY(28px) rotate(18deg);
              }
            }

            /* 6. OVERHEAD PRESS */
            @keyframes overheadPressMotion {
              0%, 100% {
                transform: translateY(-30px);
              }
              50% {
                transform: translateY(5px);
              }
            }

            /* 7. LATERAL RAISE */
            @keyframes lateralRaiseArc {
              0%, 100% {
                transform: rotate(-70deg);
              }
              50% {
                transform: rotate(0deg);
              }
            }

            /* 8. LAT PULLDOWN */
            @keyframes latPulldownBarMotion {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(32px);
              }
            }

            /* 9. BENT OVER ROW */
            @keyframes bentRowArmPull {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-24px);
              }
            }

            /* 10. CALF RAISE */
            @keyframes calfRaisePlantar {
              0%, 100% {
                transform: translateY(-16px);
              }
              50% {
                transform: translateY(0px);
              }
            }

            /* 11. CORE ABS */
            @keyframes absCrunchMotion {
              0%, 100% {
                transform: rotate(-14deg);
              }
              50% {
                transform: rotate(4deg);
              }
            }
          `}</style>

          {/* RENDER SPECIFIC ANATOMICAL ARCHETYPE */}
          {archetype === 'BENCH_PRESS' && (
            <BenchPressVisual playState={playState} />
          )}

          {archetype === 'TRICEP_PUSHDOWN' && (
            <TricepPushdownVisual playState={playState} />
          )}

          {archetype === 'BICEP_CURL' && (
            <BicepCurlVisual playState={playState} />
          )}

          {archetype === 'SQUAT' && (
            <SquatVisual playState={playState} />
          )}

          {archetype === 'DEADLIFT' && (
            <DeadliftVisual playState={playState} />
          )}

          {archetype === 'OVERHEAD_PRESS' && (
            <OverheadPressVisual playState={playState} />
          )}

          {archetype === 'LATERAL_RAISE' && (
            <LateralRaiseVisual playState={playState} />
          )}

          {archetype === 'LAT_PULLDOWN' && (
            <LatPulldownVisual playState={playState} />
          )}

          {archetype === 'BENT_OVER_ROW' && (
            <BentOverRowVisual playState={playState} />
          )}

          {archetype === 'LEG_EXTENSION_CURL' && (
            <LegExtensionVisual playState={playState} />
          )}

          {archetype === 'CALF_RAISE' && (
            <CalfRaiseVisual playState={playState} />
          )}

          {archetype === 'CORE_ABS' && (
            <CoreAbsVisual playState={playState} />
          )}
        </svg>

        {/* Anatomical Label Overlay in Corner */}
        <div className="absolute bottom-2.5 right-3 bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 shadow-md">
          {archetype.replace(/_/g, ' ')}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   1. BENCH PRESS ANATOMY (Supine on bench, glowing RED Pectorals, Grey Body)
   ========================================================================= */
function BenchPressVisual({ playState }: { playState: string }) {
  return (
    <g transform="translate(20, 10)">
      {/* Flat Workout Bench Structure (Dark Steel) */}
      <rect x="50" y="145" width="200" height="12" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2" />
      <rect x="75" y="157" width="14" height="42" rx="2" fill="#0f172a" />
      <rect x="215" y="157" width="14" height="42" rx="2" fill="#0f172a" />
      <rect x="65" y="195" width="34" height="6" rx="2" fill="#1e293b" />
      <rect x="205" y="195" width="34" height="6" rx="2" fill="#1e293b" />

      {/* Bench Upright Posts & Catchers */}
      <rect x="85" y="80" width="8" height="65" fill="#334155" />
      <polygon points="82,80 96,80 92,72 82,72" fill="#475569" />

      {/* Human Body - Supine on Bench (White / Grey Anatomy) */}
      {/* Head */}
      <circle cx="95" cy="133" r="13" fill="url(#bodyBoneGradient)" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M 90 130 Q 94 135 98 130" stroke="#64748b" strokeWidth="1.2" fill="none" />

      {/* Neck */}
      <rect x="108" y="132" width="12" height="10" rx="3" fill="#cbd5e1" />

      {/* Torso / Spine / Ribcage */}
      <rect x="120" y="128" width="65" height="17" rx="8" fill="url(#bodyBoneGradient)" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="120" y1="136" x2="185" y2="136" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2" />

      {/* Pelvis / Hips */}
      <ellipse cx="190" cy="136" rx="14" ry="10" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />

      {/* Thigh (Femur) extending downward to floor */}
      <path d="M 195 138 L 225 158" stroke="#cbd5e1" strokeWidth="14" strokeLinecap="round" />
      <circle cx="225" cy="158" r="7" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />

      {/* Lower Leg (Shin) to Foot */}
      <path d="M 225 158 L 225 198" stroke="#cbd5e1" strokeWidth="11" strokeLinecap="round" />
      <path d="M 220 198 L 245 198" stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" />

      {/* TARGET MUSCLE: PECTORALIS MAJOR (CHEST) IN VIVID RED */}
      <g
        style={{
          transformOrigin: '142px 131px',
          animation: `benchPecContraction 2.4s ease-in-out infinite ${playState}`,
        }}
      >
        {/* Pectoral Muscle Belly Contour */}
        <path
          d="M 125 125 C 135 118, 152 118, 160 126 C 158 136, 142 138, 126 135 Z"
          fill="url(#activeRedMuscle)"
          stroke="#ef4444"
          strokeWidth="1.5"
          filter="url(#redMuscleGlow)"
        />
        {/* Muscle Fiber striations */}
        <path d="M 132 124 Q 142 128 152 126" stroke="#ffffff" strokeWidth="1" opacity="0.6" fill="none" />
        <path d="M 130 128 Q 142 132 154 130" stroke="#ffffff" strokeWidth="1" opacity="0.6" fill="none" />
      </g>

      {/* Moving Arms & Barbell Assembly */}
      <g
        style={{
          animation: `benchPressArmMotion 2.4s ease-in-out infinite ${playState}`,
        }}
      >
        {/* Shoulder Joint */}
        <circle cx="128" cy="133" r="7" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />

        {/* Upper Arm (Humerus) */}
        <line x1="128" y1="133" x2="138" y2="100" stroke="#cbd5e1" strokeWidth="11" strokeLinecap="round" />

        {/* Elbow Joint */}
        <circle cx="138" cy="100" r="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />

        {/* Forearm extending up to Barbell */}
        <line x1="138" y1="100" x2="142" y2="66" stroke="#e2e8f0" strokeWidth="9" strokeLinecap="round" />

        {/* Hand Grip */}
        <circle cx="142" cy="66" r="5" fill="#f8fafc" stroke="#64748b" strokeWidth="1" />

        {/* Barbell (Steel bar) */}
        <line x1="45" y1="65" x2="245" y2="65" stroke="url(#steelBar)" strokeWidth="6" strokeLinecap="round" />

        {/* Weight Plates (Vivid Red / Grey Olympic Plates) */}
        <rect x="48" y="42" width="10" height="46" rx="3" fill="url(#weightPlateRed)" stroke="#7f1d1d" strokeWidth="1.5" />
        <rect x="58" y="48" width="6" height="34" rx="2" fill="#475569" />
        <rect x="226" y="48" width="6" height="34" rx="2" fill="#475569" />
        <rect x="232" y="42" width="10" height="46" rx="3" fill="url(#weightPlateRed)" stroke="#7f1d1d" strokeWidth="1.5" />

        {/* Trajectory Guide Dots */}
        <line x1="142" y1="68" x2="142" y2="108" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
      </g>
    </g>
  );
}

/* =========================================================================
   2. TRICEP PUSHDOWN ANATOMY (Standing at Cable Station, glowing RED Triceps)
   ========================================================================= */
function TricepPushdownVisual({ playState }: { playState: string }) {
  return (
    <g transform="translate(35, 10)">
      {/* Cable Machine Column (Right Side) */}
      <rect x="210" y="25" width="22" height="185" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="2" />
      <circle cx="210" cy="40" r="12" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
      <circle cx="210" cy="40" r="4" fill="#cbd5e1" />

      {/* Cable Wire dropping down */}
      <line x1="202" y1="40" x2="162" y2="105" stroke="#94a3b8" strokeWidth="2" strokeDasharray="2 1" />

      {/* Human Anatomy Figure - Standing Athletic Stance (White / Grey) */}
      {/* Head */}
      <circle cx="105" cy="55" r="14" fill="url(#bodyBoneGradient)" stroke="#94a3b8" strokeWidth="1.5" />
      <circle cx="109" cy="53" r="2.5" fill="#64748b" /> {/* Eye */}

      {/* Neck */}
      <line x1="107" y1="69" x2="112" y2="80" stroke="#cbd5e1" strokeWidth="7" strokeLinecap="round" />

      {/* Spine & Torso (Athletic forward lean ~12°) */}
      <path
        d="M 112 80 Q 118 115 125 140"
        stroke="url(#bodyBoneGradient)"
        strokeWidth="20"
        strokeLinecap="round"
        fill="none"
      />
      {/* Chest & Abdominal Contours */}
      <path d="M 115 88 Q 128 92 126 115" stroke="#cbd5e1" strokeWidth="3" fill="none" opacity="0.7" />

      {/* Pelvis / Hips */}
      <ellipse cx="126" cy="144" rx="14" ry="12" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />

      {/* Legs (Slightly bent athletic base) */}
      {/* Front Thigh */}
      <path d="M 126 148 L 140 185" stroke="#cbd5e1" strokeWidth="15" strokeLinecap="round" />
      <circle cx="140" cy="185" r="7" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Front Shin */}
      <path d="M 140 185 L 145 220" stroke="#94a3b8" strokeWidth="11" strokeLinecap="round" />
      <path d="M 140 220 L 160 220" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />

      {/* Rear Leg (Staggered Stance) */}
      <path d="M 120 148 L 105 188 L 100 220" stroke="#64748b" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.7" />

      {/* UPPER ARM: Fixed Vertically at Side (Fulcrum!) */}
      <line x1="116" y1="88" x2="124" y2="128" stroke="#cbd5e1" strokeWidth="14" strokeLinecap="round" />

      {/* TARGET MUSCLE: TRICEPS BRACHII (POSTERIOR ARM) IN VIVID RED */}
      <g
        style={{
          transformOrigin: '118px 105px',
          animation: `tricepMuscleContract 2.2s ease-in-out infinite ${playState}`,
        }}
      >
        {/* Posterior lateral & long head contour on back of arm */}
        <path
          d="M 112 90 C 104 98, 105 118, 118 128 C 117 118, 116 100, 112 90 Z"
          fill="url(#activeRedMuscle)"
          stroke="#ef4444"
          strokeWidth="1.5"
          filter="url(#redMuscleGlow)"
        />
        <path d="M 110 98 Q 112 110 115 120" stroke="#ffffff" strokeWidth="1" opacity="0.7" fill="none" />
      </g>

      {/* Elbow Joint (Fixed Pivot) */}
      <circle cx="124" cy="128" r="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />

      {/* HINGING FOREARM & CABLE BAR (Pushing down from 90° to straight) */}
      <g
        style={{
          transformOrigin: '124px 128px',
          animation: `tricepForearmHinge 2.2s ease-in-out infinite ${playState}`,
        }}
      >
        {/* Forearm */}
        <line x1="124" y1="128" x2="162" y2="148" stroke="#e2e8f0" strokeWidth="9" strokeLinecap="round" />

        {/* Hand gripping Bar */}
        <circle cx="162" cy="148" r="5" fill="#f8fafc" stroke="#64748b" strokeWidth="1.2" />

        {/* Cable Pushdown Handle (Straight / V-Bar) */}
        <line x1="156" y1="140" x2="168" y2="156" stroke="url(#steelBar)" strokeWidth="5" strokeLinecap="round" />

        {/* Cable Connection Clip */}
        <circle cx="162" cy="148" r="2.5" fill="#ef4444" />
      </g>
    </g>
  );
}

/* =========================================================================
   3. BICEP CURL ANATOMY (Standing, Forearms curling, glowing RED Biceps)
   ========================================================================= */
function BicepCurlVisual({ playState }: { playState: string }) {
  return (
    <g transform="translate(50, 10)">
      {/* Standing Human Anatomy Figure */}
      {/* Head */}
      <circle cx="105" cy="50" r="14" fill="url(#bodyBoneGradient)" stroke="#94a3b8" strokeWidth="1.5" />
      <circle cx="109" cy="48" r="2.5" fill="#64748b" />

      {/* Neck */}
      <line x1="105" y1="64" x2="105" y2="76" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />

      {/* Upright Torso / Chest / Core */}
      <path d="M 105 76 L 105 140" stroke="url(#bodyBoneGradient)" strokeWidth="22" strokeLinecap="round" />
      <path d="M 112 85 Q 120 100 114 120" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.6" />

      {/* Pelvis & Straight Legs */}
      <ellipse cx="105" cy="144" rx="14" ry="10" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="98" y1="150" x2="96" y2="215" stroke="#cbd5e1" strokeWidth="14" strokeLinecap="round" />
      <line x1="112" y1="150" x2="114" y2="215" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round" />
      <rect x="86" y="212" width="22" height="7" rx="3" fill="#64748b" />
      <rect x="106" y="212" width="22" height="7" rx="3" fill="#64748b" />

      {/* Shoulder Joint */}
      <circle cx="118" cy="84" r="7" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />

      {/* Upper Arm (Vertical, stationary) */}
      <line x1="118" y1="84" x2="120" y2="126" stroke="#cbd5e1" strokeWidth="13" strokeLinecap="round" />

      {/* TARGET MUSCLE: BICEPS BRACHII (ANTERIOR ARM) IN VIVID RED */}
      <g
        style={{
          transformOrigin: '124px 105px',
          animation: `bicepPeakContraction 2.2s ease-in-out infinite ${playState}`,
        }}
      >
        {/* Bicep Muscle Belly Bulge */}
        <path
          d="M 120 88 C 134 94, 134 116, 122 124 C 118 116, 118 96, 120 88 Z"
          fill="url(#activeRedMuscle)"
          stroke="#ef4444"
          strokeWidth="1.5"
          filter="url(#redMuscleGlow)"
        />
        <path d="M 123 96 Q 128 106 124 116" stroke="#ffffff" strokeWidth="1.2" opacity="0.7" fill="none" />
      </g>

      {/* Elbow Joint (Pivot) */}
      <circle cx="120" cy="126" r="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />

      {/* CURLING FOREARM & DUMBBELL / BARBELL */}
      <g
        style={{
          transformOrigin: '120px 126px',
          animation: `bicepForearmCurl 2.2s ease-in-out infinite ${playState}`,
        }}
      >
        {/* Forearm */}
        <line x1="120" y1="126" x2="160" y2="126" stroke="#e2e8f0" strokeWidth="9" strokeLinecap="round" />

        {/* Hand */}
        <circle cx="160" cy="126" r="5" fill="#f8fafc" stroke="#64748b" strokeWidth="1" />

        {/* Barbell / Dumbbell */}
        <rect x="156" y="112" width="8" height="28" rx="2" fill="url(#steelBar)" stroke="#334155" />
        <rect x="152" y="104" width="16" height="8" rx="2" fill="url(#weightPlateRed)" stroke="#7f1d1d" />
        <rect x="152" y="140" width="16" height="8" rx="2" fill="url(#weightPlateRed)" stroke="#7f1d1d" />
      </g>
    </g>
  );
}

/* =========================================================================
   4. SQUAT ANATOMY (Deep knee bend, glowing RED Quadriceps & Glutes)
   ========================================================================= */
function SquatVisual({ playState }: { playState: string }) {
  return (
    <g transform="translate(60, 10)">
      {/* Barbell on Upper Back (traps) */}
      <line x1="40" y1="62" x2="180" y2="62" stroke="url(#steelBar)" strokeWidth="6" strokeLinecap="round" />
      <rect x="42" y="42" width="10" height="40" rx="3" fill="url(#weightPlateRed)" stroke="#7f1d1d" />
      <rect x="168" y="42" width="10" height="40" rx="3" fill="url(#weightPlateRed)" stroke="#7f1d1d" />

      {/* Animated Squatting Body (Torso and Hips descending) */}
      <g
        style={{
          animation: `squatTorsoKneeDrop 2.6s ease-in-out infinite ${playState}`,
        }}
      >
        {/* Head */}
        <circle cx="110" cy="48" r="14" fill="url(#bodyBoneGradient)" stroke="#94a3b8" strokeWidth="1.5" />

        {/* Torso & Spine */}
        <path d="M 110 62 L 105 125" stroke="url(#bodyBoneGradient)" strokeWidth="22" strokeLinecap="round" />

        {/* Arms holding the barbell */}
        <path d="M 106 72 L 80 62" stroke="#cbd5e1" strokeWidth="7" strokeLinecap="round" />
        <path d="M 114 72 L 140 62" stroke="#cbd5e1" strokeWidth="7" strokeLinecap="round" />

        {/* Pelvis & TARGET MUSCLE: GLUTES IN VIVID RED */}
        <ellipse cx="102" cy="128" rx="16" ry="12" fill="url(#activeRedMuscle)" stroke="#ef4444" strokeWidth="1.5" filter="url(#redMuscleGlow)" />

        {/* TARGET MUSCLE: QUADRICEPS (THIGHS) IN VIVID RED */}
        <g
          style={{
            animation: `quadGluteBurn 2.6s ease-in-out infinite ${playState}`,
          }}
        >
          <path
            d="M 100 130 Q 80 155 90 178"
            stroke="url(#activeRedMuscle)"
            strokeWidth="17"
            strokeLinecap="round"
            fill="none"
            filter="url(#redMuscleGlow)"
          />
          <path
            d="M 108 130 Q 128 155 120 178"
            stroke="url(#activeRedMuscle)"
            strokeWidth="17"
            strokeLinecap="round"
            fill="none"
            filter="url(#redMuscleGlow)"
          />
        </g>

        {/* Knees */}
        <circle cx="90" cy="178" r="7" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="120" cy="178" r="7" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />

        {/* Shins to Feet on Floor */}
        <line x1="90" y1="178" x2="86" y2="215" stroke="#cbd5e1" strokeWidth="11" strokeLinecap="round" />
        <line x1="120" y1="178" x2="124" y2="215" stroke="#cbd5e1" strokeWidth="11" strokeLinecap="round" />
        <rect x="74" y="212" width="22" height="6" rx="2" fill="#64748b" />
        <rect x="116" y="212" width="22" height="6" rx="2" fill="#64748b" />
      </g>
    </g>
  );
}

/* =========================================================================
   5. DEADLIFT ANATOMY (Hip Hinge, glowing RED Hamstrings & Posterior Chain)
   ========================================================================= */
function DeadliftVisual({ playState }: { playState: string }) {
  return (
    <g transform="translate(60, 10)">
      {/* Moving Upper Body in Hip-Hinge */}
      <g
        style={{
          transformOrigin: '95px 140px',
          animation: `deadliftHingeMotion 2.6s ease-in-out infinite ${playState}`,
        }}
      >
        {/* Head */}
        <circle cx="75" cy="55" r="14" fill="url(#bodyBoneGradient)" stroke="#94a3b8" strokeWidth="1.5" />

        {/* Flat Torso & Spine */}
        <path d="M 75 70 L 95 135" stroke="url(#bodyBoneGradient)" strokeWidth="20" strokeLinecap="round" />

        {/* Arms hanging straight down gripping barbell */}
        <line x1="82" y1="80" x2="98" y2="155" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />

        {/* Barbell & Plates */}
        <line x1="45" y1="155" x2="175" y2="155" stroke="url(#steelBar)" strokeWidth="6" strokeLinecap="round" />
        <circle cx="50" cy="155" r="22" fill="url(#weightPlateRed)" stroke="#7f1d1d" strokeWidth="2" />
        <circle cx="170" cy="155" r="22" fill="url(#weightPlateRed)" stroke="#7f1d1d" strokeWidth="2" />
      </g>

      {/* Pelvis & Hips */}
      <ellipse cx="98" cy="140" rx="14" ry="11" fill="url(#activeRedMuscle)" stroke="#ef4444" strokeWidth="1.5" filter="url(#redMuscleGlow)" />

      {/* TARGET MUSCLE: HAMSTRINGS (POSTERIOR THIGH) IN VIVID RED */}
      <path
        d="M 98 140 Q 88 165 98 185"
        stroke="url(#activeRedMuscle)"
        strokeWidth="17"
        strokeLinecap="round"
        fill="none"
        filter="url(#redMuscleGlow)"
      />

      {/* Knees */}
      <circle cx="98" cy="185" r="7" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />

      {/* Shins to Feet */}
      <line x1="98" y1="185" x2="98" y2="218" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" />
      <rect x="90" y="215" width="26" height="6" rx="2" fill="#64748b" />
    </g>
  );
}

/* =========================================================================
   6. OVERHEAD SHOULDER PRESS (Upright, glowing RED Deltoids)
   ========================================================================= */
function OverheadPressVisual({ playState }: { playState: string }) {
  return (
    <g transform="translate(60, 10)">
      {/* Upright Human Body */}
      {/* Head */}
      <circle cx="110" cy="70" r="14" fill="url(#bodyBoneGradient)" stroke="#94a3b8" strokeWidth="1.5" />

      {/* Torso */}
      <path d="M 110 85 L 110 150" stroke="url(#bodyBoneGradient)" strokeWidth="22" strokeLinecap="round" />

      {/* TARGET MUSCLE: DELTOIDS (SHOULDER CAPS) IN VIVID RED */}
      <circle cx="94" cy="92" r="10" fill="url(#activeRedMuscle)" stroke="#ef4444" strokeWidth="1.5" filter="url(#redMuscleGlow)" />
      <circle cx="126" cy="92" r="10" fill="url(#activeRedMuscle)" stroke="#ef4444" strokeWidth="1.5" filter="url(#redMuscleGlow)" />

      {/* Pelvis and Legs */}
      <ellipse cx="110" cy="155" rx="14" ry="10" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="102" y1="160" x2="100" y2="220" stroke="#cbd5e1" strokeWidth="13" strokeLinecap="round" />
      <line x1="118" y1="160" x2="120" y2="220" stroke="#cbd5e1" strokeWidth="13" strokeLinecap="round" />
      <rect x="90" y="217" width="20" height="6" rx="2" fill="#64748b" />
      <rect x="114" y="217" width="20" height="6" rx="2" fill="#64748b" />

      {/* Moving Barbell & Arms Pressing Overhead */}
      <g
        style={{
          animation: `overheadPressMotion 2.4s ease-in-out infinite ${playState}`,
        }}
      >
        {/* Forearms extending up */}
        <line x1="94" y1="92" x2="90" y2="52" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
        <line x1="126" y1="92" x2="130" y2="52" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />

        {/* Barbell */}
        <line x1="30" y1="52" x2="190" y2="52" stroke="url(#steelBar)" strokeWidth="6" strokeLinecap="round" />
        <rect x="35" y="32" width="10" height="40" rx="3" fill="url(#weightPlateRed)" stroke="#7f1d1d" />
        <rect x="175" y="32" width="10" height="40" rx="3" fill="url(#weightPlateRed)" stroke="#7f1d1d" />
      </g>
    </g>
  );
}

/* =========================================================================
   7. LATERAL RAISE (Arms raising laterally, glowing RED Side Delts)
   ========================================================================= */
function LateralRaiseVisual({ playState }: { playState: string }) {
  return (
    <g transform="translate(60, 10)">
      {/* Head */}
      <circle cx="110" cy="55" r="14" fill="url(#bodyBoneGradient)" stroke="#94a3b8" strokeWidth="1.5" />

      {/* Torso */}
      <path d="M 110 70 L 110 145" stroke="url(#bodyBoneGradient)" strokeWidth="22" strokeLinecap="round" />

      {/* TARGET MUSCLE: LATERAL DELTOIDS (SIDE SHOULDER) IN VIVID RED */}
      <ellipse cx="94" cy="78" rx="8" ry="11" fill="url(#activeRedMuscle)" stroke="#ef4444" strokeWidth="1.5" filter="url(#redMuscleGlow)" />
      <ellipse cx="126" cy="78" rx="8" ry="11" fill="url(#activeRedMuscle)" stroke="#ef4444" strokeWidth="1.5" filter="url(#redMuscleGlow)" />

      {/* Legs */}
      <line x1="102" y1="150" x2="100" y2="218" stroke="#cbd5e1" strokeWidth="13" strokeLinecap="round" />
      <line x1="118" y1="150" x2="120" y2="218" stroke="#cbd5e1" strokeWidth="13" strokeLinecap="round" />
      <rect x="90" y="215" width="20" height="6" rx="2" fill="#64748b" />
      <rect x="114" y="215" width="20" height="6" rx="2" fill="#64748b" />

      {/* Left Arm Arcing Outward with Dumbbell */}
      <g
        style={{
          transformOrigin: '94px 78px',
          animation: `lateralRaiseArc 2.4s ease-in-out infinite ${playState}`,
        }}
      >
        <line x1="94" y1="78" x2="45" y2="78" stroke="#e2e8f0" strokeWidth="9" strokeLinecap="round" />
        <circle cx="45" cy="78" r="5" fill="#f8fafc" stroke="#64748b" strokeWidth="1" />
        <rect x="42" y="66" width="6" height="24" rx="2" fill="url(#weightPlateRed)" stroke="#7f1d1d" />
      </g>

      {/* Right Arm Arcing Outward with Dumbbell */}
      <g
        style={{
          transformOrigin: '126px 78px',
          animation: `lateralRaiseArc 2.4s ease-in-out infinite ${playState}`,
          transform: 'scaleX(-1)',
        }}
      >
        <line x1="126" y1="78" x2="77" y2="78" stroke="#e2e8f0" strokeWidth="9" strokeLinecap="round" />
        <circle cx="77" cy="78" r="5" fill="#f8fafc" stroke="#64748b" strokeWidth="1" />
        <rect x="74" y="66" width="6" height="24" rx="2" fill="url(#weightPlateRed)" stroke="#7f1d1d" />
      </g>
    </g>
  );
}

/* =========================================================================
   8. LAT PULLDOWN / PULL-UP (Wide pulling down, glowing RED Lats / Back Wings)
   ========================================================================= */
function LatPulldownVisual({ playState }: { playState: string }) {
  return (
    <g transform="translate(60, 10)">
      {/* Overhead Pulley & Bar */}
      <line x1="110" y1="20" x2="110" y2="40" stroke="#475569" strokeWidth="3" />
      <circle cx="110" cy="20" r="8" fill="#1e293b" stroke="#64748b" strokeWidth="2" />

      {/* Seated Human Body (Back View showing V-Taper Lats) */}
      {/* Head */}
      <circle cx="110" cy="85" r="14" fill="url(#bodyBoneGradient)" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="110" y1="99" x2="110" y2="108" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />

      {/* Spine */}
      <line x1="110" y1="108" x2="110" y2="165" stroke="#94a3b8" strokeWidth="14" strokeLinecap="round" />

      {/* TARGET MUSCLE: LATISSIMUS DORSI (V-TAPER WINGS) IN VIVID RED */}
      <path
        d="M 110 108 C 80 115, 75 145, 105 160 C 108 145, 110 120, 110 108 Z"
        fill="url(#activeRedMuscle)"
        stroke="#ef4444"
        strokeWidth="1.5"
        filter="url(#redMuscleGlow)"
      />
      <path
        d="M 110 108 C 140 115, 145 145, 115 160 C 112 145, 110 120, 110 108 Z"
        fill="url(#activeRedMuscle)"
        stroke="#ef4444"
        strokeWidth="1.5"
        filter="url(#redMuscleGlow)"
      />

      {/* Seat & Legs */}
      <rect x="85" y="165" width="50" height="10" rx="3" fill="#1e293b" />
      <rect x="105" y="175" width="10" height="45" fill="#0f172a" />

      {/* Moving Pulldown Bar & Arms */}
      <g
        style={{
          animation: `latPulldownBarMotion 2.4s ease-in-out infinite ${playState}`,
        }}
      >
        <line x1="30" y1="40" x2="190" y2="40" stroke="url(#steelBar)" strokeWidth="6" strokeLinecap="round" />
        {/* Cable wire */}
        <line x1="110" y1="20" x2="110" y2="40" stroke="#94a3b8" strokeWidth="2" strokeDasharray="2 1" />
        {/* Arms pulling from bar down to shoulders */}
        <line x1="90" y1="105" x2="55" y2="40" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
        <line x1="130" y1="105" x2="165" y2="40" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
      </g>
    </g>
  );
}

/* =========================================================================
   9. BENT-OVER ROW (Hinged at 45°, pulling to ribs, glowing RED Mid-Back)
   ========================================================================= */
function BentOverRowVisual({ playState }: { playState: string }) {
  return (
    <g transform="translate(60, 10)">
      {/* 45 Degree Hinged Body */}
      {/* Head */}
      <circle cx="70" cy="65" r="14" fill="url(#bodyBoneGradient)" stroke="#94a3b8" strokeWidth="1.5" />

      {/* Torso at 45° */}
      <path d="M 70 80 L 110 135" stroke="url(#bodyBoneGradient)" strokeWidth="20" strokeLinecap="round" />

      {/* TARGET MUSCLE: RHOMBOIDS & TRAPS (MID-BACK) IN VIVID RED */}
      <ellipse cx="90" cy="102" rx="14" ry="10" fill="url(#activeRedMuscle)" stroke="#ef4444" strokeWidth="1.5" filter="url(#redMuscleGlow)" />

      {/* Legs & Hips */}
      <path d="M 110 135 L 105 178 L 100 218" stroke="#cbd5e1" strokeWidth="13" strokeLinecap="round" fill="none" />
      <rect x="90" y="215" width="22" height="6" rx="2" fill="#64748b" />

      {/* Rowing Arms & Barbell */}
      <g
        style={{
          animation: `bentRowArmPull 2.2s ease-in-out infinite ${playState}`,
        }}
      >
        <line x1="82" y1="90" x2="88" y2="150" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
        <line x1="45" y1="150" x2="165" y2="150" stroke="url(#steelBar)" strokeWidth="6" strokeLinecap="round" />
        <circle cx="50" cy="150" r="18" fill="url(#weightPlateRed)" stroke="#7f1d1d" strokeWidth="2" />
        <circle cx="160" cy="150" r="18" fill="url(#weightPlateRed)" stroke="#7f1d1d" strokeWidth="2" />
      </g>
    </g>
  );
}

/* =========================================================================
   10. LEG EXTENSION / CURL (Machine Seated, glowing RED Quads/Hamstrings)
   ========================================================================= */
function LegExtensionVisual({ playState }: { playState: string }) {
  return (
    <g transform="translate(60, 10)">
      {/* Machine Seat & Backrest */}
      <rect x="70" y="80" width="12" height="70" rx="3" fill="#1e293b" />
      <rect x="70" y="145" width="65" height="12" rx="3" fill="#1e293b" />

      {/* Seated Body */}
      <circle cx="95" cy="65" r="14" fill="url(#bodyBoneGradient)" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M 95 80 L 95 145" stroke="url(#bodyBoneGradient)" strokeWidth="20" strokeLinecap="round" />

      {/* TARGET MUSCLE: QUADRICEPS (TOP OF THIGH) IN VIVID RED */}
      <path
        d="M 95 142 L 140 142"
        stroke="url(#activeRedMuscle)"
        strokeWidth="18"
        strokeLinecap="round"
        filter="url(#redMuscleGlow)"
      />

      {/* Knee Joint (Pivot point) */}
      <circle cx="140" cy="142" r="7" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />

      {/* Extending Lower Leg & Roller Pad */}
      <g
        style={{
          transformOrigin: '140px 142px',
          animation: `bicepForearmCurl 2.4s ease-in-out infinite ${playState}`,
        }}
      >
        <line x1="140" y1="142" x2="140" y2="195" stroke="#cbd5e1" strokeWidth="11" strokeLinecap="round" />
        {/* Machine Foam Roller Pad */}
        <circle cx="140" cy="190" r="8" fill="url(#weightPlateRed)" stroke="#7f1d1d" strokeWidth="1.5" />
      </g>
    </g>
  );
}

/* =========================================================================
   11. CALF RAISE (Standing on toes, glowing RED Gastrocnemius / Calves)
   ========================================================================= */
function CalfRaiseVisual({ playState }: { playState: string }) {
  return (
    <g transform="translate(60, 10)">
      {/* Moving Body Rising onto Toes */}
      <g
        style={{
          animation: `calfRaisePlantar 2.0s ease-in-out infinite ${playState}`,
        }}
      >
        {/* Head */}
        <circle cx="110" cy="45" r="14" fill="url(#bodyBoneGradient)" stroke="#94a3b8" strokeWidth="1.5" />

        {/* Torso */}
        <path d="M 110 60 L 110 135" stroke="url(#bodyBoneGradient)" strokeWidth="22" strokeLinecap="round" />

        {/* Thighs */}
        <line x1="102" y1="135" x2="102" y2="175" stroke="#cbd5e1" strokeWidth="14" strokeLinecap="round" />
        <line x1="118" y1="135" x2="118" y2="175" stroke="#cbd5e1" strokeWidth="14" strokeLinecap="round" />

        {/* TARGET MUSCLE: GASTROCNEMIUS & SOLEUS (CALVES) IN VIVID RED */}
        <path
          d="M 102 175 L 102 210"
          stroke="url(#activeRedMuscle)"
          strokeWidth="16"
          strokeLinecap="round"
          filter="url(#redMuscleGlow)"
        />
        <path
          d="M 118 175 L 118 210"
          stroke="url(#activeRedMuscle)"
          strokeWidth="16"
          strokeLinecap="round"
          filter="url(#redMuscleGlow)"
        />

        {/* Feet on Balls / Toes */}
        <ellipse cx="102" cy="215" rx="5" ry="3" fill="#64748b" />
        <ellipse cx="118" cy="215" rx="5" ry="3" fill="#64748b" />
      </g>
      {/* Platform Step */}
      <rect x="75" y="218" width="70" height="8" rx="2" fill="#1e293b" />
    </g>
  );
}

/* =========================================================================
   12. CORE & ABS (Plank / Crunch, glowing RED Rectus Abdominis)
   ========================================================================= */
function CoreAbsVisual({ playState }: { playState: string }) {
  return (
    <g transform="translate(40, 10)">
      {/* Ground Line */}
      <line x1="20" y1="190" x2="240" y2="190" stroke="#334155" strokeWidth="3" />

      {/* Crunching / Planking Body */}
      <g
        style={{
          transformOrigin: '120px 175px',
          animation: `absCrunchMotion 2.2s ease-in-out infinite ${playState}`,
        }}
      >
        {/* Head */}
        <circle cx="70" cy="120" r="14" fill="url(#bodyBoneGradient)" stroke="#94a3b8" strokeWidth="1.5" />

        {/* Neck */}
        <line x1="82" y1="126" x2="95" y2="135" stroke="#cbd5e1" strokeWidth="7" strokeLinecap="round" />

        {/* Upper Torso */}
        <path d="M 95 135 L 125 155" stroke="url(#bodyBoneGradient)" strokeWidth="18" strokeLinecap="round" />

        {/* TARGET MUSCLE: RECTUS ABDOMINIS & OBLIQUES (SIX PACK) IN VIVID RED */}
        <g filter="url(#redMuscleGlow)">
          <rect x="110" y="142" width="22" height="24" rx="4" fill="url(#activeRedMuscle)" stroke="#ef4444" strokeWidth="1.2" />
          {/* Six Pack Segments */}
          <line x1="121" y1="144" x2="121" y2="164" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
          <line x1="112" y1="154" x2="130" y2="154" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
        </g>
      </g>

      {/* Pelvis & Legs pinned on ground */}
      <ellipse cx="145" cy="175" rx="14" ry="10" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M 145 175 L 175 160 L 195 188" stroke="#cbd5e1" strokeWidth="12" strokeLinecap="round" fill="none" />
      <rect x="190" y="185" width="20" height="6" rx="2" fill="#64748b" />
    </g>
  );
}
