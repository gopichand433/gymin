'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dumbbell, ArrowRight, Check, X, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password validation rules
  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasLowercase = /[a-z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Please satisfy all password security requirements.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account.');
      }

      router.push(data.redirectUrl || '/onboarding');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080a0f] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow background effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Dumbbell className="w-6 h-6 text-black" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-white">
            GYM<span className="text-emerald-400">IN</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">Start your fitness journey</h2>
        <p className="mt-1 text-sm text-slate-400">
          Create your personalized companion in under 60 seconds
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800/80">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
              <X className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Alex Rivera"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white placeholder-slate-500 text-sm focus:border-emerald-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex@example.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white placeholder-slate-500 text-sm focus:border-emerald-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Age
              </label>
              <input
                type="number"
                min="12"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 25"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white placeholder-slate-500 text-sm focus:border-emerald-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white placeholder-slate-500 text-sm focus:border-emerald-400 transition-colors"
              />

              {/* Dynamic Password Requirements */}
              <div className="mt-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  {hasMinLength ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                  )}
                  <span className={hasMinLength ? 'text-emerald-400' : 'text-slate-400'}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasUppercase ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                  )}
                  <span className={hasUppercase ? 'text-emerald-400' : 'text-slate-400'}>
                    One uppercase letter (A-Z)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasLowercase ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                  )}
                  <span className={hasLowercase ? 'text-emerald-400' : 'text-slate-400'}>
                    One lowercase letter (a-z)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasNumber ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                  )}
                  <span className={hasNumber ? 'text-emerald-400' : 'text-slate-400'}>
                    One number (0-9)
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid}
              className="w-full mt-4 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Continue to Onboarding
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-emerald-400 font-semibold hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
