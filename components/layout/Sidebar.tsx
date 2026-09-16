'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Dumbbell,
  Utensils,
  Footprints,
  Scale,
  LineChart,
  Calendar,
  Trophy,
  User,
  LogOut,
  Flame,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Workouts', href: '/workouts', icon: Dumbbell },
  { label: 'Nutrition', href: '/nutrition', icon: Utensils },
  { label: 'Progress', href: '/progress', icon: LineChart },
  { label: 'Steps', href: '/steps', icon: Footprints },
  { label: 'Weight & Body', href: '/weight', icon: Scale },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Achievements', href: '/achievements', icon: Trophy },
  { label: 'Profile', href: '/profile', icon: User },
];

export default function Sidebar({ user }: { user?: any }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0a0a0a] border-r border-neutral-800/80 min-h-screen p-5 fixed left-0 top-0 bottom-0 z-40">
      {/* Brand Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 mb-8 px-2 group">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
          <Dumbbell className="w-5 h-5 text-black" />
        </div>
        <div>
          <span className="text-xl font-black tracking-tight text-white">
            GYM<span className="text-amber-400">IN</span>
          </span>
          <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest -mt-1">
            Fitness Companion
          </span>
        </div>
      </Link>

      {/* Streak Badge */}
      <div className="mb-6 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/25 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
          <Flame className="w-4 h-4 fill-amber-400" />
        </div>
        <div>
          <div className="text-xs font-extrabold text-amber-400">12 Day Streak 🔥</div>
          <div className="text-[10px] text-neutral-400">Keep the momentum going!</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30 shadow-sm shadow-amber-400/10'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="pt-4 border-t border-neutral-800/80">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs flex-shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Athlete'}</div>
              <div className="text-[10px] text-neutral-400 truncate">{user?.email || 'user@gymin.app'}</div>
            </div>
          </div>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              title="Logout"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
