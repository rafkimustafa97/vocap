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
              📋 Riwayat Activity & Audit Trail
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
            <span className="text-[10px] text-slate-400 uppercase font-black">Total Jejak Log:</span>
            <p className="text-xl font-black text-purple-600">{activityLogs.length} <span className="text-xs font-medium text-slate-500">entry</span></p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Cari log riwayat berdasarkan kata kunci..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Kategori Log</option>
            <option value="quiz">Sesi Kuis Saja</option>
            <option value="vocab_review">Sesi Vocab Review Saja</option>
            <option value="badge_unlock">Pencapaian Badges</option>
            <option value="rank_up">Kenaikan Level Title</option>
          </select>
        </div>

        {/* Activity Logs Stream List */}
        {currentLogs.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-8 text-center text-xs text-slate-500 font-medium border border-slate-200">
            📋 Belum ada riwayat aktivitas yang tercatat. Selesaikan kuis atau Vocabulary Review pertama Anda!
          </div>
        ) : (
          <div className="space-y-3">
            {currentLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;

              let catIcon = '🎯';
              let badgeBg = 'bg-blue-100 text-blue-800 border-blue-200';
              if (log.category === 'vocab_review') {
                catIcon = '🔄';
                badgeBg = 'bg-orange-100 text-orange-800 border-orange-200';
              } else if (log.category === 'badge_unlock') {
                catIcon = '🏆';
                badgeBg = 'bg-purple-100 text-purple-800 border-purple-200';
              } else if (log.category === 'rank_up') {
                catIcon = '👑';
                badgeBg = 'bg-amber-100 text-amber-900 border-amber-300';
              }

              return (
                <div
                  key={log.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2 transition-all hover:border-slate-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 bg-slate-50 rounded-xl border border-slate-200 shrink-0">{catIcon}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-xs md:text-sm">{log.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                            {log.category.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{log.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs font-black text-blue-600 block">+{log.xpEarned} XP</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{log.formattedDate}</span>
                      </div>

                      {log.details && (log.details.wrongWords || log.details.mode) && (
                        <button
                          type="button"
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all text-xs flex items-center gap-1 font-bold"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* EXPANDABLE LOG DETAILS */}
                  {isExpanded && log.details && (
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs animate-in fade-in duration-150 mt-2">
                      <div className="flex flex-wrap gap-4 text-slate-700">
                        {log.details.totalCount !== undefined && (
                          <span>Total Soal: <strong>{log.details.totalCount}</strong></span>
                        )}
                        {log.details.correctCount !== undefined && (
                          <span>Benar: <strong className="text-emerald-600">{log.details.correctCount}</strong></span>
                        )}
                        {log.scorePct !== undefined && (
                          <span>Akurasi: <strong className="text-blue-600">{log.scorePct}%</strong></span>
                        )}
                      </div>

                      {log.details.wrongWords && log.details.wrongWords.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-slate-200">
                          <span className="text-[11px] font-bold text-rose-700 block">Kata Terlewat / Salah ({log.details.wrongWords.length}):</span>
                          <div className="flex flex-wrap gap-1.5">
                            {log.details.wrongWords.map((w, idx) => (
                              <span key={idx} className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                {w}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-bold rounded-xl transition-all"
            >
              ← Sebelumnya
            </button>

            <span className="font-bold text-slate-600">
              Halaman {currentPage} dari {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-bold rounded-xl transition-all"
            >
              Selanjutnya →
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
