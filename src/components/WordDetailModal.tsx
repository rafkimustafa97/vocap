import React from 'react';
import { Word } from '../types';
import { speakText } from '../utils/speech';
import { X, Volume2, Sparkles, Layers, Tag, BookOpen } from 'lucide-react';

interface WordDetailModalProps {
  word: Word | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTenses: (word: Word) => void;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({
  word,
  isOpen,
  onClose,
  onOpenTenses
}) => {
  if (!isOpen || !word) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-blue-600 p-5 text-white flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {word.pos}
              </span>
              <span className="text-xs text-blue-100 italic">No. #{word.no}</span>
            </div>
            <h2 className="text-3xl font-black mt-1 flex items-center gap-2">
              {word.word}
              <button
                type="button"
                onClick={() => speakText(word.word)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </h2>
            <p className="text-xs text-blue-100 mt-0.5 font-mono">
              IPA: {word.ipa} ({word.ipa_perkiraan})
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs md:text-sm text-slate-800 flex-1">
          
          {/* Meaning Card */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4">
            <span className="text-[10px] text-blue-600 font-bold uppercase block mb-1">Arti Bahasa Indonesia:</span>
            <p className="text-base font-bold text-slate-900">{word.meaning_id}</p>
          </div>

          {/* Example Sentence */}
          {word.example_sentence && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Contoh Kalimat Akademis:</span>
              <p className="text-xs md:text-sm text-slate-700 italic leading-relaxed">
                "{word.example_sentence}"
              </p>
              <button
                type="button"
                onClick={() => speakText(word.example_sentence)}
                className="absolute top-3 right-3 p-1 text-slate-400 hover:text-blue-600"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Word Family Tree */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Layers className="w-4 h-4 text-blue-600" /> Word Family Tree:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Noun:</span>
                <span className="font-bold text-blue-700">{word.noun_family || '-'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Verb:</span>
                <span className="font-bold text-emerald-700">{word.verb_family || '-'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Adjective:</span>
                <span className="font-bold text-amber-700">{word.adj_family || '-'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Adverb:</span>
                <span className="font-bold text-indigo-700">{word.adv_family || '-'}</span>
              </div>
            </div>
          </div>

          {/* Verb Forms */}
          {word.v1 && (
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-1">Verb Forms:</span>
              <div className="flex justify-between font-mono bg-white p-2 rounded-xl border border-slate-100">
                <span>V1: <strong>{word.v1}</strong></span>
                <span>V2: <strong>{word.v2}</strong></span>
                <span>V3: <strong>{word.v3}</strong></span>
                <span>V-ing: <strong>{word.v_ing}</strong></span>
              </div>
            </div>
          )}

          {/* Collocations */}
          {word.collocations && word.collocations.length > 0 && word.collocations[0] !== '-' && (
            <div className="space-y-1.5">
              <span className="font-bold text-slate-700 text-xs flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-blue-600" /> Collocations:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {word.collocations.map((col, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => speakText(col)}
                    className="bg-blue-50 text-blue-800 text-xs font-semibold px-3 py-1 rounded-xl border border-blue-200 flex items-center gap-1"
                  >
                    {col} <Volume2 className="w-3 h-3 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Synonyms & Antonyms */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {word.synonyms && word.synonyms.length > 0 && (
              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-800 block mb-1">Sinonim:</span>
                <p className="text-slate-700">{word.synonyms.join(', ')}</p>
              </div>
            )}
            {word.antonyms && word.antonyms.length > 0 && word.antonyms[0] !== '-' && (
              <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-100">
                <span className="font-bold text-rose-800 block mb-1">Antonim:</span>
                <p className="text-slate-700">{word.antonyms.join(', ')}</p>
              </div>
            )}
          </div>

          {/* Open Tenses Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenTenses(word);
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs md:text-sm"
          >
            <Sparkles className="w-4 h-4" /> Buka Modal 9 Tenses Context & Passive Voice
          </button>

        </div>

      </div>
    </div>
  );
};
