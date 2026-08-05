import { Word } from '../types';

export interface VoiceItem {
  sentence: string;
  formula: string;
  meaning?: string;
}

export interface ActiveVoice {
  positive: VoiceItem;
  negative: VoiceItem;
  interrogative: VoiceItem;
}

export interface PassiveVoice {
  isApplicable: boolean;
  note?: string;
  positive?: VoiceItem;
  negative?: VoiceItem;
  interrogative?: VoiceItem;
}

export interface ToBeStructure {
  auxiliaryText: string;
  toBeText: string;
  passiveNote?: string;
}

export interface TenseDetail {
  id: number;
  tenseName: string;
  timeSignal: string;
  usageContext: string;
  toBeExplanation: string;
  toBeStructure: ToBeStructure;
  category: 'dasar' | 'tambahan';
  activeVoice: ActiveVoice;
  passiveVoice: PassiveVoice;
}

export interface WordInflections {
  v1: string;
  v1Singular: string;
  v2: string;
  v3: string;
  vIng: string;
}

export interface AffixAnalysis {
  prefix: string;
  prefixMeaning: string;
  suffix: string;
  suffixFunction: string;
  rootWord: string;
  wordFamily: {
    noun: string;
    verb: string;
    adjective: string;
    adverb: string;
  };
}

export interface PhoneticSensitivity {
  initialSound: 'Vowel (Bunyi Vokal)' | 'Consonant (Bunyi Konsonan)';
  article: 'a' | 'an';
  ruleNote: string;
}

export interface PassiveSensitivity {
  isTransitive: boolean;
  explanation: string;
}

export interface SmartTensesResult {
  targetWord: string;
  pos: string;
  transitivity: 'Transitive' | 'Intransitive' | 'Nominal';
  usedVerb: string;
  isDerivedVerb: boolean;
  derivedFromOriginal?: string;
  inflections: WordInflections;
  phoneticSensitivity: PhoneticSensitivity;
  passiveSensitivity: PassiveSensitivity;
  affixAnalysis: AffixAnalysis;
  tensesMatrix: TenseDetail[];
}

const INTRANSITIVE_VERBS = new Set([
  'occur', 'arise', 'disappear', 'erupt', 'rise', 'fall', 'exist',
  'belong', 'arrive', 'depart', 'sleep', 'die', 'happen', 'stay',
  'emerge', 'fluctuate', 'remain', 'succeed', 'hesitate', 'wander',
  'appear', 'collapse', 'deteriorate', 'resonate', 'expire', 'vanish',
  'thrive', 'adapt', 'persist', 'decay', 'walk', 'run', 'swim', 'fly', 'climb'
]);

const IRREGULAR_VERBS: Record<string, [string, string, string]> = {
  be: ["was/were", "been", "being"],
  have: ["had", "had", "having"],
  do: ["did", "done", "doing"],
  say: ["said", "said", "saying"],
  go: ["went", "gone", "going"],
  get: ["got", "gotten", "getting"],
  make: ["made", "made", "making"],
  know: ["knew", "known", "knowing"],
  think: ["thought", "thought", "thinking"],
  take: ["took", "taken", "taking"],
  see: ["saw", "seen", "seeing"],
  come: ["came", "come", "coming"],
  find: ["found", "found", "finding"],
  give: ["gave", "given", "giving"],
  tell: ["told", "told", "telling"],
  become: ["became", "become", "becoming"],
  leave: ["left", "left", "leaving"],
  put: ["put", "put", "putting"],
  mean: ["meant", "meant", "meaning"],
  keep: ["kept", "kept", "keeping"],
  let: ["let", "let", "letting"],
  begin: ["began", "begun", "beginning"],
  show: ["showed", "shown", "showing"],
  hear: ["heard", "heard", "hearing"],
  run: ["ran", "run", "running"],
  bring: ["brought", "brought", "bringing"],
  write: ["wrote", "written", "writing"],
  sit: ["sat", "sat", "sitting"],
  stand: ["stood", "stood", "standing"],
  lose: ["lost", "lost", "losing"],
  pay: ["paid", "paid", "paying"],
  meet: ["met", "met", "meeting"],
  set: ["set", "set", "setting"],
  lead: ["led", "led", "leading"],
  understand: ["understood", "understood", "understanding"],
  speak: ["spoke", "spoken", "speaking"],
  read: ["read", "read", "reading"],
  spend: ["spent", "spent", "spending"],
  grow: ["grew", "grown", "growing"],
  win: ["won", "won", "winning"],
  buy: ["bought", "bought", "buying"],
  build: ["built", "built", "building"],
  fall: ["fell", "fallen", "falling"],
  cut: ["cut", "cut", "cutting"],
  sell: ["sold", "sold", "selling"],
  break: ["broke", "broken", "breaking"],
  drive: ["drove", "driven", "driving"],
  draw: ["drew", "drawn", "drawing"],
  choose: ["chose", "chosen", "choosing"],
  teach: ["taught", "taught", "teaching"],
  catch: ["caught", "caught", "catching"],
  fly: ["flew", "flown", "flying"],
  swim: ["swam", "swum", "swimming"],
  throw: ["threw", "thrown", "throwing"],
  wear: ["wore", "worn", "wearing"],
  sing: ["sang", "sung", "singing"],
  ring: ["rang", "rung", "ringing"],
  drink: ["drank", "drunk", "drinking"],
  eat: ["ate", "eaten", "eating"],
  sleep: ["slept", "slept", "sleeping"],
  forget: ["forgot", "forgotten", "forgetting"],
  forgive: ["forgave", "forgiven", "forgiving"],
  shake: ["shook", "shaken", "shaking"],
  freeze: ["froze", "frozen", "freezing"],
  hide: ["hid", "hidden", "hiding"],
  strike: ["struck", "struck", "striking"],
  bend: ["bent", "bent", "bending"],
  send: ["sent", "sent", "sending"],
  lend: ["lent", "lent", "lending"],
  sweep: ["swept", "swept", "sweeping"],
  creep: ["crept", "crept", "creeping"],
  bleed: ["bled", "bled", "bleeding"],
  feed: ["fed", "fed", "feeding"],
  speed: ["sped", "sped", "speeding"],
  burst: ["burst", "burst", "bursting"],
  cost: ["cost", "cost", "costing"],
  hit: ["hit", "hit", "hitting"],
  hurt: ["hurt", "hurt", "hurting"],
  shut: ["shut", "shut", "shutting"],
  spread: ["spread", "spread", "spreading"],
  split: ["split", "split", "splitting"],
  rise: ["rose", "risen", "rising"],
  arise: ["arose", "arisen", "arising"]
};

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getArticle(wordOrPhrase: string): 'a' | 'an' {
  const w = wordOrPhrase.toLowerCase().trim();
  if (!w) return 'a';

  const silentH = ['honest', 'honor', 'hour', 'heir'];
  if (silentH.some(h => w.startsWith(h))) return 'an';

  const yooSound = ['university', 'useful', 'unique', 'unit', 'european', 'union', 'user'];
  if (yooSound.some(y => w.startsWith(y))) return 'a';

  const vowels = ['a', 'e', 'i', 'o', 'u'];
  if (vowels.includes(w.charAt(0))) return 'an';

  return 'a';
}

