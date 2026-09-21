import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Award,
  ChevronRight,
  Send,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  FileCheck,
  Star,
  Copy,
  Check,
} from 'lucide-react';
import { WRITING_TOPICS } from '../data/literaryData';
import { WritingFeedbackResult } from '../types';

interface WritingWorkshopProps {
  onAddPoints: (points: number) => void;
  onCheckBadges: (overallScore: number) => void;
}

export const WritingWorkshop: React.FC<WritingWorkshopProps> = ({ onAddPoints, onCheckBadges }) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('Tất cả');
  const [selectedTopic, setSelectedTopic] = useState(WRITING_TOPICS[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [essayContent, setEssayContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WritingFeedbackResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const levels = ['Tất cả', 'Cơ bản', 'Trung bình', 'Nâng cao'];

  const filteredTopics = selectedLevel === 'Tất cả'
    ? WRITING_TOPICS
    : WRITING_TOPICS.filter((t) => t.level === selectedLevel);

  const handleSelectTopic = (topic: typeof WRITING_TOPICS[0]) => {
    setSelectedTopic(topic);
    setIsCustom(false);
    if (!essayContent.trim()) {
      setEssayContent(topic.sampleOpening);
    }
  };

  const handleSubmitEssay = async () => {
    if (!essayContent.trim() || essayContent.trim().length < 50) {
      setErrorMsg('Bài viết văn cần đạt tối thiểu 50 ký tự để AI có thể đánh giá bố cục và câu từ sâu sắc.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    const activeTopicTitle = isCustom ? (customTopic || 'Chủ đề tự do') : selectedTopic.title;
    const activeLevel = isCustom ? 'Tự chọn' : selectedTopic.level;

    try {
      const response = await fetch('/api/writing-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeTopicTitle,
          level: activeLevel,
          essay: essayContent,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Lỗi khi gửi bài viết văn.');
      }

      const data: WritingFeedbackResult = await response.json();
      setResult(data);
      onAddPoints(50);
      onCheckBadges(data.overallScore);
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
      {/* Header & Topic Selector */}
      <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-5 sm:p-6 border border-[#E7DFCE] shadow-xs">
        <div className="border-b border-[#EFE8DC] pb-4">
          <h2 className="text-xl font-bold font-serif text-[#1F2421] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#B83B26]" />
            Luyện Viết Văn & Nhận Góp Ý
          </h2>
          <p className="text-xs sm:text-sm text-[#666B67] mt-1">
            Chọn chủ đề theo cấp độ (hoặc tự đặt đề tài), thỏa sức chắp bút và nhận nhận xét toàn diện về bố cục, từ ngữ và chiều sâu cảm xúc.
          </p>
        </div>

        {/* Level Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs font-semibold text-[#5A605B] uppercase tracking-wider mr-1">Cấp độ:</span>
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-[#B83B26] text-white shadow-2xs'
                  : 'bg-[#F3EFE6] text-[#555] hover:bg-[#E8E1D2]'
              }`}
            >
              {lvl}
            </button>
          ))}
          <button
            onClick={() => setIsCustom(!isCustom)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
              isCustom
                ? 'bg-[#7A5022] text-white border-transparent'
                : 'bg-white text-[#7A5022] border-[#DFC9AB] hover:bg-[#FAF4ED]'
            }`}
          >
            + Đề tài tự chọn
          </button>
        </div>

        {/* Topic Grid */}
        {!isCustom ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {filteredTopics.map((topic) => {
              const isCurrent = selectedTopic.id === topic.id;
              return (
                <div
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-[#FAF3EE] border-[#C85D48] ring-1 ring-[#C85D48]/30 shadow-2xs'
                      : 'bg-[#FAF8F5] border-[#E3DBD0] hover:bg-white hover:border-[#D5CBBC]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-semibold px-2 py-0.5 rounded-full bg-[#EFE9DC] text-[#7A5C3D]">
                        {topic.level}
                      </span>
                      <span className="text-[#888]">{topic.category}</span>
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-[#1F2421] font-serif leading-snug">
                      {topic.title}
                    </h3>
                    <p className="text-[11px] text-[#6E736F] mt-1 line-clamp-2">
                      {topic.prompt}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#EDE5D8] flex items-center justify-between text-[11px] text-[#B83B26] font-medium">
                    <span>{isCurrent ? 'Đang chọn viết' : 'Chọn đề tài này'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-xl bg-[#FAF8F4] border border-[#E5DEC7] space-y-2">
            <label htmlFor="custom-topic-input" className="block text-xs font-semibold text-[#5A605B]">
              Nhập đề tài / chủ đề bạn tự chọn:
            </label>
            <input
              id="custom-topic-input"
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Ví dụ: Cảm nghĩ về tình mẫu tử, Phân tích bài thơ Quê hương..."
              className="w-full p-2.5 rounded-lg bg-white border border-[#DDD5C5] text-sm text-[#1F2421] focus:outline-hidden focus:border-[#B83B26]"
            />
          </div>
        )}

        {/* Selected Topic Prompt Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#F7F3EB] border border-[#E5DEC7] text-xs text-[#4F4638]">
          <span className="font-bold text-[#7A5022]">Đề tài: </span>
          <span className="font-semibold">{isCustom ? (customTopic || 'Chủ đề tự chọn') : selectedTopic.title}</span>
          {!isCustom && (
            <div className="mt-1 text-[#665D4F]">
              <strong>Gợi ý hướng viết:</strong> {selectedTopic.prompt}
            </div>
          )}
        </div>

        {/* Writing Editor Area */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="essay-content-input" className="text-xs font-semibold text-[#5A605B] uppercase tracking-wider">
              Bài viết của bạn:
            </label>
            <span className="text-xs text-[#8A908B]">
              {essayContent.trim() ? essayContent.trim().split(/\s+/).length : 0} từ • {essayContent.length} ký tự
            </span>
          </div>

          <div className="relative">
            <textarea
              id="essay-content-input"
              rows={10}
              value={essayContent}
              onChange={(e) => setEssayContent(e.target.value)}
              placeholder="Bắt đầu viết bài của bạn ở đây. Hãy thả hồn vào từng con chữ..."
              className="w-full p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD5C5] focus:border-[#B83B26] focus:bg-white focus:outline-hidden text-[#2D312E] text-sm leading-relaxed transition-all font-serif resize-y placeholder:text-[#A0A5A0]"
            />
            {essayContent && (
              <button
                onClick={() => setEssayContent('')}
                className="absolute right-3 top-3 p-1 text-[#8A908B] hover:text-[#2D312E] transition-colors cursor-pointer"
                title="Xóa trắng bài viết"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
            <span className="text-[11px] text-[#7A807B]">
              💡 <em>Mẹo: Bài viết có cấu trúc 3 phần (Mở - Thân - Kết) sẽ được đánh giá điểm cao hơn.</em>
            </span>

            <button
              onClick={handleSubmitEssay}
              disabled={isLoading || !essayContent.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#B83B26] hover:bg-[#A13320] active:scale-98 text-white text-sm font-medium transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Giám khảo đang chấm bút...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Chấm bài & Nhận góp ý
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

      {/* Writing Feedback Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Overall Score Banner */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E7DFCE] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE8DC] pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#FAF0ED] border border-[#F2D7D1] flex flex-col items-center justify-center text-[#B83B26]">
                  <span className="text-2xl font-black font-serif">{result.overallScore}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider">Thang 10</span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-serif text-[#1F2421] flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-700" />
                    Đánh Giá Toàn Diện Bút Lực
                  </h3>
                  <p className="text-xs sm:text-sm text-[#666B67] mt-0.5">
                    {result.generalCritique}
                  </p>
                </div>
              </div>

              {result.overallScore >= 8.5 && (
                <div className="self-start sm:self-auto px-3 py-1.5 rounded-full bg-[#FEF6E9] border border-[#F1D6A7] text-xs font-bold text-[#8C5819] flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Đạt danh hiệu Cây Bút Xuất Sắc!
                </div>
              )}
            </div>

            {/* Metric Score Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-[#FAF8F4] border border-[#E8E1D3]">
                <div className="text-[11px] text-[#7A7F7B] uppercase font-semibold">Bố cục & Mạch ý</div>
                <div className="text-lg font-black text-[#1F2421] mt-1 font-serif">
                  {result.scores?.structure ?? 8}/10
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F4] border border-[#E8E1D3]">
                <div className="text-[11px] text-[#7A7F7B] uppercase font-semibold">Vốn từ & Độ đắt</div>
                <div className="text-lg font-black text-[#1F2421] mt-1 font-serif">
                  {result.scores?.vocabulary ?? 8}/10
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F4] border border-[#E8E1D3]">
                <div className="text-[11px] text-[#7A7F7B] uppercase font-semibold">Nhịp điệu & Cú pháp</div>
                <div className="text-lg font-black text-[#1F2421] mt-1 font-serif">
                  {result.scores?.flow ?? 8}/10
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F4] border border-[#E8E1D3]">
                <div className="text-[11px] text-[#7A7F7B] uppercase font-semibold">Cảm xúc & Chiều sâu</div>
                <div className="text-lg font-black text-[#1F2421] mt-1 font-serif">
                  {result.scores?.depth ?? 8}/10
                </div>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-[#EFE8DC]">
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Điểm sáng nổi bật:
                </div>
                <ul className="space-y-1.5">
                  {result.strengths?.map((s, idx) => (
                    <li key={idx} className="text-xs text-[#3D423F] flex items-start gap-2">
                      <span className="text-emerald-700 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#A8452D] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Điểm cần mài giũa thêm:
                </div>
                <ul className="space-y-1.5">
                  {result.improvements?.map((imp, idx) => (
                    <li key={idx} className="text-xs text-[#3D423F] flex items-start gap-2">
                      <span className="text-[#A8452D] font-bold">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sentence Analysis */}
          {result.sentenceAnalysis && result.sentenceAnalysis.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#575E59] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#7A5022]" />
                Nhận xét chi tiết từng câu trong bài viết:
              </h3>

              <div className="space-y-3">
                {result.sentenceAnalysis.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-[#E8DFCE] shadow-2xs space-y-2">
                    <div className="text-xs text-[#6F7571]">
                      <strong>Câu gốc:</strong> "{item.original}"
                    </div>
                    <div className="text-xs text-[#424744] bg-[#FAF8F4] p-2.5 rounded-lg border border-[#EDE5D8]">
                      <strong>Góp ý giám khảo:</strong> {item.praiseOrFix}
                    </div>
                    {item.suggestedRevision && (
                      <div className="text-xs font-serif text-[#1F2421] bg-[#F4F8F5] p-2.5 rounded-lg border border-[#D5E6DC]">
                        <strong className="font-sans text-emerald-800 text-[11px] block mb-0.5">Gợi ý cách viết nâng tầm:</strong>
                        {item.suggestedRevision}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revised Exemplary Version */}
          {result.revisedExemplaryVersion && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E7DFCE] shadow-xs">
              <div className="flex items-center justify-between border-b border-[#EFE8DC] pb-3 mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#575E59] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B83B26]" />
                  Bài văn mẫu tham khảo đã nâng tầm (Giữ trọn ý của bạn)
                </h3>

                <button
                  onClick={() => handleCopy(result.revisedExemplaryVersion)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#F5F2EB] hover:bg-[#EBE6DB] text-[#2D312E] border border-[#DDD5C5] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Đã chép' : 'Sao chép văn mẫu'}
                </button>
              </div>

              <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#EAE2D2] text-sm leading-relaxed text-[#1F2421] font-serif whitespace-pre-wrap">
                {result.revisedExemplaryVersion}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
