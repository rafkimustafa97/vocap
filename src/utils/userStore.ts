import { TitleRank, Badge, UserDataState, UserProfile, UserLearningSettings, ActivityLogEntry } from '../types';

export const TITLE_RANKS: TitleRank[] = [
  {
    level: 1,
    title: 'Novice Explorer',
    minXp: 0,
    maxXp: 499,
    icon: '🐣',
    description: 'Baru memulai langkah pertama menguasai 3.655 kata master.',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-300'
  },
  {
    level: 2,
    title: 'Word Scholar',
    minXp: 500,
    maxXp: 1499,
    icon: '📚',
    description: 'Berhasil menguasai 100+ kosakata dasar akademik.',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    level: 3,
    title: 'Academic Apprentice',
    minXp: 1500,
    maxXp: 3499,
    icon: '🎓',
    description: 'Menguasai fondasi kata AWL & NGSL pertama.',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  },
  {
    level: 4,
    title: 'PTE Strategist',
    minXp: 3500,
    maxXp: 6999,
    icon: '⚡',
    description: 'Mahir menyelesaikan soal Fill-in-Blank & Matching Pairs.',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  {
    level: 5,
    title: 'Vocabulary Master',
    minXp: 7000,
    maxXp: 11999,
    icon: '🏆',
    description: 'Menguasai lebih dari 1.000 kata sains & akademik!',
    badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-400'
  },
  {
    level: 6,
    title: 'Lexicon Elite',
    minXp: 12000,
    maxXp: 19999,
    icon: '💎',
    description: 'Menembus 12.000 XP, menguasai 9 Tenses Engine & struktur kalimat.',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },
  {
    level: 7,
    title: 'Pearson PTE Virtuoso',
    minXp: 20000,
    maxXp: 34999,
    icon: '🌟',
    description: 'Menguasai kategori AWL Academic & NGSL General > 50%.',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300'
  },
  {
    level: 8,
    title: 'Academic Vanguard',
    minXp: 35000,
    maxXp: 59999,
    icon: '🛡️',
    description: 'Menguasai 2.000+ kata akademik dengan akurasi kuis > 85%.',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300'
  },
  {
    level: 9,
    title: 'Lexicon Sovereign',
    minXp: 60000,
    maxXp: 99999,
    icon: '👑',
    description: 'Berada di ambang kelulusan seluruh 3.655 kata master.',
    badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black border-amber-300 shadow-md'
  },
  {
    level: 10,
    title: 'PTE 90 Perfect Grandmaster',
    minXp: 100000,
    maxXp: 999999,
    icon: '🌌',
    description: 'PUNCAK TERTINGGI! Menguasai 3.655 kata & 9 Tenses. Siap PTE Target Score 90!',
    badgeBg: 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-black border-purple-400 shadow-lg'
  }
];

export const SYSTEM_BADGES: Badge[] = [
  {
    id: 'streak_3',
    title: 'First Spark',
    description: 'Belajar 3 hari berturut-turut tanpa absen',
    icon: '🥉',
    category: 'streak',
    xpReward: 50
  },
  {
    id: 'streak_14',
    title: 'Unstoppable Habit',
    description: 'Belajar 14 hari berturut-turut',
    icon: '🥈',
    category: 'streak',
    xpReward: 250
  },
  {
    id: 'streak_30',
    title: '30-Day Legend',
    description: 'Belajar 30 hari berturut-turut tanpa jeda',
    icon: '🥇',
    category: 'streak',
    xpReward: 1000
  },
  {
    id: 'quiz_perfect',
    title: 'Bullseye 100%',
    description: 'Meraih skor 100% sempurna pada sesi kuis 30/50 soal',
    icon: '🎯',
    category: 'quiz',
    xpReward: 200
  },
  {
    id: 'quiz_spelling',
    title: 'Spelling Wizard',
    description: 'Menjawab 20 soal Active Recall Spelling tanpa salah',
    icon: '⚡',
    category: 'quiz',
    xpReward: 300
  },
  {
    id: 'quiz_matching',
    title: 'Pairing Maestro',
    description: 'Menyelesaikan kuis Matching Pairs dengan akurasi 100%',
    icon: '🧩',
    category: 'quiz',
    xpReward: 150
  },
  {
    id: 'vocab_100',
    title: 'First Hundred',
    description: 'Menguasai 100 kata master pertama',
    icon: '📖',
    category: 'vocab',
    xpReward: 100
  },
  {
    id: 'vocab_awl',
    title: 'AWL Scholar',
    description: 'Menguasai seluruh 245 kata Academic Word List',
    icon: '🏛️',
    category: 'vocab',
    xpReward: 500
  },
  {
    id: 'vocab_ngsl',
    title: 'NGSL Master',
    description: 'Menguasai 1.475 kata General Service List',
    icon: '🌐',
    category: 'vocab',
    xpReward: 1500
  },
  {
    id: 'vocab_3655',
    title: 'The 3,655 Conqueror',
    description: 'Menguasai seluruh 3.655 kata master dalam database',
    icon: '👑',
    category: 'vocab',
    xpReward: 5000
  },
  {
    id: 'saturday_review',
    title: 'Vocabulary Reclaimer',
    description: 'Menuntaskan sesi Vocabulary Review 4 minggu beruntun',
    icon: '🔄',
    category: 'tenses',
    xpReward: 400
  },
  {
    id: 'tenses_master',
    title: '9 Tenses Architect',
    description: 'Membuka & mempelajari rincian 9 Tenses Engine pada 50 kata berbeda',
    icon: '⚡',
    category: 'tenses',
    xpReward: 300
  }
];

const CURRENT_USER_KEY = 'lumina_active_user_email';

export function getActiveUserEmail(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function setActiveUserEmail(email: string | null): void {
  if (email) {
    localStorage.setItem(CURRENT_USER_KEY, email);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function getStorageKeyForUser(email: string): string {
  const cleanEmail = email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  return `lumina_user_data_${cleanEmail}`;
}

export function loadUserData(email: string): UserDataState {
  const key = getStorageKeyForUser(email);
  const json = localStorage.getItem(key);
  
  if (json) {
    try {
      const parsed = JSON.parse(json);
      return {
        ...parsed,
        activityLogs: parsed.activityLogs || []
      };
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultProfile: UserProfile = {
    id: `user-${Date.now()}`,
    name: email.split('@')[0],
    email: email.toLowerCase().trim(),
    createdAt: todayStr
  };

  const defaultSettings: UserLearningSettings = {
    pace: 30,
    startDate: todayStr,
    locked: false,
    targetExamDate: ''
  };

  const newState: UserDataState = {
    profile: defaultProfile,
    settings: defaultSettings,
    userStats: {},
    xp: 0,
    userStreak: 1,
    unlockedBadgeIds: [],
    lastStudyDate: todayStr,
    activityLogs: []
  };

  saveUserData(email, newState);
  return newState;
}

export function saveUserData(email: string, state: UserDataState): void {
  const key = getStorageKeyForUser(email);
  localStorage.setItem(key, JSON.stringify(state));
}

import { supabase } from './supabaseClient';

export async function fetchCloudUserData(email: string): Promise<UserDataState | null> {
  const cleanEmail = email.toLowerCase().trim();
  if (!cleanEmail) return null;

  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('user_data')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error) {
      console.warn('Notice fetching cloud user progress:', error.message);
    }

    if (data && data.user_data) {
      const cloudState = data.user_data as UserDataState;
      saveUserData(cleanEmail, cloudState);
      return cloudState;
    }
  } catch (err) {
    console.error('Error fetching cloud user data:', err);
  }
  return null;
}

export async function syncCloudUserData(email: string, state: UserDataState): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  if (!cleanEmail || !state) return;

  saveUserData(cleanEmail, state);

  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert(
        {
          email: cleanEmail,
          user_data: state,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'email' }
      );

    if (error) {
      console.error('Error syncing cloud user progress to Supabase:', error.message);
    }
  } catch (err) {
    console.error('Failed to sync user data to Supabase:', err);
  }
}

export function getTitleRank(xp: number): TitleRank {
  const rank = TITLE_RANKS.find((r) => xp >= r.minXp && xp <= r.maxXp);
  return rank || TITLE_RANKS[TITLE_RANKS.length - 1];
}