function getVerbForms(targetWord: string, wordObj?: Word): WordInflections {
  if (wordObj && wordObj.v1 && wordObj.v2 && wordObj.v3 && wordObj.v_ing && wordObj.v1 !== '-' && wordObj.v2 !== '-') {
    const v1 = wordObj.v1;
    let v1Singular = v1 + 's';
    if (v1.endsWith('y') && !/[aeiou]y$/.test(v1)) {
      v1Singular = v1.slice(0, -1) + 'ies';
    } else if (/[s|x|z|ch|sh|o]$/.test(v1)) {
      v1Singular = v1 + 'es';
    }
    return {
      v1: wordObj.v1,
      v1Singular,
      v2: wordObj.v2,
      v3: wordObj.v3,
      vIng: wordObj.v_ing
    };
  }

  let v = targetWord.toLowerCase().trim();

  if (IRREGULAR_VERBS[v]) {
    const [v2, v3, vIng] = IRREGULAR_VERBS[v];
    let v1Singular = v + 's';
    if (v.endsWith('y') && !/[aeiou]y$/.test(v)) {
      v1Singular = v.slice(0, -1) + 'ies';
    } else if (/[s|x|z|ch|sh|o]$/.test(v)) {
      v1Singular = v + 'es';
    }
    return { v1: v, v1Singular, v2, v3, vIng };
  }

  let v1Singular = v + 's';
  if (v.endsWith('y') && !/[aeiou]y$/.test(v)) {
    v1Singular = v.slice(0, -1) + 'ies';
  } else if (/[s|x|z|ch|sh|o]$/.test(v)) {
    v1Singular = v + 'es';
  }

  let v2 = v + 'ed';
  let v3 = v + 'ed';
  let vIng = v + 'ing';

  const noDoubleConsonants = ['visit', 'listen', 'happen', 'open', 'offer', 'enter', 'answer', 'differ', 'suffer'];

  if (v.endsWith('e')) {
    v2 = v + 'd';
    v3 = v + 'd';
    vIng = v.slice(0, -1) + 'ing';
  } else if (v.endsWith('y') && !/[aeiou]y$/.test(v)) {
    v2 = v.slice(0, -1) + 'ied';
    v3 = v.slice(0, -1) + 'ied';
  } else if (noDoubleConsonants.includes(v)) {
    v2 = v + 'ed';
    v3 = v + 'ed';
    vIng = v + 'ing';
  } else if (/[bcdfghjklmnpqrstvwxz][aeiou][bcdfghjklmnprstvz]$/.test(v) && v.length <= 6) {
    const lastChar = v.slice(-1);
    v2 = v + lastChar + 'ed';
    v3 = v + lastChar + 'ed';
    vIng = v + lastChar + 'ing';
  }

  return { v1: v, v1Singular, v2, v3, vIng };
}

function analyzeAffixes(wordObj: Word): AffixAnalysis {
  const w = wordObj.word.toLowerCase().trim();

  let prefix = '-';
  let prefixMeaning = 'Tidak ada awalan khusus (Root Word)';
  let suffix = '-';
  let suffixFunction = 'Bentuk kata dasar';

  if (w.startsWith('re')) {
    prefix = 'Re-';
    prefixMeaning = 'Melakukan kembali / ulang (Again/Back)';
  } else if (w.startsWith('un')) {
    prefix = 'Un-';
    prefixMeaning = 'Kebalikan / Tidak (Not/Opposite)';
  } else if (w.startsWith('dis')) {
    prefix = 'Dis-';
    prefixMeaning = 'Kebalikan / Tidak menyukai (Not/Reverse)';
  } else if (w.startsWith('pre')) {
    prefix = 'Pre-';
    prefixMeaning = 'Sebelum / Awal (Before)';
  }

  if (w.endsWith('tion') || w.endsWith('sion')) {
    suffix = '-tion / -sion';
    suffixFunction = 'Akhiran Kata Benda (Noun Form - Proses/Hasil)';
  } else if (w.endsWith('ment')) {
    suffix = '-ment';
    suffixFunction = 'Akhiran Kata Benda (Noun Form - Hasil/Keadaan)';
  } else if (w.endsWith('able') || w.endsWith('ible')) {
    suffix = '-able / -ible';
    suffixFunction = 'Akhiran Kata Sifat (Adjective Form - Dapat dilakukan)';
  } else if (w.endsWith('ive')) {
    suffix = '-ive';
    suffixFunction = 'Akhiran Kata Sifat (Adjective Form - Bersifat)';
  } else if (w.endsWith('ly')) {
    suffix = '-ly';
    suffixFunction = 'Akhiran Kata Keterangan (Adverb Form - Dengan cara)';
  } else if (w.endsWith('ize') || w.endsWith('ise')) {
    suffix = '-ize';
    suffixFunction = 'Akhiran Kata Kerja (Verb Form - Menjadikan)';
  } else if (w.endsWith('ness') || w.endsWith('ity')) {
    suffix = '-ness / -ity';
    suffixFunction = 'Akhiran Kata Benda (Noun Form - Kualitas/Sifat)';
  }

  return {
    prefix: wordObj.prefix_info ? wordObj.prefix_info : prefix,
    prefixMeaning,
    suffix: wordObj.suffix_info ? wordObj.suffix_info : suffix,
    suffixFunction,
    rootWord: wordObj.word,
    wordFamily: {
      noun: wordObj.noun_family || '-',
      verb: wordObj.verb_family || '-',
      adjective: wordObj.adj_family || '-',
      adverb: wordObj.adv_family || '-'
    }
  };
}

