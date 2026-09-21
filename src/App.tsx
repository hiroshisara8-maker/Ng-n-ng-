import React, { useState, useEffect } from 'react';
import { TabId, SavedMistake, Badge, LeaderboardUser } from './types';
import { INITIAL_BADGES, INITIAL_LEADERBOARD } from './data/literaryData';
import { TopSlideBar } from './components/TopSlideBar';
import { SpellChecker } from './components/SpellChecker';
import { SentenceEnhancer } from './components/SentenceEnhancer';
import { WritingWorkshop } from './components/WritingWorkshop';
import { VocabExplorer } from './components/VocabExplorer';
import { PronunciationPractice } from './components/PronunciationPractice';
import { ForeignLearner } from './components/ForeignLearner';
import { AiConversation } from './components/AiConversation';
import { ErrorTracker } from './components/ErrorTracker';
import { GamificationView } from './components/GamificationView';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('spelling');

  // Persistence for user mistakes
  const [mistakes, setMistakes] = useState<SavedMistake[]>(() => {
    try {
      const saved = localStorage.getItem('vietngu_mistakes');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'm-demo-1',
        original: 'xai xót',
        suggestion: 'sai sót',
        reason: 'Nhầm lẫn phụ âm s/x trong từ ghép đẳng lập.',
        type: 'Chính tả s/x',
        createdAt: Date.now() - 86400000,
        practicedCount: 1,
        isMastered: false,
      },
      {
        id: 'm-demo-2',
        original: 'chuẩn đoán',
        suggestion: 'chẩn đoán',
        reason: 'Từ Hán Việt: chẩn trong chẩn bệnh, không dùng chuẩn.',
        type: 'Từ Hán Việt',
        createdAt: Date.now() - 172800000,
        practicedCount: 0,
        isMastered: false,
      },
    ];
  });

  // User points & badges
  const [userPoints, setUserPoints] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('vietngu_points');
      if (saved) return Number(saved);
    } catch (e) {}
    return 1980;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    try {
      const saved = localStorage.getItem('vietngu_badges');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_BADGES;
  });

  const [streakDays] = useState<number>(7);
  const [leaderboard] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vietngu_mistakes', JSON.stringify(mistakes));
    } catch (e) {}
  }, [mistakes]);

  useEffect(() => {
    try {
      localStorage.setItem('vietngu_points', userPoints.toString());
    } catch (e) {}
  }, [userPoints]);

  useEffect(() => {
    try {
      localStorage.setItem('vietngu_badges', JSON.stringify(badges));
    } catch (e) {}
  }, [badges]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleAddPoints = (points: number) => {
    setUserPoints((prev) => {
      const updated = prev + points;
      showToast(`+${points} Mực Hoa! Hãy tiếp tục rèn giũa ngòi bút.`);
      return updated;
    });
  };

  const handleSaveMistake = (
    newMistake: Omit<SavedMistake, 'id' | 'createdAt' | 'practicedCount' | 'isMastered'>
  ) => {
    const exists = mistakes.some((m) => m.original.toLowerCase() === newMistake.original.toLowerCase());
    if (exists) {
      showToast(`Từ "${newMistake.original}" đã có trong Sổ tay lỗi.`);
      return;
    }

    const item: SavedMistake = {
      ...newMistake,
      id: 'm-' + Date.now(),
      createdAt: Date.now(),
      practicedCount: 0,
      isMastered: false,
    };

    setMistakes((prev) => [item, ...prev]);
    showToast(`Đã lưu "${newMistake.original}" vào Sổ tay lỗi.`);
  };

  const handleRemoveMistake = (id: string) => {
    setMistakes((prev) => prev.filter((m) => m.id !== id));
  };

  const handleToggleMastered = (id: string) => {
    setMistakes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isMastered: !m.isMastered } : m))
    );
  };

  const handleCheckBadges = (essayScore: number) => {
    if (essayScore >= 8.5) {
      setBadges((prev) =>
        prev.map((b) =>
          b.id === 'b6'
            ? { ...b, unlocked: true, unlockedAt: 'Vừa xong' }
            : b
        )
      );
      showToast('🎉 Vinh dự đạt Huy hiệu: Trạng Nguyên Văn Hiến!');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#2C2E2B] flex flex-col font-sans">
      {/* Floating notification toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F2421] text-white px-4 py-2.5 rounded-xl shadow-lg border border-[#3E4540] flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Sticky Slide Bar with Navigation */}
      <TopSlideBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        savedMistakesCount={mistakes.filter((m) => !m.isMastered).length}
        streakDays={streakDays}
        userPoints={userPoints}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'spelling' && (
          <SpellChecker
            onSaveMistake={handleSaveMistake}
            onAddPoints={handleAddPoints}
          />
        )}

        {activeTab === 'improve' && (
          <SentenceEnhancer
            onSaveMistake={handleSaveMistake}
            onAddPoints={handleAddPoints}
          />
        )}

        {activeTab === 'writing' && (
          <WritingWorkshop
            onAddPoints={handleAddPoints}
            onCheckBadges={handleCheckBadges}
          />
        )}

        {activeTab === 'vocab' && (
          <VocabExplorer onAddPoints={handleAddPoints} />
        )}

        {activeTab === 'pronunciation' && (
          <PronunciationPractice onAddPoints={handleAddPoints} />
        )}

        {activeTab === 'foreign' && (
          <ForeignLearner onAddPoints={handleAddPoints} />
        )}

        {activeTab === 'speaking' && (
          <AiConversation
            onSaveMistake={handleSaveMistake}
            onAddPoints={handleAddPoints}
          />
        )}

        {activeTab === 'tracker' && (
          <ErrorTracker
            mistakes={mistakes}
            onRemoveMistake={handleRemoveMistake}
            onToggleMastered={handleToggleMastered}
            onAddCustomMistake={handleSaveMistake}
            onAddPoints={handleAddPoints}
          />
        )}

        {activeTab === 'gamification' && (
          <GamificationView
            badges={badges}
            leaderboard={leaderboard}
            userPoints={userPoints}
            streakDays={streakDays}
          />
        )}
      </main>

      {/* Subtle literary footer */}
      <footer className="mt-auto border-t border-[#E8E0D2] bg-[#F4EFE6]/70 py-6 text-center text-xs text-[#7A807B]">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p className="font-serif italic text-[#574431]">
            "Tiếng Việt trong như hồn người Việt, giàu như nguồn đất mẹ, thắm như tấm lòng quê."
          </p>
          <div className="text-[11px] text-[#8C918C]">
            Việt Ngữ Trong Tay • Nâng niu từng con chữ, gìn giữ nét ngọc ngà của tiếng mẹ đẻ
          </div>
        </div>
      </footer>
    </div>
  );
}
