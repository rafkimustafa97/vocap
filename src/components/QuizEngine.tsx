import React, { useState } from 'react';
import { Word, WordUserStat, QuizQuestion, QuizResult } from '../types';
import { speakText } from '../utils/speech';
import {
  Sparkles,
  Layers,
  Filter,
  CheckCircle2,
  XCircle,
  Volume2,
  Award,
  BookOpen,
  Shuffle,
  ChevronDown,
  Info,
  Check,
  Zap
} from 'lucide-react';

interface QuizEngineProps {
  allWords: Word[];
  userStats: Record<number, WordUserStat>;
  currentWeek: number;
  onUpdateWordStat: (wordId: number, isCorrect: boolean) => void;
  onFinishQuiz: (result: QuizResult, xpEarned: number) => void;
}

export type QuizModeOption =
  | 'adaptive_mix'
  | 'mcq_standard'
  | 'matching_pair'
  | 'synonym_antonym'
  | 'pte_fill_blank'
  | 'essay_spelling';

interface QuizRuleInfo {
  id: QuizModeOption;
  name: string;
  levelBadge: string;
  levelColor: string;
  sourceRef: string;
  description: string;
  howToAnswer: string;
  xpPerQuestion: number;
  icon: string;
}

export const QUIZ_RULES: Record<QuizModeOption, QuizRuleInfo> = {
  adaptive_mix: {
    id: 'adaptive_mix',
    name: '⚡ Adaptive Mix (Semua 5 Jenis)',
    levelBadge: 'RECOMMENDED (ALL LEVELS)',
    levelColor: 'bg-blue-100 text-blue-800 border-blue-200',
    sourceRef: 'Kombinasi Otomatis Pearson PTE & GRE',
    description: 'Sistem secara cerdas mengombinasikan 5 jenis kuis dari Level 1 hingga Level 5 secara acak.',
    howToAnswer: 'Menjawab soal kombinasi Pilihan Ganda, Matching Pairs, Synonym/Antonym, Fill-in-Blank, dan Active Recall Spelling.',
    xpPerQuestion: 25,
    icon: '⚡'
  },
  mcq_standard: {
    id: 'mcq_standard',
    name: '🟢 Level 1: Multiple Choice',
    levelBadge: 'LEVEL 1 (MUDAH)',
    levelColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    sourceRef: 'Oxford 3000 & NGSL Standard',
    description: 'Pilihan ganda 4 opsi sederhana untuk menguji pengenalan awal arti kata baku.',
    howToAnswer: 'Pilihlah 1 dari 4 opsi jawaban yang paling tepat menggambarkan arti kata Bahasa Indonesia.',
    xpPerQuestion: 10,
    icon: '🟢'
  },
  matching_pair: {
    id: 'matching_pair',
    name: '🔵 Level 2: Matching Pairs',
    levelBadge: 'LEVEL 2 (SEDANG)',
    levelColor: 'bg-blue-100 text-blue-800 border-blue-200',
    sourceRef: 'PTE Academic Vocabulary Builder',
    description: 'Memasangkan 4 kata bahasa Inggris dengan 4 arti Bahasa Indonesia secara berurutan.',
    howToAnswer: 'Klik 1 kata bahasa Inggris lalu klik 1 pasangan arti Bahasa Indonesia yang sesuai.',
    xpPerQuestion: 15,
    icon: '🔵'
  },
  synonym_antonym: {
    id: 'synonym_antonym',
    name: '🟣 Level 3: Synonym & Antonym',
    levelBadge: 'LEVEL 3 (MENANTANG)',
    levelColor: 'bg-purple-100 text-purple-800 border-purple-200',
    sourceRef: 'GRE Verbal & Roget Thesaurus',
    description: 'Menguji kedalaman pemahaman persamaan kata (synonym) atau lawan kata (antonym).',
    howToAnswer: 'Pilih opsi yang merupakan persis persamaan atau lawan kata yang diminta pada prompt.',
    xpPerQuestion: 20,
    icon: '🟣'
  },
  pte_fill_blank: {
    id: 'pte_fill_blank',
    name: '🟠 Level 4: PTE Fill-in-Blank',
    levelBadge: 'LEVEL 4 (SULIT)',
    levelColor: 'bg-amber-100 text-amber-900 border-amber-300',
    sourceRef: 'Pearson PTE Academic Reading',
    description: 'Mengisi bagian rumpang [ ____ ] dalam kalimat jurnal sains/akademik nyata.',
    howToAnswer: 'Pilih kata yang paling sesuai secara konteks tata bahasa untuk melengkapi kalimat.',
    xpPerQuestion: 25,
    icon: '🟠'
  },
  essay_spelling: {
    id: 'essay_spelling',
    name: '🔴 Level 5: Active Recall Spelling',
    levelBadge: 'LEVEL 5 (TERSULIT)',
    levelColor: 'bg-rose-100 text-rose-900 border-rose-300',
    sourceRef: 'Merriam-Webster Academic Spelling',
    description: 'Menulis ejaan tepat kata bahasa Inggris secara mandiri tanpa bantuan opsi pilihan ganda.',
    howToAnswer: 'Ketikkan ejaan kata bahasa Inggris secara tepat sesuai petunjuk arti & perkiraan IPA.',
    xpPerQuestion: 30,
    icon: '🔴'
  }
};

