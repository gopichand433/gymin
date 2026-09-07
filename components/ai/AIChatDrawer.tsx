'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Dumbbell,
  Utensils,
  LineChart,
  Loader2,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  cardType?: 'WORKOUT_CARD' | 'NUTRITION_CARD' | 'PROGRESS_CARD' | null;
  cardData?: any;
}

export default function AIChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "What's my workout today?",
    "How much protein have I eaten today?",
    "What should I eat for dinner?",
    "Analyze my progress",
    "I missed yesterday's workout. What should I do?",
    "I only have dumbbells today. Modify my workout.",
  ];

  // Load chat history on mount
  useEffect(() => {
    fetch('/api/ai/chat')
      .then((res) => res.json())
      .then((data) => {
        if (data?.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          setMessages([
            {
              role: 'assistant',
              content:
                "Hey! 👋 I'm **Gymin AI**, your personal fitness coach. I have full context of your workout split, today's meals, steps, and PRs. How can I help you today?",
              cardType: 'WORKOUT_CARD',
              cardData: {
                dayName: 'Chest & Triceps',
                exerciseCount: 5,
                durationMin: 55,
              },
            },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setMessages((prev) => [...prev, data.message]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I encountered an issue accessing your fitness context. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 lg:bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-sm shadow-xl shadow-emerald-500/30 hover:scale-105 transition-all group"
      >
        <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-black" />
        </div>
        <span>Ask Gymin AI</span>
        <span className="w-2 h-2 rounded-full bg-black animate-ping" />
      </button>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-lg bg-[#0a0d14] border-l border-slate-800 h-full flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-black">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white">GYMIN AI</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                      Live Grounded
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Personal trainer & nutrition companion
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-500 text-black font-medium rounded-tr-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm whitespace-pre-wrap'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Render Structured Interactive Cards */}
                  {msg.role === 'assistant' && msg.cardType === 'WORKOUT_CARD' && (
                    <div className="mt-2 w-[88%] p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
                          Today's Routine
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {msg.cardData?.durationMin || 55} min
                        </span>
                      </div>
                      <div className="font-extrabold text-sm text-white">
                        {msg.cardData?.dayName || 'Chest & Triceps'}
                      </div>
                      <Link
                        href="/workouts"
                        onClick={() => setIsOpen(false)}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20"
                      >
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span>Start Workout</span>
                      </Link>
                    </div>
                  )}

                  {msg.role === 'assistant' && msg.cardType === 'NUTRITION_CARD' && (
                    <div className="mt-2 w-[88%] p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px]">
                          Today's Fuel
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {msg.cardData?.calories || 1620} / {msg.cardData?.targetCalories || 2200} kcal
                        </span>
                      </div>
                      <div className="text-xs text-slate-300">
                        Protein: <strong className="text-white">{msg.cardData?.protein || 105}g</strong> / {msg.cardData?.targetProtein || 140}g
                      </div>
                      <Link
                        href="/nutrition"
                        onClick={() => setIsOpen(false)}
                        className="w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-cyan-500/20"
                      >
                        <Utensils className="w-3.5 h-3.5" />
                        <span>Log Meals / View Foods</span>
                      </Link>
                    </div>
                  )}

                  {msg.role === 'assistant' && msg.cardType === 'PROGRESS_CARD' && (
                    <div className="mt-2 w-[88%] p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                          Progression Snapshot
                        </span>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-amber-400" />
                          {msg.cardData?.streak || 12}d Streak
                        </span>
                      </div>
                      <Link
                        href="/progress"
                        onClick={() => setIsOpen(false)}
                        className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-amber-500/20"
                      >
                        <LineChart className="w-3.5 h-3.5" />
                        <span>Open Progress Analytics</span>
                      </Link>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Consulting your fitness records...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Carousel */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto">
              <div className="flex gap-2 whitespace-nowrap">
                {suggestedPrompts.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(p)}
                    className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-[11px] text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-slate-800 bg-[#0a0d14]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about workouts, nutrition, PRs..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:border-emerald-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading || !inputValue.trim()}
                  className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="mt-2 text-[10px] text-slate-500 text-center">
                Answers grounded in your actual workout & nutrition logs.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
