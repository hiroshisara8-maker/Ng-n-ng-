import React, { useState } from 'react';
import {
  SpellCheck,
  RotateCcw,
  Copy,
  Check,
  BookmarkPlus,
  Sparkles,
  Info,
  ArrowRight,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { SpellingResult, SpellingError, SavedMistake } from '../types';
import { SAMPLE_SPELL_TEXT } from '../data/literaryData';

interface SpellCheckerProps {
  onSaveMistake: (mistake: Omit<SavedMistake, 'id' | 'createdAt' | 'practicedCount' | 'isMastered'>) => void;
  onAddPoints: (points: number) => void;
}

export const SpellChecker: React.FC<SpellCheckerProps> = ({ onSaveMistake, onAddPoints }) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SpellingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedIndexMap, setSavedIndexMap] = useState<Record<number, boolean>>({});

  const handleCheck = async () => {
    if (!inputText.trim()) {
      setErrorMsg('Vui lòng nhập hoặc dán đoạn văn cần kiểm tra.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);
    setSavedIndexMap({});

    try {
      const response = await fetch('/api/check-spelling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Có lỗi xảy ra khi kiểm tra.');
      }

      const data: SpellingResult = await response.json();
      setResult(data);
      onAddPoints(15);
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

  const handleSaveToNotebook = (err: SpellingError, idx: number) => {
    onSaveMistake({
      original: err.original,
      suggestion: err.suggestion,
      reason: err.reason,
      type: err.type,
      sourceContext: inputText.slice(0, 100),
    });
    setSavedIndexMap(prev => ({ ...prev, [idx]: true }));
  };

  const handleApplyCorrection = () => {
    if (result?.correctedText) {
      setInputText(result.correctedText);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-5 sm:p-6 border border-[#E7DFCE] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE8DC] pb-4">
          <div>
            <h2 className="text-xl font-bold font-serif text-[#1F2421] flex items-center gap-2">
              <SpellCheck className="w-5 h-5 text-[#B83B26]" />
              Sửa Lỗi Chính Tả Tiếng Việt
            </h2>
            <p className="text-xs sm:text-sm text-[#666B67] mt-1">
              Phát hiện lỗi phụ âm đầu (s/x, ch/tr, d/gi/r), thanh điệu (hỏi/ngã), âm cuối và chuẩn hóa từ ngữ Hán Việt.
            </p>
          </div>

          <button
            onClick={() => setInputText(SAMPLE_SPELL_TEXT)}
            className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg bg-[#F2EDE2] hover:bg-[#E8E0D0] text-[#69543E] border border-[#DDD4C1] transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <FileText className="w-3.5 h-3.5" />
            Dán đoạn văn mẫu
          </button>
        </div>

        {/* Input area */}
        <div className="mt-4">
          <label htmlFor="spell-input" className="block text-xs font-semibold text-[#5A605B] uppercase tracking-wider mb-2">
            Nhập hoặc dán văn bản của bạn:
          </label>
          <div className="relative">
            <textarea
              id="spell-input"
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập hoặc dán đoạn văn bản cần trau chuốt chính tả ở đây..."
              className="w-full p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD5C5] focus:border-[#B83B26] focus:bg-white focus:outline-hidden text-[#2D312E] text-sm leading-relaxed transition-all resize-y placeholder:text-[#A0A5A0]"
            />
            {inputText && (
              <button
                onClick={() => { setInputText(''); setResult(null); }}
                className="absolute right-3 top-3 p-1 text-[#8A908B] hover:text-[#2D312E] transition-colors"
                title="Xóa trắng"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
            <span className="text-xs text-[#8A908B]">
              Độ dài: {inputText.length} ký tự • {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} từ
            </span>

            <button
              onClick={handleCheck}
              disabled={isLoading || !inputText.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#B83B26] hover:bg-[#A13320] active:scale-98 text-white text-sm font-medium transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang soi chiếu chữ nghĩa...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Kiểm tra chính tả ngay
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="mt-3 p-3 rounded-xl bg-[#FDF2F0] border border-[#F5C2BC] text-xs text-[#B83B26] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Summary Banner */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            result.errorCount === 0
              ? 'bg-[#F2F8F4] border-[#CDE5D6] text-[#295F3B]'
              : 'bg-[#FFF9F3] border-[#F1DEC7] text-[#7A4B1A]'
          }`}>
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-sm">
                {result.errorCount === 0
                  ? 'Văn bản của bạn đạt độ chuẩn xác xuất sắc!'
                  : `Phát hiện ${result.errorCount} điểm cần lưu tâm và trau chuốt.`}
              </div>
              <p className="text-xs mt-0.5 opacity-90">{result.summary}</p>
            </div>
          </div>

          {/* Corrected Text Box */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E7DFCE] shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFE8DC] pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#575E59] flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700" />
                Văn bản hoàn chỉnh đã sửa chuẩn
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleApplyCorrection}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#FAF5EC] hover:bg-[#F0E8D9] text-[#7A5022] border border-[#E2D5BE] transition-colors cursor-pointer"
                >
                  Áp dụng vào ô nhập
                </button>
                <button
                  onClick={() => handleCopy(result.correctedText)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#F5F2EB] hover:bg-[#EBE6DB] text-[#2D312E] border border-[#DDD5C5] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Đã chép' : 'Sao chép'}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#EBE3D3] text-sm leading-relaxed text-[#2C2E2B] font-serif whitespace-pre-wrap">
              {result.correctedText}
            </div>
          </div>

          {/* Detailed Error Breakdown */}
          {result.errors.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#575E59]">
                Chi tiết các điểm trau chuốt ({result.errors.length}):
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.errors.map((err, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white border border-[#E8DFCE] hover:border-[#D5C7AE] transition-all shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[#A83824] line-through bg-[#FDF0ED] px-2 py-0.5 rounded-md">
                          {err.original}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#888]" />
                        <span className="text-sm font-bold text-emerald-800 bg-[#EEF8F1] px-2 py-0.5 rounded-md">
                          {err.suggestion}
                        </span>
                      </div>

                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F4EFE6] text-[#69543E] border border-[#E5DEC7] shrink-0">
                        {err.type}
                      </span>
                    </div>

                    <p className="text-xs text-[#4F5450] leading-relaxed">
                      <strong className="text-[#2C2E2B]">Giải thích:</strong> {err.reason}
                    </p>

                    {err.rule && (
                      <div className="text-[11px] text-[#6E5434] bg-[#FAF6EE] p-2 rounded-lg border border-[#EDE5D3] italic">
                        💡 <strong>Mẹo ghi nhớ:</strong> {err.rule}
                      </div>
                    )}

                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => handleSaveToNotebook(err, idx)}
                        disabled={savedIndexMap[idx]}
                        className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                          savedIndexMap[idx]
                            ? 'bg-[#E8F5ED] text-emerald-800 border-emerald-300'
                            : 'bg-white hover:bg-[#F7F3EB] text-[#555] border-[#DDD5C5]'
                        }`}
                      >
                        {savedIndexMap[idx] ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Đã lưu vào Sổ tay lỗi
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="w-3.5 h-3.5" />
                            Lưu vào Sổ tay lỗi để luyện
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
