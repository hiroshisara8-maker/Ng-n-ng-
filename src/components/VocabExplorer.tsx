import React, { useState } from 'react';
import {
  BookMarked,
  Search,
  Volume2,
  Sparkles,
  BookOpen,
  Quote,
  Layers,
  ArrowRight,
  BookmarkPlus,
  Check,
} from 'lucide-react';
import { VocabResult } from '../types';
import { speakVietnamese } from '../utils/speech';

interface VocabExplorerProps {
  onAddPoints: (points: number) => void;
}

export const VocabExplorer: React.FC<VocabExplorerProps> = ({ onAddPoints }) => {
  const [searchTerm, setSearchTerm] = useState('bảng lảng');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VocabResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const suggestedWords = [
    'bảng lảng',
    'xán lạn',
    'thung dung',
    'bạt thiệp',
    'u uẩn',
    'hoài niệm',
    'phong vân',
    'trầm tích',
  ];

  const handleLookup = async (wordToSearch?: string) => {
    const term = wordToSearch || searchTerm;
    if (!term.trim()) {
      setErrorMsg('Vui lòng nhập từ hoặc cụm từ cần tra cứu.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);
    if (wordToSearch) setSearchTerm(wordToSearch);

    try {
      const response = await fetch('/api/vocab-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: term.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Lỗi khi tra cứu từ vựng.');
      }

      const data: VocabResult = await response.json();
      setResult(data);
      onAddPoints(10);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    setIsPlayingAudio(true);
    speakVietnamese(text, 0.9, () => {
      setIsPlayingAudio(false);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Search Box */}
      <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-5 sm:p-6 border border-[#E7DFCE] shadow-xs">
        <div className="border-b border-[#EFE8DC] pb-4">
          <h2 className="text-xl font-bold font-serif text-[#1F2421] flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-[#B83B26]" />
            Kho Tàng Từ Vựng Tiếng Việt
          </h2>
          <p className="text-xs sm:text-sm text-[#666B67] mt-1">
            Tra cứu nghĩa từ, từ loại, chiết tự Hán Việt, từ đồng nghĩa, trái nghĩa, sắc thái văn phong và trích dẫn văn chương.
          </p>
        </div>

        {/* Search input */}
        <div className="mt-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                placeholder="Nhập từ hoặc cụm từ (ví dụ: bạt thiệp, xán lạn, phong ba...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C5] focus:border-[#B83B26] focus:bg-white focus:outline-hidden text-[#2D312E] text-sm"
              />
            </div>
            <button
              onClick={() => handleLookup()}
              disabled={isLoading || !searchTerm.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#B83B26] hover:bg-[#A13320] active:scale-98 text-white text-sm font-medium transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang mở sách...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Tra cứu nghĩa
                </>
              )}
            </button>
          </div>

          {/* Word Suggestions Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="text-xs text-[#7E837F] mr-1">Từ vựng gợi ý hay:</span>
            {suggestedWords.map((word) => (
              <button
                key={word}
                onClick={() => handleLookup(word)}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#FAF4ED] hover:bg-[#F2E8DC] text-[#7A5022] border border-[#E8DEC9] transition-colors cursor-pointer"
              >
                {word}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="mt-3 p-3 rounded-xl bg-[#FDF2F0] border border-[#F5C2BC] text-xs text-[#B83B26]">
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Lookup Result Card */}
      {result && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E7DFCE] shadow-xs space-y-6 animate-in fade-in duration-300">
          {/* Main Title & Pronunciation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE8DC] pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl sm:text-3xl font-bold font-serif text-[#1F2421]">
                  {result.word}
                </h3>
                <button
                  onClick={() => handleSpeak(result.word)}
                  className={`p-2 rounded-full border transition-all cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-[#B83B26] text-white border-[#B83B26]'
                      : 'bg-[#F7F3EB] text-[#7A5022] border-[#E3D9C7] hover:bg-[#EFE7D7]'
                  }`}
                  title="Nghe phát âm chuẩn tiếng Việt"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EFE9DC] text-[#69543E]">
                  {result.partOfSpeech}
                </span>
                <span className="text-xs text-[#7A7F7B]">
                  {result.etymology}
                </span>
              </div>
            </div>

            <div className="text-xs text-[#7A5022] bg-[#FDF8F0] px-3 py-1.5 rounded-lg border border-[#EFE4D2] self-start sm:self-auto">
              <strong>Sắc thái:</strong> {result.nuance}
            </div>
          </div>

          {/* Definition */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B807C] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#B83B26]" />
              Định nghĩa chuẩn xác:
            </h4>
            <p className="text-sm sm:text-base font-serif text-[#2C2E2B] leading-relaxed bg-[#FAF8F5] p-4 rounded-xl border border-[#EFE8DC]">
              {result.definition}
            </p>
          </div>

          {/* Synonyms & Antonyms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Synonyms */}
            <div className="p-4 rounded-xl bg-[#F7F5EE] border border-[#EBE4D5] space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                Từ đồng nghĩa & Sắc thái dị biệt:
              </h4>
              <div className="space-y-2">
                {result.synonyms?.map((syn, idx) => (
                  <div key={idx} className="text-xs bg-white p-2.5 rounded-lg border border-[#E5DEC7]">
                    <div className="font-bold text-[#1F2421] text-sm font-serif">{syn.term}</div>
                    <div className="text-[#666B67] mt-0.5 text-[11px]">{syn.distinction}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Antonyms */}
            <div className="p-4 rounded-xl bg-[#FAF5EE] border border-[#EBE0D0] space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A8452D] flex items-center gap-1.5">
                <ArrowRight className="w-4 h-4" />
                Từ trái nghĩa:
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.antonyms && result.antonyms.length > 0 ? (
                  result.antonyms.map((ant, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-white border border-[#E0D4C2] text-xs font-serif font-semibold text-[#6E4226]"
                    >
                      {ant}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#8A908B] italic">Không có từ trái nghĩa trực tiếp.</span>
                )}
              </div>
            </div>
          </div>

          {/* Examples */}
          {result.examples && result.examples.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B807C]">
                Câu ví dụ minh họa:
              </h4>
              <div className="space-y-2">
                {result.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#FAF8F5] border border-[#EBE3D3] text-xs sm:text-sm font-serif text-[#3D423F] italic flex items-center justify-between"
                  >
                    <span>"{ex}"</span>
                    <button
                      onClick={() => handleSpeak(ex)}
                      className="p-1.5 text-[#888] hover:text-[#B83B26] transition-colors ml-2 shrink-0 cursor-pointer"
                      title="Nghe câu mẫu"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Literary Quote */}
          {result.literaryQuote && (
            <div className="p-4 rounded-xl bg-[#FDF9F2] border border-[#EBDCC5] space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8C5819] flex items-center gap-1.5">
                <Quote className="w-4 h-4" />
                Dấu ấn trong áng thơ ca & văn học:
              </div>
              <p className="text-sm font-serif italic text-[#4A3924] leading-relaxed pl-2 border-l-2 border-[#D97D68]">
                {result.literaryQuote}
              </p>
            </div>
          )}

          {/* Related Idioms */}
          {result.relatedIdioms && result.relatedIdioms.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B807C]">
                Thành ngữ, tục ngữ liên quan:
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.relatedIdioms.map((idm, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-[#F7F3EB] border border-[#E2D8C6] text-xs font-serif text-[#574431]"
                  >
                    {idm}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
