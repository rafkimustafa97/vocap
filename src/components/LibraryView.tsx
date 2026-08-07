import React, { useState, useMemo } from 'react';
import { Word, WordUserStat } from '../types';
import { speakText } from '../utils/speech';
import {
  Search,
  BookOpen,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter
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
  const itemsPerPage = 20;

  const filteredWords = useMemo(() => {
    return allWords.filter((w) => {
      const matchesSearch =
        w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.meaning_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.no.toString() === searchTerm.trim();

      const matchesPos =
        selectedPos === 'all'
          ? true
          : w.pos.toLowerCase().includes(selectedPos.toLowerCase());

      const matchesSource =
        selectedSource === 'all'
          ? true
          : (w.source || '').toUpperCase().includes(selectedSource.toUpperCase());

      const stat = userStats[w.id];
      let matchesStatus = true;
      if (selectedStatus === 'mastered') {
        matchesStatus = stat?.status === 'mastered';
      } else if (selectedStatus === 'learning') {
        matchesStatus = stat?.status === 'learning';
      } else if (selectedStatus === 'new') {
        matchesStatus = !stat || stat.status === 'new';
      } else if (selectedStatus === 'weakness') {
        matchesStatus = !!stat?.isWeakness;
      }

      return matchesSearch && matchesPos && matchesSource && matchesStatus;
    });
  }, [allWords, userStats, searchTerm, selectedPos, selectedSource, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredWords.length / itemsPerPage));
  const currentPageWords = filteredWords.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-2 sm:px-4 pb-20">
      
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-0.5 rounded-full">
              Kamus Akademis Lengkap
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              3.655 Master Vocabulary PTE
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full self-start sm:self-auto">
            Menampilkan {filteredWords.length} kata
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
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
                <div className="flex flex-wrap items-center gap-2">
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

              {/* Action Buttons: Moved to the right side on mobile to fill red box area */}
              <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-100 justify-end">
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

        {filteredWords.length === 0 && (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 text-sm">Tidak ada kata ditemukan</h4>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl p-3 border border-slate-200 text-xs font-bold text-slate-600">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Sebelum
          </button>

          <span>
            Halaman {page} dari {totalPages}
          </span>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-all"
          >
            Berikut <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
