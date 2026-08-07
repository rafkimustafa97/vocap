import React, { useState, useEffect, useMemo } from 'react';
import {
  Word,
  UserLearningSettings,
  WordUserStat,
  UserProfile,
  QuizResult,
  UserDataState,
  ActivityLogEntry
} from './types';
import { getWordsRange } from './data/wordsMaster';
import { getDailyWordRange } from './utils/scheduler';
import {
  getActiveUserEmail,
  setActiveUserEmail,
  loadUserData,
  saveUserData,
  fetchCloudUserData,
  syncCloudUserData,
  getTitleRank
} from './utils/userStore';
import { supabase } from './utils/supabaseClient';

import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { LandingPageView } from './components/LandingPageView';
import { AuthModal } from './components/AuthModal';
import { AchievementsModal } from './components/AchievementsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { Dashboard } from './components/Dashboard';
import { FlashcardView } from './components/FlashcardView';
import { QuizEngine } from './components/QuizEngine';
import { VocabularyReview } from './components/VocabularyReview';
import { LibraryView } from './components/LibraryView';
import { AuditTrailView } from './components/AuditTrailView';
import { TensesModal } from './components/TensesModal';
import { WordDetailModal } from './components/WordDetailModal';
import { SqlSchemaModal } from './components/SqlSchemaModal';
import { SettingsModal } from './components/SettingsModal';

// Robust, fail-safe JWT decoder for OAuth Hash Tokens
const decodeJwt = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const rawBinary = atob(base64);
    try {
      const jsonPayload = decodeURIComponent(
        rawBinary
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return JSON.parse(rawBinary);
    }
  } catch (err) {
    console.error('Failed to parse JWT payload:', err);
    return null;
  }
};

// Synchronous OAuth Token Extraction from Hash Fragment on initial page load
const getInitialOAuthUser = (): { email: string; name?: string } | null => {
  if (typeof window === 'undefined') return null;

  if (window.location.hash && window.location.hash.includes('access_token')) {
    try {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      if (accessToken) {
        const payload = decodeJwt(accessToken);
        if (payload?.email) {
          const email = payload.email.toLowerCase().trim();
          const name = payload.user_metadata?.full_name || payload.user_metadata?.name || email.split('@')[0];
          setActiveUserEmail(email);
          
          // Instantly clean address bar hash before initial render!
          window.history.replaceState(null, '', window.location.pathname);
          return { email, name };
        }
      }
    } catch (e) {
      console.error('Error parsing synchronous OAuth hash:', e);
    }
  }
  return null;
};

