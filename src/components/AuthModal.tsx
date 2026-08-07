import React, { useState } from 'react';
import { X, User, Mail, Lock, LogIn, UserPlus, ShieldCheck, Sparkles } from 'lucide-react';
import { signInWithGoogle } from '../utils/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onAuthSuccess: (email: string, name?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'register',
  onClose,
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    try {
      setError('');
      setIsGoogleLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Gagal melanjutkan dengan Google OAuth.');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Masukkan alamat email yang valid.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Masukkan nama lengkap Anda.');
      return;
    }

    if (!password || password.length < 4) {
      setError('Password minimal 4 karakter.');
      return;
    }

    // Auth success callback
    onAuthSuccess(cleanEmail, name.trim() || cleanEmail.split('@')[0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase mb-1">
              <Sparkles className="w-3 h-3" /> Lumina Account System
            </div>
            <h2 className="text-xl font-black">
              {mode === 'login' ? 'Masuk ke Akun Saya' : 'Daftar Akun Baru'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6 space-y-4 text-xs md:text-sm text-slate-800">
          
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-bold">
              ⚠️ {error}
            </div>
          )}

          {/* 1-CLICK GOOGLE OAUTH LOGIN BUTTON */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isGoogleLoading}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 font-bold py-3.5 px-4 rounded-2xl shadow-sm active:scale-98 transition-all flex items-center justify-center gap-3 text-xs md:text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            {isGoogleLoading ? 'Menghubungkan ke Google...' : 'Lanjutkan dengan Google (Gmail)'}
          </button>

          {/* DIVIDER */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] text-slate-400 font-bold uppercase shrink-0">
              atau dengan Email
            </span>
            <div className="border-t border-slate-200 w-full"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Nama Lengkap:</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Alex Wijaya"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Alamat Email:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="nama@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Password:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 flex items-start gap-2 text-xs text-blue-900 mt-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-snug">
                <strong>Privasi Terjamin:</strong> Data akun, XP, streak, dan progres hafalan Anda disimpan secara pribadi dan terisolasi per akun.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-500/30 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm mt-4"
            >
              {mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" /> Masuk ke Akun
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Buat Akun Baru
                </>
              )}
            </button>
          </form>

          {/* Toggle Register/Login Mode */}
          <div className="text-center pt-2 border-t border-slate-100">
            {mode === 'login' ? (
              <p className="text-xs text-slate-600">
                Belum memiliki akun?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  className="font-black text-blue-600 hover:underline"
                >
                  Daftar Akun Baru
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-600">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="font-black text-blue-600 hover:underline"
                >
                  Masuk di Sini
                </button>
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
