import React, { useState } from 'react';
import { Word, WordUserStat } from '../types';
import { speakText } from '../utils/speech';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  RotateCw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  BookOpen,
  Tag,
  ArrowRight,
  ListFilter,
  Grid,
  ChevronDown,
  Navigation,
  Info,
  RotateCcw
} from 'lucide-react';

interface FlashcardViewProps {
  words: Word[];
  userStats: Record<number, WordUserStat>;
  onMarkWord: (wordId: number, isMastered: boolean) => void;
  onResetWord: (wordId: number) => void;
  onOpenTenses: (word: Word) => void;
  onSelectWordByName?: (wordName: string) => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  words,
  userStats,
  onMarkWord,
  onResetWord,
  onOpenTenses,
  onSelectWordByName
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isJumpGridExpanded, setIsJumpGridExpanded] = useState<boolean>(false);

  const currentWord = words && words.length > 0 ? words[currentIndex % words.length] : null;

  if (!words || words.length === 0 || !currentWord) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm my-6 max-w-xl mx-auto">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Tidak ada kata untuk dipelajari</h3>
        <p className="text-xs text-slate-500 mt-1">
          Semua target kata di filter ini telah diselesaikan atau belum dijadwalkan.
        </p>
      </div>
    );
  }

  const currentStat = userStats?.[currentWord.id];
  const isWordMastered = currentStat?.status === 'mastered';

  const handleJumpToWord = (index: number) => {
    setIsFlipped(false);
    setCurrentIndex(index);
  };

  const handleNext = (mastered: boolean) => {
    onMarkWord(currentWord.id, mastered);
    setDirection(mastered ? 'right' : 'left');
    setIsFlipped(false);
    setTimeout(() => {
      setDirection(null);
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 200);
  };

  const handleResetCurrentWord = () => {
    onResetWord(currentWord.id);
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const isVerb = currentWord.pos && (currentWord.pos.toLowerCase().includes('verb') || currentWord.v1 !== '-');

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto w-full px-2 py-4 space-y-4">
      
      {/* QUICK JUMP SELECTOR BAR (BEBAS LOMPAT KOSAKATA TARGET HARIAN 10, 20, 30) */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Target Hafalan Hari Ini ({words.length} Kata):
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Dropdown Jump */}
            <select
              value={currentIndex}
              onChange={(e) => handleJumpToWord(Number(e.target.value))}
              className="bg-slate-100 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[140px] truncate"
            >
              {words.map((w, idx) => {
                const wStat = userStats?.[w.id];
                const isMastered = wStat?.status === 'mastered';
                return (
                  <option key={w.id} value={idx}>
                    #{idx + 1}. {w.word} {isMastered ? '✓ (Mastered)' : ''}
                  </option>
                );
              })}
            </select>

            {/* Grid Toggle Button */}
            <button
              type="button"
              onClick={() => setIsJumpGridExpanded(!isJumpGridExpanded)}
              className={`p-1.5 rounded-xl border transition-all ${
                isJumpGridExpanded
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Tampilkan Kisi Semua Kata"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Jump Grid Pills */}
        {isJumpGridExpanded && (
          <div className="pt-2 border-t border-slate-100 grid grid-cols-5 sm:grid-cols-10 gap-1.5 animate-fadeIn">
            {words.map((w, idx) => {
              const wStat = userStats?.[w.id];
              const isMastered = wStat?.status === 'mastered';
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => {
                    handleJumpToWord(idx);
                    setIsJumpGridExpanded(false);
                  }}
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-black truncate transition-all text-center border ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                      : isMastered
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  title={`${w.word} (${w.meaning_id})`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Flashcard Card */}
      <motion.div
        key={currentWord.id}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full bg-white rounded-3xl border border-slate-200 shadow-md p-5 sm:p-6 space-y-4 relative overflow-hidden"
      >
        {/* Top Header info */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              #{currentWord.no}
            </span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
              {currentWord.pos}
            </span>
            {currentWord.source && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                {currentWord.source}
              </span>
            )}
          </div>

          {/* Dynamic Mastery Badge */}
          <div>
            {isWordMastered ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[11px] rounded-full border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Mastered
              </span>
            ) : currentStat?.status === 'learning' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 font-extrabold text-[11px] rounded-full border border-blue-200">
                <RotateCw className="w-3.5 h-3.5 text-blue-600 text-[10px]" /> Learning
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 font-extrabold text-[11px] rounded-full border border-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> New
              </span>
            )}
          </div>
        </div>

        {/* Card Body Front & Back Flip Animation */}
        <div className="min-h-[280px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {!isFlipped ? (
              /* FRONT OF CARD */
              <motion.div
                key="front"
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-center py-2"
              >
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {currentWord.word}
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-sm font-semibold text-slate-500 font-mono">
                      {currentWord.ipa || `/${currentWord.word}/`}
                    </span>
                    <button
                      type="button"
                      onClick={() => speakText(currentWord.word)}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-colors active:scale-95"
                      title="Dengar Pengucapan Audio"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Primary Meaning */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Arti Bahasa Indonesia
                  </span>
                  <p className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
                    {currentWord.meaning_id}
                  </p>
                </div>

                {/* Part of Speech & Word Structure info */}
                <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl p-3.5 border border-blue-100 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Informasi Kelas Kata ({currentWord.pos.toUpperCase()})
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                      {isVerb ? 'Kata Kerja' : 'Nominal / Sifat'}
                    </span>
                  </div>

                  {isVerb ? (
                    <div className="grid grid-cols-4 gap-1.5 text-center pt-1">
                      <div className="bg-white p-1.5 rounded-xl border border-blue-100 shadow-2xs">
                        <span className="text-[9px] font-bold text-slate-400 block">V1</span>
                        <span className="text-xs font-black text-slate-800 truncate block">
                          {currentWord.v1 && currentWord.v1 !== '-' ? currentWord.v1 : currentWord.word}
                        </span>
                      </div>
                      <div className="bg-white p-1.5 rounded-xl border border-blue-100 shadow-2xs">
                        <span className="text-[9px] font-bold text-slate-400 block">V2</span>
                        <span className="text-xs font-black text-slate-800 truncate block">
                          {currentWord.v2 && currentWord.v2 !== '-' ? currentWord.v2 : '-'}
                        </span>
                      </div>
                      <div className="bg-white p-1.5 rounded-xl border border-blue-100 shadow-2xs">
                        <span className="text-[9px] font-bold text-slate-400 block">V3</span>
                        <span className="text-xs font-black text-slate-800 truncate block">
                          {currentWord.v3 && currentWord.v3 !== '-' ? currentWord.v3 : '-'}
                        </span>
                      </div>
                      <div className="bg-white p-1.5 rounded-xl border border-blue-100 shadow-2xs">
                        <span className="text-[9px] font-bold text-slate-400 block">V-ing</span>
                        <span className="text-xs font-black text-slate-800 truncate block">
                          {currentWord.v_ing && currentWord.v_ing !== '-' ? currentWord.v_ing : '-'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-blue-100 shadow-2xs text-xs">
                      <span className="text-slate-500 font-medium">Bentuk Imbuhan (Affix):</span>
                      <div className="flex items-center gap-1.5">
                        {currentWord.prefix_info && (
                          <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-md border border-purple-200">
                            Prefix: {currentWord.prefix_info}
                          </span>
                        )}
                        {currentWord.suffix_info && (
                          <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md border border-amber-200">
                            Suffix: {currentWord.suffix_info}
                          </span>
                        )}
                        {!currentWord.prefix_info && !currentWord.suffix_info && (
                          <span className="text-slate-600 font-semibold italic">Root Word</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Open 9 Tenses Engine Button */}
                <button
                  type="button"
                  onClick={() => onOpenTenses(currentWord)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Buka 9 Tenses Engine & Aplikasi Kalimat
                </button>
              </motion.div>
            ) : (
              /* BACK OF CARD */
              <motion.div
                key="back"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 py-2"
              >
                {/* Example Sentence */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Contoh Kalimat Kontekstual
                  </span>
                  <p className="text-sm font-semibold text-slate-800 italic leading-relaxed">
                    "{currentWord.example_sentence || 'Tidak ada contoh kalimat.'}"
                  </p>
                </div>

                {/* Word Family Tree */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    Pohon Keluarga Kata (Word Family Tree)
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Noun (Benda)</span>
                      <span className="font-bold text-slate-800">
                        {currentWord.noun_family || '-'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Verb (Kerja)</span>
                      <span className="font-bold text-slate-800">
                        {currentWord.verb_family || '-'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Adjective (Sifat)</span>
                      <span className="font-bold text-slate-800">
                        {currentWord.adj_family || '-'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Adverb (Keterangan)</span>
                      <span className="font-bold text-slate-800">
                        {currentWord.adv_family || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Synonyms & Collocations */}
                <div className="space-y-2 text-xs">
                  {currentWord.synonyms && currentWord.synonyms.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-500 shrink-0">Sinonim:</span>
                      <div className="flex flex-wrap gap-1">
                        {currentWord.synonyms.map((s, idx) => (
                          <span
                            key={idx}
                            onClick={() => onSelectWordByName && onSelectWordByName(s)}
                            className="bg-slate-100 hover:bg-blue-100 hover:text-blue-700 cursor-pointer font-bold text-slate-700 px-2 py-0.5 rounded-md text-[11px] transition-colors"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentWord.collocations && currentWord.collocations.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-500 shrink-0">Kolokasi:</span>
                      <div className="flex flex-wrap gap-1">
                        {currentWord.collocations.map((c, idx) => (
                          <span
                            key={idx}
                            className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md text-[11px]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Flip Toggle Button */}
          <button
            type="button"
            onClick={toggleFlip}
            className="w-full mt-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <RotateCw className="w-4 h-4 text-blue-600" />
            {isFlipped ? 'Lihat Sisi Depan Kartu' : 'Putar Kartu (Detail & Word Family Tree)'}
          </button>
        </div>

        {/* Action Buttons: Toggle dynamically between (Belum Hafal + Sudah Hafal) OR (Pelajari Ulang) */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          {isWordMastered ? (
            <button
              type="button"
              onClick={handleResetCurrentWord}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Pelajari Ulang (Reset Progress -5 XP)
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleNext(false)}
                className="py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-2xl border border-rose-200 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <XCircle className="w-4 h-4" /> Belum Hafal (+0 XP)
              </button>

              <button
                type="button"
                onClick={() => handleNext(true)}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Sudah Hafal (+5 XP)
              </button>
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
};
