'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  TrendingUp,
  HeartPulse,
  Scale,
  Flame,
  Activity,
  Award,
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Clock,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    goal: 'BUILD_MUSCLE',
    experience: 'INTERMEDIATE',
    daysPerWeek: 4,
    duration: 45,
    location: 'GYM',
    equipment: ['Dumbbells', 'Barbell', 'Bench'],
    heightCm: 175,
    weightKg: 75,
    targetWeightKg: 75,
    activityLevel: 'MODERATE',
    age: 25,
    gender: 'MALE',
  });

  const totalSteps = 7;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const toggleEquipment = (item: string) => {
    setFormData((prev) => {
      const exists = prev.equipment.includes(item);
      if (exists) {
        return { ...prev, equipment: prev.equipment.filter((e) => e !== item) };
      } else {
        return { ...prev, equipment: [...prev.equipment, item] };
      }
    });
  };

  const finishOnboarding = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to finish onboarding.');
      }

      router.push(data.redirectUrl || '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Progress */}
      <div className="max-w-2xl mx-auto w-full z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-500 flex items-center justify-center text-black font-bold shadow-lg shadow-amber-500/20">
              <Dumbbell className="w-4 h-4" />
            </div>
            <span className="font-extrabold tracking-tight text-lg">
              GYM<span className="text-amber-400">IN</span>
            </span>
          </div>
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
            Step {currentStep} of {totalSteps}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-neutral-800/80 h-2 rounded-full overflow-hidden mb-8 border border-neutral-700/50">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question Body */}
      <div className="max-w-2xl mx-auto w-full z-10 flex-1 flex flex-col justify-center py-4">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* QUESTION 1: MAIN GOAL */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                  Question 1
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight mt-1">
                  What is your main goal?
                </h1>
                <p className="text-sm text-neutral-400 mt-1">
                  We'll tailor your workout splits, volume, and calorie targets around this.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { id: 'BUILD_MUSCLE', title: 'Build Muscle', desc: 'Hypertrophy and lean muscle mass', icon: Flame },
                  { id: 'IMPROVE_STRENGTH', title: 'Improve Strength', desc: 'Heavy compounds and power', icon: TrendingUp },
                  { id: 'IMPROVE_FITNESS', title: 'Improve Fitness', desc: 'Endurance, stamina and conditioning', icon: HeartPulse },
                  { id: 'MAINTAIN_WEIGHT', title: 'Maintain Weight', desc: 'Consistency and tone', icon: Scale },
                  { id: 'LOSE_WEIGHT', title: 'Lose Weight', desc: 'Fat loss with muscle retention', icon: Sparkles },
                  { id: 'GENERAL_HEALTH', title: 'General Health', desc: 'Active longevity and daily energy', icon: Activity },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = formData.goal === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, goal: item.id })}
                      className={`p-4 rounded-2xl text-left border transition-all flex items-start gap-4 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                          : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900/90'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-amber-400 text-black' : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-white flex items-center justify-between">
                          {item.title}
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* QUESTION 2: EXPERIENCE */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                  Question 2
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight mt-1">
                  What is your fitness experience?
                </h1>
                <p className="text-sm text-neutral-400 mt-1">
                  This adjusts exercise selection complexity and recommended starting sets.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'BEGINNER', title: 'Beginner', desc: 'Less than 6 months of structured lifting. Learning basic movement patterns.' },
                  { id: 'INTERMEDIATE', title: 'Intermediate', desc: '6 months to 2 years of regular training. Comfortable with compound lifts.' },
                  { id: 'ADVANCED', title: 'Advanced', desc: '2+ years of consistent training. Looking for progressive overload and fine-tuning.' },
                ].map((item) => {
                  const isSelected = formData.experience === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, experience: item.id })}
                      className={`w-full p-5 rounded-2xl text-left border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                          : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-base text-white">{item.title}</div>
                        <div className="text-xs text-neutral-400 mt-1">{item.desc}</div>
                      </div>
                      {isSelected && (
                        <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-black">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* QUESTION 3: WORKOUT FREQUENCY */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                  Question 3
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight mt-1">
                  How many days can you work out?
                </h1>
                <p className="text-sm text-neutral-400 mt-1">
                  We'll structure your weekly split so every muscle group receives optimal recovery.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[2, 3, 4, 5, 6, 7].map((num) => {
                  const isSelected = formData.daysPerWeek === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData({ ...formData, daysPerWeek: num })}
                      className={`p-6 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10'
                          : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className={`text-4xl font-extrabold ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                        {num}
                      </div>
                      <div className="text-xs text-neutral-400 mt-1 font-semibold uppercase tracking-wider">
                        {num === 1 ? 'Day / week' : 'Days / week'}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-2">
                        {num === 3 ? 'Full Body Split' : num === 4 ? 'Upper / Lower' : num === 5 ? '5-Day Hypertrophy' : num === 6 ? 'Push / Pull / Legs' : 'High Volume'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* QUESTION 4: WORKOUT DURATION */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                  Question 4
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight mt-1">
                  How much time do you have per session?
                </h1>
                <p className="text-sm text-neutral-400 mt-1">
                  We'll adjust the number of exercises and rest periods to match your schedule.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { value: 25, label: '20–30 minutes', desc: 'Express high-intensity sessions with minimal rest' },
                  { value: 40, label: '30–45 minutes', desc: 'Efficient target training with 4-5 key exercises' },
                  { value: 55, label: '45–60 minutes', desc: 'Standard comprehensive workout with warm-up (Recommended)' },
                  { value: 75, label: '60–90 minutes', desc: 'Full bodybuilding volume with dedicated accessory work' },
                  { value: 95, label: '90+ minutes', desc: 'Extended powerlifting or high-volume athletic conditioning' },
                ].map((item) => {
                  const isSelected = formData.duration === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, duration: item.value })}
                      className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-lg shadow-amber-500/10'
                          : 'bg-[#0a0a0a] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-amber-400 text-black font-bold' : 'bg-neutral-800 text-neutral-400'}`}>
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">{item.label}</div>
                          <div className="text-xs text-neutral-400">{item.desc}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* QUESTION 5: WORKOUT LOCATION */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                  Question 5
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight mt-1">
                  Where do you work out?
                </h1>
                <p className="text-sm text-neutral-400 mt-1">
                  We'll prioritize exercises available in your environment.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'GYM', title: 'Commercial Gym', desc: 'Full access to cables, barbells, and machines' },
                  { id: 'HOME', title: 'Home', desc: 'Dumbbells, bands, pull-up bar or bodyweight' },
                  { id: 'BOTH', title: 'Both Gym & Home', desc: 'Flexible routines that adapt to either setting' },
                ].map((item) => {
                  const isSelected = formData.location === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, location: item.id })}
                      className={`p-5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/10'
                          : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isSelected ? 'bg-amber-400 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="font-bold text-sm text-white">{item.title}</div>
                      <div className="text-xs text-neutral-400 mt-1">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* QUESTION 6: EQUIPMENT */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                  Question 6
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight mt-1">
                  What equipment do you have access to?
                </h1>
                <p className="text-sm text-neutral-400 mt-1">
                  Select all that apply.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  'Dumbbells',
                  'Barbell',
                  'Bench',
                  'Cable Machine',
                  'Machines',
                  'Resistance Bands',
                  'Pull-up Bar',
                  'Bodyweight',
                  'Other',
                ].map((eq) => {
                  const isSelected = formData.equipment.includes(eq);
                  return (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => toggleEquipment(eq)}
                      className={`p-3.5 rounded-xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500/60 text-white'
                          : 'bg-[#0a0a0a] border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span>{eq}</span>
                      {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* QUESTION 7: BODY INFORMATION */}
          {currentStep === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                  Question 7
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight mt-1">
                  Your Body Information
                </h1>
                <p className="text-sm text-neutral-400 mt-1">
                  Used strictly to calculate your estimated daily calories and protein via the scientific Mifflin-St Jeor formula.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Current Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Target Weight (kg, optional)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.targetWeightKg}
                    onChange={(e) => setFormData({ ...formData, targetWeightKg: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Activity Level
                  </label>
                  <select
                    value={formData.activityLevel}
                    onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                  >
                    <option value="SEDENTARY">Sedentary (desk job, minimal movement)</option>
                    <option value="LIGHT">Lightly Active (light exercise 1-3 days/wk)</option>
                    <option value="MODERATE">Moderately Active (exercise 3-5 days/wk)</option>
                    <option value="VERY_ACTIVE">Very Active (hard exercise 6-7 days/wk)</option>
                    <option value="EXTRA_ACTIVE">Extra Active (intense training & physical job)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-neutral-300">
                <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy & Health Note:</strong> Your statistics are 100% private and only used to determine personal estimates. Calorie and macro values are approximations and not medical advice.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="max-w-2xl mx-auto w-full z-10 pt-6 flex items-center justify-between border-t border-neutral-800">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1 || loading}
          className="px-5 py-3 rounded-xl border border-neutral-800 text-neutral-400 hover:text-amber-400 hover:border-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Custom Program...
            </>
          ) : currentStep === totalSteps ? (
            <>
              Finish & Build My Plan
              <Sparkles className="w-4 h-4" />
            </>
          ) : (
            <>
              Next Step
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
