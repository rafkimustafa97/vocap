import React from 'react';
import { Target, Sparkles, BookOpen, Layers, Trophy, CheckCircle, ShieldCheck, ArrowRight, Star, Flame, Zap, Award } from 'lucide-react';
import { signInWithGoogle } from '../utils/supabaseClient';

interface LandingPageViewProps {
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onOpenRegister, onOpenLogin }) => {
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (e: any) {
      console.error('Google login error:', e);
      onOpenLogin();
    }
  };

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

          {/* SINGLE 1-CLICK GOOGLE LOGIN CALL-TO-ACTION */}
          <div className="pt-4 flex flex-col items-center justify-center max-w-md mx-auto w-full">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-black py-4 px-8 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-3 text-base md:text-lg border-2 border-slate-200"
            >
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              🚀 Masuk / Daftar 1-Click dengan Google
            </button>
            <span className="text-xs text-slate-400 font-semibold mt-2">
              Langsung masuk menggunakan akun Gmail Anda tanpa ketik password.
            </span>
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
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center font-black text-xl">
              📋
            </div>
            <h3 className="text-xl font-bold text-white">Card Board 5 Quiz Master</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              5 variasi ujian otomatis: Multi-Choice Arti, Tebak Bahasa Inggris, Audio Pronunciation, Word Family Tree, & Context Sentence Fill-in.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
