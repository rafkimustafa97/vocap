import React, { useState } from 'react';
import { UserLearningSettings, WordUserStat, Word } from '../types';
import { getDailyWordRange, getDayType } from '../utils/scheduler';
import {
  Flame,
  Target,
  Trophy,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Coffee,
  RotateCcw,
  Sparkles,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface DashboardProps {
  settings: UserLearningSettings;
  userStats: Record<number, WordUserStat>;
  allWords: Word[];
  userXp: number;
  userStreak: number;
  onNavigateToLearn: () => void;
  onNavigateToQuiz: () => void;
  onNavigateToSaturdayReview: () => void;
  onOpenSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  settings,
  userStats,
  allWords,
  userXp,
  userStreak,
  onNavigateToLearn,
  onNavigateToQuiz,
  onNavigateToSaturdayReview,
  onOpenSettings
}) => {
  const totalWords = 3655;
  const statsList = Object.values(userStats) as WordUserStat[];
  const masteredCount = statsList.filter((s) => s.status === 'mastered').length;
  const percentage = Math.min(100, Math.round((masteredCount / totalWords) * 100));

  const range = getDailyWordRange(settings);
  const dayType = getDayType();

  // Weekly Performance Meter Metrics
  const weeklyTarget = settings.pace * 5; // e.g., 30 * 5 = 150 words
  const activeStudiedCount = statsList.filter((s) => s.status === 'learning' || s.status === 'mastered').length;
  const weeklyPerfPct = Math.min(100, Math.round((activeStudiedCount / weeklyTarget) * 100));

  // Weakness list with stat details
  const weaknessItems = statsList
    .filter((s) => s.isWeakness || s.wrongCount > 0)
    .map((s) => {
      const wordObj = allWords.find((w) => w.id === s.wordId);
      return wordObj ? { wordObj, stat: s } : null;
    })
    .filter(Boolean) as { wordObj: Word; stat: WordUserStat }[];

  // Weakness Radar Pagination State
  const [weaknessPage, setWeaknessPage] = useState<number>(1);
  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(weaknessItems.length / itemsPerPage));
  const currentWeaknessSlice = weaknessItems.slice((weaknessPage - 1) * itemsPerPage, weaknessPage * itemsPerPage);

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-2 sm:px-4">
      
      {/* Hero Section: PTE Readiness Index & Weekly Performance Meter Bar */}
      <div className="bg-white rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
            {/* Circular SVG Progress */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-500 transition-all duration-700 ease-out"
                  strokeDasharray={`${percentage}, 100`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl sm:text-2xl font-black text-slate-800">{percentage}%</span>
                <span className="text-[8px] sm:text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">PTE Ready</span>
              </div>
            </div>

            <div>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest inline-block">
                Lumina Learn Command Center
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">PTE Readiness Index</h2>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                {masteredCount} / {totalWords} Words Mastered
              </p>
            </div>
          </div>

          {/* Streak & XP Badges */}
          <div className="flex sm:flex-col items-center sm:items-end justify-center gap-2">
            <span className="bg-orange-100 text-orange-600 text-xs font-black px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
              🔥 {userStreak} Day Streak
            </span>
            <span className="bg-blue-50 text-blue-700 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 border border-blue-100">
              <Trophy className="w-3.5 h-3.5 text-blue-600" /> {userXp} XP
            </span>
          </div>
        </div>

        {/* WEEKLY PERFORMANCE METER BAR */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center text-xs font-extrabold gap-1">
            <span className="flex items-center gap-1.5 text-slate-800">
              <TrendingUp className="w-4 h-4 text-blue-600 shrink-0" /> Performa Hafalan Minggu Ini:
            </span>
            <span className="text-blue-600 font-mono font-black text-right sm:text-left">
              {activeStudiedCount} / {weeklyTarget} Kata ({weeklyPerfPct}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 transition-all duration-700 rounded-full"
              style={{ width: `${weeklyPerfPct}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Saturday Review Alert Banner */}
      {dayType === 'review' && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl p-4 sm:p-5 text-white shadow-lg shadow-orange-500/20">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-2xl shrink-0">
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-sm sm:text-base">HARI SABTU: MANDATORY VOCABULARY REVIEW</h3>
              <p className="text-xs opacity-90 mt-1 leading-relaxed">
                Ulas kembali seluruh kosakata yang dipelajari minggu ini dengan active recall timer 15 detik.
              </p>
              <button
                type="button"
                onClick={onNavigateToSaturdayReview}
                className="mt-3 bg-white text-orange-700 font-black text-xs px-4 py-2.5 rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5"
              >
                🚀 Mulai Vocabulary Review Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sunday Rest Day Banner */}
      {dayType === 'rest' && (
        <div className="bg-emerald-600 rounded-3xl p-4 sm:p-5 text-white shadow-lg shadow-emerald-500/20 flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-2xl shrink-0">
            <Coffee className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base">MINGGU: REST & RECOVERY DAY ☕</h3>
            <p className="text-xs opacity-90 mt-0.5">
              "Konsolidasi memori jangka panjang membutuhkan waktu istirahat yang cukup. Nikmati hari libur Anda!"
            </p>
          </div>
        </div>
      )}

      {/* Hero Daily Target Card */}
      <div className="bg-blue-600 rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 text-white shadow-xl shadow-blue-500/25 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden sm:block">
          <Target className="w-56 h-56 text-white" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-center gap-2">
            <span className="bg-blue-500/50 text-white text-[11px] sm:text-xs font-extrabold px-3 sm:px-4 py-1.5 rounded-full flex items-center gap-1.5 tracking-wide">
              <Calendar className="w-3.5 h-3.5" /> Pace: {settings.pace} Kata / Hari
            </span>
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-xs text-blue-100 hover:text-white underline font-bold"
            >
              Ubah Target
            </button>
          </div>

          <div>
            <p className="text-xs text-blue-200 font-extrabold uppercase tracking-widest">Target Hari Ini:</p>
            <h3 className="text-2xl sm:text-4xl font-black mt-1 tracking-tight">
              {range.startNo > 0 ? `Kata #${range.startNo} - #${range.endNo}` : 'Sesi Review / Rest'}
            </h3>
            <p className="text-xs text-blue-100/90 mt-1.5 font-medium">
              Aplikasi telah menghitung jadwal otomatis berdasarkan tanggal start belajar Anda.
            </p>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onNavigateToLearn}
              className="flex-1 bg-white text-blue-600 font-black py-3.5 sm:py-4 px-6 rounded-2xl shadow-[0_4px_0_#d1d5db] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              🎯 Belajar Target Hari Ini
            </button>
            <button
              type="button"
              onClick={onNavigateToQuiz}
              className="bg-blue-800/80 hover:bg-blue-800 text-white font-bold py-3.5 sm:py-4 px-5 rounded-2xl border border-blue-400/30 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" /> Kuis Adaptive
            </button>
          </div>

          {/* EXCLAMATION NOTE FOR COMPLETION ESTIMATE */}
          <div className="bg-blue-700/50 border border-blue-400/30 rounded-2xl p-3 flex items-start gap-2 text-xs text-blue-100 mt-2">
            <span className="font-black text-amber-300 text-sm leading-none shrink-0">!</span>
            <p className="text-[11px] leading-snug">
              <strong>Catatan:</strong> Jika Anda tidak belajar / absen 1 hari, estimasi tanggal lulus akan otomatis bergeser secara dinamis menyesuaikan porsi belajar Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Grid (7 Hari) */}
      <div className="bg-white rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 border border-slate-100 shadow-sm space-y-3">
        <div className="flex justify-between items-center gap-2">
          <h3 className="font-extrabold text-slate-800 text-xs sm:text-base uppercase tracking-wider">Weekly Schedule Tracker</h3>
          <span className="text-[11px] sm:text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full shrink-0">
            Minggu Ke-{range.weekIndex}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center overflow-x-auto">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((dayName, idx) => {
            const isToday = (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1) === idx;
            const isWeekend = idx >= 5;

            return (
              <div key={idx} className="flex flex-col gap-1.5 min-w-0">
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-wider truncate">{dayName}</span>
                <div
                  className={`h-10 sm:h-12 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center font-extrabold text-[10px] sm:text-xs transition-all ${
                    isToday
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 sm:ring-4 ring-blue-100'
                      : isWeekend
                      ? idx === 5
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-50 text-slate-700 border border-slate-100'
                  }`}
                >
                  {idx < 5 ? `+${settings.pace}` : idx === 5 ? 'REV' : 'REST'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WEAKNESS RADAR WIDGET (4-TIER COLOR CODING & PAGINATION) */}
      <div className="bg-white rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shrink-0"></div>
            <h3 className="font-extrabold text-slate-800 text-xs sm:text-base">Weakness Radar (4-Tier)</h3>
          </div>

          <span className="bg-rose-50 text-rose-700 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full border border-rose-100 self-start sm:self-auto">
            {weaknessItems.length} Kata Perlu Ditingkatkan
          </span>
        </div>

        {/* Legend Indicator */}
        <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-600 pt-1">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> 🟡 Salah 1x</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> 🟠 Salah 2x</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> 🔴 Salah 3x</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span> ⬛ Salah 4x+ (Kritis)</span>
        </div>

        {weaknessItems.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-4 text-center text-xs text-slate-500 font-medium border border-slate-100">
            ✅ Belum ada kata kelemahan yang terdeteksi. Pertahankan kinerja kuis Anda!
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {currentWeaknessSlice.map(({ wordObj, stat }) => {
                let badgeClass = 'bg-yellow-50 text-yellow-800 border-yellow-300';
                let icon = '🟡';

                if (stat.wrongCount === 2) {
                  badgeClass = 'bg-orange-50 text-orange-900 border-orange-300';
                  icon = '🟠';
                } else if (stat.wrongCount === 3) {
                  badgeClass = 'bg-rose-50 text-rose-900 border-rose-300';
                  icon = '🔴';
                } else if (stat.wrongCount >= 4) {
                  badgeClass = 'bg-slate-900 text-amber-300 border-slate-700 font-black';
                  icon = '⬛';
                }

                return (
                  <div
                    key={wordObj.id}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${badgeClass}`}
                  >
                    <span className="truncate">{wordObj.word}</span>
                    <span className="text-[10px] opacity-90 shrink-0 ml-1">{icon} {stat.wrongCount}x</span>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 text-xs font-bold text-slate-600">
                <button
                  type="button"
                  disabled={weaknessPage === 1}
                  onClick={() => setWeaknessPage((prev) => Math.max(1, prev - 1))}
                  className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <span>Halaman {weaknessPage} dari {totalPages}</span>

                <button
                  type="button"
                  disabled={weaknessPage === totalPages}
                  onClick={() => setWeaknessPage((prev) => Math.min(totalPages, prev + 1))}
                  className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onNavigateToSaturdayReview}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              🔄 Reclaim {weaknessItems.length} Kata di Vocabulary Review
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
