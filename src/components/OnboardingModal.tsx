import React, { useState } from 'react';
import { UserLearningSettings, PaceType } from '../types';
import { calculateCompletionDate } from '../utils/scheduler';
import { Target, Calendar, Sparkles, AlertCircle, CheckCircle, ShieldCheck, Info } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onConfirm: (settings: UserLearningSettings) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onConfirm }) => {
  const isSaturday = new Date().getDay() === 6;

  // Generate valid starting date options (Today up to 3 days ahead)
  const availableDates = [0, 1, 2, 3].map((daysAhead) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const dateStr = d.toISOString().split('T')[0];
    const formatted = d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    let label = formatted;
    if (daysAhead === 0) label = `Hari Ini (${formatted})`;
    else if (daysAhead === 1) label = `Besok (${formatted})`;
    else if (daysAhead === 2) label = `Lusa (${formatted})`;
    else label = `+3 Hari (${formatted})`;

    return { dateStr, label };
  });

  const [selectedPace, setSelectedPace] = useState<PaceType>(30);
  const [startDate, setStartDate] = useState<string>(availableDates[0].dateStr);
  const [sabtuChoice, setSabtuChoice] = useState<'diagnostic' | 'next_monday' | null>(
    isSaturday ? 'diagnostic' : null
  );

  if (!isOpen) return null;

  const calculation = calculateCompletionDate(startDate, selectedPace);

  const handleStart = () => {
    onConfirm({
      pace: selectedPace,
      startDate: startDate,
      locked: true,
      targetExamDate: calculation.completionDate,
      sabtuOption: sabtuChoice
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 p-6 md:p-8 animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl mb-3 shadow-inner">
            <Target className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Setup Target Hafalan PTE</h2>
          <p className="text-sm text-slate-500 mt-1">
            Panduan Spaced Repetition: 5 hari belajar kata baru (Senin-Jumat), 1 hari Deep Review (Sabtu), dan 1 hari Istirahat (Minggu).
          </p>
        </div>

        {/* Saturday Notice Card if today is Saturday */}
        {isSaturday && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">Registrasi Hari Sabtu Detected!</h4>
                <p className="text-xs text-amber-700 mt-1">
                  Hari Sabtu di Lumina Learn adalah Hari Review. Pilih rencana pertama Anda:
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setSabtuChoice('diagnostic')}
                    className={`p-3 rounded-xl text-left border text-xs font-medium transition-all ${
                      sabtuChoice === 'diagnostic'
                        ? 'bg-amber-100 border-amber-500 text-amber-900 ring-2 ring-amber-400'
                        : 'bg-white border-amber-200 text-slate-700'
                    }`}
                  >
                    <strong>Opsi A:</strong> Mainkan Quiz Diagnostic Test untuk menguji kemampuan awal hari ini.
                  </button>
                  <button
                    type="button"
                    onClick={() => setSabtuChoice('next_monday')}
                    className={`p-3 rounded-xl text-left border text-xs font-medium transition-all ${
                      sabtuChoice === 'next_monday'
                        ? 'bg-amber-100 border-amber-500 text-amber-900 ring-2 ring-amber-400'
                        : 'bg-white border-amber-200 text-slate-700'
                    }`}
                  >
                    <strong>Opsi B:</strong> Jadwalkan Mulai Belajar Resmi pada Hari Senin Depan.
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pace Selection */}
        <div className="space-y-4 mb-6">
          <label className="block text-sm font-bold text-slate-800">
            Pilih Kecepatan Belajar Harian (Senin - Jumat):
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Pace 10 */}
            <button
              type="button"
              onClick={() => setSelectedPace(10)}
              className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                selectedPace === 10
                  ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">Santai</span>
                {selectedPace === 10 && <CheckCircle className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-xl font-black text-slate-900 mt-2">10 <span className="text-xs font-medium text-slate-500">kata/hari</span></p>
              <p className="text-xs text-slate-600 mt-1 font-medium">50 kata/minggu</p>
              <p className="text-[11px] text-blue-600 font-semibold mt-2">~18 Bulan (74 Mgg)</p>
            </button>

            {/* Pace 20 */}
            <button
              type="button"
              onClick={() => setSelectedPace(20)}
              className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                selectedPace === 20
                  ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">Sedang</span>
                {selectedPace === 20 && <CheckCircle className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-xl font-black text-slate-900 mt-2">20 <span className="text-xs font-medium text-slate-500">kata/hari</span></p>
              <p className="text-xs text-slate-600 mt-1 font-medium">100 kata/minggu</p>
              <p className="text-[11px] text-blue-600 font-semibold mt-2">~8,5 Bulan (37 Mgg)</p>
            </button>

            {/* Pace 30 - Recommended */}
            <button
              type="button"
              onClick={() => setSelectedPace(30)}
              className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                selectedPace === 30
                  ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Recommended
                </span>
                {selectedPace === 30 && <CheckCircle className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-xl font-black text-slate-900 mt-2">30 <span className="text-xs font-medium text-slate-500">kata/hari</span></p>
              <p className="text-xs text-slate-600 mt-1 font-medium">150 kata/minggu</p>
              <p className="text-[11px] text-blue-600 font-semibold mt-2">~5 Bulan (25 Mgg)</p>
            </button>
          </div>
        </div>

        {/* Start Date Selection (Allowed: Today up to 3 days ahead) */}
        <div className="space-y-2 mb-6">
          <label className="block text-sm font-bold text-slate-800">
            Tanggal Resmi Mulai Belajar (Pilih Hari Ini s/d 3 Hari ke Depan):
          </label>
          <select
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs md:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {availableDates.map((item) => (
              <option key={item.dateStr} value={item.dateStr}>
                {item.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 italic">
            * Tanggal tidak dapat dimundurkan dan hanya dapat dipilih 1x saat awal pendaftaran ini.
          </p>
        </div>

        {/* Calculated Summary Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Estimasi Durasi Belajar:</span>
            <span className="font-bold text-slate-900">{calculation.totalWeeks} Minggu ({calculation.totalStudyDays} Hari Kerja)</span>
          </div>
          <div className="flex items-center justify-between text-sm font-bold text-blue-700 pt-1 border-t border-slate-200">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-blue-600" /> Target Lulus 3.655 Kata:
            </span>
            <span className="text-base font-black text-blue-700">{calculation.formattedCompletionDate}</span>
          </div>

          {/* EXCLAMATION NOTE FOR COMPLETION ESTIMATE */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 mt-2 flex items-start gap-2 text-xs text-amber-900">
            <span className="font-black text-amber-600 text-sm leading-none">!</span>
            <p className="text-[11px] leading-snug">
              <strong>Catatan:</strong> Jika Anda tidak belajar / absen 1 hari, estimasi tanggal lulus akan otomatis bergeser secara dinamis menyesuaikan porsi belajar Anda.
            </p>
          </div>
        </div>

        {/* Lock & Start Button */}
        <button
          type="button"
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/30 active:scale-98 transition-all flex items-center justify-center gap-2 text-base"
        >
          <ShieldCheck className="w-5 h-5" /> 🚀 Mulai Belajar Sekarang
        </button>

        <p className="text-center text-[11px] text-slate-400 mt-3 italic">
          Tanggal mulai resmi akan dikunci secara permanen setelah dikonfirmasi.
        </p>

      </div>
    </div>
  );
};
