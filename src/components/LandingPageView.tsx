import React from 'react';
import { Target, Sparkles, BookOpen, Layers, Trophy, CheckCircle, ShieldCheck, ArrowRight, Star, Flame, Zap, Award } from 'lucide-react';

interface LandingPageViewProps {
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onOpenRegister, onOpenLogin }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-500 selection:text-white">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-900/50 via-slate-900 to-slate-950 pt-12 pb-20 px-4">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-60 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs md:text-sm font-extrabold px-4 py-1.5 rounded-full shadow-inner">
            <Sparkles className="w-4 h-4 text-blue-400" /> Platform Akademis PTE & IELTS Terpresisi #1
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight md:leading-none">
            Kuasai <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">3.655 Kata Akademis</span> dengan Presisi Tinggi
          </h1>

          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Metode ilmiah <strong>Spaced Repetition (5+1+1)</strong>, <strong>9 Tenses Engine Terpresisi</strong> (Fonetik, Pasif Voice, & Afiksasi), serta <strong>Card Board 5 Jenis Quiz Akademis</strong>.
          </p>

          {/* Call-To-Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              type="button"
              onClick={onOpenRegister}
              className="w-full sm:w-auto flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-blue-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 text-base"
            >
              🚀 Mulai Belajar Gratis (Daftar)
            </button>

            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-4 px-7 rounded-2xl active:scale-98 transition-all flex items-center justify-center gap-2 text-base"
            >
              Sudah Punya Akun? (Masuk)
            </button>
          </div>

          {/* Quick Badges Bar */}
          <div className="pt-8 flex flex-wrap justify-center gap-4 text-xs text-slate-400 font-bold">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              ✅ 3.655 Kata Master (AWL, NGSL, Oxford 10th)
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              ⚡ 9 Tenses Engine & Fonetik
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              🔒 100% Data Personal & Privacy Sealed
            </span>
          </div>
        </div>
      </div>

      {/* Feature Showcase Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
        
        {/* Section Title */}
        <div className="text-center space-y-2">
          <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Sistem Belajar Komprehensif</span>
          <h2 className="text-2xl md:text-4xl font-black text-white">5 Pilar Keunggulan Lumina Learn</h2>
        </div>

        {/* 5 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pillar 1: Spaced Repetition 5+1+1 */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-3 hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center font-black text-xl">
              🎯
            </div>
            <h3 className="text-xl font-bold text-white">Metode 5+1+1 Spaced Repetition</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              5 hari belajar kata baru (Senin-Jumat), 1 hari Diagnostic Review (Sabtu), dan 1 hari Rest Day (Minggu) untuk konsolidasi memori jangka panjang tanpa penumpukan beban.
            </p>
          </div>

          {/* Pillar 2: 9 Tenses Engine */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-3 hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center font-black text-xl">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-white">Hyper-Accurate 9 Tenses Engine</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Rumus super presisi color-coded (+ Biru, - Merah, ? Hijau), sensitivitas fonetik vokal/konsonan (a/an), aturan pasif voice transitif/intransitif, serta analisis afiksasi (prefix/suffix).
            </p>
          </div>

          {/* Pillar 3: Card Board 5 Jenis Quiz */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-3 hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center font-black text-xl">
              🎮
            </div>
            <h3 className="text-xl font-bold text-white">Card Board 5 Jenis Quiz (Level 1-5)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Kuis berjenjang dari Multiple Choice (Level 1), Matching Pairs (Level 2), Synonym & Antonym (Level 3), PTE Fill-in-Blank (Level 4), hingga Active Recall Spelling (Level 5).
            </p>
          </div>

          {/* Pillar 4: Gamifikasi Title Ranks & Badges */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-3 hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center font-black text-xl">
              🏆
            </div>
            <h3 className="text-xl font-bold text-white">10 Gelar Rank & 12 Badges</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dapatkan XP dari setiap kuis dan naik gelar dari <em>Novice Explorer</em> (0 XP) hingga puncak tertinggi <em>PTE 90 Perfect Grandmaster</em> (100.000+ XP).
            </p>
          </div>

          {/* Pillar 5: Master Dataset 3.655 Kata */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-3 hover:border-blue-500/50 transition-all col-span-1 md:col-span-2">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center font-black text-xl">
              📖
            </div>
            <h3 className="text-xl font-bold text-white">Database 3.655 Kata Akademis LENGKAP</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Terdiri dari 245 kata Academic Word List (AWL), 1.475 kata General Service List (NGSL), 1.698 kata Oxford 10th Vocabulary, dan 237 Appendix Teknis lengkap dengan IPA, arti, kolokasi, dan contoh kalimat baku.
            </p>
          </div>

        </div>

        {/* Gamification Preview Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 rounded-[36px] p-8 border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="bg-amber-400/20 text-amber-300 text-xs font-black px-3 py-1 rounded-full uppercase border border-amber-400/30">
              Gamified Learning System
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-white">Uji Kemampuanmu & Raih Gelar Grandmaster!</h3>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl">
              Setiap aktivitas kuis dan hafalan akan memberikan XP. Kumpulkan XP untuk membuka 12 Achievement Badges langka dan gelar kehormatan akademis.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenRegister}
            className="bg-white text-slate-900 hover:bg-slate-100 font-black py-4 px-8 rounded-2xl shadow-lg active:scale-95 transition-all text-sm shrink-0"
          >
            🎯 Buat Akun & Mulai Sekarang
          </button>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 text-center py-6 text-xs text-slate-500">
        Standard: Pearson PTE Academic & Cambridge English Grammar Guidelines • Lumina Learn System
      </footer>

    </div>
  );
};
