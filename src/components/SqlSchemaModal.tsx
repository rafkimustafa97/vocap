import React, { useState } from 'react';
import { X, Copy, Check, Database, Download } from 'lucide-react';

interface SqlSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlSchemaModal: React.FC<SqlSchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const sqlScript = `-- =========================================================
-- Lumina Learn v11: Supabase PostgreSQL DDL Schema
-- =========================================================

-- 1. Master Words Table (3,655 Words)
CREATE TABLE IF NOT EXISTS public.master_words (
  id SERIAL PRIMARY KEY,
  no_master INT UNIQUE NOT NULL,
  word TEXT NOT NULL,
  pos TEXT NOT NULL, -- Noun, Verb, Adjective, Adverb, Phrasal Verb, Idiom
  ipa TEXT,
  ipa_perkiraan TEXT,
  meaning_id TEXT NOT NULL,
  example_sentence TEXT,
  source TEXT DEFAULT 'AWL', -- AWL, NGSL, Vocabulary, Appendix
  priority TEXT DEFAULT 'Tinggi',
  synonyms TEXT[] DEFAULT '{}',
  antonyms TEXT[] DEFAULT '{}',
  collocations TEXT[] DEFAULT '{}',
  prefix_info TEXT,
  suffix_info TEXT,
  verb_type TEXT DEFAULT 'transitive', -- transitive, intransitive, noun, adj, adv
  week INT DEFAULT 1
);

-- 2. Word Family Table (Relational)
CREATE TABLE IF NOT EXISTS public.word_families (
  id SERIAL PRIMARY KEY,
  word_id INT REFERENCES public.master_words(id) ON DELETE CASCADE,
  noun_family TEXT,
  verb_family TEXT,
  adj_family TEXT,
  adv_family TEXT
);

-- 3. Verb Forms Table (V1, V2, V3, V_ing)
CREATE TABLE IF NOT EXISTS public.verb_forms (
  id SERIAL PRIMARY KEY,
  word_id INT REFERENCES public.master_words(id) ON DELETE CASCADE,
  v1 TEXT NOT NULL,
  v2 TEXT NOT NULL,
  v3 TEXT NOT NULL,
  v_ing TEXT NOT NULL
);

-- 4. User Learning Settings Table (Multi-tenant)
CREATE TABLE IF NOT EXISTS public.user_learning_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  pace_per_day INT DEFAULT 30 CHECK (pace_per_day IN (10, 20, 30)),
  start_date DATE DEFAULT CURRENT_DATE,
  locked BOOLEAN DEFAULT FALSE,
  target_exam_date DATE,
  sabtu_option TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User Word Statistics Table (Mistake-Centric Radar)
CREATE TABLE IF NOT EXISTS public.user_word_stats (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id INT REFERENCES public.master_words(id) ON DELETE CASCADE,
  wrong_count INT DEFAULT 0,
  correct_streak INT DEFAULT 0,
  is_weakness BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'learning', 'mastered')),
  last_tested TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, word_id)
);

-- 6. Quiz Session History Table
CREATE TABLE IF NOT EXISTS public.quiz_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_questions INT NOT NULL,
  correct_count INT NOT NULL,
  score INT NOT NULL,
  wrong_word_ids INT[] DEFAULT '{}'
);

-- RLS (Row Level Security) Policies
ALTER TABLE public.user_learning_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_word_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own learning settings"
  ON public.user_learning_settings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own word stats"
  ON public.user_word_stats FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their quiz history"
  ON public.quiz_history FOR ALL USING (auth.uid() = user_id);
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sqlScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'supabase_schema.sql';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Database className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-lg font-bold">File DDL Supabase (`supabase_schema.sql`)</h2>
              <p className="text-xs text-slate-400">Skema database PostgreSQL lengkap untuk Lumina Learn v11</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950 text-slate-200 overflow-y-auto flex-1 font-mono text-xs leading-relaxed">
          <pre>{sqlScript}</pre>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> Unduh file `.sql`
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Tersalin ke Clipboard!' : 'Salin Kode DDL'}
          </button>
        </div>

      </div>
    </div>
  );
};
