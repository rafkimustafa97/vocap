import React, { useState } from 'react';
import { Word } from '../types';
import { generateSmartTenses } from '../utils/tensesGenerator';
import { speakText } from '../utils/speech';
import { X, Volume2, Sparkles, BookOpen, Layers, ShieldCheck, AlertCircle, Info, CheckCircle, Code, ChevronDown, ChevronUp } from 'lucide-react';

interface TensesModalProps {
  word: Word | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TensesModal: React.FC<TensesModalProps> = ({ word, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'dasar' | 'tambahan'>('dasar');
  const [isDetailsExpanded, setIsDetailsExpanded] = useState<boolean>(false);

  if (!isOpen || !word) return null;

  const matrixData = generateSmartTenses(word);
  const filteredTenses = matrixData.tensesMatrix.filter((t) => t.category === activeTab);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-5 text-white flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                HYPER-ACCURATE 9 TENSES ENGINE
              </span>
              <span className="bg-indigo-300/30 text-indigo-100 text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase">
                {word.source || 'Vocab'}
              </span>
              <span className="bg-emerald-400/20 text-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-300/30">
                PTE & IELTS Register
              </span>
            </div>

            <h2 className="text-2xl font-black mt-1.5 flex items-center gap-2">
              {word.word}
              <button
                type="button"
                onClick={() => speakText(word.word)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors text-blue-100 hover:text-white"
                title="Dengarkan pengucapan"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </h2>

            <p className="text-xs text-blue-100 mt-0.5 italic">
              IPA: {word.ipa} ({word.ipa_perkiraan}) — {word.meaning_id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Verb Inflection & Compact Header Bar */}
        <div className="bg-slate-900 text-slate-200 px-5 py-3 border-b border-slate-800 shrink-0 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono text-[11px] flex-wrap">
              <span className="text-slate-400 uppercase font-bold">Verb Inflections:</span>
              <span className="bg-slate-800 text-blue-300 px-2 py-0.5 rounded border border-slate-700 font-bold">V1: {matrixData.inflections.v1}</span>
              <span className="bg-slate-800 text-blue-300 px-2 py-0.5 rounded border border-slate-700 font-bold">V1(+s): {matrixData.inflections.v1Singular}</span>
              <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700 font-bold">V2: {matrixData.inflections.v2}</span>
              <span className="bg-slate-800 text-emerald-300 px-2 py-0.5 rounded border border-slate-700 font-bold">V3: {matrixData.inflections.v3}</span>
              <span className="bg-slate-800 text-purple-300 px-2 py-0.5 rounded border border-slate-700 font-bold">V-ing: {matrixData.inflections.vIng}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                matrixData.transitivity === 'Transitive'
                  ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
                  : 'bg-amber-900/60 text-amber-300 border-amber-700'
              }`}>
                {matrixData.transitivity} Verb
              </span>

              {/* COLLAPSE / EXPAND TOGGLE BUTTON */}
              <button
                type="button"
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className="bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 text-[11px] font-bold px-3 py-1 rounded-lg border border-indigo-700 flex items-center gap-1 transition-all"
              >
                {isDetailsExpanded ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" /> Sembunyikan Detail
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" /> Detail Linguistik & Afiksasi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* COLLAPSIBLE LINGUISTIC & AFFIXES PANEL */}
        {isDetailsExpanded && (
          <div className="bg-slate-100 p-4 border-b border-slate-200 shrink-0 space-y-2.5 text-xs animate-in slide-in-from-top duration-200">
            {/* Row 1: Phonetics & Passive Sensitivity Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Phonetic Box */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                  <Volume2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Sensitivitas Bunyi & Vokal/Konsonan:</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {matrixData.phoneticSensitivity.ruleNote}
                </p>
              </div>

              {/* Passive Voice Sensitivity Box */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Sensitivitas Kalimat Pasif (Voice):</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {matrixData.passiveSensitivity.explanation}
                </p>
              </div>
            </div>

            {/* Row 2: Prefix, Suffix & Word Family Analysis */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                <Code className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Analisis Afiksasi (Prefix & Suffix) & Word Family:</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-indigo-50/60 p-2 rounded-lg border border-indigo-100">
                  <span className="text-indigo-600 font-bold block">Awalan (Prefix):</span>
                  <span className="font-black text-indigo-900">{matrixData.affixAnalysis.prefix}</span>
                  <p className="text-[10px] text-indigo-700/80 leading-tight mt-0.5">{matrixData.affixAnalysis.prefixMeaning}</p>
                </div>

                <div className="bg-purple-50/60 p-2 rounded-lg border border-purple-100">
                  <span className="text-purple-600 font-bold block">Akhiran (Suffix):</span>
                  <span className="font-black text-purple-900">{matrixData.affixAnalysis.suffix}</span>
                  <p className="text-[10px] text-purple-700/80 leading-tight mt-0.5">{matrixData.affixAnalysis.suffixFunction}</p>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 col-span-2">
                  <span className="text-slate-600 font-bold block">Word Family Derivations:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1 font-mono text-[10px]">
                    <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">Noun: {matrixData.affixAnalysis.wordFamily.noun}</span>
                    <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">Verb: {matrixData.affixAnalysis.wordFamily.verb}</span>
                    <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">Adj: {matrixData.affixAnalysis.wordFamily.adjective}</span>
                    <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">Adv: {matrixData.affixAnalysis.wordFamily.adverb}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('dasar')}
            className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'dasar'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" /> 5 TENSES DASAR (Fondasi Utama)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tambahan')}
            className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'tambahan'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" /> 4 TENSES TAMBAHAN (Tingkat Lanjut)
          </button>
        </div>

        {/* Content List Scrollable */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {filteredTenses.map((tense) => (
            <div key={tense.id} className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
              
              {/* Tense Header & Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-slate-900 text-base md:text-lg flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-black">
                      {tense.id}
                    </span>
                    {tense.tenseName}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {tense.usageContext}
                  </p>
                </div>

                <div className="shrink-0 text-left sm:text-right">
                  <span className="text-[11px] bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-mono font-bold block sm:inline-block border border-slate-200">
                    ⏱️ {tense.timeSignal}
                  </span>
                </div>
              </div>

              {/* RAPI & TERSTRUKTUR: TO BE / AUXILIARY EXPLANATION BOX */}
              <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 text-xs space-y-2.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-900 border-b border-amber-200/60 pb-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider">Aturan Auxiliary Verb & To Be</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {/* Auxiliary Badge Box */}
                  <div className="bg-white/90 p-3 rounded-xl border border-amber-200/80 flex flex-col justify-between shadow-2xs">
                    <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">Kata Kerja Bantu (Auxiliary):</span>
                    <p className="text-xs font-bold text-slate-900 mt-1 leading-snug">
                      {tense.toBeStructure.auxiliaryText}
                    </p>
                  </div>

                  {/* To Be Badge Box */}
                  <div className="bg-white/90 p-3 rounded-xl border border-amber-200/80 flex flex-col justify-between shadow-2xs">
                    <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">Kata Kerja Be / Pasif:</span>
                    <p className="text-xs font-bold text-slate-900 mt-1 leading-snug">
                      {tense.toBeStructure.toBeText}
                    </p>
                  </div>
                </div>

                {tense.toBeStructure.passiveNote && (
                  <p className="text-[11px] text-amber-950 font-medium pt-1 flex items-center gap-1">
                    <span>💡</span> {tense.toBeStructure.passiveNote}
                  </p>
                )}
              </div>

              {/* ACTIVE VOICE SECTION */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-blue-600" /> Kalimat Aktif (Active Voice)
                  </span>
                  <button
                    type="button"
                    onClick={() => speakText(tense.activeVoice.positive.sentence)}
                    className="p-1.5 hover:bg-blue-100 text-blue-700 rounded-xl text-xs flex items-center gap-1 font-bold bg-blue-50 border border-blue-200 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Dengarkan
                  </button>
                </div>

                {/* ACTIVE (+) POSITIVE - BLUE */}
                <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-3.5 space-y-1.5">
                  <div>
                    <span className="bg-blue-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-md inline-block shadow-2xs">
                      {tense.activeVoice.positive.formula}
                    </span>
                  </div>
                  <p className="text-blue-950 font-mono font-bold text-sm md:text-base">
                    {tense.activeVoice.positive.sentence}
                  </p>
                  {tense.activeVoice.positive.meaning && (
                    <p className="text-blue-700/80 text-xs italic">
                      🇮🇩 Arti: "{tense.activeVoice.positive.meaning}"
                    </p>
                  )}
                </div>

                {/* ACTIVE (-) NEGATIVE - RED */}
                <div className="bg-rose-50/90 border border-rose-200 rounded-xl p-3.5 space-y-1.5">
                  <div>
                    <span className="bg-rose-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-md inline-block shadow-2xs">
                      {tense.activeVoice.negative.formula}
                    </span>
                  </div>
                  <p className="text-rose-950 font-mono font-bold text-sm md:text-base">
                    {tense.activeVoice.negative.sentence}
                  </p>
                </div>

                {/* ACTIVE (?) INTERROGATIVE - GREEN */}
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3.5 space-y-1.5">
                  <div>
                    <span className="bg-emerald-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-md inline-block shadow-2xs">
                      {tense.activeVoice.interrogative.formula}
                    </span>
                  </div>
                  <p className="text-emerald-950 font-mono font-bold text-sm md:text-base">
                    {tense.activeVoice.interrogative.sentence}
                  </p>
                </div>
              </div>

              {/* PASSIVE VOICE SECTION */}
              {tense.passiveVoice.isApplicable && tense.passiveVoice.positive ? (
                <div className="space-y-3 pt-3 border-t border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" /> Kalimat Pasif (Passive Voice)
                    </span>
                    <button
                      type="button"
                      onClick={() => speakText(tense.passiveVoice.positive!.sentence)}
                      className="p-1.5 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs flex items-center gap-1 font-bold bg-indigo-50 border border-indigo-200 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Dengarkan
                    </button>
                  </div>

                  {/* PASSIVE (+) POSITIVE - BLUE */}
                  <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-3.5 space-y-1.5">
                    <div>
                      <span className="bg-blue-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-md inline-block shadow-2xs">
                        {tense.passiveVoice.positive.formula}
                      </span>
                    </div>
                    <p className="text-blue-950 font-mono font-bold text-sm md:text-base">
                      {tense.passiveVoice.positive.sentence}
                    </p>
                    {tense.passiveVoice.positive.meaning && (
                      <p className="text-blue-700/80 text-xs italic">
                        🇮🇩 Arti: "{tense.passiveVoice.positive.meaning}"
                      </p>
                    )}
                  </div>

                  {/* PASSIVE (-) NEGATIVE - RED */}
                  {tense.passiveVoice.negative && (
                    <div className="bg-rose-50/90 border border-rose-200 rounded-xl p-3.5 space-y-1.5">
                      <div>
                        <span className="bg-rose-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-md inline-block shadow-2xs">
                          {tense.passiveVoice.negative.formula}
                        </span>
                      </div>
                      <p className="text-rose-950 font-mono font-bold text-sm md:text-base">
                        {tense.passiveVoice.negative.sentence}
                      </p>
                    </div>
                  )}

                  {/* PASSIVE (?) INTERROGATIVE - GREEN */}
                  {tense.passiveVoice.interrogative && (
                    <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3.5 space-y-1.5">
                      <div>
                        <span className="bg-emerald-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-md inline-block shadow-2xs">
                          {tense.passiveVoice.interrogative.formula}
                        </span>
                      </div>
                      <p className="text-emerald-950 font-mono font-bold text-sm md:text-base">
                        {tense.passiveVoice.interrogative.sentence}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {tense.passiveVoice.note || 'N/A (Intransitive Verb - Tidak Memiliki Bentuk Pasif dalam Bahasa Inggris)'}
                  </span>
                </div>
              )}

            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex justify-between items-center shrink-0">
          <span className="text-xs text-slate-600 font-medium">
            Standard: Pearson PTE Academic & Cambridge English Grammar Guidelines
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
