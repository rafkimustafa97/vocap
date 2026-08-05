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
  getTitleRank
} from './utils/userStore';

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

export default function App() {
  const allWords = useMemo<Word[]>(() => {
    return getWordsRange(1, 3655);
  }, []);

  const [activeEmail, setActiveEmail] = useState<string | null>(() => getActiveUserEmail());
  
  const [userData, setUserData] = useState<UserDataState | null>(() => {
    const email = getActiveUserEmail();
    return email ? loadUserData(email) : null;
  });

  const [activeView, setActiveView] = useState<string>(() => (getActiveUserEmail() ? 'dashboard' : 'landing'));

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

  useEffect(() => {
    if (activeEmail && userData) {
      saveUserData(activeEmail, userData);
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
    setActiveUserEmail(email);
    setActiveEmail(email);
    
    let loaded = loadUserData(email);
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

      const newStreak = isMastered ? existing.correctStreak + 1 : 0;
      const newWrongCount = isMastered ? existing.wrongCount : existing.wrongCount + 1;
      const isWeak = newWrongCount >= 2;
      const newStatus = newStreak >= 3 ? 'mastered' : 'learning';

      const updatedStats = {
        ...stats,
        [wordId]: {
          ...existing,
          correctStreak: newStreak,
          wrongCount: newWrongCount,
          isWeakness: isWeak,
          status: newStatus,
          lastTested: new Date().toISOString()
        }
      };

      const newXp = isMastered ? prev.xp + 5 : prev.xp;
      
      const masteredCount = Object.values(updatedStats).filter(s => s.status === 'mastered').length;
      const newUnlocked = [...prev.unlockedBadgeIds];
      if (masteredCount >= 100 && !newUnlocked.includes('vocab_100')) newUnlocked.push('vocab_100');
      if (masteredCount >= 3655 && !newUnlocked.includes('vocab_3655')) newUnlocked.push('vocab_3655');

      return {
        ...prev,
        userStats: updatedStats,
        xp: newXp,
        unlockedBadgeIds: newUnlocked
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
                onMarkWord={handleMarkWord}
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

      {isAuthenticated && (
        <OnboardingModal
          isOpen={!userData.settings.locked}
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
