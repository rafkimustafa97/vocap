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
  'thrive', 'adapt', 'persist', 'decay'
]);

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
  if (wordObj && wordObj.v1 && wordObj.v2 && wordObj.v3 && wordObj.v_ing && wordObj.v1 !== '-') {
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

  let baseWord = targetWord.toLowerCase().trim();
  if (wordObj && wordObj.verb_family && wordObj.verb_family !== '-') {
    const cleanFam = wordObj.verb_family.split(' ')[0].split('(')[0].toLowerCase().trim();
    if (cleanFam && cleanFam !== '-') {
      baseWord = cleanFam;
    }
  }

  const v = baseWord;

  let v1Singular = v + 's';
  if (v.endsWith('y') && !/[aeiou]y$/.test(v)) {
    v1Singular = v.slice(0, -1) + 'ies';
  } else if (/[s|x|z|ch|sh|o]$/.test(v)) {
    v1Singular = v + 'es';
  }

  let v2 = v + 'ed';
  let v3 = v + 'ed';
  let vIng = v + 'ing';

  if (v.endsWith('e')) {
    v2 = v + 'd';
    v3 = v + 'd';
    vIng = v.slice(0, -1) + 'ing';
  } else if (v.endsWith('y') && !/[aeiou]y$/.test(v)) {
    v2 = v.slice(0, -1) + 'ied';
    v3 = v.slice(0, -1) + 'ied';
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
    prefixMeaning = 'Tidak / Terpisah (Not/Apart)';
  } else if (w.startsWith('in') || w.startsWith('im')) {
    prefix = w.startsWith('im') ? 'Im-' : 'In-';
    prefixMeaning = 'Tidak / Ke dalam (Not/Into)';
  } else if (w.startsWith('sub')) {
    prefix = 'Sub-';
    prefixMeaning = 'Di bawah / Bagian (Under/Below)';
  } else if (w.startsWith('trans')) {
    prefix = 'Trans-';
    prefixMeaning = 'Seberang / Lintas (Across/Change)';
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

export function generateSmartTenses(wordObj: Word): SmartTensesResult {
  const rawPos = (wordObj.pos || '').toLowerCase();
  const wordLower = wordObj.word.toLowerCase().trim();
  const sourceLower = (wordObj.source || '').toLowerCase();

  let transitivity: 'Transitive' | 'Intransitive' | 'Nominal' = 'Transitive';
  let usedVerb = wordLower;
  let isDerivedVerb = false;
  let derivedFromOriginal: string | undefined = undefined;

  const isMainVerb = rawPos.includes('verb') || rawPos.includes('v.');

  if (isMainVerb) {
    if (wordObj.verb_type === 'intransitive' || INTRANSITIVE_VERBS.has(wordLower)) {
      transitivity = 'Intransitive';
    } else {
      transitivity = 'Transitive';
    }
  } else {
    if (wordObj.verb_family && wordObj.verb_family !== '-') {
      const cleanFam = wordObj.verb_family.split(' ')[0].split('(')[0].toLowerCase().trim();
      if (cleanFam && cleanFam !== '-') {
        usedVerb = cleanFam;
        isDerivedVerb = true;
        derivedFromOriginal = `${wordObj.word} (${wordObj.pos})`;
        transitivity = INTRANSITIVE_VERBS.has(usedVerb) ? 'Intransitive' : 'Transitive';
      }
    } else if (wordObj.v1 && wordObj.v1 !== '-') {
      usedVerb = wordObj.v1.toLowerCase().trim();
      isDerivedVerb = true;
      derivedFromOriginal = `${wordObj.word} (${wordObj.pos})`;
      transitivity = INTRANSITIVE_VERBS.has(usedVerb) ? 'Intransitive' : 'Transitive';
    }
  }

  const inflections = getVerbForms(wordObj.word, wordObj);
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
      : 'Kata kerja ini bertipe INTRANSITIF (tidak memerlukan objek penderita). Dalam tata bahasa Inggris baku, kata ini TIDAK BISA diubah menjadi bentuk Pasif Voice.'
  };

  let subject = 'The researcher';
  let object = 'the project findings';
  let meaningVerbID = wordObj.meaning_id || 'menerapkan';

  if (wordLower === 'mother') {
    subject = 'The mother';
    object = 'her young children';
    meaningVerbID = 'merawat / mengasuh';
    usedVerb = 'nurture';
  } else if (wordLower === 'father') {
    subject = 'Her father';
    object = 'the family members';
    meaningVerbID = 'melindungi / membimbing';
    usedVerb = 'guide';
  } else if (wordLower === 'parent') {
    subject = 'The parent';
    object = 'the child\'s education';
    meaningVerbID = 'mendukung / mendidik';
    usedVerb = 'support';
  } else if (wordLower === 'child') {
    subject = 'The young child';
    object = 'the educational game';
    meaningVerbID = 'memainkan';
    usedVerb = 'play';
  } else if (wordLower === 'everyday') {
    subject = 'She';
    object = 'everyday English phrases';
    meaningVerbID = 'menggunakan';
    usedVerb = 'use';
  } else if (sourceLower.includes('awl')) {
    subject = 'The research committee';
    object = `the ${wordLower} data`;
    if (usedVerb === 'analyze') {
      subject = 'The scientist';
      object = 'the experimental data';
      meaningVerbID = 'menganalisis';
    } else if (usedVerb === 'implement') {
      subject = 'The academic committee';
      object = 'the research policy';
      meaningVerbID = 'melaksanakan';
    } else if (usedVerb === 'evaluate') {
      subject = 'The university board';
      object = 'the academic proposal';
      meaningVerbID = 'mengevaluasi';
    } else if (usedVerb === 'educate') {
      subject = 'The institution';
      object = 'undergraduate students';
      meaningVerbID = 'mendidik';
    } else if (usedVerb === 'occur' || usedVerb === 'arise') {
      subject = 'The natural phenomenon';
      object = '';
      meaningVerbID = 'terjadi';
    }
  } else if (sourceLower.includes('ngsl')) {
    subject = 'The project manager';
    object = `the ${wordLower} strategy`;
    if (usedVerb === 'acquire') {
      subject = 'The organization';
      object = 'new technical skills';
      meaningVerbID = 'memperoleh';
    } else if (usedVerb === 'enhance') {
      subject = 'The team';
      object = 'system performance';
      meaningVerbID = 'meningkatkan';
    }
  } else if (sourceLower.includes('appendix')) {
    subject = 'The system specialist';
    object = `the ${wordLower} parameter`;
  } else {
    subject = 'My friend';
    object = `the ${wordLower} routine`;
  }

  const S = subject;
  const O = object;
  const sLower = S.toLowerCase();
  const oLower = O.toLowerCase();
  const O_Cap = capitalize(O);

  const sentenceInflections = getVerbForms(usedVerb, wordObj);
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
          meaning: `${S} ${meaningVerbID} ${O} setiap hari.`
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
        note: !isApplicablePassive ? 'N/A (Intransitive Verb - Tidak Memiliki Bentuk Pasif dalam Bahasa Inggris)' : undefined,
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
          meaning: `${S} sedang ${meaningVerbID} ${O} saat ini.`
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
        note: !isApplicablePassive ? 'N/A (Intransitive Verb - Tidak Memiliki Bentuk Pasif dalam Bahasa Inggris)' : undefined,
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
        passiveNote: 'Digunakan untuk aksi yang telah selesai dengan dampak yang masih berlangsung.'
      },
      category: 'dasar',
      activeVoice: {
        positive: {
          formula: '(+) S + have/has + V3 + O',
          sentence: `${S} has ${v3} ${O} recently.`.trim(),
          meaning: `${S} telah ${meaningVerbID} ${O} baru-baru ini.`
        },
        negative: {
          formula: '(-) S + have/has + not + V3 + O',
          sentence: `${S} has not ${v3} ${O} recently.`.trim()
        },
        interrogative: {
          formula: '(?) Have/Has + S + V3 + O?',
          sentence: `Has ${sLower} ${v3} ${O} recently?`.trim()
        }
      },
      passiveVoice: {
        isApplicable: isApplicablePassive,
        note: !isApplicablePassive ? 'N/A (Intransitive Verb - Tidak Memiliki Bentuk Pasif dalam Bahasa Inggris)' : undefined,
        positive: isApplicablePassive ? {
          formula: '(+) S + have/has + been + V3',
          sentence: `${O_Cap} has been ${v3} by ${sLower} recently.`.trim(),
          meaning: `${O_Cap} telah di-${v3} oleh ${sLower} baru-baru ini.`
        } : undefined,
        negative: isApplicablePassive ? {
          formula: '(-) S + have/has + not + been + V3',
          sentence: `${O_Cap} has not been ${v3} by ${sLower} recently.`.trim()
        } : undefined,
        interrogative: isApplicablePassive ? {
          formula: '(?) Have/Has + S + been + V3?',
          sentence: `Has ${oLower} been ${v3} by ${sLower} recently?`.trim()
        } : undefined
      }
    },

    // 4. Simple Past
    {
      id: 4,
      tenseName: 'Simple Past Tense',
      timeSignal: 'yesterday, last year, previously',
      usageContext: 'Menyatakan kejadian lampau yang telah selesai sepenuhnya di masa lalu.',
      toBeExplanation: 'Auxiliary Verb: "did" untuk semua subjek pada aktif (-/?). To Be: "was / were" (was: I/He/She/It/Tunggal, were: You/We/They/Jamak).',
      toBeStructure: {
        auxiliaryText: 'did → (Digunakan untuk semua subjek pada kalimat aktif - / ?)',
        toBeText: 'was / were → (was: I/He/She/It/Tunggal, were: You/We/They/Jamak)',
        passiveNote: 'was/were + V3 digunakan untuk bentuk pasif lampau.'
      },
      category: 'dasar',
      activeVoice: {
        positive: {
          formula: '(+) S + V2 + O',
          sentence: `${S} ${v2} ${O} yesterday.`.trim(),
          meaning: `${S} ${meaningVerbID} ${O} kemarin.`
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
        note: !isApplicablePassive ? 'N/A (Intransitive Verb - Tidak Memiliki Bentuk Pasif dalam Bahasa Inggris)' : undefined,
        positive: isApplicablePassive ? {
          formula: '(+) S + was/were + V3',
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

    // 5. Past Continuous
    {
      id: 5,
      tenseName: 'Past Continuous Tense',
      timeSignal: 'at 9 AM yesterday, while, when',
      usageContext: 'Menyatakan aksi yang sedang terjadi saat aksi lain menyela di masa lalu.',
      toBeExplanation: 'To Be: "was / were" + V-ing (was: I/He/She/It, were: You/We/They). Bentuk Pasif: "was being / were being" + V3.',
      toBeStructure: {
        auxiliaryText: 'was / were + V-ing → (was: I/He/She/It/Tunggal, were: You/We/They/Jamak)',
        toBeText: 'was being / were being + V3 (Bentuk Pasif)',
        passiveNote: 'Menyatakan aksi yang sedang terjadi di masa lalu saat disela kejadian lain.'
      },
      category: 'dasar',
      activeVoice: {
        positive: {
          formula: '(+) S + was/were + V-ing + O',
          sentence: `${S} was ${vIng} ${O} at 9 AM yesterday.`.trim(),
          meaning: `${S} sedang ${meaningVerbID} ${O} pada jam 9 pagi kemarin.`
        },
        negative: {
          formula: '(-) S + was/were + not + V-ing + O',
          sentence: `${S} was not ${vIng} ${O} at 9 AM yesterday.`.trim()
        },
        interrogative: {
          formula: '(?) Was/Were + S + V-ing + O?',
          sentence: `Was ${sLower} ${vIng} ${O} at 9 AM yesterday?`.trim()
        }
      },
      passiveVoice: {
        isApplicable: isApplicablePassive,
        note: !isApplicablePassive ? 'N/A (Intransitive Verb - Tidak Memiliki Bentuk Pasif dalam Bahasa Inggris)' : undefined,
        positive: isApplicablePassive ? {
          formula: '(+) S + was/were + being + V3',
          sentence: `${O_Cap} was being ${v3} by ${sLower} at 9 AM yesterday.`.trim(),
          meaning: `${O_Cap} sedang di-${v3} oleh ${sLower} pada jam 9 pagi kemarin.`
        } : undefined,
        negative: isApplicablePassive ? {
          formula: '(-) S + was/were + not + being + V3',
          sentence: `${O_Cap} was not being ${v3} by ${sLower} at 9 AM yesterday.`.trim()
        } : undefined,
        interrogative: isApplicablePassive ? {
          formula: '(?) Was/Were + S + being + V3?',
          sentence: `Was ${oLower} being ${v3} by ${sLower} at 9 AM yesterday?`.trim()
        } : undefined
      }
    },

    // 6. Past Perfect
    {
      id: 6,
      tenseName: 'Past Perfect Tense',
      timeSignal: 'before the deadline, prior to that',
      usageContext: 'Menyatakan aksi yang telah selesai sebelum kejadian lain di masa lalu.',
      toBeExplanation: 'Auxiliary Verb: "had" + V3 untuk semua subjek. Bentuk Pasif: "had been" + V3.',
      toBeStructure: {
        auxiliaryText: 'had + V3 → (Berlaku untuk semua subjek tanpa perubahan)',
        toBeText: 'had been + V3 (Bentuk Pasif)',
        passiveNote: 'Menyatakan aksi yang rampung sebelum momen lampau tertentu.'
      },
      category: 'tambahan',
      activeVoice: {
        positive: {
          formula: '(+) S + had + V3 + O',
          sentence: `${S} had ${v3} ${O} before the deadline.`.trim(),
          meaning: `${S} telah ${meaningVerbID} ${O} sebelum tenggat waktu.`
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
        note: !isApplicablePassive ? 'N/A (Intransitive Verb - Tidak Memiliki Bentuk Pasif dalam Bahasa Inggris)' : undefined,
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

    // 7. Simple Future
    {
      id: 7,
      tenseName: 'Simple Future Tense',
      timeSignal: 'tomorrow, next week, soon',
      usageContext: 'Menyatakan aksi, rencana, atau prediksi di masa mendatang.',
      toBeExplanation: 'Auxiliary Verb: "will" + V1 untuk semua subjek. Bentuk Pasif: "will be" + V3.',
      toBeStructure: {
        auxiliaryText: 'will + V1 → (Berlaku untuk semua subjek)',
        toBeText: 'will be + V3 (Bentuk Pasif)',
        passiveNote: 'Digunakan untuk rencana atau janji di masa depan.'
      },
      category: 'tambahan',
      activeVoice: {
        positive: {
          formula: '(+) S + will + V1 + O',
          sentence: `${S} will ${v1} ${O} tomorrow.`.trim(),
          meaning: `${S} akan ${meaningVerbID} ${O} besok.`
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
        note: !isApplicablePassive ? 'N/A (Intransitive Verb - Tidak Memiliki Bentuk Pasif dalam Bahasa Inggris)' : undefined,
        positive: isApplicablePassive ? {
          formula: '(+) S + will + be + V3',
          sentence: `${O_Cap} will be ${v3} by ${sLower} tomorrow.`.trim(),
          meaning: `${O_Cap} akan di-${v3} oleh ${sLower} besok.`
        } : undefined,
        negative: isApplicablePassive ? {
          formula: '(-) S + will + not + be + V3',
          sentence: `${O_Cap} will not be ${v3} by ${sLower} tomorrow.`.trim()
        } : undefined,
        interrogative: isApplicablePassive ? {
          formula: '(?) Will + S + be + V3?',
          sentence: `Will ${oLower} be ${v3} by ${sLower} tomorrow?`.trim()
        } : undefined
      }
    },

    // 8. Future Continuous
    {
      id: 8,
      tenseName: 'Future Continuous Tense',
      timeSignal: 'at 10 AM tomorrow, this time next week',
      usageContext: 'Menyatakan aksi yang akan sedang berlangsung pada waktu tertentu di masa depan.',
      toBeExplanation: 'To Be: "will be" + V-ing untuk semua subjek.',
      toBeStructure: {
        auxiliaryText: 'will be + V-ing → (Berlaku untuk semua subjek)',
        toBeText: 'will be + V-ing (Aktif)',
        passiveNote: 'Bentuk pasif sangat jarang digunakan dalam tata bahasa Inggris baku.'
      },
      category: 'tambahan',
      activeVoice: {
        positive: {
          formula: '(+) S + will + be + V-ing + O',
          sentence: `${S} will be ${vIng} ${O} at 10 AM tomorrow.`.trim(),
          meaning: `${S} akan sedang ${meaningVerbID} ${O} pada jam 10 pagi besok.`
        },
        negative: {
          formula: '(-) S + will + not + be + V-ing + O',
          sentence: `${S} will not be ${vIng} ${O} at 10 AM tomorrow.`.trim()
        },
        interrogative: {
          formula: '(?) Will + S + be + V-ing + O?',
          sentence: `Will ${sLower} be ${vIng} ${O} at 10 AM tomorrow?`.trim()
        }
      },
      passiveVoice: {
        isApplicable: false,
        note: 'Bentuk pasif Future Continuous sangat jarang digunakan dalam tata bahasa Inggris baku (N/A).'
      }
    },

    // 9. Future Perfect
    {
      id: 9,
      tenseName: 'Future Perfect Tense',
      timeSignal: 'by next month, by December, by then',
      usageContext: 'Menyatakan aksi yang akan telah selesai sebelum batas waktu tertentu di masa depan.',
      toBeExplanation: 'Auxiliary Verb: "will have" + V3 untuk semua subjek. Bentuk Pasif: "will have been" + V3.',
      toBeStructure: {
        auxiliaryText: 'will have + V3 → (Berlaku untuk semua subjek)',
        toBeText: 'will have been + V3 (Bentuk Pasif)',
        passiveNote: 'Menyatakan aksi yang ditargetkan selesai sebelum momen mendatang.'
      },
      category: 'tambahan',
      activeVoice: {
        positive: {
          formula: '(+) S + will + have + V3 + O',
          sentence: `${S} will have ${v3} ${O} by next month.`.trim(),
          meaning: `${S} akan telah ${meaningVerbID} ${O} menjelang bulan depan.`
        },
        negative: {
          formula: '(-) S + will + not + have + V3 + O',
          sentence: `${S} will not have ${v3} ${O} by next month.`.trim()
        },
        interrogative: {
          formula: '(?) Will + S + have + V3 + O?',
          sentence: `Will ${sLower} have ${v3} ${O} by next month?`.trim()
        }
      },
      passiveVoice: {
        isApplicable: isApplicablePassive,
        note: !isApplicablePassive ? 'N/A (Intransitive Verb - Tidak Memiliki Bentuk Pasif dalam Bahasa Inggris)' : undefined,
        positive: isApplicablePassive ? {
          formula: '(+) S + will + have + been + V3',
          sentence: `${O_Cap} will have been ${v3} by ${sLower} by next month.`.trim(),
          meaning: `${O_Cap} akan telah di-${v3} oleh ${sLower} menjelang bulan depan.`
        } : undefined,
        negative: isApplicablePassive ? {
          formula: '(-) S + will + not + have + been + V3',
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