interface NaturalContext {
  usedVerb: string;
  subject: string;
  object: string;
  meaningVerbID: string;
  transitivity: 'Transitive' | 'Intransitive' | 'Nominal';
  isDerivedVerb: boolean;
  derivedFromOriginal?: string;
}

function getNaturalContext(wordObj: Word): NaturalContext {
  const rawPos = (wordObj.pos || '').toLowerCase();
  const wordLower = wordObj.word.toLowerCase().trim();
  const meaning = (wordObj.meaning_id || '').toLowerCase();
  const isMainVerb = rawPos.includes('verb') || rawPos.includes('v.');

  // 1. MAIN VERBS
  if (isMainVerb) {
    const isIntransitive = wordObj.verb_type === 'intransitive' || INTRANSITIVE_VERBS.has(wordLower);
    const transitivity: 'Transitive' | 'Intransitive' | 'Nominal' = isIntransitive ? 'Intransitive' : 'Transitive';

    if (wordLower === 'walk' || wordLower === 'run' || wordLower === 'travel' || wordLower === 'hike') {
      return {
        usedVerb: wordLower,
        subject: 'The student',
        object: 'to the university campus',
        meaningVerbID: meaning || 'berjalan',
        transitivity: 'Intransitive',
        isDerivedVerb: false
      };
    }
    if (wordLower === 'cook' || wordLower === 'prepare' || wordLower === 'bake') {
      return {
        usedVerb: wordLower,
        subject: 'The chef',
        object: 'a delicious gourmet dish',
        meaningVerbID: meaning || 'memasak',
        transitivity: 'Transitive',
        isDerivedVerb: false
      };
    }
    if (wordLower === 'study' || wordLower === 'learn' || wordLower === 'read' || wordLower === 'memorize') {
      return {
        usedVerb: wordLower,
        subject: 'The candidate',
        object: 'the PTE academic vocabulary',
        meaningVerbID: meaning || 'mempelajari',
        transitivity: 'Transitive',
        isDerivedVerb: false
      };
    }
    if (wordLower === 'write' || wordLower === 'compose' || wordLower === 'draft' || wordLower === 'publish') {
      return {
        usedVerb: wordLower,
        subject: 'The academic author',
        object: 'the research manuscript',
        meaningVerbID: meaning || 'menulis',
        transitivity: 'Transitive',
        isDerivedVerb: false
      };
    }
    if (wordLower === 'teach' || wordLower === 'guide' || wordLower === 'instruct' || wordLower === 'lecture') {
      return {
        usedVerb: wordLower,
        subject: 'The professor',
        object: 'undergraduate students',
        meaningVerbID: meaning || 'mengajar',
        transitivity: 'Transitive',
        isDerivedVerb: false
      };
    }
    if (wordLower === 'develop' || wordLower === 'build' || wordLower === 'create' || wordLower === 'design') {
      return {
        usedVerb: wordLower,
        subject: 'The software engineer',
        object: 'an innovative application',
        meaningVerbID: meaning || 'mengembangkan',
        transitivity: 'Transitive',
        isDerivedVerb: false
      };
    }
    if (wordLower === 'analyze' || wordLower === 'examine' || wordLower === 'investigate' || wordLower === 'inspect') {
      return {
        usedVerb: wordLower,
        subject: 'The data scientist',
        object: 'the experimental dataset',
        meaningVerbID: meaning || 'menganalisis',
        transitivity: 'Transitive',
        isDerivedVerb: false
      };
    }
    if (wordLower === 'occur' || wordLower === 'happen' || wordLower === 'arise' || wordLower === 'exist' || wordLower === 'disappear') {
      return {
        usedVerb: wordLower,
        subject: 'The natural phenomenon',
        object: '',
        meaningVerbID: meaning || 'terjadi',
        transitivity: 'Intransitive',
        isDerivedVerb: false
      };
    }

    // Default for other main verbs
    return {
      usedVerb: wordLower,
      subject: 'The scholar',
      object: isIntransitive ? '' : 'the academic assignment',
      meaningVerbID: meaning || 'melakukan',
      transitivity,
      isDerivedVerb: false
    };
  }

  // 2. PEOPLE / FAMILY / ROLES NOUNS
  const peopleKeywords = ['mother', 'father', 'parent', 'child', 'niece', 'nephew', 'son', 'daughter', 'brother', 'sister', 'aunt', 'uncle', 'cousin', 'friend', 'doctor', 'patient', 'teacher', 'student', 'client', 'customer'];
  if (peopleKeywords.some(k => wordLower.includes(k)) || rawPos.includes('person')) {
    if (wordLower.includes('doctor')) {
      return {
        usedVerb: 'consult',
        subject: 'The patient',
        object: 'the specialist doctor',
        meaningVerbID: 'berkonsultasi dengan dokter',
        transitivity: 'Transitive',
        isDerivedVerb: true,
        derivedFromOriginal: `${wordObj.word} (${wordObj.pos})`
      };
    }
    if (wordLower.includes('teacher') || wordLower.includes('instructor')) {
      return {
        usedVerb: 'consult',
        subject: 'The student',
        object: 'the subject instructor',
        meaningVerbID: 'berkonsultasi dengan guru',
        transitivity: 'Transitive',
        isDerivedVerb: true,
        derivedFromOriginal: `${wordObj.word} (${wordObj.pos})`
      };
    }
    if (wordLower.includes('customer') || wordLower.includes('client')) {
      return {
        usedVerb: 'serve',
        subject: 'The manager',
        object: `the loyal ${wordLower}`,
        meaningVerbID: `melayani ${meaning || wordLower}`,
        transitivity: 'Transitive',
        isDerivedVerb: true,
        derivedFromOriginal: `${wordObj.word} (${wordObj.pos})`
      };
    }
    // Family default
    return {
      usedVerb: 'visit',
      subject: 'My friend',
      object: `his ${wordLower}`,
      meaningVerbID: `mengunjungi ${meaning || wordLower}`,
      transitivity: 'Transitive',
      isDerivedVerb: true,
      derivedFromOriginal: `${wordObj.word} (${wordObj.pos})`
    };
  }

  // 3. ABSTRACT / CONCEPT / SYSTEM NOUNS
  if (rawPos.includes('noun')) {
    if (wordLower.includes('system') || wordLower.includes('network') || wordLower.includes('software')) {
      return {
        usedVerb: 'upgrade',
        subject: 'The IT department',
        object: `the ${wordLower}`,
        meaningVerbID: `meningkatkan ${meaning || wordLower}`,
        transitivity: 'Transitive',
        isDerivedVerb: true,
        derivedFromOriginal: `${wordObj.word} (${wordObj.pos})`
      };
    }
    if (wordLower.includes('policy') || wordLower.includes('rule') || wordLower.includes('law') || wordLower.includes('strategy')) {
      return {
        usedVerb: 'implement',
        subject: 'The committee',
        object: `the new ${wordLower}`,
        meaningVerbID: `menerapkan ${meaning || wordLower}`,
        transitivity: 'Transitive',
        isDerivedVerb: true,
        derivedFromOriginal: `${wordObj.word} (${wordObj.pos})`
      };
    }
    if (wordLower.includes('book') || wordLower.includes('paper') || wordLower.includes('report') || wordLower.includes('article')) {
      return {
        usedVerb: 'publish',
        subject: 'The university press',
        object: `the academic ${wordLower}`,
        meaningVerbID: `menerbitkan ${meaning || wordLower}`,
        transitivity: 'Transitive',
        isDerivedVerb: true,
        derivedFromOriginal: `${wordObj.word} (${wordObj.pos})`
      };
    }
    if (wordLower.includes('childhood') || wordLower.includes('memory') || wordLower.includes('history') || wordLower.includes('experience')) {
      return {
        usedVerb: 'cherish',
        subject: 'The student',
        object: `the fond ${wordLower}`,
        meaningVerbID: `menghargai ${meaning || wordLower}`,
        transitivity: 'Transitive',
        isDerivedVerb: true,
        derivedFromOriginal: `${wordObj.word} (${wordObj.pos})`
      };
    }

    // Noun default
    return {
      usedVerb: 'develop',
      subject: 'The research team',
      object: `the ${wordLower} framework`,
      meaningVerbID: `mengembangkan kerangka ${meaning || wordLower}`,
      transitivity: 'Transitive',
      isDerivedVerb: true,
      derivedFromOriginal: `${wordObj.word} (${wordObj.pos})`
    };
  }

  // 4. ADJECTIVES (EMOTION VS ATTRIBUTE)
  if (rawPos.includes('adj')) {
    const emotionKeywords = ['happy', 'sad', 'glad', 'proud', 'anxious', 'confident', 'curious', 'eager', 'nervous', 'calm'];
    if (emotionKeywords.some(e => wordLower.includes(e))) {
      return {
        usedVerb: 'feel',
        subject: 'The candidate',
        object: wordLower,
        meaningVerbID: `merasa ${meaning || wordLower}`,
        transitivity: 'Nominal',
        isDerivedVerb: true,
        derivedFromOriginal: `${wordObj.word} (${wordObj.pos})`
      };
    }
    return {
      usedVerb: 'consider',
      subject: 'The review panel',
      object: `the proposal ${wordLower}`,
      meaningVerbID: `menganggap ${meaning || wordLower}`,
      transitivity: 'Transitive',
      isDerivedVerb: true,
      derivedFromOriginal: `${wordObj.word} (${wordObj.pos})`
    };
  }

  // 5. ADVERBS
  return {
    usedVerb: 'explain',
    subject: 'The lecturer',
    object: `the concept ${wordLower}`,
    meaningVerbID: `menjelaskan konsep secara ${meaning || wordLower}`,
    transitivity: 'Transitive',
    isDerivedVerb: true,
    derivedFromOriginal: `${wordObj.word} (${wordObj.pos})`
  };
}

