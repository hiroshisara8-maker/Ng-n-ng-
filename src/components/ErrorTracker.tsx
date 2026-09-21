import React, { useState } from 'react';
import {
  BookmarkCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Filter,
  Check,
  RotateCcw,
  Award,
  HelpCircle,
} from 'lucide-react';
import { SavedMistake, GeneratedExercise } from '../types';

interface ErrorTrackerProps {
  mistakes: SavedMistake[];
  onRemoveMistake: (id: string) => void;
  onToggleMastered: (id: string) => void;
  onAddCustomMistake: (mistake: Omit<SavedMistake, 'id' | 'createdAt' | 'practicedCount' | 'isMastered'>) => void;
  onAddPoints: (points: number) => void;
}

export const ErrorTracker: React.FC<ErrorTrackerProps> = ({
  mistakes,
  onRemoveMistake,
  onToggleMastered,
  onAddCustomMistake,
  onAddPoints,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('Tất cả');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOriginal, setNewOriginal] = useState('');
  const [newSuggestion, setNewSuggestion] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newType, setNewType] = useState('Chính tả s/x');

  // Exercise State
  const [isGeneratingExercise, setIsGeneratingExercise] = useState(false);
  const [exercise, setExercise] = useState<GeneratedExercise | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const errorTypes = ['Tất cả', 'Chính tả s/x', 'Dấu thanh', 'Từ Hán Việt', 'Phụ âm d/gi/r', 'Âm cuối c/t', 'Văn phong/Lặp từ'];

  const filteredMistakes = selectedFilter === 'Tất cả'
    ? mistakes
    : mistakes.filter((m) => m.type.includes(selectedFilter) || selectedFilter.includes(m.type));

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOriginal.trim() || !newSuggestion.trim()) return;

    onAddCustomMistake({
      original: newOriginal.trim(),
      suggestion: newSuggestion.trim(),
      reason: newReason.trim() || 'Lỗi cá nhân ghi nhớ',
      type: newType,
    });

    setNewOriginal('');
    setNewSuggestion('');
    setNewReason('');
    setShowAddModal(false);
  };

  const handleGenerateExercise = async () => {
    if (mistakes.length === 0) {
      alert('Bạn chưa có lỗi nào trong Sổ tay để tạo bài luyện. Hãy kiểm tra chính tả hoặc thêm lỗi thủ công nhé!');
      return;
    }

    setIsGeneratingExercise(true);
    setExercise(null);
    setUserAnswers({});
    setShowResults(false);

    try {
      const response = await fetch('/api/generate-error-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors: mistakes }),
      });

      if (!response.ok) {
        throw new Error('Lỗi khi tạo bài luyện.');
      }

      const data: GeneratedExercise = await response.json();
      setExercise(data);
    } catch (err: any) {
      alert('Lỗi tạo bài tập: ' + err.message);
    } finally {
      setIsGeneratingExercise(false);
    }
  };

  const handleSelectAnswer = (qId: number, option: string) => {
    if (showResults) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleCheckAnswers = () => {
    if (!exercise) return;
    let correctCount = 0;
    exercise.questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (ans && (ans === q.correctAnswer || ans.includes(q.correctAnswer))) {
        correctCount++;
      }
    });

    const calculated = Math.round((correctCount / exercise.questions.length) * 100);
    setQuizScore(calculated);
    setShowResults(true);
    onAddPoints(correctCount * 15);
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-5 sm:p-6 border border-[#E7DFCE] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE8DC] pb-4">
          <div>
            <h2 className="text-xl font-bold font-serif text-[#1F2421] flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-[#B83B26]" />
              Sổ Tay Lỗi Thường Gặp & Bài Luyện Cá Nhân Hóa
            </h2>
            <p className="text-xs sm:text-sm text-[#666B67] mt-1">
              Hệ thống tự động lưu lại những điểm bạn hay mắc phải và thiết kế bài luyện tương tác riêng để khắc phục triệt để.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs px-3 py-2 rounded-xl bg-[#FAF5EE] hover:bg-[#F0E6D8] text-[#7A5022] border border-[#E0D5C2] transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm lỗi thủ công
            </button>

            <button
              onClick={handleGenerateExercise}
              disabled={isGeneratingExercise || mistakes.length === 0}
              className="text-xs px-4 py-2 rounded-xl bg-[#B83B26] hover:bg-[#A13320] text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer font-semibold disabled:opacity-50"
            >
              {isGeneratingExercise ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang soạn bài luyện...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Tạo bài luyện tập riêng
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs text-[#7A7F7B] font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Phân loại:
          </span>
          {errorTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedFilter(type)}
              className={`text-xs px-3 py-1 rounded-full border transition-all cursor-pointer ${
                selectedFilter === type
                  ? 'bg-[#B83B26] text-white border-[#B83B26]'
                  : 'bg-[#FAF8F5] text-[#555] border-[#DDD5C5] hover:bg-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Practice Exercise Modal/Block */}
      {exercise && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-[#D97D68] shadow-sm space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFE8DC] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#FAF0ED] text-[#B83B26] text-[11px] font-bold">
                  Bài Luyện Cá Nhân Hóa
                </span>
                <h3 className="text-base sm:text-lg font-bold font-serif text-[#1F2421]">
                  {exercise.title}
                </h3>
              </div>
              <p className="text-xs text-[#69543E] mt-1 italic">
                {exercise.encouragement}
              </p>
            </div>

            <button
              onClick={() => setExercise(null)}
              className="self-start sm:self-auto text-xs text-[#888] hover:text-[#222] cursor-pointer"
            >
              Đóng bài tập
            </button>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {exercise.questions.map((q, qIndex) => {
              const selectedOpt = userAnswers[q.id];
              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-[#FAF8F4] border border-[#E7E0D2] space-y-3"
                >
                  <div className="font-semibold text-xs sm:text-sm text-[#1F2421] flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#EFE9DC] text-[#7A5022] flex items-center justify-center text-xs shrink-0 font-bold">
                      {qIndex + 1}
                    </span>
                    <span>{q.question}</span>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selectedOpt === opt;
                      const isCorrect = showResults && (opt === q.correctAnswer || opt.includes(q.correctAnswer));
                      const isWrong = showResults && isChosen && !isCorrect;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(q.id, opt)}
                          disabled={showResults}
                          className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold'
                              : isWrong
                              ? 'bg-rose-50 border-rose-400 text-rose-800 line-through'
                              : isChosen
                              ? 'bg-[#FAF0ED] border-[#B83B26] text-[#B83B26]'
                              : 'bg-white border-[#DDD5C5] text-[#333] hover:bg-[#FAF8F5]'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after checking */}
                  {showResults && (
                    <div className="pl-7 pt-1 text-xs text-[#54432F] bg-[#F7F3EB] p-2.5 rounded-lg border border-[#EDE5D5]">
                      💡 <strong>Quy tắc chuẩn:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-[#EFE8DC]">
            {!showResults ? (
              <button
                onClick={handleCheckAnswers}
                disabled={Object.keys(userAnswers).length === 0}
                className="px-6 py-2.5 rounded-xl bg-[#B83B26] hover:bg-[#A13320] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                Nộp bài & Xem kết quả
              </button>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="text-sm font-bold font-serif text-[#B83B26] flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-700" />
                  Bạn đạt {quizScore}% độ chuẩn xác! Đã cộng điểm Mực Hoa.
                </div>
                <button
                  onClick={handleGenerateExercise}
                  className="px-4 py-2 rounded-xl bg-[#FAF4ED] text-[#7A5022] border border-[#E2D5BE] text-xs font-semibold hover:bg-[#F2E7D8] cursor-pointer"
                >
                  Làm đề bài khác
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* List of Tracked Mistakes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#575E59]">
            Danh sách lỗi đã ghi nhận ({filteredMistakes.length}):
          </h3>
          <span className="text-xs text-[#7A7F7B]">
            Đã thành thạo: {mistakes.filter((m) => m.isMastered).length}/{mistakes.length}
          </span>
        </div>

        {filteredMistakes.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#E7DFCE] text-[#888] space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-[#CCC]" />
            <p className="text-sm">Chưa có lỗi nào trong sổ tay theo bộ lọc này.</p>
            <p className="text-xs">Khi bạn kiểm tra chính tả hoặc câu văn, hãy bấm "Lưu vào Sổ tay lỗi" để lưu lại và luyện tập nhé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMistakes.map((mistake) => (
              <div
                key={mistake.id}
                className={`p-4 rounded-xl border transition-all shadow-2xs space-y-2.5 ${
                  mistake.isMastered
                    ? 'bg-[#F9FCFA] border-[#D4E8DC] opacity-80'
                    : 'bg-white border-[#E8DFCE]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[#B83B26] line-through bg-[#FAF0ED] px-2 py-0.5 rounded-md">
                      {mistake.original}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#888]" />
                    <span className="text-sm font-bold text-emerald-800 bg-[#EEF8F1] px-2 py-0.5 rounded-md">
                      {mistake.suggestion}
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F3EFE6] text-[#69543E]">
                    {mistake.type}
                  </span>
                </div>

                <p className="text-xs text-[#525754]">
                  {mistake.reason}
                </p>

                {mistake.sourceContext && (
                  <p className="text-[11px] text-[#8A908B] italic truncate">
                    Ngữ cảnh: "{mistake.sourceContext}"
                  </p>
                )}

                <div className="pt-2 border-t border-[#F0EAE0] flex items-center justify-between text-xs">
                  <button
                    onClick={() => onToggleMastered(mistake.id)}
                    className={`flex items-center gap-1 cursor-pointer font-medium ${
                      mistake.isMastered
                        ? 'text-emerald-700'
                        : 'text-[#888] hover:text-[#111]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {mistake.isMastered ? 'Đã nắm vững' : 'Đánh dấu đã hiểu'}
                  </button>

                  <button
                    onClick={() => onRemoveMistake(mistake.id)}
                    className="text-[#999] hover:text-rose-600 transition-colors cursor-pointer"
                    title="Xóa lỗi này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom Mistake Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#DDD5C5] shadow-lg space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold font-serif text-[#1F2421]">
              Ghi Lại Lỗi Cá Nhân Vào Sổ Tay
            </h3>

            <form onSubmit={handleCreateCustom} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#555] mb-1">Từ / Cụm từ viết sai:</label>
                <input
                  type="text"
                  value={newOriginal}
                  onChange={(e) => setNewOriginal(e.target.value)}
                  placeholder="Ví dụ: suất sắc, đọc giả..."
                  className="w-full p-2.5 rounded-lg bg-[#FAF8F5] border border-[#DDD5C5] text-sm focus:border-[#B83B26]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#555] mb-1">Cách viết / Dùng từ đúng:</label>
                <input
                  type="text"
                  value={newSuggestion}
                  onChange={(e) => setNewSuggestion(e.target.value)}
                  placeholder="Ví dụ: xuất sắc, độc giả..."
                  className="w-full p-2.5 rounded-lg bg-[#FAF8F5] border border-[#DDD5C5] text-sm focus:border-[#B83B26]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#555] mb-1">Phân loại:</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#FAF8F5] border border-[#DDD5C5] text-sm"
                >
                  <option value="Chính tả s/x">Chính tả s/x</option>
                  <option value="Dấu thanh">Dấu thanh (hỏi/ngã)</option>
                  <option value="Từ Hán Việt">Từ Hán Việt</option>
                  <option value="Phụ âm d/gi/r">Phụ âm d/gi/r</option>
                  <option value="Âm cuối c/t">Âm cuối c/t</option>
                  <option value="Văn phong/Lặp từ">Văn phong / Lặp từ</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#555] mb-1">Ghi chú nguyên do hoặc mẹo nhớ:</label>
                <textarea
                  rows={2}
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="Giải thích vì sao sai hoặc quy tắc nhớ..."
                  className="w-full p-2.5 rounded-lg bg-[#FAF8F5] border border-[#DDD5C5] text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#F2EDE2] text-[#555] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#B83B26] text-white font-semibold cursor-pointer"
                >
                  Lưu vào Sổ tay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
