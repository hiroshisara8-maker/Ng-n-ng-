import React, { useRef } from 'react';
import {
  SpellCheck,
  PenTool,
  BookOpen,
  BookMarked,
  Mic,
  Globe,
  MessageSquare,
  BookmarkCheck,
  Award,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';
import { TabId } from '../types';
import { TOP_TABS } from '../data/literaryData';

interface TopSlideBarProps {
  activeTab: TabId;
  onSelectTab: (id: TabId) => void;
  savedMistakesCount: number;
  streakDays: number;
  userPoints: number;
}

const iconMap: Record<string, LucideIcon> = {
  SpellCheck,
  PenTool,
  BookOpen,
  BookMarked,
  Mic,
  Globe,
  MessageSquare,
  BookmarkCheck,
  Award,
};

export const TopSlideBar: React.FC<TopSlideBarProps> = ({
  activeTab,
  onSelectTab,
  savedMistakesCount,
  streakDays,
  userPoints,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#E8E0D2] shadow-xs">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#B83B26] text-white flex items-center justify-center font-serif text-xl font-bold shadow-xs">
            VN
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold font-serif tracking-tight text-[#1F2421]">
                Việt Ngữ Trong Tay
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-medium bg-[#EFE9DC] text-[#7A5C3D] rounded-full border border-[#DFD5C2]">
                Trau chuốt & Rèn luyện
              </span>
            </div>
            <p className="text-xs text-[#6B706B] hidden md:block">
              Sửa lỗi chính tả • Trau chuốt văn phong • Phát âm chuẩn • Đối thoại cùng AI
            </p>
          </div>
        </div>

        {/* User Stats / Motivation */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div 
            onClick={() => onSelectTab('gamification')} 
            className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EFE6] hover:bg-[#EBE5D8] border border-[#E0D8C7] transition-colors"
            title="Chuỗi ngày chuyên cần"
          >
            <span className="text-base">🔥</span>
            <span className="text-xs font-semibold text-[#8B4513]">{streakDays} ngày</span>
          </div>

          <div 
            onClick={() => onSelectTab('gamification')}
            className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EFE6] hover:bg-[#EBE5D8] border border-[#E0D8C7] transition-colors"
            title="Điểm Mực Hoa (XP tích lũy)"
          >
            <span className="text-base">🌸</span>
            <span className="text-xs font-semibold text-[#B83B26]">{userPoints} Mực Hoa</span>
          </div>
        </div>
      </div>

      {/* The Requested Slide Bar (Thanh lướt chức năng) */}
      <div className="relative max-w-7xl mx-auto px-2 sm:px-4">
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#DDD5C5] shadow-sm items-center justify-center text-[#555] hover:text-[#1F2421] hover:bg-white transition-all cursor-pointer"
          aria-label="Cuộn sang trái"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Slide Bar */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto py-2 px-1 sm:px-2 no-scrollbar scroll-smooth"
        >
          {TOP_TABS.map((tab) => {
            const Icon = iconMap[tab.iconName] || BookOpen;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-xl whitespace-nowrap text-left transition-all duration-200 shrink-0 cursor-pointer border ${
                  isActive
                    ? 'bg-[#FFFFFF] text-[#9A2D1B] border-[#D97D68] shadow-sm font-medium'
                    : 'bg-[#F4EFE6]/70 text-[#4D524F] border-transparent hover:bg-[#EFE9DC] hover:text-[#1F2421]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-[#FAF0ED] text-[#B83B26]'
                      : 'bg-[#EAE4D7] text-[#6B706B] group-hover:bg-[#DFD8C8]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-medium tracking-tight">
                      {tab.label}
                    </span>
                    {tab.id === 'tracker' && savedMistakesCount > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#B83B26] text-white">
                        {savedMistakesCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#7E837F] hidden xl:block">
                    {tab.shortDesc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#DDD5C5] shadow-sm items-center justify-center text-[#555] hover:text-[#1F2421] hover:bg-white transition-all cursor-pointer"
          aria-label="Cuộn sang phải"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