export const QuizEngine: React.FC<QuizEngineProps> = ({
  allWords,
  userStats,
  currentWeek,
  onUpdateWordStat,
  onFinishQuiz
}) => {
  // Master Control Selector & Custom Popover State
  const [masterMode, setMasterMode] = useState<QuizModeOption>('adaptive_mix');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Master Dictionary Filters for Quiz
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [posFilter, setPosFilter] = useState<string>('all');
  const [poolTarget, setPoolTarget] = useState<'all' | 'weakness' | 'today'>('all');

  // Question Count Choice (15, 30, 50)
  const [questionCount, setQuestionCount] = useState<number>(15);

  // Active Questions State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIndex] = useState<number>(0);
  const [isQuizStarted, setIsQuizStarted] = useState<boolean>(false);

  // Mode States
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);

  // Results
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);
  const [earnedXp, setEarnedXp] = useState<number>(0);
  const [wrongWordIds, setWrongWordIds] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Fisher-Yates Shuffler
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Generate Questions based on Filters & Master Mode
  const generateQuestions = () => {
    if (!allWords || allWords.length === 0) return;

    let filtered = [...allWords];

    if (sourceFilter !== 'all') {
      const sf = sourceFilter.toLowerCase();
      filtered = filtered.filter((w) => (w.source || '').toLowerCase().includes(sf));
    }

    if (posFilter !== 'all') {
      const pf = posFilter.toLowerCase();
      filtered = filtered.filter((w) => (w.pos || '').toLowerCase().includes(pf));
    }

    if (filtered.length < 5) {
      filtered = [...allWords];
    }

    let targetPool: Word[] = [];
    if (poolTarget === 'weakness') {
      const statsList = Object.values(userStats) as WordUserStat[];
      const weaknessWordIds = statsList
        .filter((s) => s.isWeakness || s.wrongCount > 0)
        .map((s) => s.wordId);
      targetPool = filtered.filter((w) => weaknessWordIds.includes(w.id));
      if (targetPool.length < questionCount) {
        targetPool = filtered;
      }
    } else if (poolTarget === 'today') {
      const startNo = Math.max(1, (currentWeek - 1) * 5 * 30 + 1);
      const endNo = Math.min(3655, currentWeek * 5 * 30);
      targetPool = filtered.slice(startNo - 1, endNo);
      if (targetPool.length === 0) targetPool = filtered;
    } else {
      targetPool = filtered;
    }

    const shuffledTargets = shuffleArray(targetPool).slice(0, questionCount);

    const generated: QuizQuestion[] = shuffledTargets.map((wordObj, index) => {
      const distractors = shuffleArray(allWords.filter((w) => w.id !== wordObj.id)).slice(0, 3);

      let qType = masterMode;
      if (masterMode === 'adaptive_mix') {
        const types: QuizModeOption[] = ['mcq_standard', 'matching_pair', 'synonym_antonym', 'pte_fill_blank', 'essay_spelling'];
        qType = types[index % types.length];
      }

      if (qType === 'mcq_standard') {
        const rawOpts = shuffleArray([wordObj.meaning_id, ...distractors.map((d) => d.meaning_id)]);
        const formattedOpts = rawOpts.map((m, i) => `${String.fromCharCode(65 + i)}. ${m}`);
        const correctFormatted = formattedOpts.find((o) => o.includes(wordObj.meaning_id)) || formattedOpts[0];

        return {
          id: `q-${wordObj.id}-${index}-${Date.now()}`,
          wordId: wordObj.id,
          wordObj,
          type: 'mcq_standard',
          sourceCorpus: 'Oxford 3000 & NGSL Standard',
          prompt: `Manakah arti Bahasa Indonesia yang paling tepat untuk kata '${wordObj.word}' (${wordObj.pos})?`,
          options: formattedOpts,
          correctAnswer: correctFormatted,
          explanation: `'${wordObj.word}' (${wordObj.pos}) berarti '${wordObj.meaning_id}'.`
        };
      }

      if (qType === 'matching_pair') {
        const set4Words = [wordObj, ...distractors];
        const matchingPairs = set4Words.map((w) => ({
          id: `pair-${w.id}`,
          word: w.word,
          meaning: w.meaning_id
        }));

        return {
          id: `q-${wordObj.id}-${index}-${Date.now()}`,
          wordId: wordObj.id,
          wordObj,
          type: 'matching_pair',
          sourceCorpus: 'PTE Academic Matching Pairs',
          prompt: 'Pasangkan 4 kata bahasa Inggris berikut dengan arti Bahasa Indonesia yang tepat:',
          correctAnswer: 'All Pairs Matched',
          matchingPairs,
          explanation: 'Seluruh 4 pasangan kata & arti berhasil dicocokkan dengan benar.'
        };
      }

      if (qType === 'synonym_antonym') {
        const challengeMode = index % 2 === 0 ? 'SYNONYM' : 'ANTONYM';
        let targetList = challengeMode === 'SYNONYM' ? wordObj.synonyms : wordObj.antonyms;
        if (!targetList || targetList.length === 0) {
          targetList = [wordObj.meaning_id];
        }

        const correctTarget = targetList[0] || wordObj.meaning_id;
        const distractorMeanings = distractors.map((d) => d.meaning_id);
        const rawOpts = shuffleArray([correctTarget, ...distractorMeanings]);
        const formattedOpts = rawOpts.map((m, i) => `${String.fromCharCode(65 + i)}. ${m}`);
        const correctFormatted = formattedOpts.find((o) => o.includes(correctTarget)) || formattedOpts[0];

        return {
          id: `q-${wordObj.id}-${index}-${Date.now()}`,
          wordId: wordObj.id,
          wordObj,
          type: 'synonym_antonym',
          challengeMode,
          sourceCorpus: 'GRE & Roget Thesaurus',
          prompt: challengeMode === 'SYNONYM'
            ? `Manakah kata di bawah ini yang merupakan PERSAMAAN KATA (Synonym) dari '${wordObj.word}'?`
            : `Manakah kata di bawah ini yang merupakan LAWAN KATA (Antonym) dari '${wordObj.word}'?`,
          options: formattedOpts,
          correctAnswer: correctFormatted,
          explanation: `'${wordObj.word}' memiliki ${challengeMode.toLowerCase()} baku yaitu '${correctTarget}'.`
        };
      }

      if (qType === 'pte_fill_blank') {
        const sentence = wordObj.example_sentence || `The researcher attempted to ${wordObj.word} the dataset.`;
        const regex = new RegExp(`\\b${wordObj.word}\\b`, 'gi');
        const contextSentence = sentence.replace(regex, '[ _________ ]');

        const rawOpts = shuffleArray([wordObj.word, ...distractors.map((d) => d.word)]);
        const formattedOpts = rawOpts.map((w, i) => `${String.fromCharCode(65 + i)}. ${w}`);
        const correctFormatted = formattedOpts.find((o) => o.includes(wordObj.word)) || formattedOpts[0];

        return {
          id: `q-${wordObj.id}-${index}-${Date.now()}`,
          wordId: wordObj.id,
          wordObj,
          type: 'pte_fill_blank',
          sourceCorpus: 'Pearson PTE Academic Reading',
          prompt: 'Lengkapilah bagian rumpang [ _________ ] dalam kalimat sains/akademik berikut:',
          contextSentence,
          options: formattedOpts,
          correctAnswer: correctFormatted,
          hint: `Arti kata: "${wordObj.meaning_id}" | Pos: ${wordObj.pos}`,
          explanation: `Kata '${wordObj.word}' paling tepat secara konteks tata bahasa untuk melengkapi kalimat.`
        };
      }

      return {
        id: `q-${wordObj.id}-${index}-${Date.now()}`,
        wordId: wordObj.id,
        wordObj,
        type: 'essay_spelling',
        sourceCorpus: 'Merriam-Webster Academic Spelling',
        prompt: `Tuliskan ejaan tepat bahasa Inggris untuk kata dengan arti baku '${wordObj.meaning_id}' (${wordObj.pos}):`,
        clue: `Petunjuk IPA: ${wordObj.ipa} (${wordObj.ipa_perkiraan})`,
        correctAnswer: wordObj.word.toLowerCase().trim(),
        acceptedVariations: [wordObj.word.toLowerCase().trim()],
        explanation: `Ejaan baku yang tepat adalah '${wordObj.word}'.`
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setScore(0);
    setEarnedXp(0);
    setWrongWordIds([]);
    setIsCompleted(false);
    setIsAnswerSubmitted(false);
    setSelectedOption(null);
    setTypedAnswer('');
    setMatchedPairs({});
  };

  const handleStartQuiz = () => {
    generateQuestions();
    setIsQuizStarted(true);
  };

  const handleAnswerMCQ = (optionText: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(optionText);
    const q = questions[currentIdx];
    const correct = optionText === q.correctAnswer;
    setIsCorrect(correct);
    setIsAnswerSubmitted(true);

    const ruleInfo = QUIZ_RULES[masterMode];
    if (correct) {
      setScore((prev) => prev + 1);
      setEarnedXp((prev) => prev + ruleInfo.xpPerQuestion);
      onUpdateWordStat(q.wordId, true);
    } else {
      setWrongWordIds((prev) => [...prev, q.wordId]);
      onUpdateWordStat(q.wordId, false);
    }
  };

  const handleAnswerEssay = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswerSubmitted || !typedAnswer.trim()) return;

    const q = questions[currentIdx];
    const userClean = typedAnswer.toLowerCase().trim();
    const correct = userClean === q.correctAnswer || (q.acceptedVariations && q.acceptedVariations.includes(userClean));
    setIsCorrect(correct);
    setIsAnswerSubmitted(true);

    const ruleInfo = QUIZ_RULES[masterMode];
    if (correct) {
      setScore((prev) => prev + 1);
      setEarnedXp((prev) => prev + ruleInfo.xpPerQuestion);
      onUpdateWordStat(q.wordId, true);
    } else {
      setWrongWordIds((prev) => [...prev, q.wordId]);
      onUpdateWordStat(q.wordId, false);
    }
  };

  const handleMatchSelect = (wordId: string, meaning: string) => {
    if (isAnswerSubmitted) return;
    if (!selectedWordId) {
      setSelectedWordId(wordId);
    } else {
      const q = questions[currentIdx];
      const selectedPair = q.matchingPairs?.find((p) => p.id === selectedWordId);
      if (selectedPair && selectedPair.meaning === meaning) {
        const newPairs = { ...matchedPairs, [selectedWordId]: meaning };
        setMatchedPairs(newPairs);
        setSelectedWordId(null);

        if (Object.keys(newPairs).length === (q.matchingPairs?.length || 4)) {
          setIsCorrect(true);
          setIsAnswerSubmitted(true);
          setScore((prev) => prev + 1);
          setEarnedXp((prev) => prev + QUIZ_RULES[masterMode].xpPerQuestion);
          onUpdateWordStat(q.wordId, true);
        }
      } else {
        setSelectedWordId(null);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsAnswerSubmitted(false);
      setIsCorrect(null);
      setSelectedOption(null);
      setTypedAnswer('');
      setMatchedPairs({});
      setSelectedWordId(null);
    } else {
      setIsCompleted(true);
      const finalScorePct = Math.round((score / questions.length) * 100);
      const totalXp = earnedXp + (finalScorePct === 100 ? 100 : 0);

      onFinishQuiz(
        {
          id: `result-${Date.now()}`,
          date: new Date().toISOString(),
          total: questions.length,
          correct: score,
          score: finalScorePct,
          wrongWordIds
        },
        totalXp
      );
    }
  };

  const activeRule = QUIZ_RULES[masterMode];

  // -------------------------------------------------------------------
  // RENDER MASTER BOARD SETUP VIEW
  // -------------------------------------------------------------------
  if (!isQuizStarted || isCompleted) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto pb-24 px-2">
        
        {/* Quiz Board Header Card */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-sm space-y-6 overflow-visible">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Lumina Adaptive Quiz Control
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-1 flex items-center gap-2">
                ⚡ Master Board 5 Jenis Quiz Akademis
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Pilih mode kuis, filter kosakata, dan jumlah soal untuk menguji daya ingat memori Anda.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartQuiz}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-blue-500/30 active:scale-98 transition-all flex items-center justify-center gap-2 text-base shrink-0"
            >
              🚀 Mulai Sesi Kuis Sekarang
            </button>
          </div>

          {/* 1. MASTER CONTROL SCROLL-DOWN SELECTOR (RESPONSIVE CUSTOM POPOVER DROPDOWN) */}
          <div className="space-y-2 relative">
            <label className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Master Control Quiz Selector:
            </label>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-slate-50 border-2 border-blue-500/40 rounded-2xl p-4 text-sm md:text-base font-black text-slate-900 flex items-center justify-between shadow-xs transition-all text-left hover:border-blue-500 max-w-full overflow-hidden"
              >
                <span className="truncate pr-2">{activeRule.name}</span>
                <ChevronDown className={`w-5 h-5 text-slate-500 shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Responsive Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-blue-500/30 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 max-w-full max-h-80 overflow-y-auto">
                  {Object.values(QUIZ_RULES).map((rule) => {
                    const isSelected = masterMode === rule.id;
                    return (
                      <button
                        key={rule.id}
                        type="button"
                        onClick={() => {
                          setMasterMode(rule.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full p-3.5 text-left text-xs md:text-sm font-bold flex items-start gap-3 transition-colors ${
                          isSelected ? 'bg-blue-50 text-blue-950 font-extrabold' : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <span className="text-lg shrink-0 mt-0.5">{rule.icon}</span>
                        <div className="flex-1 min-w-0 pr-2">
                          <span className="block font-black text-slate-900 text-xs md:text-sm break-words">{rule.name}</span>
                          <span className="text-[11px] text-slate-500 font-medium block mt-0.5 leading-tight">{rule.description}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 mt-1" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 2. DYNAMIC ATURAN & DETAIL QUIZ CARD */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <span className={`text-xs font-black px-3 py-1 rounded-full ${activeRule.levelColor}`}>
                {activeRule.levelBadge}
              </span>
              <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                Rujukan: {activeRule.sourceRef}
              </span>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 text-base">{activeRule.name}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{activeRule.description}</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1 text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-600" /> Cara Kerja & Format Jawaban:
              </span>
              <p className="text-slate-600 font-medium">{activeRule.howToAnswer}</p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 font-bold text-blue-700">
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-500" /> Scoring System:
              </span>
              <span>+{activeRule.xpPerQuestion} XP / Jawaban Benar (+100 XP Perfect Score)</span>
            </div>
          </div>

          {/* 3. FILTER KOSAKATA IDENTIK KAMUS MASTER */}
          <div className="space-y-3 pt-2">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" /> Filter Target Kosakata Kuis
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Filter Sumber Kata:</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-full truncate"
                >
                  <option value="all">Semua Sumber (3.655 Kata)</option>
                  <option value="awl">AWL Academic (245 Kata)</option>
                  <option value="ngsl">NGSL General (1.475 Kata)</option>
                  <option value="vocab">Oxford 10th (1.698 Kata)</option>
                  <option value="appendix">Appendix Teknis (237 Kata)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kelas Kata (POS):</label>
                <select
                  value={posFilter}
                  onChange={(e) => setPosFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-full truncate"
                >
                  <option value="all">Semua Kelas Kata</option>
                  <option value="noun">Noun (Kata Benda)</option>
                  <option value="verb">Verb (Kata Kerja)</option>
                  <option value="adjective">Adjective (Kata Sifat)</option>
                  <option value="adverb">Adverb (Kata Keterangan)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pool Target Kuis:</label>
                <select
                  value={poolTarget}
                  onChange={(e) => setPoolTarget(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-full truncate"
                >
                  <option value="all">Seluruh DB 3.655 Kata</option>
                  <option value="weakness">Radar Kelemahan (Weakness)</option>
                  <option value="today">Target Porsi Hari Ini</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. SELEKTOR JUMLAH SOAL (15, 30, 50) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-800 text-xs flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" /> Pilih Jumlah Soal per Sesi:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[15, 30, 50].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`py-3 rounded-xl font-black text-xs transition-all border-2 ${
                    questionCount === count
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {count} Soal
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    );
  }

  // -------------------------------------------------------------------
  // RENDER ACTIVE QUIZ SESSION VIEW
  // -------------------------------------------------------------------
  const q = questions[currentIdx];
  if (!q) return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 px-2">
      
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[32px] p-6 text-white shadow-xl flex items-center justify-between">
        <div>
          <span className="bg-white/20 text-white font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            SOAL {currentIdx + 1} DARI {questions.length}
          </span>
          <h2 className="text-xl md:text-2xl font-black mt-1">{q.sourceCorpus || 'PTE Academic Quiz'}</h2>
        </div>

        <div className="bg-white/20 px-3.5 py-1.5 rounded-2xl font-mono font-black text-sm border border-white/30">
          Skor: {score}
        </div>
      </div>

      <div className="bg-white rounded-[36px] p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="space-y-2 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              {q.type.replace('_', ' ').toUpperCase()}
            </span>
            {q.challengeMode && (
              <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {q.challengeMode}
              </span>
            )}
          </div>
          <h3 className="text-lg md:text-xl font-black text-slate-900 leading-snug">{q.prompt}</h3>
        </div>

        {q.type === 'mcq_standard' || q.type === 'synonym_antonym' || q.type === 'pte_fill_blank' ? (
          <div className="space-y-3">
            {q.contextSentence && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 leading-relaxed font-mono">
                "{q.contextSentence}"
              </div>
            )}

            {q.hint && (
              <p className="text-xs text-slate-500 italic font-medium">💡 Hint: {q.hint}</p>
            )}

            <div className="grid grid-cols-1 gap-2.5 pt-2">
              {q.options?.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300';

                if (isAnswerSubmitted) {
                  if (opt === q.correctAnswer) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black ring-2 ring-emerald-400/20';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-50 border-rose-500 text-rose-900 font-black';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-blue-50 border-blue-500 text-blue-900 font-black';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswerSubmitted}
                    onClick={() => handleAnswerMCQ(opt)}
                    className={`p-4 rounded-2xl border-2 text-left font-bold text-xs md:text-sm transition-all ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {q.type === 'matching_pair' && q.matchingPairs ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-bold">
              Klik 1 Kata Bahasa Inggris di sebelah kiri, lalu klik 1 Pasangan Arti di sebelah kanan:
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-black uppercase">Kata Bahasa Inggris:</span>
                {q.matchingPairs.map((pair) => {
                  const isMatched = !!matchedPairs[pair.id];
                  const isSelected = selectedWordId === pair.id;

                  return (
                    <button
                      key={pair.id}
                      type="button"
                      disabled={isMatched || isAnswerSubmitted}
                      onClick={() => handleMatchSelect(pair.id, pair.meaning)}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                        isMatched
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-900 line-through opacity-70'
                          : isSelected
                          ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {pair.word}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-black uppercase">Arti Bahasa Indonesia:</span>
                {shuffleArray([...q.matchingPairs]).map((pair) => {
                  const isMatched = Object.values(matchedPairs).includes(pair.meaning);

                  return (
                    <button
                      key={pair.id}
                      type="button"
                      disabled={isMatched || isAnswerSubmitted}
                      onClick={() => selectedWordId && handleMatchSelect(selectedWordId, pair.meaning)}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                        isMatched
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-900 line-through opacity-70'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {pair.meaning}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {q.type === 'essay_spelling' && (
          <form onSubmit={handleAnswerEssay} className="space-y-4">
            {q.clue && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs font-bold text-amber-900">
                {q.clue}
              </div>
            )}

            <div className="space-y-2">
              <label className="font-extrabold text-xs text-slate-700 block uppercase tracking-wider">
                Ketikkan Ejaan Kata Bahasa Inggris Mandiri:
              </label>
              <input
                type="text"
                disabled={isAnswerSubmitted}
                autoFocus
                placeholder="Contoh: mother / analyze..."
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 font-bold text-base md:text-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              />
            </div>

            {!isAnswerSubmitted && (
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/30 active:scale-98 transition-all text-base"
              >
                Kirim Jawaban Ejaan
              </button>
            )}
          </form>
        )}

        {isAnswerSubmitted && (
          <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {isCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" /> : <XCircle className="w-6 h-6 text-rose-600 shrink-0" />}
              <div>
                <h4 className="font-extrabold text-sm md:text-base">
                  {isCorrect ? 'JAWABAN BENAR (+XP Earned)' : 'BELUM TEPAT'}
                </h4>
                <p className="text-xs font-medium mt-0.5">{q.explanation}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextQuestion}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-6 rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 text-base"
            >
              {currentIdx < questions.length - 1 ? 'Lanjut Soal Berikutnya ➡️' : 'Selesaikan Kuis 🎉'}
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