export function generateSmartTenses(wordObj: Word): SmartTensesResult {
  const wordLower = wordObj.word.toLowerCase().trim();
  const context = getNaturalContext(wordObj);

  const { usedVerb, subject: S, object: O, meaningVerbID, transitivity, isDerivedVerb, derivedFromOriginal } = context;

  const inflections = getVerbForms(usedVerb, wordObj);
  const affixAnalysis = analyzeAffixes(wordObj);

  const isVowelInitial = ['a', 'e', 'i', 'o', 'u'].includes(wordLower.charAt(0)) || ['/æ/', '/eɪ/', '/ɪ/', '/aɪ/', '/ɒ/', '/ʌ/', '/uː/', '/ɛ/', '/ɔː/', '/iː/'].some(ipa => (wordObj.ipa || '').includes(ipa));
  const phoneticSensitivity: PhoneticSensitivity = {
    initialSound: isVowelInitial ? 'Vowel (Bunyi Vokal)' : 'Consonant (Bunyi Konsonan)',
    article: getArticle(wordObj.word),
    ruleNote: isVowelInitial
      ? `Kata '${wordObj.word}' diawali dengan bunyi VOKAL (${wordObj.ipa || 'vowel'}). Artikel yang sesuai adalah 'an' (an ${wordObj.word}).`
      : `Kata '${wordObj.word}' diawali dengan bunyi KONSONAN (${wordObj.ipa || 'consonant'}). Artikel yang sesuai adalah 'a' (a ${wordObj.word}).`
  };

  const passiveSensitivity: PassiveSensitivity = {
    isTransitive: transitivity === 'Transitive',
    explanation: transitivity === 'Transitive'
      ? 'Kata kerja ini bertipe TRANSITIF (membutuhkan objek penderita). Oleh karena itu, kata ini DAPAT diubah menjadi bentuk Pasif Voice (+, -, ?).'
      : transitivity === 'Nominal'
      ? `Kata ini bertipe ${wordObj.pos.toUpperCase()}. Menggunakan struktur Nominal To Be. Kalimat nominal tidak memiliki bentuk Pasif Transitif.`
      : 'Kata kerja ini bertipe INTRANSITIF (tidak memerlukan objek penderita). Dalam tata bahasa Inggris baku, kata ini TIDAK BISA diubah menjadi bentuk Pasif Voice.'
  };

  const sLower = S.toLowerCase();
  const oLower = O.toLowerCase();
  const O_Cap = capitalize(O);

  const sentenceInflections = getVerbForms(usedVerb);
  const { v1, v1Singular, v2, v3, vIng } = sentenceInflections;
  const isApplicablePassive = transitivity === 'Transitive' && O.length > 0;

  const tensesMatrix: TenseDetail[] = [
    // 1. Simple Present
    {
      id: 1,
      tenseName: 'Simple Present Tense',
      timeSignal: 'every day, routinely, as a rule',
      usageContext: 'Menyatakan fakta umum, kebenaran mutlak, atau kebiasaan rutin.',
      toBeExplanation: 'Auxiliary Verb: "do / does" (does: He/She/It/Subjek Tunggal, do: I/You/We/They/Subjek Jamak). To Be (Nomina & Pasif): "is / am / are" (is: Tunggal, am: I, are: Jamak).',
      toBeStructure: {
        auxiliaryText: 'do / does → (does: He/She/It/Tunggal, do: I/You/We/They/Jamak)',
        toBeText: 'is / am / are → (is: Tunggal, am: I, are: Jamak)',
        passiveNote: 'Digunakan pada kalimat aktif (- / ?) dan bentuk pasif / nominal.'
      },
      category: 'dasar',
      activeVoice: {
        positive: {
          formula: '(+) S + V1(s/es) + O',
          sentence: `${S} ${v1Singular} ${O} every day.`.trim(),
          meaning: `${S} ${meaningVerbID} ${O} setiap hari.`.replace(/\s+/g, ' ').trim()
        },
        negative: {
          formula: '(-) S + does/do + not + V1 + O',
          sentence: `${S} does not ${v1} ${O} every day.`.trim()
        },
        interrogative: {
          formula: '(?) Does/Do + S + V1 + O?',
          sentence: `Does ${sLower} ${v1} ${O} every day?`.trim()
        }
      },
      passiveVoice: {
        isApplicable: isApplicablePassive,
        note: !isApplicablePassive ? 'N/A (Bukan Kata Kerja Transitif - Tidak Memiliki Bentuk Pasif dalam Bahasa Inggris)' : undefined,
        positive: isApplicablePassive ? {
          formula: '(+) S + am/is/are + V3 + by Agent',
          sentence: `${O_Cap} is ${v3} by ${sLower} every day.`.trim(),
          meaning: `${O_Cap} di-${v3} oleh ${sLower} setiap hari.`
        } : undefined,
        negative: isApplicablePassive ? {
          formula: '(-) S + am/is/are + not + V3',
          sentence: `${O_Cap} is not ${v3} by ${sLower} every day.`.trim()
        } : undefined,
        interrogative: isApplicablePassive ? {
          formula: '(?) Am/Is/Are + S + V3?',
          sentence: `Is ${oLower} ${v3} by ${sLower} every day?`.trim()
        } : undefined
      }
    },

    // 2. Present Continuous
    {
      id: 2,
      tenseName: 'Present Continuous Tense',
      timeSignal: 'right now, at present, currently',
      usageContext: 'Menyatakan aksi atau proses yang sedang berlangsung saat ini.',
      toBeExplanation: 'To Be: "is / am / are" + V-ing (is: He/She/It, am: I, are: You/We/They). Bentuk Pasif ditambahkan "being" + V3.',
      toBeStructure: {
        auxiliaryText: 'is / am / are + V-ing → (is: He/She/It/Tunggal, am: I, are: You/We/They/Jamak)',
        toBeText: 'is being / am being / are being + V3 (Bentuk Pasif)',
        passiveNote: 'Menyatakan proses yang sedang dialami objek saat ini.'
      },
      category: 'dasar',
      activeVoice: {
        positive: {
          formula: '(+) S + am/is/are + V-ing + O',
          sentence: `${S} is ${vIng} ${O} right now.`.trim(),
          meaning: `${S} sedang ${meaningVerbID} ${O} saat ini.`.replace(/\s+/g, ' ').trim()
        },
        negative: {
          formula: '(-) S + am/is/are + not + V-ing + O',
          sentence: `${S} is not ${vIng} ${O} right now.`.trim()
        },
        interrogative: {
          formula: '(?) Am/Is/Are + S + V-ing + O?',
          sentence: `Is ${sLower} ${vIng} ${O} right now?`.trim()
        }
      },
      passiveVoice: {
        isApplicable: isApplicablePassive,
        note: !isApplicablePassive ? 'N/A (Bukan Kata Kerja Transitif - Tidak Memiliki Bentuk Pasif dalam Bahasa Inggris)' : undefined,
        positive: isApplicablePassive ? {
          formula: '(+) S + am/is/are + being + V3',
          sentence: `${O_Cap} is being ${v3} by ${sLower} right now.`.trim(),
          meaning: `${O_Cap} sedang di-${v3} oleh ${sLower} saat ini.`
        } : undefined,
        negative: isApplicablePassive ? {
          formula: '(-) S + am/is/are + not + being + V3',
          sentence: `${O_Cap} is not being ${v3} by ${sLower} right now.`.trim()
        } : undefined,
        interrogative: isApplicablePassive ? {
          formula: '(?) Am/Is/Are + S + being + V3?',
          sentence: `Is ${oLower} being ${v3} by ${sLower} right now?`.trim()
        } : undefined
      }
    },

    // 3. Present Perfect
    {
      id: 3,
      tenseName: 'Present Perfect Tense',
      timeSignal: 'already, recently, so far',
      usageContext: 'Menyatakan aksi yang telah selesai dan efeknya masih terasa hingga saat ini.',
      toBeExplanation: 'Auxiliary Verb: "has / have" + V3 (has: He/She/It/Tunggal, have: I/You/We/They/Jamak). Bentuk Pasif ditambahkan "been" + V3.',
      toBeStructure: {
        auxiliaryText: 'has / have + V3 → (has: He/She/It/Tunggal, have: I/You/We/They/Jamak)',
        toBeText: 'has been / have been + V3 (Bentuk Pasif)',
        passiveNote: 'Menyatakan bahwa objek telah menerima aksi tersebut.'
      },
      category: 'dasar',
      activeVoice: {
        positive: {
          formula: '(+) S + has/have + V3 + O',
          sentence: `${S} has ${v3} ${O} recently.`.trim(),
          meaning: `${S} telah ${meaningVerbID} ${O} baru-baru ini.`.replace(/\s+/g, ' ').trim()
        },
        negative: {
          formula: '(-) S + has/have + not + V3 + O',
          sentence: `${S} has not ${v3} ${O} recently.`.trim()
        },
        interrogative: {
          formula: '(?) Has/Have + S + V3 + O?',
          sentence: `Has ${sLower} ${v3} ${O} recently?`.trim()
        }
      },
      passiveVoice: {
        isApplicable: isApplicablePassive,
        note: !isApplicablePassive ? 'N/A (Bukan Kata Kerja Transitif - Tidak Memiliki Bentuk Pasif dalam Bahasa Inggris)' : undefined,
        positive: isApplicablePassive ? {
          formula: '(+) S + has/have + been + V3',
          sentence: `${O_Cap} has been ${v3} by ${sLower} recently.`.trim(),
          meaning: `${O_Cap} telah di-${v3} oleh ${sLower} baru-baru ini.`
        } : undefined,
        negative: isApplicablePassive ? {
          formula: '(-) S + has/have + not + been + V3',
          sentence: `${O_Cap} has not been ${v3} by ${sLower} recently.`.trim()
        } : undefined,
        interrogative: isApplicablePassive ? {
          formula: '(?) Has/Have + S + been + V3?',
          sentence: `Has ${oLower} been ${v3} by ${sLower} recently?`.trim()
        } : undefined
      }
    },

    // 4. Simple Past
    {
      id: 4,
      tenseName: 'Simple Past Tense',
      timeSignal: 'yesterday, last week, two days ago',
      usageContext: 'Menyatakan aksi yang terjadi dan selesai sepenuhnya di masa lampau.',
      toBeExplanation: 'Auxiliary Verb: "did" (pada kalimat - & ?). To Be (Nomina & Pasif): "was / were" (was: I/He/She/It/Tunggal, were: You/We/They/Jamak).',
      toBeStructure: {
        auxiliaryText: 'did → (Berlaku untuk semua subjek pada kalimat aktif - & ?)',
        toBeText: 'was / were → (was: Tunggal/I/He/She/It, were: Jamak/You/We/They)',
        passiveNote: 'Digunakan untuk aksi masa lalu yang sudah selesai.'
      },
      category: 'dasar',
      activeVoice: {
        positive: {
          formula: '(+) S + V2 + O',
          sentence: `${S} ${v2} ${O} yesterday.`.trim(),
          meaning: `${S} ${meaningVerbID} ${O} kemarin.`.replace(/\s+/g, ' ').trim()
        },
        negative: {
          formula: '(-) S + did + not + V1 + O',
          sentence: `${S} did not ${v1} ${O} yesterday.`.trim()
        },
        interrogative: {
          formula: '(?) Did + S + V1 + O?',
          sentence: `Did ${sLower} ${v1} ${O} yesterday?`.trim()
        }
      },
      passiveVoice: {
        isApplicable: isApplicablePassive,
        note: !isApplicablePassive ? 'N/A (Bukan Kata Kerja Transitif - Tidak Memiliki Bentuk Pasif dalam Bahasa Inggris)' : undefined,
        positive: isApplicablePassive ? {
          formula: '(+) S + was/were + V3 + by Agent',
          sentence: `${O_Cap} was ${v3} by ${sLower} yesterday.`.trim(),
          meaning: `${O_Cap} di-${v3} oleh ${sLower} kemarin.`
        } : undefined,
        negative: isApplicablePassive ? {
          formula: '(-) S + was/were + not + V3',
          sentence: `${O_Cap} was not ${v3} by ${sLower} yesterday.`.trim()
        } : undefined,
        interrogative: isApplicablePassive ? {
          formula: '(?) Was/Were + S + V3?',
          sentence: `Was ${oLower} ${v3} by ${sLower} yesterday?`.trim()
        } : undefined
      }
    },

    // 5. Simple Future
    {
      id: 5,
      tenseName: 'Simple Future Tense',
      timeSignal: 'tomorrow, next week, soon',
      usageContext: 'Menyatakan janji, keputusan spontan, atau prediksi masa depan.',
      toBeExplanation: 'Auxiliary Verb: "will" + V1. Bentuk Pasif / Nomina: "will be" + V3 / Kata Sifat.',
      toBeStructure: {
        auxiliaryText: 'will + V1 → (Berlaku untuk seluruh subjek)',
        toBeText: 'will be + V3 (Bentuk Pasif / Nomina)',
        passiveNote: 'Menyatakan rencana atau kejadian di masa mendatang.'
      },
      category: 'dasar',
      activeVoice: {
        positive: {
          formula: '(+) S + will + V1 + O',
          sentence: `${S} will ${v1} ${O} tomorrow.`.trim(),
          meaning: `${S} akan ${meaningVerbID} ${O} besok.`.replace(/\s+/g, ' ').trim()
        },
        negative: {
          formula: '(-) S + will + not + V1 + O',
          sentence: `${S} will not ${v1} ${O} tomorrow.`.trim()
        },
        interrogative: {
          formula: '(?) Will + S + V1 + O?',
          sentence: `Will ${sLower} ${v1} ${O} tomorrow?`.trim()
        }
      },
      passiveVoice: {
        isApplicable: isApplicablePassive,
        note: !isApplicablePassive ? 'N/A (Bukan Kata Kerja Transitif - Tidak Memiliki Bentuk Pasif dalam Bahasa Inggris)' : undefined,
        positive: isApplicablePassive ? {
          formula: '(+) S + will be + V3',
          sentence: `${O_Cap} will be ${v3} by ${sLower} tomorrow.`.trim(),
          meaning: `${O_Cap} akan di-${v3} oleh ${sLower} besok.`
        } : undefined,
        negative: isApplicablePassive ? {
          formula: '(-) S + will not be + V3',
          sentence: `${O_Cap} will not be ${v3} by ${sLower} tomorrow.`.trim()
        } : undefined,
        interrogative: isApplicablePassive ? {
          formula: '(?) Will + S + be + V3?',
          sentence: `Will ${oLower} be ${v3} by ${sLower} tomorrow?`.trim()
        } : undefined
      }
    },

    // 6. Past Continuous
    {
      id: 6,
      tenseName: 'Past Continuous Tense',
      timeSignal: 'at 8 PM last night, when the alarm rang',
      usageContext: 'Menyatakan aksi yang sedang berlangsung pada titik waktu tertentu di masa lalu.',
      toBeExplanation: 'To Be: "was / were" + V-ing (was: I/He/She/It, were: You/We/They). Pasif: "was/were being" + V3.',
      toBeStructure: {
        auxiliaryText: 'was / were + V-ing → (was: I/He/She/It/Tunggal, were: You/We/They/Jamak)',
        toBeText: 'was being / were being + V3 (Bentuk Pasif)',
        passiveNote: 'Proses yang sedang dialami objek pada saat tertentu di masa lalu.'
      },
      category: 'tambahan',
      activeVoice: {
        positive: {
          formula: '(+) S + was/were + V-ing + O',
          sentence: `${S} was ${vIng} ${O} at 8 PM last night.`.trim(),
          meaning: `${S} sedang ${meaningVerbID} ${O} pada jam 8 malam kemarin.`.replace(/\s+/g, ' ').trim()
        },
        negative: {
          formula: '(-) S + was/were + not + V-ing + O',
          sentence: `${S} was not ${vIng} ${O} at 8 PM last night.`.trim()
        },
        interrogative: {
          formula: '(?) Was/Were + S + V-ing + O?',
          sentence: `Was ${sLower} ${vIng} ${O} at 8 PM last night?`.trim()
        }
      },
      passiveVoice: {
        isApplicable: isApplicablePassive,
        note: !isApplicablePassive ? 'N/A (Bukan Kata Kerja Transitif)' : undefined,
        positive: isApplicablePassive ? {
          formula: '(+) S + was/were + being + V3',
          sentence: `${O_Cap} was being ${v3} by ${sLower} at 8 PM last night.`.trim(),
          meaning: `${O_Cap} sedang di-${v3} oleh ${sLower} pada jam 8 malam kemarin.`
        } : undefined,
        negative: isApplicablePassive ? {
          formula: '(-) S + was/were + not + being + V3',
          sentence: `${O_Cap} was not being ${v3} by ${sLower} at 8 PM last night.`.trim()
        } : undefined,
        interrogative: isApplicablePassive ? {
          formula: '(?) Was/Were + S + being + V3?',
          sentence: `Was ${oLower} being ${v3} by ${sLower} at 8 PM last night?`.trim()
        } : undefined
      }
    },

    // 7. Past Perfect
    {
      id: 7,
      tenseName: 'Past Perfect Tense',
      timeSignal: 'before the deadline, by the time',
      usageContext: 'Menyatakan aksi yang sudah selesai sebelum kejadian lain terjadi di masa lalu.',
      toBeExplanation: 'Auxiliary Verb: "had" + V3. Pasif: "had been" + V3.',
      toBeStructure: {
        auxiliaryText: 'had + V3 → (Berlaku untuk seluruh subjek)',
        toBeText: 'had been + V3 (Bentuk Pasif)',
        passiveNote: 'Menunjukkan prioritas waktu yang lebih lampau.'
      },
      category: 'tambahan',
      activeVoice: {
        positive: {
          formula: '(+) S + had + V3 + O',
          sentence: `${S} had ${v3} ${O} before the deadline.`.trim(),
          meaning: `${S} telah ${meaningVerbID} ${O} sebelum tenggat waktu.`.replace(/\s+/g, ' ').trim()
        },
        negative: {
          formula: '(-) S + had + not + V3 + O',
          sentence: `${S} had not ${v3} ${O} before the deadline.`.trim()
        },
        interrogative: {
          formula: '(?) Had + S + V3 + O?',
          sentence: `Had ${sLower} ${v3} ${O} before the deadline?`.trim()
        }
      },
      passiveVoice: {
        isApplicable: isApplicablePassive,
        note: !isApplicablePassive ? 'N/A (Bukan Kata Kerja Transitif)' : undefined,
        positive: isApplicablePassive ? {
          formula: '(+) S + had + been + V3',
          sentence: `${O_Cap} had been ${v3} by ${sLower} before the deadline.`.trim(),
          meaning: `${O_Cap} telah di-${v3} oleh ${sLower} sebelum tenggat waktu.`
        } : undefined,
        negative: isApplicablePassive ? {
          formula: '(-) S + had + not + been + V3',
          sentence: `${O_Cap} had not been ${v3} by ${sLower} before the deadline.`.trim()
        } : undefined,
        interrogative: isApplicablePassive ? {
          formula: '(?) Had + S + been + V3?',
          sentence: `Had ${oLower} been ${v3} by ${sLower} before the deadline?`.trim()
        } : undefined
      }
    },

    // 8. Future Continuous
    {
      id: 8,
      tenseName: 'Future Continuous Tense',
      timeSignal: 'at 10 AM tomorrow, this time next week',
      usageContext: 'Menyatakan aksi yang akan sedang berlangsung pada titik waktu tertentu di masa depan.',
      toBeExplanation: 'Auxiliary Verb: "will be" + V-ing.',
      toBeStructure: {
        auxiliaryText: 'will be + V-ing → (Berlaku untuk seluruh subjek)',
        toBeText: 'will be being + V3 (Bentuk Pasif Jarang)',
        passiveNote: 'Aksi yang sedang dalam proses di masa mendatang.'
      },
      category: 'tambahan',
      activeVoice: {
        positive: {
          formula: '(+) S + will be + V-ing + O',
          sentence: `${S} will be ${vIng} ${O} at 10 AM tomorrow.`.trim(),
          meaning: `${S} akan sedang ${meaningVerbID} ${O} jam 10 pagi besok.`.replace(/\s+/g, ' ').trim()
        },
        negative: {
          formula: '(-) S + will not be + V-ing + O',
          sentence: `${S} will not be ${vIng} ${O} at 10 AM tomorrow.`.trim()
        },
        interrogative: {
          formula: '(?) Will + S + be + V-ing + O?',
          sentence: `Will ${sLower} be ${vIng} ${O} at 10 AM tomorrow?`.trim()
        }
      },
      passiveVoice: {
        isApplicable: isApplicablePassive,
        note: !isApplicablePassive ? 'N/A (Bukan Kata Kerja Transitif)' : undefined,
        positive: isApplicablePassive ? {
          formula: '(+) S + will be + being + V3',
          sentence: `${O_Cap} will be being ${v3} by ${sLower} at 10 AM tomorrow.`.trim(),
          meaning: `${O_Cap} akan sedang di-${v3} oleh ${sLower} jam 10 pagi besok.`
        } : undefined,
        negative: isApplicablePassive ? {
          formula: '(-) S + will not be + being + V3',
          sentence: `${O_Cap} will not be being ${v3} by ${sLower} at 10 AM tomorrow.`.trim()
        } : undefined,
        interrogative: isApplicablePassive ? {
          formula: '(?) Will + S + be + being + V3?',
          sentence: `Will ${oLower} be being ${v3} by ${sLower} at 10 AM tomorrow?`.trim()
        } : undefined
      }
    },

    // 9. Future Perfect
    {
      id: 9,
      tenseName: 'Future Perfect Tense',
      timeSignal: 'by next month, by the end of this year',
      usageContext: 'Menyatakan aksi yang ditargetkan selesai sepenuhnya pada tenggat waktu tertentu di masa depan.',
      toBeExplanation: 'Auxiliary Verb: "will have" + V3. Pasif: "will have been" + V3.',
      toBeStructure: {
        auxiliaryText: 'will have + V3 → (Berlaku untuk seluruh subjek)',
        toBeText: 'will have been + V3 (Bentuk Pasif)',
        passiveNote: 'Menyatakan kepastian target waktu penyelesaian.'
      },
      category: 'tambahan',
      activeVoice: {
        positive: {
          formula: '(+) S + will have + V3 + O',
          sentence: `${S} will have ${v3} ${O} by next month.`.trim(),
          meaning: `${S} akan telah ${meaningVerbID} ${O} menjelang bulan depan.`.replace(/\s+/g, ' ').trim()
        },
        negative: {
          formula: '(-) S + will not have + V3 + O',
          sentence: `${S} will not have ${v3} ${O} by next month.`.trim()
        },
        interrogative: {
          formula: '(?) Will + S + have + V3 + O?',
          sentence: `Will ${sLower} have ${v3} ${O} by next month?`.trim()
        }
      },
      passiveVoice: {
        isApplicable: isApplicablePassive,
        note: !isApplicablePassive ? 'N/A (Bukan Kata Kerja Transitif)' : undefined,
        positive: isApplicablePassive ? {
          formula: '(+) S + will have + been + V3',
          sentence: `${O_Cap} will have been ${v3} by ${sLower} by next month.`.trim(),
          meaning: `${O_Cap} akan telah di-${v3} oleh ${sLower} menjelang bulan depan.`
        } : undefined,
        negative: isApplicablePassive ? {
          formula: '(-) S + will not have + been + V3',
          sentence: `${O_Cap} will not have been ${v3} by ${sLower} by next month.`.trim()
        } : undefined,
        interrogative: isApplicablePassive ? {
          formula: '(?) Will + S + have + been + V3?',
          sentence: `Will ${oLower} have been ${v3} by ${sLower} by next month?`.trim()
        } : undefined
      }
    }
  ];

  return {
    targetWord: wordObj.word,
    pos: wordObj.pos,
    transitivity,
    usedVerb,
    isDerivedVerb,
    derivedFromOriginal,
    inflections,
    phoneticSensitivity,
    passiveSensitivity,
    affixAnalysis,
    tensesMatrix
  };
}
