import React, { useState, useEffect } from 'react';
import { Word, WordUserStat } from '../types';
import { speakText } from '../utils/speech';
import {
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Volume2,
  Sparkles,
  Clock,
  Send,
  HelpCircle,
  Layers
} from 'lucide-react';

interface SaturdayDeepReviewProps {
  allWords: Word[];
  userStats: Record<number, WordUserStat>;
  currentWeek: number;
  onMarkWord: (wordId: number, isMastered: boolean) => void;
  onOpenTenses: (word: Word) => void;
}

export const SaturdayDeepReview: React.FC<SaturdayDeepReviewProps> = ({
  allWords,
  userStats,
  currentWeek,
  onMarkWord,
  onOpenTenses
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // 10-Second Countdown & Active Recall Guessing State
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [userGuess, setUserGuess] = useState<string>('');
  const [submittedGuess, setSubmittedGuess] = useState<string>('');

  // Review pool: words marked as weakness or tested recently up to current week
  const reviewPool = allWords.filter((w) => {
    const stat = userStats[w.id];
    return stat && (stat.isWeakness || stat.wrongCount > 0 || stat.status === 'learning');
  });

  const poolToUse = reviewPool.length > 0 ? reviewPool : allWords.slice(0, 30);
  const currentWord = poolToUse[currentIndex % poolToUse.length];

  // Reset timer & state when word changes
  useEffect(() => {
    setTimeLeft(10);
    setIsRevealed(false);
    setUserGuess('');
    setSubmittedGuess('');
  }, [currentIndex, poolToUse.length]);

  // 10-Second Countdown Interval
  useEffect(() => {
    if (!currentWord || isRevealed) return;

    if (timeLeft <= 0) {
      setIsRevealed(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRevealed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isRevealed, currentWord]);

  const handleNext = (mastered: boolean) => {
    onMarkWord(currentWord.id, mastered);
    setCurrentIndex((prev) => (prev + 1) % poolToUse.length);
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userGuess.trim()) return;
    setSubmittedGuess(userGuess.trim());
    setIsRevealed(true);
  };

  const handleManualReveal = () => {
    setIsRevealed(true);
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 px-2 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 rounded-3xl p-6 text-white shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5" /> Saturday Deep Review
          </span>
          <span className="text-xs font-mono font-bold bg-black/20 px-2.5 py-1 rounded-full">
            {currentIndex + 1} / {poolToUse.length} Kata
          </span>
        </div>

        <h2 className="text-2xl font-black">Reclaim Your Mistakes 🎯</h2>
        <p className="text-xs opacity-90 leading-relaxed">
          Uji ingatan aktif Anda (Active Recall) dalam waktu 10 detik per kata sebelum arti bahasa Indonesia terbuka otomatis.
        </p>
      </div>

      {/* Main Review Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-5 text-center relative">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400">
          <span>Kata #{currentWord.no}</span>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full uppercase font-bold">{currentWord.pos}</span>
        </div>

        {/* Word Title & Audio */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">{currentWord.word}</h1>
            <button
              type="button"
              onClick={() => speakText(currentWord.word)}
              className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-all shadow-inner"
              title="Dengarkan pengucapan"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>

          <p className="text-xs font-mono text-slate-500 bg-slate-50 inline-block px-3 py-1 rounded-lg">
            IPA: {currentWord.ipa} ({currentWord.ipa_perkiraan})
          </p>
        </div>

        {/* 10-Second Countdown Timer Bar */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Clock className={`w-4 h-4 ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-amber-600'}`} />
              {!isRevealed ? (
                <>Waktu Mengingat: <strong className="font-mono text-amber-600 text-sm">{timeLeft} detik</strong></>
              ) : (
                <span className="text-emerald-600 font-bold">Arti Terbuka</span>
              )}
            </span>
            {!isRevealed && (
              <button
                type="button"
                onClick={handleManualReveal}
                className="text-amber-700 hover:text-amber-900 text-[11px] font-bold flex items-center gap-1 underline"
              >
                <Eye className="w-3.5 h-3.5" /> Buka Sekarang
              </button>
            )}
          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                timeLeft <= 3 ? 'bg-red-500' : 'bg-amber-500'
              }`}
              style={{ width: `${(timeLeft / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Meaning Box (Blurred & Interactive Guess) */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 w-full text-center relative overflow-hidden transition-all">
          <p className="text-xs text-amber-700 font-bold uppercase tracking-wider mb-1">Arti (Bahasa Indonesia):</p>
          
          <div className="relative min-h-[44px] flex flex-col items-center justify-center">
            <p
              className={`text-xl md:text-2xl font-bold text-slate-900 transition-all duration-300 ${
                !isRevealed ? 'blur-md select-none opacity-40' : 'blur-none opacity-100'
              }`}
            >
              {currentWord.meaning_id}
            </p>

            {!isRevealed && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-amber-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  🔒 Terkunci ({timeLeft}s)
                </span>
              </div>
            )}
          </div>

          {/* User Guess Input */}
          {!isRevealed && (
            <form onSubmit={handleGuessSubmit} className="mt-3 flex gap-2">
              <input
                type="text"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                placeholder="Ketik tebakan arti dalam Bahasa Indonesia..."
                className="flex-1 bg-white border border-amber-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1 shrink-0"
              >
                <Send className="w-3.5 h-3.5" /> Kirim
              </button>
            </form>
          )}

          {/* Submitted Guess Feedback */}
          {isRevealed && submittedGuess && (
            <div className="mt-3 pt-2.5 border-t border-amber-200/80 text-xs flex items-center justify-between">
              <span className="text-slate-600 font-medium">Tebakan Anda:</span>
              <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                "{submittedGuess}"
              </span>
            </div>
          )}
        </div>

        {/* Verb Forms V1, V2, V3, V-ing */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left">
          <p className="text-[11px] text-slate-400 font-bold uppercase mb-1.5">Bentuk Kata Kerja (V1, V2, V3, V-ing):</p>
          <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-mono">
            <div className="bg-white p-2 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-sans">V1</span>
              <strong className="text-blue-700">{currentWord.v1 || currentWord.word}</strong>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-sans">V2</span>
              <strong className="text-blue-700">{currentWord.v2 || `${currentWord.word}ed`}</strong>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-sans">V3</span>
              <strong className="text-blue-700">{currentWord.v3 || `${currentWord.word}ed`}</strong>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-sans">V-ing</span>
              <strong className="text-blue-700">{currentWord.v_ing || `${currentWord.word}ing`}</strong>
            </div>
          </div>
        </div>

        {/* Action Icon for 9 Tenses */}
        <button
          type="button"
          onClick={() => onOpenTenses(currentWord)}
          className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-2xl border border-indigo-200 flex items-center justify-center gap-1.5 transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" /> Buka 9 Tenses Context & Passive Voice
        </button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleNext(false)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-4 rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <XCircle className="w-5 h-5" /> ❌ Perlu Diulang
        </button>

        <button
          type="button"
          onClick={() => handleNext(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-4 rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <CheckCircle2 className="w-5 h-5" /> ✅ Sangat Lancar
        </button>
      </div>
    </div>
  );
};
