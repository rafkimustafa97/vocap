import React, { useState, useMemo } from 'react';
import { Word, WordUserStat } from '../types';
import { getWordsRange } from '../data/wordsMaster';
import { speakText } from '../utils/speech';
import {
  Search,
  Filter,
  Volume2,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Tag,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface LibraryViewProps {
  allWords: Word[];
  userStats: Record<number, WordUserStat>;
  onOpenTenses: (word: Word) => void;
  onSelectWord: (word: Word) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  allWords,
  userStats,
  onOpenTenses,
  onSelectWord
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPos, setSelectedPos] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;

  // Filtered dataset
  const filteredWords = useMemo(() => {
    return allWords.filter((word) => {
      // Search
      const searchLower = searchTerm.trim().toLowerCase();
      const matchesSearch =
        searchLower === '' ||
        word.word.toLowerCase().includes(searchLower) ||
        word.meaning_id.toLowerCase().includes(searchLower) ||
        word.ipa.toLowerCase().includes(searchLower) ||
        word.ipa_perkiraan.toLowerCase().includes(searchLower) ||
        word.no.toString() === searchLower;

      // POS
      let matchesPos = selectedPos === 'all';
      if (!matchesPos) {
        const pLower = word.pos.toLowerCase();
        if (selectedPos === 'verb') {
          matchesPos = pLower.includes('verb') || pLower.includes('v.') || pLower.includes('v/');
        } else if (selectedPos === 'noun') {
          matchesPos = pLower.includes('noun') || pLower.includes('n.') || pLower.includes('/n');
        } else if (selectedPos === 'adjective') {
          matchesPos = pLower.includes('adj');
        } else if (selectedPos === 'adverb') {
          matchesPos = pLower.includes('adv');
        } else if (selectedPos === 'phrasal') {
          matchesPos = pLower.includes('phrasal');
        } else if (selectedPos === 'idiom') {
          matchesPos = pLower.includes('idiom');
        } else {
          matchesPos = pLower.includes(selectedPos.toLowerCase());
        }
      }

      // Source
      let matchesSource = selectedSource === 'all';
      if (!matchesSource) {
        const sLower = word.source.toLowerCase();
        if (selectedSource === 'AWL') {
          matchesSource = sLower.includes('awl');
        } else if (selectedSource === 'NGSL') {
          matchesSource = sLower.includes('ngsl');
        } else if (selectedSource === 'Vocabulary') {
          matchesSource = sLower.includes('vocab') && !sLower.includes('awl') && !sLower.includes('ngsl');
        } else if (selectedSource === 'Appendix') {
          matchesSource = sLower.includes('appendix');
        } else {
          matchesSource = sLower === selectedSource.toLowerCase();
        }
      }

      // Mastery status
      const stat = userStats[word.id];
      const status = stat ? stat.status : 'new';
      const isWeakness = stat ? stat.isWeakness : false;

      let matchesStatus = true;
      if (selectedStatus === 'mastered') matchesStatus = status === 'mastered';
      if (selectedStatus === 'learning') matchesStatus = status === 'learning';
      if (selectedStatus === 'new') matchesStatus = status === 'new';
      if (selectedStatus === 'weakness') matchesStatus = isWeakness;

      return matchesSearch && matchesPos && matchesSource && matchesStatus;
    });
  }, [allWords, userStats, searchTerm, selectedPos, selectedSource, selectedStatus]);

  const totalPages = Math.ceil(filteredWords.length / pageSize) || 1;
  const currentPageWords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredWords.slice(start, start + pageSize);
  }, [filteredWords, page, pageSize]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto px-2 pb-24">
      {/* Search & Filter Header */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> Kamus Master (3.655 Kata)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Cari kata, IPA, arti Bahasa Indonesia, atau nomor kata.
            </p>
          </div>
          <span className="text-xs font-black bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
            {filteredWords.length} Hasil
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Cari kata (contoh: implement, 150, mader)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <select
            value={selectedPos}
            onChange={(e) => { setSelectedPos(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">POS: Semua</option>
            <option value="verb">Verb</option>
            <option value="noun">Noun</option>
            <option value="adjective">Adjective</option>
            <option value="adverb">Adverb</option>
            <option value="phrasal">Phrasal Verb</option>
            <option value="idiom">Idiom</option>
          </select>

          <select
            value={selectedSource}
            onChange={(e) => { setSelectedSource(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">Sumber: Semua</option>
            <option value="AWL">AWL Academic</option>
            <option value="NGSL">NGSL General</option>
            <option value="Vocabulary">Everyday</option>
            <option value="Appendix">Appendix</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">Status: Semua</option>
            <option value="mastered">✅ Mastered</option>
            <option value="learning">🔄 Learning</option>
            <option value="new">🆕 New</option>
            <option value="weakness">⚠️ Weakness</option>
          </select>
        </div>
      </div>

      {/* Words List Grid */}
      <div className="space-y-2.5">
        {currentPageWords.map((word) => {
          const stat = userStats[word.id];
          const isMastered = stat?.status === 'mastered';
          const isWeakness = stat?.isWeakness;

          return (
            <div
              key={word.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 font-mono">#{word.no}</span>
                  <h3 className="text-base font-black text-slate-900">{word.word}</h3>
                  <button
                    type="button"
                    onClick={() => speakText(word.word)}
                    className="p-1 hover:bg-blue-50 text-blue-600 rounded-full transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {word.pos}
                  </span>

                  {isMastered && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Mastered
                    </span>
                  )}

                  {isWeakness && (
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3" /> Weakness
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  <strong>IPA:</strong> {word.ipa} <span className="text-slate-400">({word.ipa_perkiraan})</span> — <strong>Arti:</strong> {word.meaning_id}
                </p>

                {word.collocations && word.collocations.length > 0 && word.collocations[0] !== '-' && (
                  <p className="text-[11px] text-slate-500 italic">
                    <strong>Collocations:</strong> {word.collocations.join(', ')}
                  </p>
                )}
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                <button
                  type="button"
                  onClick={() => onOpenTenses(word)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 flex items-center gap-1 transition-all"
                  title="Buka 9 Tenses Context"
                >
                  <Sparkles className="w-3.5 h-3.5" /> 9 Tenses
                </button>

                <button
                  type="button"
                  onClick={() => onSelectWord(word)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Detail
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between text-xs font-bold text-slate-700">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-3 py-2 rounded-xl flex items-center gap-1 ${
              page === 1 ? 'text-slate-300 cursor-not-allowed' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          <span>
            Halaman {page} dari {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-3 py-2 rounded-xl flex items-center gap-1 ${
              page === totalPages ? 'text-slate-300 cursor-not-allowed' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
