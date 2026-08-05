-- =========================================================
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
  sabtu_option TEXT, -- 'diagnostic' OR 'next_monday'
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

-- RLS (Row Level Security) Policies for Supabase
ALTER TABLE public.user_learning_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_word_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own learning settings"
  ON public.user_learning_settings FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own word stats"
  ON public.user_word_stats FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their quiz history"
  ON public.quiz_history FOR ALL
  USING (auth.uid() = user_id);
