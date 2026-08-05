import React from 'react';
import { TITLE_RANKS, SYSTEM_BADGES, getTitleRank } from '../utils/userStore';
import { X, Trophy, Award, Star, Flame, CheckCircle2, Lock, Sparkles } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  xp: number;
  unlockedBadgeIds: string[];
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  xp,
  unlockedBadgeIds
}) => {
  if (!isOpen) return null;

  const currentRank = getTitleRank(xp);
  const nextRank = TITLE_RANKS.find((r) => r.level === currentRank.level + 1);

  let progressPct = 100;
  if (nextRank) {
    const totalDiff = nextRank.minXp - currentRank.minXp;
    const currentDiff = xp - currentRank.minXp;
    progressPct = Math.min(100, Math.max(0, Math.round((currentDiff / totalDiff) * 100)));
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 md:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 p-6 text-white flex items-start justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider mb-2">
              <Trophy className="w-3.5 h-3.5 text-amber-300" /> System Gamifikasi Akademis
            </div>

            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentRank.icon}</span>
              <div>
                <span className="text-xs text-indigo-200 font-bold uppercase tracking-widest block">Gelar Aktif (Level {currentRank.level}):</span>
                <h2 className="text-2xl font-black text-amber-300">{currentRank.title}</h2>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50 text-xs md:text-sm text-slate-800">
          
          {/* XP Progress Bar Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Total Akumulasi XP: <strong className="text-blue-600 text-sm">{xp} XP</strong></span>
              {nextRank ? (
                <span className="text-slate-500 font-medium">Target Level {nextRank.level} ({nextRank.title}): <strong>{nextRank.minXp} XP</strong></span>
              ) : (
                <span className="text-amber-600 font-black">MAX LEVEL REACHED! 🎉</span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              {currentRank.description}
            </p>
          </div>

          {/* 10 Title Ranks Tier List */}
          <div className="space-y-3">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-600" /> 10 Tingkat Gelar Kehormatan (Title Ranks)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TITLE_RANKS.map((rank) => {
                const isCurrent = rank.level === currentRank.level;
                const isUnlocked = xp >= rank.minXp;

                return (
                  <div
                    key={rank.level}
                    className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-400 ring-2 ring-amber-400/30 shadow-sm'
                        : isUnlocked
                        ? 'bg-white border-slate-200 text-slate-800'
                        : 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-60'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{rank.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs truncate">{rank.title}</span>
                        {isCurrent && (
                          <span className="text-[9px] bg-amber-500 text-white font-black px-1.5 py-0.5 rounded uppercase">Aktif</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{rank.minXp} - {rank.maxXp === 999999 ? '∞' : rank.maxXp} XP</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 12 Achievement Badges Gallery */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500" /> 12 Piala Pencapaian (Achievement Badges)
              </h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2.5 py-0.5 rounded-full">
                {unlockedBadgeIds.length} / {SYSTEM_BADGES.length} Terbuka
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SYSTEM_BADGES.map((badge) => {
                const isUnlocked = unlockedBadgeIds.includes(badge.id);

                return (
                  <div
                    key={badge.id}
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                      isUnlocked
                        ? 'bg-white border-emerald-300 shadow-xs ring-1 ring-emerald-400/20'
                        : 'bg-slate-100/60 border-slate-200 opacity-55'
                    }`}
                  >
                    <span className="text-3xl shrink-0 p-1 bg-slate-50 rounded-xl border border-slate-200">{badge.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-xs text-slate-900">{badge.title}</h4>
                        {isUnlocked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug mt-1">{badge.description}</p>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1.5 border border-blue-100">
                        +{badge.xpReward} XP Reward
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
