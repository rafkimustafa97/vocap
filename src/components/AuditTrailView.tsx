import React, { useState } from 'react';
import { ActivityLogEntry } from '../types';
import { FileText, Clock, Trophy, Award, Search, Filter, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Sparkles, Layers } from 'lucide-react';

interface AuditTrailViewProps {
  activityLogs: ActivityLogEntry[];
  totalXp: number;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ activityLogs, totalXp }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Filter logs based on category & search query
  const filteredLogs = activityLogs.filter((log) => {
    const matchesCat = filterCategory === 'all' || log.category === filterCategory;
    const matchesQuery = !searchQuery.trim() ||
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Sort by timestamp descending (newest first)
  const sortedLogs = [...filteredLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / itemsPerPage));
  const currentLogs = sortedLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Summary Metrics
  const totalQuizSessions = activityLogs.filter((l) => l.category === 'quiz').length;
  const totalReviewSessions = activityLogs.filter((l) => l.category === 'vocab_review').length;
  const avgQuizScore = totalQuizSessions > 0
    ? Math.round(
        activityLogs.filter((l) => l.category === 'quiz' && l.scorePct !== undefined).reduce((acc, l) => acc + (l.scorePct || 0), 0) / totalQuizSessions
      )
    : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 px-2">
      
      {/* Header Card */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              Complete User Traceability
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-1 flex items-center gap-2">
              📋 Riwayat Aktivitas
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Catatan rekam jejak aktivitas belajar, sesi kuis, vocabulary review, dan pencapaian tanpa celah.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="bg-blue-50 text-blue-700 text-xs font-black px-3 py-2 rounded-2xl border border-blue-100 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-blue-600" /> {totalXp} Total XP
            </span>
          </div>
        </div>

        {/* Metrics Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-black">Total Sesi Kuis:</span>
            <p className="text-xl font-black text-slate-900">{totalQuizSessions} <span className="text-xs font-medium text-slate-500">sesi</span></p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-black">Total Sesi Review:</span>
            <p className="text-xl font-black text-slate-900">{totalReviewSessions} <span className="text-xs font-medium text-slate-500">sesi</span></p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-black">Rata-rata Skor Kuis:</span>
            <p className="text-xl font-black text-blue-600">{avgQuizScore}%</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-black">Total Activity Logs:</span>
            <p className="text-xl font-black text-purple-600">{activityLogs.length} <span className="text-xs font-medium text-slate-500">entri</span></p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari kata kunci riwayat aktivitas..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">Kategori: Semua</option>
              <option value="quiz">🎯 Kuis Adaptive</option>
              <option value="vocab_review">🔄 Vocab Review</option>
              <option value="review_exit">🚪 Pembatalan Review</option>
              <option value="rank_up">🏆 Kenaikan Rank</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Logs Stream */}
      <div className="space-y-3">
        {currentLogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
            Tidak ada riwayat aktivitas yang cocok dengan pencarian Anda.
          </div>
        ) : (
          currentLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            let icon = '📝';
            let catColor = 'bg-slate-100 text-slate-700 border-slate-200';

            if (log.category === 'quiz') {
              icon = '🎯';
              catColor = 'bg-blue-50 text-blue-700 border-blue-200';
            } else if (log.category === 'vocab_review') {
              icon = '🔄';
              catColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            } else if (log.category === 'review_exit') {
              icon = '🚪';
              catColor = 'bg-rose-50 text-rose-700 border-rose-200';
            } else if (log.category === 'rank_up') {
              icon = '🏆';
              catColor = 'bg-amber-50 text-amber-700 border-amber-200';
            }

            return (
              <div
                key={log.id}
                className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/90 shadow-2xs space-y-2.5 transition-all hover:border-purple-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-xl p-2 bg-slate-50 rounded-2xl border border-slate-100 shrink-0">
                      {icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${catColor}`}>
                          {log.category.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {log.formattedDate}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm md:text-base mt-1">
                        {log.title}
                      </h4>
                    </div>
                  </div>

                  {log.xpEarned !== undefined && log.xpEarned !== 0 && (
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full shrink-0 ${
                        log.xpEarned > 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {log.xpEarned > 0 ? `+${log.xpEarned} XP` : `${log.xpEarned} XP`}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed pl-1">
                  {log.description}
                </p>

                {/* Optional Expandable Details */}
                {log.details && (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {isExpanded ? 'Sembunyikan Rincian Kata' : 'Lihat Rincian Kata'}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-1.5 text-xs text-slate-700">
                        {log.details.wrongWords && log.details.wrongWords.length > 0 ? (
                          <div>
                            <span className="font-bold text-rose-700 block">Kata yang perlu dievaluasi ({log.details.wrongWords.length}):</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {log.details.wrongWords.map((w, idx) => (
                                <span key={idx} className="bg-white text-rose-800 px-2 py-0.5 rounded-lg border border-rose-200 text-[11px] font-bold">
                                  {w}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-emerald-700 font-bold">✅ Sempurna! Seluruh kata dijawab dengan benar.</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl p-3 border border-slate-200 text-xs font-bold text-slate-600">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-all"
          >
            Sebelumnya
          </button>

          <span>Halaman {currentPage} dari {totalPages}</span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-all"
          >
            Berikutnya
          </button>
        </div>
      )}

    </div>
  );
};
