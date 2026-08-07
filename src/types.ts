export type PaceType = 10 | 20 | 30;

export type WordSource = 'AWL' | 'NGSL' | 'Vocabulary' | 'Appendix' | 'Vocabulary-GAP-AWL' | 'Vocabulary-GAP-NGSL';

export type VerbType = 'transitive' | 'intransitive' | 'noun' | 'adj' | 'adv';

export interface Word {
  id: number;
  no: number;
  word: string;
  pos: string; // Noun, Verb, Adjective, Adverb, Phrasal Verb, Idiom
  ipa: string;
  ipa_perkiraan: string;
  meaning_id: string;
  example_sentence: string;
  source: WordSource;
  priority: string;
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  prefix_info?: string;
  suffix_info?: string;
  noun_family?: string;
  verb_family?: string;
  adj_family?: string;
  adv_family?: string;
  verb_type?: VerbType;
  v1?: string;
  v2?: string;
  v3?: string;
  v_ing?: string;
  week?: number;
}

export interface UserLearningSettings {
  pace: PaceType;
  startDate: string; // YYYY-MM-DD
  locked: boolean;
  targetExamDate?: string;
  sabtuOption?: 'diagnostic' | 'next_monday' | null;
}

export type MasteryStatus = 'new' | 'learning' | 'mastered';

export interface WordUserStat {
  wordId: number;
  wrongCount: number;
  correctStreak: number;
  isWeakness: boolean;
  status: MasteryStatus;
  lastTested?: string;
}

export type QuizType =
  | 'mcq_standard'
  | 'matching_pair'
  | 'synonym_antonym'
  | 'pte_fill_blank'
  | 'essay_spelling';

export interface QuizQuestion {
  id: string;
  wordId: number;
  wordObj: Word;
  type: QuizType;
  prompt: string;
  sourceCorpus?: string;
  contextSentence?: string;
  hint?: string;
  clue?: string;
  challengeMode?: 'SYNONYM' | 'ANTONYM';
  options?: string[];
  correctAnswer: string;
  acceptedVariations?: string[];
  explanation?: string;
  matchingPairs?: { id: string; word: string; meaning: string }[];
}

export interface QuizResult {
  id: string;
  date: string;
  total: number;
  correct: number;
  score: number;
  wrongWordIds: number[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface TitleRank {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  icon: string;
  description: string;
  badgeBg: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'quiz' | 'vocab' | 'tenses';
  xpReward: number;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  formattedDate: string;
  category: 'quiz' | 'vocab_review' | 'flashcard' | 'badge_unlock' | 'rank_up';
  title: string;
  description: string;
  xpEarned: number;
  scorePct?: number;
  details?: {
    totalCount?: number;
    correctCount?: number;
    wrongWords?: string[];
    mode?: string;
    dayRange?: string;
  };
}

export interface UserDataState {
  profile: UserProfile;
  settings: UserLearningSettings;
  userStats: Record<number, WordUserStat>;
  xp: number;
  userStreak: number;
  unlockedBadgeIds: string[];
  lastStudyDate: string;
  activityLogs: ActivityLogEntry[];
}
