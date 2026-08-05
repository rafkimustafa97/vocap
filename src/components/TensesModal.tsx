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

          {/* EXPANDABLE COLLAPSIBLE SECTION */}
          {isDetailsExpanded && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 animate-in fade-in zoom-in duration-200">
              {/* Sensitivitas Fonetik vokal / konsonan (a / an) */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Rule Fonetik Artikulat (Artikel a/an):
                  </span>
                  <span className="bg-slate-900 text-amber-400 font-mono text-[11px] px-2 py-0.5 rounded font-black border border-amber-500/30">
                    Artikel: "{matrixData.phoneticSensitivity.article}" ({matrixData.phoneticSensitivity.initialSound})
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {matrixData.phoneticSensitivity.ruleNote}
                </p>
              </div>

              {/* Transitivity & Passive Rule Note */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
                <span className="font-bold text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Rule Pasif Voice Transitif / Intransitif:
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {matrixData.passiveSensitivity.explanation}
                </p>
              </div>

              {/* Affix & Word Family Analysis */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center gap-1 text-purple-300 font-bold">
                  <Code className="w-3.5 h-3.5" />
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
        </div>

        {/* Tab Navigation (Simplified to Tenses Dasar & 4 Tenses Tambahan as requested in Gambar 2) */}
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
            <BookOpen className="w-4 h-4" /> Tenses Dasar
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
            <Layers className="w-4 h-4" /> 4 Tenses Tambahan
          </button>
        </div>

        {/* Content List Scrollable */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {filteredTenses.map((tense) => (
            <div key={tense.id} className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
              
              {/* Tense Header & Time Signal */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">
                    Tense #{tense.id}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{tense.tenseName}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{tense.usageContext}</p>
                </div>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl self-start sm:self-auto">
                  ⏰ Time Signal: {tense.timeSignal}
                </span>
              </div>

              {/* To Be & Auxiliary Rule Note */}
              <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 text-xs space-y-1">
                <span className="font-bold text-blue-900 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-600" /> Aturan To Be & Auxiliary Verb:
                </span>
                <p className="text-slate-700 leading-relaxed">{tense.toBeExplanation}</p>
              </div>

              {/* ACTIVE VOICE SECTION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-blue-600" /> KALIMAT AKTIF (ACTIVE VOICE)
                  </span>
                  <button
                    type="button"
                    onClick={() => speakText(tense.activeVoice.positive.sentence)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Dengarkan
                  </button>
                </div>

                {/* Positive (+) */}
                <div className="bg-blue-50/40 border border-blue-200/80 rounded-xl p-3 space-y-1">
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
                    {tense.activeVoice.positive.formula}
                  </span>
                  <p className="font-mono font-bold text-slate-900 text-sm">{tense.activeVoice.positive.sentence}</p>
                  {tense.activeVoice.positive.meaning && (
                    <p className="text-xs text-blue-700 italic">id Arti: "{tense.activeVoice.positive.meaning}"</p>
                  )}
                </div>

                {/* Negative (-) */}
                <div className="bg-rose-50/40 border border-rose-200/80 rounded-xl p-3 space-y-1">
                  <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
                    {tense.activeVoice.negative.formula}
                  </span>
                  <p className="font-mono font-bold text-slate-900 text-sm">{tense.activeVoice.negative.sentence}</p>
                </div>

                {/* Interrogative (?) */}
                <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-3 space-y-1">
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
                    {tense.activeVoice.interrogative.formula}
                  </span>
                  <p className="font-mono font-bold text-slate-900 text-sm">{tense.activeVoice.interrogative.sentence}</p>
                </div>
              </div>

              {/* PASSIVE VOICE SECTION */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" /> KALIMAT PASIF (PASSIVE VOICE)
                </span>

                {!tense.passiveVoice.isApplicable ? (
                  <div className="bg-slate-100 rounded-xl p-3 text-xs text-slate-500 font-medium italic border border-slate-200">
                    ⚠️ {tense.passiveVoice.note}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Positive (+) */}
                    {tense.passiveVoice.positive && (
                      <div className="bg-purple-50/40 border border-purple-200/80 rounded-xl p-3 space-y-1">
                        <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
                          {tense.passiveVoice.positive.formula}
                        </span>
                        <p className="font-mono font-bold text-slate-900 text-sm">{tense.passiveVoice.positive.sentence}</p>
                        {tense.passiveVoice.positive.meaning && (
                          <p className="text-xs text-purple-700 italic">id Arti: "{tense.passiveVoice.positive.meaning}"</p>
                        )}
                      </div>
                    )}

                    {/* Negative (-) */}
                    {tense.passiveVoice.negative && (
                      <div className="bg-rose-50/40 border border-rose-200/80 rounded-xl p-3 space-y-1">
                        <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
                          {tense.passiveVoice.negative.formula}
                        </span>
                        <p className="font-mono font-bold text-slate-900 text-sm">{tense.passiveVoice.negative.sentence}</p>
                      </div>
                    )}

                    {/* Interrogative (?) */}
                    {tense.passiveVoice.interrogative && (
                      <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-3 space-y-1">
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
                          {tense.passiveVoice.interrogative.formula}
                        </span>
                        <p className="font-mono font-bold text-slate-900 text-sm">{tense.passiveVoice.interrogative.sentence}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex justify-between items-center shrink-0">
          <span className="text-[11px] font-medium text-slate-500 hidden sm:block">
            Standard: Pearson PTE Academic & Cambridge English Grammar Guidelines
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 ml-auto"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
