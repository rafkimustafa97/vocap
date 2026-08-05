import React from 'react';
import { Database, Settings, Flame, Trophy, Award, LogOut, LogIn, UserPlus, FileText, History, RotateCcw } from 'lucide-react';
import { UserProfile } from '../types';
import { getTitleRank } from '../utils/userStore';

interface NavbarProps {
  user: UserProfile | null;
  xp: number;
  streak: number;
  isAuthenticated: boolean;
  onOpenSqlModal: () => void;
  onOpenSettings: () => void;
  onOpenAchievements: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
  activeView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  xp,
  streak,
  isAuthenticated,
  onOpenSqlModal,
  onOpenSettings,
  onOpenAchievements,
  onOpenLogin,
  onOpenRegister,
  onLogout,
  activeView,
  onNavigate
}) => {
  const titleRank = getTitleRank(xp);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3 shadow-2xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
          className="flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all shrink-0">
            <span className="text-white font-black text-xl italic">L</span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-blue-900 italic leading-none">
              Lumina <span className="text-blue-600 not-italic">Learn</span>
            </h1>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">
              PTE Academic Vocabulary
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links (ONLY IF AUTHENTICATED) */}
        {isAuthenticated && (
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 text-xs font-bold text-slate-700">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeView === 'dashboard' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => onNavigate('learn')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeView === 'learn' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              Flashcard
            </button>
            <button
              type="button"
              onClick={() => onNavigate('quiz')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeView === 'quiz' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              Adaptive Quiz
            </button>
            <button
              type="button"
              onClick={() => onNavigate('saturday_review')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeView === 'saturday_review' ? 'bg-white text-orange-600 shadow-2xs font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              Vocabulary Review
            </button>
            <button
              type="button"
              onClick={() => onNavigate('library')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeView === 'library' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              Kamus 3.655 Kata
            </button>
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeView === 'history' ? 'bg-white text-purple-600 shadow-2xs font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              Riwayat Activity
            </button>
          </nav>
        )}

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {isAuthenticated && user ? (
            <>
              {/* Title Rank Badge & XP */}
              <button
                type="button"
                onClick={onOpenAchievements}
                className="hidden sm:flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-2xl border border-slate-200 text-xs transition-all"
                title="Lihat Galeri Gelar & Achievement"
              >
                <span className="text-base">{titleRank.icon}</span>
                <div className="text-left">
                  <span className="font-extrabold text-slate-800 text-[11px] block leading-none">{titleRank.title}</span>
                  <span className="text-[10px] text-blue-600 font-bold leading-none">{xp} XP</span>
                </div>
              </button>

              {/* Streak */}
              <div className="hidden md:flex flex-col items-end shrink-0">
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Daily Streak</span>
                <span className="text-xs font-black text-orange-600 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" /> {streak} Days
                </span>
              </div>

              {/* Action Buttons */}
              <button
                type="button"
                onClick={onOpenAchievements}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-all sm:hidden"
                title="Achievements"
              >
                <Trophy className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onOpenSqlModal}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all"
                title="Lihat DDL Supabase SQL"
              >
                <Database className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onOpenSettings}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all"
                title="Pengaturan Target & Pace"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Keluar (Logout)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            /* Unauthenticated Header Buttons */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" /> Masuk
              </button>
              <button
                type="button"
                onClick={onOpenRegister}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" /> Daftar Gratis
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
