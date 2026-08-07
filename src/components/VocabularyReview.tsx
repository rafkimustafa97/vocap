import React, { useState, useEffect, useMemo } from 'react';
import { Word, WordUserStat, ActivityLogEntry } from '../types';
import { speakText } from '../utils/speech';
import {
  RotateCcw,
  Volume2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Flame,
  Award,
  ShieldCheck,
  Calendar,
  Lock,
  ArrowRight,
  Info,
  Check,
  Ban,
  LogOut,
  AlertTriangle
} from 'lucide-react';

interface VocabularyReviewProps {
  allWords: Word[];
  userStats: Record<number, WordUserStat>;
  currentWeek: number;
  startDateStr: string;
  onMarkWord: (wordId: number, isMastered: boolean) => void;
  onAddAuditLog: (log: ActivityLogEntry) => void;
  onReviewStateChange?: (isActive: boolean) => void;
  onDeductXpPenalty?: (penalty: number, reason: string) => void;
}

interface DynamicDayData {
  id: string;
  dayName: string;
  dayIndex: number; // 0: Mon, 1: Tue, 2: Wed, 3: Thu, 4: Fri
  studiedWords: Word[];
  minNo: number;
  maxNo: number;
  isAbsent: boolean; // True ONLY for past days before today with 0 studied words
  isToday: boolean;
}

