import React, { useState } from 'react';
import { UserLearningSettings, PaceType } from '../types';
import { calculateCompletionDate } from '../utils/scheduler';
import { X, Settings, Target, Calendar, Save, Lock } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserLearningSettings;
  onSaveSettings: (newSettings: UserLearningSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) => {
  const [pace, setPace] = useState<PaceType>(settings.pace || 30);
  const startDate = settings.startDate || new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  const calculation = calculateCompletionDate(startDate, pace);

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      pace,
      startDate,
      targetExamDate: calculation.completionDate,
      locked: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold">Pengaturan Target Pace</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs md:text-sm text-slate-800">
          
          {/* Pace Option */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 block">
              Pilih Target Kata / Hari (Senin - Jumat):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[10, 20, 30].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPace(p as PaceType)}
                  className={`py-3 px-2 rounded-2xl border-2 font-bold text-center transition-all ${
                    pace === p
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-base block">{p}</span>
                  <span className="text-[10px] font-medium text-slate-500 block">kata/hari</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start Date (Locked & Readonly) */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" /> Tanggal Resmi Mulai Belajar:
              </span>
              <span className="bg-slate-200 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                Permanen
              </span>
            </div>
            <p className="text-sm font-black text-slate-900 pt-0.5">
              {new Date(startDate).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            <p className="text-[11px] text-slate-400 italic">
              * Tanggal mulai telah dikunci permanen saat pendaftaran awal dan tidak dapat diubah.
            </p>
          </div>

          {/* Calculated Output & Exclamation Note */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Estimasi Durasi Belajar:</span>
              <strong className="text-slate-900">{calculation.totalWeeks} Minggu ({calculation.totalStudyDays} Hari Kerja)</strong>
            </div>
            <div className="flex justify-between text-blue-700 font-bold text-sm pt-1 border-t border-blue-200/60">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-blue-600" /> Tanggal Lulus 3.655 Kata:
              </span>
              <span>{calculation.formattedCompletionDate}</span>
            </div>

            {/* EXCLAMATION NOTE FOR COMPLETION ESTIMATE */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 mt-2 flex items-start gap-2 text-xs text-amber-900">
              <span className="font-black text-amber-600 text-sm leading-none">!</span>
              <p className="text-[11px] leading-snug">
                <strong>Catatan:</strong> Jika Anda tidak belajar / absen 1 hari, estimasi tanggal lulus akan otomatis bergeser secara dinamis menyesuaikan porsi belajar Anda.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Simpan Perubahan Target
          </button>
        </div>

      </div>
    </div>
  );
};
