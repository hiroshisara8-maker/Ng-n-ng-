import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Square,
  Sparkles,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Award,
} from 'lucide-react';
import { PronunciationResult } from '../types';
import { SAMPLE_PRONUNCIATION_TEXT } from '../data/literaryData';
import {
  speakVietnamese,
  stopSpeaking,
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
} from '../utils/speech';

interface PronunciationPracticeProps {
  onAddPoints: (points: number) => void;
}

export const PronunciationPractice: React.FC<PronunciationPracticeProps> = ({ onAddPoints }) => {
  const [inputText, setInputText] = useState(SAMPLE_PRONUNCIATION_TEXT);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Audio Playback state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [recognizer, setRecognizer] = useState<any>(null);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      setErrorMsg('Vui lòng nhập đoạn văn cần luyện đọc và phát âm.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);
    setScore(null);
    setTranscribedText('');

    try {
      const response = await fetch('/api/pronunciation-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Lỗi khi phân tích phát âm.');
      }

      const data: PronunciationResult = await response.json();
      setResult(data);
      onAddPoints(20);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayModelReading = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    speakVietnamese(inputText, playbackSpeed, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleToggleRecord = () => {
    if (!isSpeechRecognitionSupported()) {
      setErrorMsg('Trình duyệt của bạn chưa hỗ trợ Web Speech Recognition. Vui lòng sử dụng Google Chrome hoặc Edge để ghi âm luyện đọc.');
      return;
    }

    if (isRecording) {
      if (recognizer) recognizer.stop();
      setIsRecording(false);
      return;
    }

    setTranscribedText('');
    setScore(null);
    setErrorMsg('');

    const rec = createSpeechRecognizer(
      (transcript) => {
        setTranscribedText(transcript);
        setIsRecording(false);
        // Calculate similarity score between user's reading and original text
        calculateReadingScore(transcript, inputText);
      },
      (err) => {
        console.error('Speech rec error:', err);
        setErrorMsg('Không thể nhận diện giọng nói: ' + err);
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );

    if (rec) {
      setRecognizer(rec);
      rec.start();
      setIsRecording(true);
    }
  };

  const calculateReadingScore = (spoken: string, original: string) => {
    const cleanSpoken = spoken.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim().split(/\s+/);
    const cleanOrig = original.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim().split(/\s+/);

    if (cleanOrig.length === 0) return;

    let matched = 0;
    for (const w of cleanSpoken) {
      if (cleanOrig.includes(w)) matched++;
    }

    const calculatedScore = Math.min(100, Math.round((matched / cleanOrig.length) * 100));
    setScore(calculatedScore);
    onAddPoints(30);
  };

  return (
    <div className="space-y-6">
      {/* Header and Passage Input */}
      <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-5 sm:p-6 border border-[#E7DFCE] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE8DC] pb-4">
          <div>
            <h2 className="text-xl font-bold font-serif text-[#1F2421] flex items-center gap-2">
              <Mic className="w-5 h-5 text-[#B83B26]" />
              Luyện Đọc – Phát Âm Diễn Cảm
            </h2>
            <p className="text-xs sm:text-sm text-[#666B67] mt-1">
              Phân tích ngắt nhịp (ngắt ngắn / ngắt dài), nhấn giọng truyền cảm, kiểm tra cao độ thanh điệu và nhận diện giọng đọc.
            </p>
          </div>

          <button
            onClick={() => setInputText(SAMPLE_PRONUNCIATION_TEXT)}
            className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg bg-[#F2EDE2] hover:bg-[#E8E0D0] text-[#69543E] border border-[#DDD4C1] transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <FileText className="w-3.5 h-3.5" />
            Đoạn văn thơ mẫu
          </button>
        </div>

        {/* Input */}
        <div className="mt-4">
          <label htmlFor="pronounce-input" className="block text-xs font-semibold text-[#5A605B] uppercase tracking-wider mb-2">
            Đoạn văn bản bạn muốn luyện đọc:
          </label>
          <div className="relative">
            <textarea
              id="pronounce-input"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập hoặc dán đoạn văn, câu thơ cần luyện đọc..."
              className="w-full p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD5C5] focus:border-[#B83B26] focus:bg-white focus:outline-hidden text-[#2D312E] text-sm leading-relaxed transition-all font-serif resize-y"
            />
            {inputText && (
              <button
                onClick={() => setInputText('')}
                className="absolute right-3 top-3 p-1 text-[#8A908B] hover:text-[#2D312E] transition-colors cursor-pointer"
                title="Xóa trắng"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
            {/* Audio speed toggles */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7A7F7B]">Tốc độ đọc mẫu:</span>
              <button
                onClick={() => setPlaybackSpeed(0.8)}
                className={`text-xs px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                  playbackSpeed === 0.8
                    ? 'bg-[#B83B26] text-white border-[#B83B26]'
                    : 'bg-[#F5F2EB] text-[#555] border-[#DDD5C5]'
                }`}
              >
                0.8x (Chậm)
              </button>
              <button
                onClick={() => setPlaybackSpeed(1.0)}
                className={`text-xs px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                  playbackSpeed === 1.0
                    ? 'bg-[#B83B26] text-white border-[#B83B26]'
                    : 'bg-[#F5F2EB] text-[#555] border-[#DDD5C5]'
                }`}
              >
                1.0x (Chuẩn)
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Play Model Voice */}
              <button
                onClick={handlePlayModelReading}
                disabled={!inputText.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isPlayingAudio
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-[#F4EFE6] hover:bg-[#EDE5D5] text-[#69543E] border-[#DDD5C5]'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    Dừng đọc mẫu
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    Nghe giọng mẫu
                  </>
                )}
              </button>

              {/* Analyze Guide */}
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !inputText.trim()}
                className="px-5 py-2 rounded-xl bg-[#B83B26] hover:bg-[#A13320] text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang soi nhịp điệu...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Hướng dẫn ngắt nhịp & phát âm
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-3 p-3 rounded-xl bg-[#FDF2F0] border border-[#F5C2BC] text-xs text-[#B83B26]">
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Recording & Evaluation Section */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E7DFCE] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE8DC] pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#575E59] flex items-center gap-2">
              <Mic className="w-4 h-4 text-[#B83B26]" />
              Thực Hành Ghi Âm & Chấm Điểm Giọng Đọc
            </h3>
            <p className="text-xs text-[#7A7F7B] mt-0.5">
              Bấm nút Ghi âm và đọc to đoạn văn trên. Hệ thống sẽ nhận diện và chấm mức độ chuẩn xác.
            </p>
          </div>

          <button
            onClick={handleToggleRecord}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
              isRecording
                ? 'bg-rose-700 text-white animate-pulse'
                : 'bg-[#B83B26] hover:bg-[#9E2F1C] text-white'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4" />
                Đang lắng nghe... (Bấm để hoàn tất)
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Bấm để đọc thử ngay
              </>
            )}
          </button>
        </div>

        {/* Recording Feedback Result */}
        {transcribedText && (
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE2D2] space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#555]">
                Lời bạn vừa đọc nhận diện được:
              </span>
              {score !== null && (
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  score >= 80
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}>
                  Độ khớp phát âm: {score}%
                </span>
              )}
            </div>

            <div className="text-sm font-serif text-[#2C2E2B] italic bg-white p-3 rounded-lg border border-[#EDE5D5]">
              "{transcribedText}"
            </div>

            {score !== null && (
              <div className="text-xs text-[#524430] flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  {score >= 85
                    ? 'Tuyệt vời! Bạn phát âm rất rõ ràng, tròn vành rõ chữ và chuẩn thanh điệu.'
                    : score >= 60
                    ? 'Khá tốt! Hãy chú ý đọc chậm hơn một chút ở các từ có thanh hỏi và ngã.'
                    : 'Cần tiếp tục luyện tập! Hãy nghe lại bản đọc mẫu và chú ý ngắt nhịp đúng chỗ nhé.'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Marked Rhythm Text Box */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E7DFCE] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFE8DC] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#575E59] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B83B26]" />
                Bản hướng dẫn ngắt nhịp (Rhythm & Intonation)
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F3EFE6] text-[#69543E]">
                Nhịp điệu: {result.tempoAdvice}
              </span>
            </div>

            <div className="p-5 rounded-xl bg-[#FAF8F4] border border-[#EBE2D0] text-base leading-loose font-serif text-[#1F2421] whitespace-pre-wrap">
              {result.markedText}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#6A706A] pt-1 border-t border-[#F0EAE0]">
              <span className="flex items-center gap-1">
                <strong className="text-[#B83B26] font-mono text-sm">/</strong> = Ngắt hơi ngắn
              </span>
              <span className="flex items-center gap-1">
                <strong className="text-[#B83B26] font-mono text-sm">//</strong> = Ngắt ý trọn vẹn
              </span>
              <span className="flex items-center gap-1">
                <strong className="text-[#1F2421] bg-[#F1E8DB] px-1 rounded">[TỪ]</strong> = Nhấn giọng biểu cảm
              </span>
            </div>
          </div>

          {/* Challenging Words Breakdown */}
          {result.challengingWords && result.challengingWords.length > 0 && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E7DFCE] shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#575E59] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                Các từ cần chú ý khẩu hình & thanh điệu:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.challengingWords.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D3] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold font-serif text-[#B83B26]">
                        {item.word}
                      </span>
                      <button
                        onClick={() => speakVietnamese(item.word, 0.8)}
                        className="p-1 text-[#7A5022] hover:text-[#B83B26] cursor-pointer"
                        title="Nghe phát âm từ này"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-[#3D423F]">
                      <strong>Khẩu hình:</strong> {item.phoneticHint}
                    </div>
                    <div className="text-[11px] text-[#8C5819] italic">
                      ⚠️ Lỗi thường gặp: {item.commonMistake}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tone & Emotion Guides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#F4F8F5] border border-[#D5E6DC] text-xs text-[#2A543B] space-y-2">
              <div className="font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Mẹo lấy hơi & cao độ thanh điệu:
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1">
                {result.toneAndBreathingTips?.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF5EE] border border-[#EBDCC8] text-xs text-[#523F27] space-y-2">
              <div className="font-bold uppercase tracking-wider text-[#8C5819] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Cảm xúc chủ đạo khi đọc:
              </div>
              <p className="font-serif italic leading-relaxed">
                "{result.emotionGuide}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