export default function App() {
  const allWords = useMemo<Word[]>(() => {
    return getWordsRange(1, 3655);
  }, []);

  // Synchronously extract user email & name if returning from Google OAuth redirect
  const initialOAuthUser = getInitialOAuthUser();
  const initialEmail = initialOAuthUser ? initialOAuthUser.email : getActiveUserEmail();

  const [activeEmail, setActiveEmail] = useState<string | null>(initialEmail);

  const [userData, setUserData] = useState<UserDataState | null>(() => {
    if (!initialEmail) return null;
    const loaded = loadUserData(initialEmail);
    if (initialOAuthUser?.name && loaded.profile.name !== initialOAuthUser.name) {
      loaded.profile.name = initialOAuthUser.name;
      saveUserData(initialEmail, loaded);
    }
    return loaded;
  });

  const [activeView, setActiveView] = useState<string>(() => (initialEmail ? 'dashboard' : 'landing'));

  // Active Review Fullscreen Lock State
  const [isReviewActive, setIsReviewActive] = useState<boolean>(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState<boolean>(false);

  const [isTensesModalOpen, setIsTensesModalOpen] = useState<boolean>(false);
  const [selectedTensesWord, setSelectedTensesWord] = useState<Word | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedDetailWord, setSelectedDetailWord] = useState<Word | null>(null);

  const [isSqlModalOpen, setIsSqlModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Helper function to handle user login state from Supabase OAuth
  const processSessionUser = (sessionUser: any) => {
    if (!sessionUser?.email) return;
    const email = sessionUser.email.toLowerCase().trim();
    const name = sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || email.split('@')[0];

    setActiveUserEmail(email);
    setActiveEmail(email);

    const loaded = loadUserData(email);
    if (name && loaded.profile.name !== name) {
      loaded.profile.name = name;
    }

    setUserData(loaded);
    setActiveView('dashboard');

    // Clean address bar URL (remove ?code=... or #access_token=...)
    if (window.location.search || window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // Auto-listen & process Supabase OAuth Session redirects (Google 1-Click Login)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        processSessionUser(session.user);
      }
    });

    const { data: authSubscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        processSessionUser(session.user);
      }
    });

    return () => {
      authSubscription?.subscription.unsubscribe();
    };
  }, []);

  const [isCloudLoading, setIsCloudLoading] = useState<boolean>(true);

  // Auto-fetch cloud user progress from Supabase database whenever activeEmail changes
  useEffect(() => {
    if (!activeEmail) {
      setIsCloudLoading(false);
      return;
    }

    let isMounted = true;
    setIsCloudLoading(true);

    fetchCloudUserData(activeEmail)
      .then((cloudData) => {
        if (!isMounted) return;
        setIsCloudLoading(false);

        if (!cloudData) return;

        setUserData((prevLocal) => {
          if (!prevLocal) {
            const dataWithLocked = {
              ...cloudData,
              settings: {
                ...(cloudData.settings || { pace: 30, startDate: new Date().toISOString().split('T')[0] }),
                locked: true
              }
            };
            syncCloudUserData(activeEmail, dataWithLocked);
            return dataWithLocked;
          }

          const localXp = prevLocal.xp || 0;
          const cloudXp = cloudData.xp || 0;
          const localMasteredCount = Object.values(prevLocal.userStats || {}).filter((s) => s.status === 'mastered').length;
          const cloudMasteredCount = Object.values(cloudData.userStats || {}).filter((s) => s.status === 'mastered').length;

          const chosenBase = (cloudXp >= localXp || cloudMasteredCount >= localMasteredCount) ? cloudData : prevLocal;

          const merged = {
            ...chosenBase,
            settings: {
              ...(chosenBase.settings || { pace: 30, startDate: new Date().toISOString().split('T')[0] }),
              locked: true
            },
            profile: {
              ...chosenBase.profile,
              name: prevLocal.profile.name || cloudData.profile.name || chosenBase.profile.name
            }
          };

          syncCloudUserData(activeEmail, merged);
          return merged;
        });
      })
      .catch((err) => {
        console.error('Failed to fetch cloud user data:', err);
        if (isMounted) setIsCloudLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeEmail]);

  // Sync to Cloud Supabase database on every local userData mutation
  useEffect(() => {
    if (activeEmail && userData) {
      syncCloudUserData(activeEmail, userData);
    }
  }, [activeEmail, userData]);

  const handleOpenLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthMode('register');
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (email: string, name?: string) => {
    const cleanEmail = email.toLowerCase().trim();
    setActiveUserEmail(cleanEmail);
    setActiveEmail(cleanEmail);
    
    let loaded = loadUserData(cleanEmail);
    if (name && loaded.profile.name !== name) {
      loaded = {
        ...loaded,
        profile: { ...loaded.profile, name }
      };
    }

    setUserData(loaded);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    setActiveUserEmail(null);
    setActiveEmail(null);
    setUserData(null);
    setActiveView('landing');
  };

  const handleOnboardingConfirm = (newSettings: UserLearningSettings) => {
    if (!userData || !activeEmail) return;
    setUserData((prev) => prev ? { ...prev, settings: newSettings } : null);
  };

  const handleSaveSettings = (newSettings: UserLearningSettings) => {
    if (!userData || !activeEmail) return;
    setUserData((prev) => prev ? { ...prev, settings: newSettings } : null);
  };

  const handleAddAuditLog = (logEntry: ActivityLogEntry) => {
    if (!userData || !activeEmail) return;

    setUserData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        activityLogs: [logEntry, ...prev.activityLogs]
      };
    });
  };

  const handleDeductXpPenalty = (penalty: number, reason: string) => {
    if (!userData || !activeEmail) return;

    setUserData((prev) => {
      if (!prev) return null;
      const newXp = Math.max(0, prev.xp - penalty);
      return {
        ...prev,
        xp: newXp
      };
    });
  };

  const handleMarkWord = (wordId: number, isMastered: boolean) => {
    if (!userData || !activeEmail) return;

    setUserData((prev) => {
      if (!prev) return null;

      const stats = prev.userStats;
      const existing = stats[wordId] || {
        wordId,
        wrongCount: 0,
        correctStreak: 0,
        isWeakness: false,
        status: 'new'
      };

      const newStreak = isMastered ? Math.max(3, existing.correctStreak + 1) : 0;
      const newWrongCount = isMastered ? existing.wrongCount : existing.wrongCount + 1;
      const isWeak = isMastered ? false : newWrongCount >= 2;
      const newStatus = isMastered ? 'mastered' : 'learning';

      const updatedStats = {
        ...stats,
        [wordId]: {
          ...existing,
          correctStreak: newStreak,
          wrongCount: newWrongCount,
          isWeakness: isWeak,
          status: newStatus as any,
          lastTested: new Date().toISOString()
        }
      };

      const isAlreadyMastered = existing.status === 'mastered';
      const xpGained = (isMastered && !isAlreadyMastered) ? 5 : 0;
      const newXp = prev.xp + xpGained;
      
      const masteredCount = Object.values(updatedStats).filter(s => s.status === 'mastered').length;
      const newUnlocked = [...prev.unlockedBadgeIds];
      if (masteredCount >= 100 && !newUnlocked.includes('vocab_100')) newUnlocked.push('vocab_100');
      if (masteredCount >= 3655 && !newUnlocked.includes('vocab_3655')) newUnlocked.push('vocab_3655');

      const targetWordObj = allWords.find((w) => w.id === wordId);
      const wordName = targetWordObj ? targetWordObj.word : `ID #${wordId}`;
      const nowStr = new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const newAuditLog: ActivityLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: nowStr,
        activityType: isMastered ? 'SUDAH_HAFAL' : 'BELUM_HAFAL',
        description: isMastered
          ? `Menandai kata "${wordName}" sebagai SUDAH HAFAL (+5 XP). Total kata mastered: ${masteredCount}.`
          : `Menandai kata "${wordName}" sebagai BELUM HAFAL (Sedang dipelajari).`,
        xpGained: xpGained,
        category: 'vocab'
      };

      return {
        ...prev,
        userStats: updatedStats,
        xp: newXp,
        unlockedBadgeIds: newUnlocked,
        activityLogs: [newAuditLog, ...(prev.activityLogs || [])]
      };
    });
  };

  const handleResetWord = (wordId: number) => {
    if (!userData || !activeEmail) return;

    setUserData((prev) => {
      if (!prev) return null;

      const stats = prev.userStats;
      const existing = stats[wordId];
      if (!existing) return prev;

      const isPreviouslyMastered = existing.status === 'mastered';
      const xpDeducted = isPreviouslyMastered ? 5 : 0;
      const newXp = Math.max(0, prev.xp - xpDeducted);

      const updatedStats = {
        ...stats,
        [wordId]: {
          ...existing,
          correctStreak: 0,
          status: 'learning' as const,
          lastTested: new Date().toISOString()
        }
      };

      const masteredCount = Object.values(updatedStats).filter(s => s.status === 'mastered').length;
      const targetWordObj = allWords.find((w) => w.id === wordId);
      const wordName = targetWordObj ? targetWordObj.word : `ID #${wordId}`;
      const nowStr = new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const newAuditLog: ActivityLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: nowStr,
        activityType: 'BELAJAR_ULANG',
        description: `Mereset status hafalan kata "${wordName}" (Pelajari Ulang, -5 XP). Total kata mastered: ${masteredCount}.`,
        xpGained: -xpDeducted,
        category: 'vocab'
      };

      return {
        ...prev,
        userStats: updatedStats,
        xp: newXp,
        activityLogs: [newAuditLog, ...(prev.activityLogs || [])]
      };
    });
  };

  const handleUpdateWordStat = (wordId: number, isCorrect: boolean) => {
    if (!userData || !activeEmail) return;

    setUserData((prev) => {
      if (!prev) return null;
      const stats = prev.userStats;
      const existing = stats[wordId] || {
        wordId,
        wrongCount: 0,
        correctStreak: 0,
        isWeakness: false,
        status: 'new'
      };

      const newStreak = isCorrect ? existing.correctStreak + 1 : 0;
      const newWrong = isCorrect ? existing.wrongCount : existing.wrongCount + 1;
      
      let isWeak = false;
      if (newWrong >= 4) {
        isWeak = newStreak < 3;
      } else {
        isWeak = !isCorrect || newWrong >= 2;
      }

      const newStatus = newStreak >= 3 ? 'mastered' : 'learning';

      return {
        ...prev,
        userStats: {
          ...stats,
          [wordId]: {
            ...existing,
            correctStreak: newStreak,
            wrongCount: newWrong,
            isWeakness: isWeak,
            status: newStatus,
            lastTested: new Date().toISOString()
          }
        }
      };
    });
  };

  const handleFinishQuiz = (result: QuizResult, xpEarned: number) => {
    if (!userData || !activeEmail) return;

    const nowStr = new Date().toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const auditEntry: ActivityLogEntry = {
      id: `audit-quiz-${Date.now()}`,
      timestamp: new Date().toISOString(),
      formattedDate: `${nowStr} WIB`,
      category: 'quiz',
      title: `Sesi Adaptive Quiz (${result.correct}/${result.total} Benar)`,
      description: `Menuntaskan kuis dengan skor ${result.score}% dan memperoleh +${xpEarned} XP.`,
      xpEarned,
      scorePct: result.score,
      details: {
        totalCount: result.total,
        correctCount: result.correct,
        wrongWords: result.wrongWordIds.map((id) => allWords.find((w) => w.id === id)?.word).filter(Boolean) as string[]
      }
    };

    setUserData((prev) => {
      if (!prev) return null;
      const oldRank = getTitleRank(prev.xp);
      const newXp = prev.xp + xpEarned;
      const newRank = getTitleRank(newXp);
      const newUnlocked = [...prev.unlockedBadgeIds];

      if (result.score === 100 && !newUnlocked.includes('quiz_perfect')) {
        newUnlocked.push('quiz_perfect');
      }

      const logs = [auditEntry, ...prev.activityLogs];

      if (newRank.level > oldRank.level) {
        logs.unshift({
          id: `audit-rank-${Date.now()}`,
          timestamp: new Date().toISOString(),
          formattedDate: `${nowStr} WIB`,
          category: 'rank_up',
          title: `Kenaikan Level Title: ${newRank.title} (${newRank.icon})`,
          description: `Selamat! Anda berhasil menembus ${newXp} XP dan mendapatkan gelar ${newRank.title}.`,
          xpEarned: 0
        });
      }

      return {
        ...prev,
        xp: newXp,
        unlockedBadgeIds: newUnlocked,
        activityLogs: logs
      };
    });
  };

  const handleOpenTenses = (word: Word) => {
    setSelectedTensesWord(word);
    setIsTensesModalOpen(true);
  };

  const handleOpenDetail = (word: Word) => {
    setSelectedDetailWord(word);
    setIsDetailModalOpen(true);
  };

  const handleSelectWordByName = (name: string) => {
    const found = allWords.find(
      (w) => w.word.toLowerCase() === name.toLowerCase()
    );
    if (found) {
      handleOpenDetail(found);
    }
  };

  const actualStudiedCount = useMemo(() => {
    if (!userData?.userStats) return 0;
    return Object.values(userData.userStats).filter(
      (s) => s.status === 'learning' || s.status === 'mastered' || s.wrongCount > 0
    ).length;
  }, [userData?.userStats]);

  const dailyRange = getDailyWordRange(
    userData?.settings || { pace: 30, startDate: new Date().toISOString().split('T')[0], locked: false },
    new Date().toISOString().split('T')[0],
    actualStudiedCount
  );

  const currentTargetWords = useMemo(() => {
    if (dailyRange.startNo === 0) {
      return allWords.slice(0, 30);
    }
    return getWordsRange(dailyRange.startNo, dailyRange.endNo);
  }, [allWords, dailyRange]);

  const isAuthenticated = !!(activeEmail && userData);

  return (
    <div className="min-h-screen bg-[#F6FAFE] text-slate-800 font-sans antialiased selection:bg-blue-200">
      
      {/* NAVBAR HIDDEN WHEN IN ACTIVE FULLSCREEN REVIEW SESSION */}
      {!isReviewActive && (
        <Navbar
          user={userData ? { id: userData.profile.id, name: userData.profile.name, email: userData.profile.email, createdAt: userData.profile.createdAt } : null}
          xp={userData?.xp || 0}
          streak={userData?.userStreak || 1}
          isAuthenticated={isAuthenticated}
          onOpenSqlModal={() => setIsSqlModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenAchievements={() => setIsAchievementsModalOpen(true)}
          onOpenLogin={handleOpenLogin}
          onOpenRegister={handleOpenRegister}
          onLogout={handleLogout}
          activeView={activeView}
          onNavigate={setActiveView}
        />
      )}

      <main className={`px-2 sm:px-4 ${isReviewActive ? 'pt-6 pb-6' : 'pt-4 pb-20'}`}>
        {!isAuthenticated ? (
          <LandingPageView
            onOpenRegister={handleOpenRegister}
            onOpenLogin={handleOpenLogin}
          />
        ) : (
          <>
            {activeView === 'dashboard' && (
              <Dashboard
                settings={userData.settings}
                userStats={userData.userStats}
                allWords={allWords}
                userXp={userData.xp}
                userStreak={userData.userStreak}
                onNavigateToLearn={() => setActiveView('learn')}
                onNavigateToQuiz={() => setActiveView('quiz')}
                onNavigateToSaturdayReview={() => setActiveView('saturday_review')}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            )}

            {activeView === 'learn' && (
              <FlashcardView
                words={currentTargetWords}
                userStats={userData.userStats}
                onMarkWord={handleMarkWord}
                onResetWord={handleResetWord}
                onOpenTenses={handleOpenTenses}
                onSelectWordByName={handleSelectWordByName}
              />
            )}

            {activeView === 'quiz' && (
              <QuizEngine
                allWords={allWords}
                userStats={userData.userStats}
                currentWeek={dailyRange.weekIndex}
                onUpdateWordStat={handleUpdateWordStat}
                onFinishQuiz={handleFinishQuiz}
              />
            )}

            {activeView === 'saturday_review' && (
              <VocabularyReview
                allWords={allWords}
                userStats={userData.userStats}
                currentWeek={dailyRange.weekIndex}
                startDateStr={userData.settings.startDate}
                onMarkWord={handleMarkWord}
                onAddAuditLog={handleAddAuditLog}
                onReviewStateChange={setIsReviewActive}
                onDeductXpPenalty={handleDeductXpPenalty}
              />
            )}

            {activeView === 'library' && (
              <LibraryView
                allWords={allWords}
                userStats={userData.userStats}
                onOpenTenses={handleOpenTenses}
                onSelectWord={handleOpenDetail}
              />
            )}

            {activeView === 'history' && (
              <AuditTrailView
                activityLogs={userData.activityLogs || []}
                totalXp={userData.xp}
              />
            )}
          </>
        )}
      </main>

      {/* BOTTOM NAV HIDDEN WHEN IN ACTIVE FULLSCREEN REVIEW SESSION */}
      {isAuthenticated && !isReviewActive && (
        <BottomNav activeView={activeView} onNavigate={setActiveView} />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {isAuthenticated && (
        <AchievementsModal
          isOpen={isAchievementsModalOpen}
          onClose={() => setIsAchievementsModalOpen(false)}
          xp={userData.xp}
          unlockedBadgeIds={userData.unlockedBadgeIds}
        />
      )}

      {isAuthenticated && !isCloudLoading && !userData.settings.locked && (
        <OnboardingModal
          isOpen={true}
          onConfirm={handleOnboardingConfirm}
        />
      )}

      <TensesModal
        word={selectedTensesWord}
        isOpen={isTensesModalOpen}
        onClose={() => setIsTensesModalOpen(false)}
      />

      <WordDetailModal
        word={selectedDetailWord}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onOpenTenses={handleOpenTenses}
      />

      <SqlSchemaModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />

      {isAuthenticated && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          settings={userData.settings}
          onSaveSettings={handleSaveSettings}
        />
      )}

    </div>
  );
}
