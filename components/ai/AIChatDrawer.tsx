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
  KeyRound,
  Globe,
  Check,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  cardType?: 'WORKOUT_CARD' | 'NUTRITION_CARD' | 'PROGRESS_CARD' | null;
  cardData?: any;
}

function renderFormattedMessage(content: string) {
  const lines = content.split('\n');
  return lines.map((line, lIdx) => {
    if (line.trim() === '---') {
      return <hr key={lIdx} className="my-2.5 border-neutral-800" />;
    }

    const parts: (string | JSX.Element)[] = [];
    const regex = /(\[.*?\]\(https?:\/\/[^\s)]+\)|\*\*.*?\*\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('[') && token.includes('](')) {
        const title = token.substring(1, token.indexOf(']('));
        const url = token.substring(token.indexOf('](') + 2, token.length - 1);
        parts.push(
          <a
            key={`${lIdx}-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 underline font-semibold inline-flex items-center gap-1 mx-0.5"
          >
            <span>{title}</span>
            <ExternalLink className="w-2.5 h-2.5 inline" />
          </a>
        );
      } else if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={`${lIdx}-${match.index}`} className="font-bold text-white">
            {token.slice(2, -2)}
          </strong>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return (
      <span key={lIdx} className="block min-h-[1.15em]">
        {parts.length > 0 ? parts : line}
      </span>
    );
  });
}

export default function AIChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'analytical'>('analytical');
  const [customApiKey, setCustomApiKey] = useState('');
  const [showKeySettings, setShowKeySettings] = useState(false);
  const [keySavedNotice, setKeySavedNotice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'Is creatine safe for daily use?',
    'Best workout split for hypertrophy?',
    "What's my workout today?",
    'How much protein have I eaten today?',
    'What should I eat for dinner?',
    'Why do my knees ache during squats?',
  ];

  // Load chat history & stored API key on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('gymin_custom_ai_key');
      if (savedKey) {
        setCustomApiKey(savedKey);
      }
    }

    fetch('/api/ai/chat')
      .then((res) => res.json())
      .then((data) => {
        if (data?.activeProvider) {
          setProvider(data.activeProvider);
        }
        if (data?.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          setMessages([
            {
              role: 'assistant',
              content:
                "Hey! 👋 I'm **GYMIN AI**, your personal fitness coach powered by real-time online web browsing & athlete logs.\n\nAsk me any fitness doubts, workout techniques, supplement studies, or today's nutrition!",
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

  const handleSaveKey = () => {
    if (typeof window !== 'undefined') {
      let cleaned = customApiKey.trim();
      cleaned = cleaned.replace(/^["']|["']$/g, '').trim();
      cleaned = cleaned.replace(/^(GEMINI_API_KEY|OPENAI_API_KEY|API_KEY)[:=]\s*/i, '').trim();
      setCustomApiKey(cleaned);
      if (cleaned) {
        localStorage.setItem('gymin_custom_ai_key', cleaned);
      } else {
        localStorage.removeItem('gymin_custom_ai_key');
      }
      setKeySavedNotice(true);
      setTimeout(() => setKeySavedNotice(false), 2500);
    }
  };

  const handleClearKey = () => {
    setCustomApiKey('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gymin_custom_ai_key');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const rawKey =
        customApiKey.trim() ||
        (typeof window !== 'undefined' ? localStorage.getItem('gymin_custom_ai_key') : null);
      const activeKey = rawKey
        ?.trim()
        .replace(/^["']|["']$/g, '')
        .replace(/^(GEMINI_API_KEY|OPENAI_API_KEY|API_KEY)[:=]\s*/i, '')
        .trim();

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          customApiKey: activeKey || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }

      if (data.provider) {
        setProvider(data.provider);
      }

      setMessages((prev) => [...prev, data.message]);
    } catch (err: any) {
      const errMsg = err?.message || '';
      let displayContent =
        'Sorry, I encountered an issue communicating with the AI service. Please verify your connection and try again.';
      if (errMsg.includes('Session expired') || errMsg.includes('Unauthorized')) {
        displayContent =
          '🔒 **Session Expired:** Please refresh or log in again to consult GYMIN AI.';
      } else if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key')) {
        displayContent =
          '⚠️ **API Key Error:** The Gemini API key entered appears to be invalid. Please verify your key at [Google AI Studio](https://aistudio.google.com/app/apikey).';
      } else if (errMsg) {
        displayContent = `⚠️ **Notice:** ${errMsg}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: displayContent,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const isBrowsingActive =
    provider === 'gemini' || (customApiKey.trim() && !customApiKey.startsWith('sk-'));

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 lg:bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-black font-extrabold text-xs shadow-xl shadow-amber-500/25 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
      >
        <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-black" />
        </div>
        <span>Ask GYMIN AI</span>
        {isBrowsingActive && (
          <span className="w-2 h-2 rounded-full bg-emerald-950 border border-emerald-400 animate-pulse" />
        )}
      </button>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-lg bg-[#0a0a0a] border-l border-neutral-800 h-full flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-black">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white">GYMIN AI</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-400 flex items-center gap-1 border border-amber-400/30">
                      {isBrowsingActive ? (
                        <>
                          <Globe className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                          <span>Gemini Live Search</span>
                        </>
                      ) : provider === 'openai' || customApiKey.startsWith('sk-') ? (
                        <>
                          <span>🤖 ChatGPT</span>
                        </>
                      ) : (
                        <>
                          <span>⚡ Grounded Coach</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Online browsing trainer & nutrition expert
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowKeySettings(!showKeySettings)}
                  className={`p-2 rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                    customApiKey.trim()
                      ? 'bg-amber-400/15 border border-amber-400/40 text-amber-300'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                  title="Configure Gemini or OpenAI API Key"
                >
                  <KeyRound className="w-4 h-4" />
                  <span className="text-[10px] font-bold hidden sm:inline">
                    {customApiKey.trim() ? 'Key Active' : 'Set Key'}
                  </span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Optional Collapsible Key Settings Panel */}
            {showKeySettings && (
              <div className="p-3.5 bg-neutral-950 border-b border-amber-500/20 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Gemini Live Online Browsing</span>
                  </div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-amber-400/90 hover:text-amber-300 underline flex items-center gap-1"
                  >
                    <span>Get Free Gemini Key</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Connect your Google Gemini API key to activate{' '}
                  <strong className="text-white">real-time Google Search browsing</strong> so GYMIN
                  AI answers any doubt with verified scientific articles and citations.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="Paste Gemini (AIzaSy...) or OpenAI key"
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveKey}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs hover:from-amber-300 hover:to-yellow-400 transition-all flex items-center gap-1"
                  >
                    {keySavedNotice ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <span>Save</span>
                    )}
                  </button>
                  {customApiKey && (
                    <button
                      onClick={handleClearKey}
                      className="px-2.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white text-xs transition-colors"
                      title="Clear saved key"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}

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
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold rounded-tr-sm shadow-md shadow-amber-500/15'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-sm'
                    }`}
                  >
                    {msg.role === 'user' ? msg.content : renderFormattedMessage(msg.content)}
                  </div>

                  {/* Render Structured Interactive Cards */}
                  {msg.role === 'assistant' && msg.cardType === 'WORKOUT_CARD' && (
                    <div className="mt-2 w-[88%] p-4 rounded-2xl bg-neutral-900/90 border border-amber-500/30 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                          Today's Routine
                        </span>
                        <span className="text-neutral-400 text-[11px]">
                          {msg.cardData?.durationMin || 55} min
                        </span>
                      </div>
                      <div className="font-extrabold text-sm text-white">
                        {msg.cardData?.dayName || 'Chest & Triceps'}
                      </div>
                      {msg.cardData?.isCompleted ? (
                        <div className="w-full py-2 px-3 rounded-xl bg-neutral-800/80 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-inner">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Finished Today (Next at 12 AM)</span>
                        </div>
                      ) : (
                        <Link
                          href="/workouts"
                          onClick={() => setIsOpen(false)}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-amber-500/20"
                        >
                          <Dumbbell className="w-3.5 h-3.5" />
                          <span>Start Workout</span>
                        </Link>
                      )}
                    </div>
                  )}

                  {msg.role === 'assistant' && msg.cardType === 'NUTRITION_CARD' && (
                    <div className="mt-2 w-[88%] p-4 rounded-2xl bg-neutral-900/90 border border-amber-500/30 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                          Today's Fuel
                        </span>
                        <span className="text-neutral-400 text-[11px]">
                          {msg.cardData?.calories ?? 0} / {msg.cardData?.targetCalories || 2200} kcal
                        </span>
                      </div>
                      <div className="text-xs text-neutral-300">
                        Protein: <strong className="text-white">{msg.cardData?.protein ?? 0}g</strong> / {msg.cardData?.targetProtein || 140}g
                      </div>
                      <Link
                        href="/nutrition"
                        onClick={() => setIsOpen(false)}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-amber-500/20"
                      >
                        <Utensils className="w-3.5 h-3.5" />
                        <span>Log Meals / View Foods</span>
                      </Link>
                    </div>
                  )}

                  {msg.role === 'assistant' && msg.cardType === 'PROGRESS_CARD' && (
                    <div className="mt-2 w-[88%] p-4 rounded-2xl bg-neutral-900/90 border border-amber-500/30 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                          Progression Snapshot
                        </span>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-amber-400" />
                          {msg.cardData?.streak ?? 0}d Streak
                        </span>
                      </div>
                      <Link
                        href="/progress"
                        onClick={() => setIsOpen(false)}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-amber-500/20"
                      >
                        <LineChart className="w-3.5 h-3.5" />
                        <span>Open Progress Analytics</span>
                      </Link>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-neutral-400 p-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>
                    {isBrowsingActive
                      ? 'Browsing live online research & analyzing fitness context...'
                      : 'Consulting your fitness records & science database...'}
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Carousel */}
            <div className="p-3 border-t border-neutral-800 bg-neutral-950/80 overflow-x-auto">
              <div className="flex gap-2 whitespace-nowrap">
                {suggestedPrompts.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(p)}
                    className="px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 hover:border-amber-400 hover:text-amber-400 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-neutral-800 bg-[#0a0a0a]">
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
                  placeholder="Ask about workouts, nutrition, supplements, injuries..."
                  className="flex-1 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs sm:text-sm focus:border-amber-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading || !inputValue.trim()}
                  className="p-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 disabled:opacity-40 text-black transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="mt-2 text-[10px] text-neutral-500 text-center flex items-center justify-center gap-1.5">
                <span>Real-time Google search grounding</span>
                <span>•</span>
                <span>Athletic logs</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