export const VocabularyReview: React.FC<VocabularyReviewProps> = ({
  allWords,
  userStats,
  currentWeek,
  startDateStr,
  onMarkWord,
  onAddAuditLog,
  onReviewStateChange,
  onDeductXpPenalty
}) => {
  // Check if today is Saturday: ALL day filters disabled, mandatory cumulative weekly review focus!
  const now = new Date();
  const rawTodayWeekday = now.getDay();
  const isSaturday = rawTodayWeekday === 6;
  const isSaturdayAutoLocked = isSaturday;

  // Map current weekday to 0-4 index (0: Mon, 1: Tue, 2: Wed, 3: Thu, 4: Fri)
  const currentWeekdayIdx = rawTodayWeekday === 0 ? 0 : rawTodayWeekday === 6 ? 4 : Math.max(0, rawTodayWeekday - 1);

  // Safely parse YYYY-MM-DD as local date without UTC offset shift
  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-');
    if (parts.length < 3) return new Date();
    const [y, m, d] = parts.map(Number);
    return new Date(y, m - 1, d);
  };

  const localStartObj = parseLocalDate(startDateStr);
  const rawStartDay = localStartObj.getDay();
  const userStartWeekday = rawStartDay === 0 ? 0 : rawStartDay === 6 ? 0 : Math.max(0, rawStartDay - 1);

  // Extract all unique studied words (both correct & wrong) from userStats
  const allStudiedStatsList = useMemo(() => {
    return (Object.values(userStats) as WordUserStat[]).filter(
      (s) => s.status === 'learning' || s.status === 'mastered' || s.wrongCount > 0
    );
  }, [userStats]);

  const allStudiedWords = useMemo(() => {
    const studiedIds = new Set(allStudiedStatsList.map((s) => s.wordId));
    return allWords.filter((w) => studiedIds.has(w.id));
  }, [allWords, allStudiedStatsList]);

  // Compute DYNAMIC daily studied word slices for full Monday - Friday (Senin s/d Jumat)
  const dynamicDays = useMemo<DynamicDayData[]>(() => {
    const daysNameList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    const result: DynamicDayData[] = [];

    let currentOffset = 0;
    const countTotalStudied = allStudiedWords.length;

    for (let dayIdx = 0; dayIdx < 5; dayIdx++) {
      const dayName = daysNameList[dayIdx];
      const isToday = dayIdx === currentWeekdayIdx;

      let dayWords: Word[] = [];
      if (currentOffset < countTotalStudied) {
        const sliceSize = Math.min(30, countTotalStudied - currentOffset);
        dayWords = allStudiedWords.slice(currentOffset, currentOffset + sliceSize);
        currentOffset += sliceSize;
      }

      const minNo = dayWords[0]?.no || 0;
      const maxNo = dayWords[dayWords.length - 1]?.no || 0;

      const isPastDay = dayIdx < currentWeekdayIdx;
      const isAbsent = isPastDay && dayWords.length === 0 && dayIdx < userStartWeekday;

      result.push({
        id: `day-${dayIdx}`,
        dayName,
        dayIndex: dayIdx,
        studiedWords: dayWords,
        minNo,
        maxNo,
        isAbsent,
        isToday
      });
    }

    return result;
  }, [allStudiedWords, currentWeekdayIdx, userStartWeekday]);

  const activeStudiedDays = dynamicDays.filter((d) => !d.isAbsent);

  const [selectMode, setSelectMode] = useState<'all_week' | 'today' | 'custom_days'>('all_week');
  const [selectedDayIds, setSelectedDayIds] = useState<string[]>(() => {
    const todayDay = dynamicDays.find((d) => d.isToday && !d.isAbsent) || activeStudiedDays[0];
    return todayDay ? [todayDay.id] : ['day-0'];
  });

  // Review Active States
  const [reviewWords, setReviewWords] = useState<Word[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isReviewStarted, setIsReviewStarted] = useState<boolean>(false);

  // 15-Second Active Recall Countdown Timer
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // User Answer Inputs
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Session Results
  const [score, setScore] = useState<number>(0);
  const [earnedXp, setEarnedXp] = useState<number>(0);
  const [wrongWordIds, setWrongWordIds] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Notify parent of review active state for full app feature lock
  useEffect(() => {
    if (onReviewStateChange) {
      onReviewStateChange(isReviewStarted && !isCompleted);
    }
  }, [isReviewStarted, isCompleted, onReviewStateChange]);

  // Fisher-Yates Shuffler
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Timer Effect (15s per word)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isReviewStarted && isTimerRunning && !isAnswerSubmitted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswerSubmitted && isReviewStarted) {
      handleTimeoutFail();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReviewStarted, isTimerRunning, isAnswerSubmitted, timeLeft]);

  // Handle Timeout Failure
  const handleTimeoutFail = () => {
    setIsAnswerSubmitted(true);
    setIsCorrect(false);
    setIsTimerRunning(false);

    const currentWord = reviewWords[currentIdx];
    if (currentWord) {
      setWrongWordIds((prev) => [...prev, currentWord.id]);
      onMarkWord(currentWord.id, false); // Mark false -> adds to Weakness Radar!
    }
  };

  // Toggle Day Selection for Custom Days
  const toggleDaySelection = (dayId: string) => {
    if (isSaturdayAutoLocked) return;
    const targetDay = dynamicDays.find((d) => d.id === dayId);
    if (!targetDay || targetDay.isAbsent) return;

    let updated = [...selectedDayIds];
    if (updated.includes(dayId)) {
      if (updated.length > 1) {
        updated = updated.filter((d) => d !== dayId);
      }
    } else {
      updated.push(dayId);
    }
    setSelectedDayIds(updated);
  };

  // Handle Early Exit during Mon-Fri Daily Vocabulary Review
  const handleEarlyExitReview = () => {
    if (isSaturdayAutoLocked) return; // Exit disabled on Saturday

    const confirmExit = window.confirm(
      '⚠️ PERINGATAN KELUAR SESI REVIEW HARIAN:\n\n' +
      'Apakah Anda yakin ingin keluar di tengah jalan saat sesi Vocabulary Review Harian?\n\n' +
      '• XP Anda akan dipotong (-20 XP penalty).\n' +
      '• Aktivitas pembatalan ini akan dicatat secara transparan pada Riwayat Audit Trail.'
    );

    if (confirmExit) {
      setIsTimerRunning(false);
      setIsReviewStarted(false);
      setIsCompleted(false);

      const penaltyXp = 20;

      // Deduct XP penalty if callback provided
      if (onDeductXpPenalty) {
        onDeductXpPenalty(penaltyXp, 'Pembatalan Sesi Vocabulary Review Harian');
      }

      // Record Audit Trail Log for Cancellation
      const nowStr = new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const auditEntry: ActivityLogEntry = {
        id: `audit-review-cancel-${Date.now()}`,
        timestamp: new Date().toISOString(),
        formattedDate: `${nowStr} WIB`,
        category: 'vocab_review',
        title: '⚠️ Vocabulary Review Harian Dibatalkan (Exit Sesi)',
        description: `Pengguna keluar di tengah jalan pada kata ${currentIdx + 1}/${reviewWords.length}. XP dipotong (-20 XP).`,
        xpEarned: -penaltyXp,
        scorePct: 0,
        details: {
          totalCount: reviewWords.length,
          correctCount: score,
          mode: 'Exit Early Cancel'
        }
      };

      onAddAuditLog(auditEntry);
    }
  };

  // Initialize Review Pool strictly from ACTUAL STUDIED WORDS
  const handleStartReview = () => {
    let pool: Word[] = [];

    if (isSaturdayAutoLocked) {
      if (allStudiedWords.length > 0) {
        const sortedByWeakness = [...allStudiedWords].sort((a, b) => {
          const wA = userStats[a.id]?.wrongCount || 0;
          const wB = userStats[b.id]?.wrongCount || 0;
          return wB - wA;
        });
        pool = sortedByWeakness;
      } else {
        pool = allWords.slice(0, 30);
      }
    } else {
      if (selectMode === 'all_week') {
        pool = allStudiedWords.length > 0 ? allStudiedWords : allWords.slice(0, 30);
      } else if (selectMode === 'today') {
        const matchedDay = dynamicDays.find((d) => d.isToday) || activeStudiedDays[0];
        pool = matchedDay && matchedDay.studiedWords.length > 0 ? matchedDay.studiedWords : allWords.slice(0, 30);
      } else {
        const selectedDayObjs = dynamicDays.filter((d) => selectedDayIds.includes(d.id) && !d.isAbsent);
        selectedDayObjs.forEach((dayOpt) => {
          if (dayOpt.studiedWords.length > 0) {
            pool.push(...dayOpt.studiedWords);
          } else {
            const fallbackSlice = allWords.slice(dayOpt.dayIndex * 30, (dayOpt.dayIndex + 1) * 30);
            pool.push(...fallbackSlice);
          }
        });
      }
    }

    if (pool.length === 0) {
      pool = allWords.slice(0, 30);
    }

    const shuffled = shuffleArray(pool).slice(0, 30);
    setReviewWords(shuffled);
    setCurrentIdx(0);
    setScore(0);
    setEarnedXp(0);
    setWrongWordIds([]);
    setIsCompleted(false);
    setIsAnswerSubmitted(false);
    setIsCorrect(null);
    setTypedAnswer('');
    setTimeLeft(15);
    setIsTimerRunning(true);
    setIsReviewStarted(true);
  };

  // Handle Answer Submit
  const handleSubmitAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswerSubmitted || !typedAnswer.trim()) return;

    setIsTimerRunning(false);
    const currentWord = reviewWords[currentIdx];
    const userClean = typedAnswer.toLowerCase().trim();
    const correctMeaning = currentWord.meaning_id.toLowerCase().trim();

    const isMatched = correctMeaning.split(/[,/;]/).some((m) => userClean.includes(m.trim()) || m.trim().includes(userClean));

    setIsCorrect(isMatched);
    setIsAnswerSubmitted(true);

    if (isMatched) {
      setScore((prev) => prev + 1);
      setEarnedXp((prev) => prev + 15);
      onMarkWord(currentWord.id, true);
    } else {
      setWrongWordIds((prev) => [...prev, currentWord.id]);
      onMarkWord(currentWord.id, false); // Mark false -> adds to Weakness Radar!
    }
  };

  // Handle Next Word
  const handleNextWord = () => {
    if (currentIdx < reviewWords.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setIsAnswerSubmitted(false);
      setIsCorrect(null);
      setTypedAnswer('');
      setTimeLeft(15);
      setIsTimerRunning(true);
    } else {
      // Session Completed!
      setIsCompleted(true);
      const scorePct = Math.round((score / reviewWords.length) * 100);
      const finalXp = earnedXp + (scorePct === 100 ? 100 : 0);

      const nowStr = new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const dayLabelText = isSaturdayAutoLocked
        ? `Sabtu Auto-Lock Mandatory (${allStudiedWords.length} Kata Riil)`
        : selectMode === 'all_week'
        ? `Seluruh Kata Riil Senin-Jumat (${allStudiedWords.length} Kata)`
        : selectMode === 'today'
        ? 'Target Hari Ini'
        : dynamicDays.filter((d) => selectedDayIds.includes(d.id)).map((d) => d.dayName).join(', ');

      const auditEntry: ActivityLogEntry = {
        id: `audit-review-${Date.now()}`,
        timestamp: new Date().toISOString(),
        formattedDate: `${nowStr} WIB`,
        category: 'vocab_review',
        title: `Vocabulary Review (${dayLabelText})`,
        description: `Menuntaskan review ${reviewWords.length} kata dengan akurasi ${scorePct}%.`,
        xpEarned: finalXp,
        scorePct,
        details: {
          totalCount: reviewWords.length,
          correctCount: score,
          wrongWords: wrongWordIds.map((id) => allWords.find((w) => w.id === id)?.word).filter(Boolean) as string[],
          dayRange: dayLabelText
        }
      };

      onAddAuditLog(auditEntry);
    }
  };

  // -------------------------------------------------------------------
  // SETUP / START SCREEN VIEW
  // -------------------------------------------------------------------
  if (!isReviewStarted || isCompleted) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto pb-24 px-2">
        
        {/* Header Card */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Spaced Repetition Active Recall
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-1 flex items-center gap-2">
                🔄 Vocabulary Review Engine
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Sesi penguatan memori jangka panjang dengan timer 15 detik per kata tanpa distraksi.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartReview}
              className="bg-orange-600 hover:bg-orange-700 text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-orange-500/30 active:scale-98 transition-all flex items-center justify-center gap-2 text-base shrink-0"
            >
              {isSaturdayAutoLocked ? '🚀 Mulai Review Sabtu Mingguan' : '🚀 Mulai Vocabulary Review'}
            </button>
          </div>

          {/* SATURDAY AUTO-LOCK NOTICE BANNER */}
          {isSaturdayAutoLocked ? (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-6 flex items-start gap-4 text-amber-950 shadow-sm">
              <div className="p-3 bg-amber-500 text-white rounded-2xl shrink-0 shadow-md">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-base text-amber-900">HARI SABTU: TERKUNCI AUTOMATIS 🔒</h4>
                  <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                    FILTER DI-DISABLE
                  </span>
                </div>
                <p className="text-xs text-amber-900 font-medium leading-relaxed">
                  Sesuai aturan Spaced Repetition, seluruh filter hari di-disable pada hari Sabtu. Sistem <strong>FOKUS TOTAL MENGUJI MANDATORY {allStudiedWords.length} KATA RIIL MINGGU INI</strong> (diprioritaskan kata yang paling sering salah).
                </p>
              </div>
            </div>
          ) : (
            /* MON-FRI DYNAMIC DAY SELECTION */
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <label className="font-bold text-slate-800 text-xs md:text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-600" /> Pilih Hari Belajar (Senin s/d Jumat):
                </label>
                <span className="text-[11px] font-extrabold text-orange-800 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                  Total Hafalan: {allStudiedWords.length} Kata Riil
                </span>
              </div>

              {/* 3-OPTION MODE SELECTOR */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSelectMode('all_week')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                    selectMode === 'all_week'
                      ? 'border-orange-500 bg-orange-50 text-orange-950 ring-2 ring-orange-400/20 font-black'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black">🗓️ Seluruh Kata Riil</span>
                      {selectMode === 'all_week' && <Check className="w-4 h-4 text-orange-600" />}
                    </div>
                    <span className="text-[11px] text-orange-700 font-bold block mt-1">
                      Senin – Jumat ({allStudiedWords.length} Kata)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block mt-2">Hanya mengulas kata yang pernah dikerjakan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectMode('today')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                    selectMode === 'today'
                      ? 'border-orange-500 bg-orange-50 text-orange-950 ring-2 ring-orange-400/20 font-black'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black">🎯 Target Hari Ini</span>
                      {selectMode === 'today' && <Check className="w-4 h-4 text-orange-600" />}
                    </div>
                    <span className="text-[11px] text-blue-700 font-bold block mt-1">30 Kata Porsi Harian</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block mt-2">Materi khusus hari ini</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectMode('custom_days')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                    selectMode === 'custom_days'
                      ? 'border-orange-500 bg-orange-50 text-orange-950 ring-2 ring-orange-400/20 font-black'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black">📌 Pilih Hari (Bisa &gt;1)</span>
                      {selectMode === 'custom_days' && <Check className="w-4 h-4 text-orange-600" />}
                    </div>
                    <span className="text-[11px] text-purple-700 font-bold block mt-1">Multi-Selection</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block mt-2">Pilih lebih dari 1 hari</span>
                </button>
              </div>

              {/* DYNAMIC FULL MONDAY TO FRIDAY PILL BUTTONS */}
              {selectMode === 'custom_days' && (
                <div className="pt-2 border-t border-slate-200/80 space-y-2 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-700 block">
                      Pilih Hari yang Ingin Diulang (Bisa Dipilih Lebih dari 1 Hari):
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium italic">
                      * Hari ini aktif hingga jam 00:00
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {dynamicDays.map((dayOpt) => {
                      const isSelected = selectedDayIds.includes(dayOpt.id);
                      const isAbsent = dayOpt.isAbsent;
                      const hasWords = dayOpt.studiedWords.length > 0;

                      if (isAbsent) {
                        return (
                          <div
                            key={dayOpt.id}
                            className="px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-100 text-slate-400 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed opacity-75"
                            title="Hari lalu tanpa riwayat pengerjaan (Absen)"
                          >
                            <Ban className="w-3.5 h-3.5 text-slate-400" />
                            Hari {dayOpt.dayName} (Absen / 0 Kata)
                          </div>
                        );
                      }

                      return (
                        <button
                          key={dayOpt.id}
                          type="button"
                          onClick={() => toggleDaySelection(dayOpt.id)}
                          className={`px-4 py-2.5 rounded-xl border-2 text-xs font-black transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-orange-600 border-orange-600 text-white shadow-sm ring-2 ring-orange-400/30'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          Hari {dayOpt.dayName} {dayOpt.isToday ? '(Hari Ini' : ''}
                          {hasWords ? `: ${dayOpt.studiedWords.length} Kata #${dayOpt.minNo}-#${dayOpt.maxNo}` : dayOpt.isToday ? ': 0 Kata)' : ')'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400 italic pt-1">
                * Hari yang sedang berlangsung (Hari Ini) <strong>TIDAK AKAN DI-DISABLE</strong> dan tetap aktif hingga jam 00:00 midnight!
              </p>
            </div>
          )}

          {/* RULES BRIEFING WITH EXIT WARNING NOTE */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
            <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
              <Info className="w-4 h-4 text-orange-600" /> Aturan Main Sesi Review Fokus:
            </h4>
            <ul className="space-y-1.5 text-slate-600 list-disc pl-4 text-[11px]">
              <li><strong>Timer 15 Detik:</strong> Setiap kata memiliki waktu 15 detik untuk mengetik arti dalam Bahasa Indonesia.</li>
              <li><strong>Auto-Timeout to Weakness:</strong> Jika 15 detik habis tanpa jawaban, soal otomatis salah dan dimasukkan ke <em>Weakness Radar</em>.</li>
              <li><strong>Tanpa Distraksi:</strong> Seluruh fitur navigasi aplikasi di-disable selama sesi review aktif.</li>
              <li className="text-amber-800 font-bold">
                ⚠️ <strong>Batal / Keluar Sesi (Khusus Harian):</strong> Jika Anda keluar di tengah sesi Vocabulary Review Harian, XP Anda akan dipotong (-20 XP penalty) dan dicatat pada Riwayat Audit Trail.
              </li>
            </ul>
          </div>

        </div>

      </div>
    );
  }

  // -------------------------------------------------------------------
  // ACTIVE FULLSCREEN FOCUS REVIEW VIEW
  // -------------------------------------------------------------------
  const word = reviewWords[currentIdx];
  if (!word) return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 px-2">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-[32px] p-6 text-white shadow-xl flex items-center justify-between gap-4">
        <div>
          <span className="bg-white/20 text-white font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            VOCABULARY REVIEW ({currentIdx + 1} / {reviewWords.length})
          </span>
          <h2 className="text-xl md:text-2xl font-black mt-1">Active Memory Recall</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/20 px-3 py-1.5 rounded-2xl font-mono font-black text-sm border border-white/30 flex items-center gap-1">
            <Clock className="w-4 h-4 text-amber-200 animate-pulse" /> {timeLeft}s
          </div>

          {/* EXIT BUTTON ONLY FOR MON-FRI DAILY REVIEW */}
          {!isSaturdayAutoLocked && (
            <button
              type="button"
              onClick={handleEarlyExitReview}
              className="bg-rose-500/90 hover:bg-rose-600 text-white font-black px-3.5 py-1.5 rounded-2xl text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all border border-rose-300/40"
              title="Keluar Sesi (Dipotong -20 XP)"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          )}
        </div>
      </div>

      {/* Main Review Card */}
      <div className="bg-white rounded-[36px] p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
        
        {/* Word Title & Pronunciation */}
        <div className="text-center space-y-2 border-b border-slate-100 pb-6">
          <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
            {word.pos}
          </span>

          <h3 className="text-3xl md:text-5xl font-black text-slate-900 flex items-center justify-center gap-3 tracking-tight">
            {word.word}
            <button
              type="button"
              onClick={() => speakText(word.word)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-blue-600"
              title="Dengarkan pengucapan"
            >
              <Volume2 className="w-7 h-7" />
            </button>
          </h3>

          <p className="text-xs text-slate-400 font-mono">
            IPA: {word.ipa} ({word.ipa_perkiraan})
          </p>

          {/* 15s Countdown Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-4">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 5 ? 'bg-rose-500' : timeLeft <= 10 ? 'bg-amber-500' : 'bg-orange-500'
              }`}
              style={{ width: `${(timeLeft / 15) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Typing Input Form */}
        <form onSubmit={handleSubmitAnswer} className="space-y-4">
          <div className="space-y-2">
            <label className="font-extrabold text-xs text-slate-700 block uppercase tracking-wider">
              Ketik Tebakan Arti dalam Bahasa Indonesia (Batas Waktu: 15 Detik):
            </label>
            <input
              type="text"
              disabled={isAnswerSubmitted}
              autoFocus
              placeholder="Contoh: ibu / mengasuh..."
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 font-bold text-base md:text-lg text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
            />
          </div>

          {!isAnswerSubmitted && (
            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-orange-500/30 active:scale-98 transition-all text-base"
            >
              Kirim Jawaban Review
            </button>
          )}
        </form>

        {/* ANSWER FEEDBACK BOX & NEXT BUTTON */}
        {isAnswerSubmitted && (
          <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {isCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" /> : <XCircle className="w-6 h-6 text-rose-600 shrink-0" />}
              <div>
                <h4 className="font-extrabold text-sm md:text-base">
                  {isCorrect ? 'BENAR! AMAN (+15 XP)' : timeLeft === 0 ? 'WAKTU HABIS (TIMEOUT)' : 'BELUM TEPAT'}
                </h4>
                <p className="text-xs font-bold mt-0.5">
                  Arti Baku: <span className="underline">{word.meaning_id}</span>
                </p>
                {!isCorrect && (
                  <p className="text-[11px] opacity-80 mt-1">
                    * Kata ini otomatis dimasukkan ke dalam list <strong>Weakness Radar</strong>.
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextWord}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-6 rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 text-base"
            >
              {currentIdx < reviewWords.length - 1 ? 'Lanjut Kata Berikutnya ➡️' : 'Selesaikan Vocabulary Review 🎉'}
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
