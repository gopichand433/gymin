'use client';

import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import AIChatDrawer from '../ai/AIChatDrawer';

interface AppShellProps {
  children: React.ReactNode;
  user?: any;
}

export default function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex">
      {/* Desktop Sidebar */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen pb-20 lg:pb-8">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Omnipresent Floating Gymin AI Assistant */}
      <AIChatDrawer />
    </div>
  );
}
