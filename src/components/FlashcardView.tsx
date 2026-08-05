import React, { useState } from 'react';
import { Word } from '../types';
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
  Navigation
} from 'lucide-react';

interface FlashcardViewProps {
  words: Word[];
  onMarkWord: (wordId: number, isMastered: boolean) => void;
  onOpenTenses: (word: Word) => void;
  onSelectWordByName?: (wordName: string) => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  words,
  onMarkWord,
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

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

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
              {words.map((w, idx) => (
                <option key={w.id} value={idx}>
                  #{idx + 1}. {w.word}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setIsJumpGridExpanded(!isJumpGridExpanded)}
              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 text-xs font-bold flex items-center gap-1 transition-all"
              title="Tampilkan grid lompat kata"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* HORIZONTAL SCROLLING WORD PILLS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth">
          {words.map((w, idx) => {
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => handleJumpToWord(idx)}
                className={`px-3 py-1 rounded-xl text-xs font-black shrink-0 transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-300 scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                }`}
              >
                #{idx + 1} {w.word}
              </button>
            );
          })}
        </div>

        {/* EXPANDABLE GRID PICKER (FOR ALL 10, 20, 30 WORDS) */}
        {isJumpGridExpanded && (
          <div className="pt-3 border-t border-slate-100 space-y-2 animate-in fade-in zoom-in duration-200">
            <span className="text-[11px] font-bold text-slate-500 block">
              Pilih Kata Mana Saja untuk Dibaca (Bebas Lompat Dalam Porsi {words.length} Kata):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {words.map((w, idx) => {
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      handleJumpToWord(idx);
                      setIsJumpGridExpanded(false);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md font-black'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">#{idx + 1}. {w.word}</span>
                    <span className="text-[10px] opacity-80 uppercase ml-1">{w.pos.slice(0, 3)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Top Counter & 9 Tenses Action */}
      <div className="w-full flex items-center justify-between px-2 text-xs font-bold text-slate-600">
        <span className="bg-slate-200/80 px-3 py-1 rounded-full">
          Kata {currentIndex + 1} dari {words.length} (No. #{currentWord.no})
        </span>
        <button
          type="button"
          onClick={() => onOpenTenses(currentWord)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-full font-bold shadow-md shadow-indigo-200 flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" /> 9 Tenses Context
        </button>
      </div>

      {/* Main Flashcard Container */}
      <motion.div
        key={currentWord.id}
        initial={{ opacity: 0, x: direction === 'right' ? 100 : direction === 'left' ? -100 : 0 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-xl relative min-h-[440px] flex flex-col justify-between"
      >
        {/* Header: POS & Source */}
        <div className="flex items-center justify-between mb-3">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {currentWord.pos}
          </span>
          <span className="text-xs text-slate-400 font-semibold italic">
            Source: {currentWord.source}
          </span>
        </div>

        {/* CARD CONTENT AREA */}
        <div className="flex-1 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {!isFlipped ? (
              // FRONT OF FLASHCARD
              <motion.div
                key="front"
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 90 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col justify-between space-y-4 my-2 text-center"
              >
                <div className="space-y-3">
                  {/* Word & Audio */}
                  <div className="flex items-center justify-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                      {currentWord.word}
                    </h1>
                    <button
                      type="button"
                      onClick={() => speakText(currentWord.word)}
                      className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition-all shadow-inner"
                      title="Dengarkan pengucapan"
                    >
                      <Volume2 className="w-6 h-6" />
                    </button>
                  </div>

                  {/* IPA */}
                  <div className="inline-block bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100">
                    <p className="text-sm font-semibold text-slate-600 font-mono">
                      IPA: {currentWord.ipa} <span className="text-slate-400 font-sans">({currentWord.ipa_perkiraan})</span>
                    </p>
                  </div>

                  {/* Meaning */}
                  <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 w-full">
                    <p className="text-xs text-amber-700 font-bold uppercase tracking-wider mb-1">Arti (Indonesia):</p>
                    <p className="text-xl md:text-2xl font-bold text-slate-900">
                      {currentWord.meaning_id}
                    </p>
                  </div>

                  {/* V1, V2, V3, V-ing Display */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-left">
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

                  {/* Example Sentence */}
                  {currentWord.example_sentence && (
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-left w-full relative">
                      <p className="text-[11px] text-slate-400 font-bold uppercase mb-1">Contoh Kalimat Akademis:</p>
                      <p className="text-xs md:text-sm text-slate-700 italic leading-relaxed pr-6">
                        "{currentWord.example_sentence}"
                      </p>
                      <button
                        type="button"
                        onClick={() => speakText(currentWord.example_sentence)}
                        className="absolute top-3 right-3 p-1 text-slate-400 hover:text-blue-600"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              // BACK OF FLASHCARD (Word Family & Details)
              <motion.div
                key="back"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col justify-between space-y-4 my-2 text-left overflow-y-auto max-h-[350px] pr-1"
              >
                <div className="text-center pb-2 border-b border-slate-100">
                  <h3 className="text-2xl font-bold text-slate-900">{currentWord.word}</h3>
                  <p className="text-xs text-slate-500 font-medium">{currentWord.meaning_id}</p>
                </div>

                {/* Word Family Tree Diagram */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/40 p-3.5 rounded-2xl border border-slate-200/80">
                  <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" /> Word Family Tree:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Noun:</span>
                      <button
                        type="button"
                        onClick={() => onSelectWordByName && currentWord.noun_family && onSelectWordByName(currentWord.noun_family.split(' ')[0])}
                        className="font-semibold text-blue-700 hover:underline text-left truncate block w-full"
                      >
                        {currentWord.noun_family || '-'}
                      </button>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Verb:</span>
                      <button
                        type="button"
                        onClick={() => onSelectWordByName && currentWord.verb_family && onSelectWordByName(currentWord.verb_family.split(' ')[0])}
                        className="font-semibold text-emerald-700 hover:underline text-left truncate block w-full"
                      >
                        {currentWord.verb_family || '-'}
                      </button>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Adjective:</span>
                      <button
                        type="button"
                        onClick={() => onSelectWordByName && currentWord.adj_family && onSelectWordByName(currentWord.adj_family.split(' ')[0])}
                        className="font-semibold text-amber-700 hover:underline text-left truncate block w-full"
                      >
                        {currentWord.adj_family || '-'}
                      </button>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Adverb:</span>
                      <button
                        type="button"
                        onClick={() => onSelectWordByName && currentWord.adv_family && onSelectWordByName(currentWord.adv_family.split(' ')[0])}
                        className="font-semibold text-indigo-700 hover:underline text-left truncate block w-full"
                      >
                        {currentWord.adv_family || '-'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collocations */}
                {currentWord.collocations && currentWord.collocations.length > 0 && currentWord.collocations[0] !== '-' && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-blue-600" /> Collocations:
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {currentWord.collocations.map((col, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => speakText(col)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-xl border border-blue-200 flex items-center gap-1 transition-all active:scale-95"
                        >
                          {col} <Volume2 className="w-3 h-3 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Synonyms & Antonyms */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {currentWord.synonyms && currentWord.synonyms.length > 0 && (
                    <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                      <span className="font-bold text-emerald-800 block mb-1">Sinonim:</span>
                      <p className="text-slate-700">{currentWord.synonyms.join(', ')}</p>
                    </div>
                  )}
                  {currentWord.antonyms && currentWord.antonyms.length > 0 && currentWord.antonyms[0] !== '-' && (
                    <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-100">
                      <span className="font-bold text-rose-800 block mb-1">Antonim:</span>
                      <p className="text-slate-700">{currentWord.antonyms.join(', ')}</p>
                    </div>
                  )}
                </div>

                {/* Prefix / Suffix info boxes */}
                {(currentWord.prefix_info || currentWord.suffix_info) && (
                  <div className="space-y-1.5 pt-1">
                    {currentWord.prefix_info && (
                      <div className="bg-blue-50 text-blue-900 text-xs p-2.5 rounded-xl border border-blue-200">
                        <strong>Prefix Info:</strong> {currentWord.prefix_info}
                      </div>
                    )}
                    {currentWord.suffix_info && (
                      <div className="bg-emerald-50 text-emerald-900 text-xs p-2.5 rounded-xl border border-emerald-200">
                        <strong>Suffix Info:</strong> {currentWord.suffix_info}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Flip Card Toggle Button */}
        <button
          type="button"
          onClick={toggleFlip}
          className="mt-4 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98 shrink-0 shadow-2xs"
        >
          <RotateCw className="w-4 h-4 text-blue-600" /> {isFlipped ? 'Lihat Sisi Depan Kartu' : 'Putar Kartu (Detail & Word Family Tree)'}
        </button>
      </motion.div>

      {/* Action Buttons */}
      <div className="w-full grid grid-cols-2 gap-3 mt-4">
        <button
          type="button"
          onClick={() => handleNext(false)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-4 rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <XCircle className="w-5 h-5" /> ❌ Perlu Diulang
        </button>

        <button
          type="button"
          onClick={() => handleNext(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-4 rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <CheckCircle2 className="w-5 h-5" /> ✅ Lancar / Ingat
        </button>
      </div>
    </div>
  );
};
