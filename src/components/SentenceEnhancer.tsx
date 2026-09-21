import React, { useState } from 'react';
import {
  PenTool,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  FileText,
  Lightbulb,
  ArrowRight,
  BookmarkPlus,
  BookOpen,
} from 'lucide-react';
import { SentenceImproveResult, SavedMistake } from '../types';
import { SAMPLE_IMPROVE_TEXT } from '../data/literaryData';

interface SentenceEnhancerProps {
  onSaveMistake: (mistake: Omit<SavedMistake, 'id' | 'createdAt' | 'practicedCount' | 'isMastered'>) => void;
  onAddPoints: (points: number) => void;
}

export const SentenceEnhancer: React.FC<SentenceEnhancerProps> = ({ onSaveMistake, onAddPoints }) => {
  const [inputText, setInputText] = useState('');
  const [style, setStyle] = useState<'natural' | 'literary' | 'concise' | 'formal'>('literary');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SentenceImproveResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const styleOptions = [
    { id: 'natural', label: 'Tự nhiên & Gần gũi', desc: 'Mượt mà, loại bỏ lủng củng, khẩu ngữ hài hòa' },
    { id: 'literary', label: 'Giàu chất văn học', desc: 'Giàu hình ảnh, nhịp điệu thơ mộng, từ ngữ tinh tế' },
    { id: 'concise', label: 'Súc tích & Gãy gọn', desc: 'Cô đọng ý tứ, gọt giũa từ thừa, súc tích' },
    { id: 'formal', label: 'Trang trọng & Chuẩn mực', desc: 'Học thuật, công sở, từ ngữ chuẩn xác, lịch sự' },
  ];

  const handleImprove = async () => {
    if (!inputText.trim()) {
      setErrorMsg('Vui lòng nhập câu hoặc đoạn văn bạn muốn trau chuốt.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/improve-sentences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, style }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Lỗi khi xử lý cải thiện câu văn.');
      }

      const data: SentenceImproveResult = await response.json();
      setResult(data);
      onAddPoints(20);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Configuration & Input Card */}
      <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-5 sm:p-6 border border-[#E7DFCE] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE8DC] pb-4">
          <div>
            <h2 className="text-xl font-bold font-serif text-[#1F2421] flex items-center gap-2">
              <PenTool className="w-5 h-5 text-[#B83B26]" />
              Cải Thiện & Trau Chuốt Câu Văn
            </h2>
            <p className="text-xs sm:text-sm text-[#666B67] mt-1">
              Phát hiện câu tối nghĩa, lặp từ hoặc thiếu tự nhiên, gợi ý văn phong giàu chất văn học mà vẫn giữ trọn ý của bạn.
            </p>
          </div>

          <button
            onClick={() => setInputText(SAMPLE_IMPROVE_TEXT)}
            className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg bg-[#F2EDE2] hover:bg-[#E8E0D0] text-[#69543E] border border-[#DDD4C1] transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <FileText className="w-3.5 h-3.5" />
            Dán đoạn văn mẫu lặp từ
          </button>
        </div>

        {/* Style selection pills */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-[#5A605B] uppercase tracking-wider mb-2">
            Chọn phong cách văn phong mong muốn:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {styleOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setStyle(opt.id as any)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  style === opt.id
                    ? 'bg-[#FAF3EE] border-[#C85D48] text-[#8C2817] shadow-2xs ring-1 ring-[#C85D48]/30'
                    : 'bg-[#FAF8F5] border-[#E2DBD0] text-[#4A504B] hover:bg-white hover:border-[#D5CBBC]'
                }`}
              >
                <div className="font-semibold text-xs sm:text-sm">{opt.label}</div>
                <div className="text-[11px] text-[#787E79] mt-0.5 leading-tight">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Text input area */}
        <div className="mt-4">
          <label htmlFor="improve-input" className="block text-xs font-semibold text-[#5A605B] uppercase tracking-wider mb-2">
            Nhập câu văn hoặc đoạn văn của bạn:
          </label>
          <div className="relative">
            <textarea
              id="improve-input"
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập đoạn văn của bạn... (ví dụ đoạn văn bị lặp từ 'chúng ta', 'nó là', câu văn lủng củng)"
              className="w-full p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD5C5] focus:border-[#B83B26] focus:bg-white focus:outline-hidden text-[#2D312E] text-sm leading-relaxed transition-all resize-y placeholder:text-[#A0A5A0]"
            />
            {inputText && (
              <button
                onClick={() => { setInputText(''); setResult(null); }}
                className="absolute right-3 top-3 p-1 text-[#8A908B] hover:text-[#2D312E] transition-colors cursor-pointer"
                title="Xóa trắng"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-[#8A908B]">
              {inputText.length} ký tự
            </span>

            <button
              onClick={handleImprove}
              disabled={isLoading || !inputText.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#B83B26] hover:bg-[#A13320] active:scale-98 text-white text-sm font-medium transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang mài giũa câu từ...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Trau chuốt câu văn
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

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Side by side or enhanced card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E7DFCE] shadow-xs">
            <div className="flex items-center justify-between border-b border-[#EFE8DC] pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#575E59] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B83B26]" />
                Bản nâng tầm hoàn chỉnh (Phong cách: {styleOptions.find(s => s.id === style)?.label})
              </h3>

              <button
                onClick={() => handleCopy(result.improvedText)}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#F5F2EB] hover:bg-[#EBE6DB] text-[#2D312E] border border-[#DDD5C5] transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Đã sao chép' : 'Sao chép kết quả'}
              </button>
            </div>

            <div className="p-5 rounded-xl bg-[#FDFBF7] border border-[#EBE4D5] text-base font-serif leading-relaxed text-[#1F2421] whitespace-pre-wrap shadow-2xs">
              {result.improvedText}
            </div>

            {/* Alternatives */}
            {result.alternatives && result.alternatives.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#F0EAE0]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B807C] mb-2">
                  Các cách diễn đạt thay thế gợi ý thêm:
                </h4>
                <div className="space-y-2">
                  {result.alternatives.map((alt, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#F9F7F2] border border-[#EAE3D5] text-xs text-[#3D423F] font-serif flex items-start justify-between gap-2"
                    >
                      <span>{alt}</span>
                      <button
                        onClick={() => handleCopy(alt)}
                        className="text-[11px] text-[#7A5022] hover:underline shrink-0 cursor-pointer"
                      >
                        Chép
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Specific Sentence Analyses */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#575E59] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#7A5022]" />
                So sánh chi tiết từng câu & Nguyên do thay đổi:
              </h3>

              <div className="space-y-3">
                {result.suggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white border border-[#E8DFCE] shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF0ED] text-[#B83B26] border border-[#F2D7D1]">
                        {sug.improvementType || 'Nâng tầm diễn đạt'}
                      </span>

                      <button
                        onClick={() => onSaveMistake({
                          original: sug.originalSentence,
                          suggestion: sug.improvedSentence,
                          reason: sug.explanation,
                          type: 'Văn phong/Lặp từ',
                        })}
                        className="text-xs text-[#6B533E] hover:text-[#B83B26] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        Lưu vào Sổ tay để rèn luyện
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-xs text-[#7A7F7B]">
                        <span className="font-semibold text-[#B83B26]">Câu ban đầu:</span> {sug.originalSentence}
                      </div>
                      <div className="text-sm font-serif text-[#1F2421] bg-[#F9F7F2] p-2.5 rounded-lg border border-[#EDE5D5]">
                        <span className="font-bold text-emerald-800 font-sans text-xs mr-1">Gợi ý viết lại:</span>
                        {sug.improvedSentence}
                      </div>
                    </div>

                    <div className="text-xs text-[#525754] bg-[#F7F5EE] p-2.5 rounded-lg flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>Góc nhìn biên tập:</strong> {sug.explanation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Literary Tips */}
          {result.literaryTips && result.literaryTips.length > 0 && (
            <div className="p-4 rounded-xl bg-[#F7F4EC] border border-[#E2DAC9] text-xs text-[#524430] space-y-1.5">
              <div className="font-bold uppercase tracking-wider text-[#7A5022] flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-700" />
                Mẹo bút lực tiếng Việt:
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1">
                {result.literaryTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
