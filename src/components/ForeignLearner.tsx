import React, { useState } from 'react';
import {
  Globe,
  Volume2,
  Sparkles,
  BookOpen,
  MessageCircle,
  HelpCircle,
  Coffee,
  MapPin,
  Users,
  Compass,
} from 'lucide-react';
import { ForeignHelperResult } from '../types';
import { speakVietnamese } from '../utils/speech';

interface ForeignLearnerProps {
  onAddPoints: (points: number) => void;
}

export const ForeignLearner: React.FC<ForeignLearnerProps> = ({ onAddPoints }) => {
  const [searchQuery, setSearchQuery] = useState('Ordering Vietnamese coffee & asking for the bill');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ForeignHelperResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 6 Tones Guide data
  const VIETNAMESE_TONES = [
    { name: 'Ngang (Flat)', mark: 'ma', pitch: 'Mid-level, flat', soundLike: 'Like saying "ahhh" in a relaxed voice' },
    { name: 'Huyền (Falling)', mark: 'mà', pitch: 'Low falling, soft', soundLike: 'Like sighing "uhhh" or answering "yeah"' },
    { name: 'Sắc (Rising)', mark: 'má', pitch: 'High rising, sharp', soundLike: 'Like asking a quick question: "What?"' },
    { name: 'Hỏi (Dipping-rising)', mark: 'mả', pitch: 'Drops then rises', soundLike: 'Like saying "Really?" with curiosity' },
    { name: 'Ngã (Broken-rising)', mark: 'mã', pitch: 'High broken glottal', soundLike: 'Starts high, breaks with glottal stop, rises' },
    { name: 'Nặng (Heavy-drop)', mark: 'mạ', pitch: 'Low, abruptly cut short', soundLike: 'Like an abrupt heavy grunt "uh!"' },
  ];

  const quickTopics = [
    { label: 'Cà phê & Ẩm thực (Coffee & Food)', query: 'Ordering iced milk coffee and street food politely', icon: Coffee },
    { label: 'Chào hỏi & Xưng hô (Greetings & Pronouns)', query: 'Polite greetings and addressing people (anh, chị, em, cô, chú)', icon: Users },
    { label: 'Hỏi đường & Di chuyển (Directions & Travel)', query: 'Asking for directions and taking a taxi in Hanoi or Saigon', icon: MapPin },
    { label: 'Mặc cả & Mua sắm (Bargaining & Shopping)', query: 'Shopping at traditional markets and asking for prices', icon: Compass },
  ];

  const handleLearnTopic = async (topicQuery?: string) => {
    const q = topicQuery || searchQuery;
    if (!q.trim()) {
      setErrorMsg('Please enter a topic or phrase.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);
    if (topicQuery) setSearchQuery(topicQuery);

    try {
      const response = await fetch('/api/foreign-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch learning materials.');
      }

      const data: ForeignHelperResult = await response.json();
      setResult(data);
      onAddPoints(15);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    speakVietnamese(text, 0.9);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Starter */}
      <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-5 sm:p-6 border border-[#E7DFCE] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE8DC] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#B83B26]" />
              <h2 className="text-xl font-bold font-serif text-[#1F2421]">
                Tiếng Việt Cho Người Nước Ngoài (Vietnamese for Beginners)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#666B67] mt-1">
              Bilingual English-Vietnamese guide: master 6 tones, natural daily dialogues, and social etiquette.
            </p>
          </div>
        </div>

        {/* Quick Topic Buttons */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-[#5A605B] uppercase tracking-wider mb-2">
            Chủ đề phổ biến (Popular Everyday Scenarios):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {quickTopics.map((topic, idx) => {
              const Icon = topic.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleLearnTopic(topic.query)}
                  className="p-3 rounded-xl bg-[#FAF8F4] border border-[#E0D8C8] hover:border-[#B83B26] hover:bg-white text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1F2421] group-hover:text-[#B83B26]">
                    <Icon className="w-4 h-4 text-[#B83B26]" />
                    <span>{topic.label}</span>
                  </div>
                  <div className="text-[11px] text-[#7A7F7B] mt-1 line-clamp-1">{topic.query}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input */}
        <div className="mt-4">
          <label htmlFor="foreign-topic-input" className="block text-xs font-semibold text-[#5A605B] uppercase tracking-wider mb-2">
            Ask about any Vietnamese word, phrase, or situation:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="foreign-topic-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLearnTopic()}
              placeholder="e.g. How to ask how much something costs in Vietnamese..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C5] text-sm text-[#1F2421] focus:outline-hidden focus:border-[#B83B26]"
            />
            <button
              onClick={() => handleLearnTopic()}
              disabled={isLoading || !searchQuery.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#B83B26] hover:bg-[#A13320] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating guide...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Học chủ đề này
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="mt-3 p-3 rounded-xl bg-[#FDF2F0] border border-[#F5C2BC] text-xs text-[#B83B26]">
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* 6 Vietnamese Tones Reference Card (Always visible & super handy) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E7DFCE] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#EFE8DC] pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#575E59] flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#B83B26]" />
            Bảng 6 Thanh Điệu Tiếng Việt (The 6 Vietnamese Tones)
          </h3>
          <span className="text-xs text-[#7A7F7B]">Click to listen to sample "ma"</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {VIETNAMESE_TONES.map((tone, idx) => (
            <div
              key={idx}
              onClick={() => handleSpeak(tone.mark)}
              className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E0D2] hover:border-[#B83B26] hover:bg-[#FDFBF7] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold font-serif text-[#B83B26] group-hover:scale-110 transition-transform">
                    {tone.mark}
                  </span>
                  <Volume2 className="w-3.5 h-3.5 text-[#888] group-hover:text-[#B83B26]" />
                </div>
                <div className="text-xs font-bold text-[#1F2421] mt-1">{tone.name}</div>
                <div className="text-[10px] text-[#69543E] font-medium mt-0.5">{tone.pitch}</div>
              </div>
              <div className="text-[10px] text-[#888] mt-2 border-t border-[#EDE5D5] pt-1 leading-tight">
                {tone.soundLike}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Result Card */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main Explanation */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E7DFCE] shadow-xs space-y-4">
            <div className="border-b border-[#EFE8DC] pb-3">
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#1F2421]">
                {result.topic}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A504B] mt-1 leading-relaxed">
                {result.explanationEn}
              </p>
              <p className="text-xs text-[#7A5022] mt-1 italic">
                {result.explanationVi}
              </p>
            </div>

            {/* Practical Phrases */}
            {result.practicalPhrases && result.practicalPhrases.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B807C]">
                  Key Practical Phrases to Memorize:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.practicalPhrases.map((phrase, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE2D2] flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="text-sm font-bold font-serif text-[#1F2421] flex items-center gap-2">
                          <span>{phrase.vietnamese}</span>
                          <button
                            onClick={() => handleSpeak(phrase.vietnamese)}
                            className="p-1 text-[#888] hover:text-[#B83B26] cursor-pointer"
                            title="Nghe câu này"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-xs text-[#4E5450] mt-0.5">{phrase.english}</div>
                        <div className="text-[11px] text-[#8C5819] italic mt-1">Context: {phrase.context}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real Everyday Dialogue */}
            {result.shortDialogue && result.shortDialogue.length > 0 && (
              <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#E5DEC8] space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A5022] flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-[#B83B26]" />
                  Everyday Dialogue (Hội thoại thực tế):
                </h4>
                <div className="space-y-2">
                  {result.shortDialogue.map((d, idx) => (
                    <div key={idx} className="text-xs flex items-start gap-2 bg-white p-2.5 rounded-lg border border-[#E2D8C6]">
                      <span className="font-bold text-[#B83B26] px-1.5 py-0.5 rounded-md bg-[#FAF0ED]">
                        {d.speaker}:
                      </span>
                      <div className="flex-1">
                        <div className="font-bold font-serif text-[#1F2421] flex items-center gap-2">
                          <span>{d.vi}</span>
                          <button
                            onClick={() => handleSpeak(d.vi)}
                            className="p-0.5 text-[#888] hover:text-[#B83B26] cursor-pointer"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[#666B67] text-[11px]">{d.en}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cultural & Pronoun Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#F4F8F5] border border-[#D5E6DC] text-xs space-y-1">
                <div className="font-bold uppercase tracking-wider text-emerald-800">
                  Cultural Note & Politeness:
                </div>
                <p className="text-[#2D4537] leading-relaxed">{result.culturalNote}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FDF7F0] border border-[#F0DFCA] text-xs space-y-1">
                <div className="font-bold uppercase tracking-wider text-[#8C5819]">
                  Pronoun Tip (Xưng hô):
                </div>
                <p className="text-[#59422A] leading-relaxed">{result.pronounTip}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
