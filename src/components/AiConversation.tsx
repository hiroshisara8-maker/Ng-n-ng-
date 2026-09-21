import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  BookmarkPlus,
  RefreshCw,
  User,
  Bot,
} from 'lucide-react';
import { ChatMessage, SavedMistake } from '../types';
import {
  speakVietnamese,
  stopSpeaking,
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
} from '../utils/speech';

interface AiConversationProps {
  onSaveMistake: (mistake: Omit<SavedMistake, 'id' | 'createdAt' | 'practicedCount' | 'isMastered'>) => void;
  onAddPoints: (points: number) => void;
}

export const AiConversation: React.FC<AiConversationProps> = ({ onSaveMistake, onAddPoints }) => {
  const [topic, setTopic] = useState('Trò chuyện đời thường & Văn hóa Việt Nam');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'model',
      content: 'Chào bạn! Tôi là Tri Kỷ Việt Ngữ. Rất vui được cùng bạn hàn huyên, trò chuyện bằng tiếng Việt hôm nay. Bạn có thể gõ chữ hoặc bấm mic để nói chuyện cùng tôi nhé!',
      timestamp: 'Vừa xong',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [autoSpeakReplies, setAutoSpeakReplies] = useState(true);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const topics = [
    'Trò chuyện đời thường & Văn hóa Việt Nam',
    'Ẩm thực & Ký ức tuổi thơ',
    'Sách, thơ ca và những chuyến đi',
    'Ước mơ và cảm nhận cuộc sống',
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: 'Vừa xong',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/speak-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: historyPayload,
          topic,
        }),
      });

      if (!response.ok) {
        throw new Error('Lỗi gửi tin nhắn đến AI.');
      }

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: data.reply,
        timestamp: 'Vừa xong',
        feedback: data.feedback,
      };

      setMessages((prev) => [...prev, aiMsg]);
      onAddPoints(20);

      if (autoSpeakReplies && data.reply) {
        speakVietnamese(data.reply, 1.0);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVoiceInput = () => {
    if (!isSpeechRecognitionSupported()) {
      alert('Trình duyệt chưa hỗ trợ Web Speech Recognition. Hãy sử dụng Chrome hoặc Edge để dùng micro.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    const rec = createSpeechRecognizer(
      (transcript) => {
        setInputText(transcript);
        setIsRecording(false);
        // Automatically send after speech
        handleSendMessage(transcript);
      },
      (err) => {
        console.error('Speech error:', err);
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );

    if (rec) {
      rec.start();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Topic Picker */}
      <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-[#E7DFCE] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE8DC] pb-3">
          <div>
            <h2 className="text-xl font-bold font-serif text-[#1F2421] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#B83B26]" />
              Luyện Nói & Đối Thoại Cùng AI
            </h2>
            <p className="text-xs sm:text-sm text-[#666B67] mt-0.5">
              Nói chuyện tự nhiên với AI qua micro hoặc gõ chữ. AI sẽ hồi đáp thân tình và góp ý cách diễn đạt, từ ngữ hay hơn.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label className="flex items-center gap-1.5 text-xs text-[#5A605B] cursor-pointer">
              <input
                type="checkbox"
                checked={autoSpeakReplies}
                onChange={(e) => setAutoSpeakReplies(e.target.checked)}
                className="rounded text-[#B83B26] focus:ring-[#B83B26]"
              />
              Tự động đọc giọng AI
            </label>
          </div>
        </div>

        {/* Topic Selector */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs text-[#7A7F7B] font-semibold">Chủ đề đối thoại:</span>
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                topic === t
                  ? 'bg-[#FAF0ED] text-[#B83B26] border-[#D97D68] font-medium shadow-2xs'
                  : 'bg-[#FAF8F5] text-[#555] border-[#DDD5C5] hover:bg-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area Container */}
      <div className="bg-white rounded-2xl border border-[#E7DFCE] shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#FBF9F5] custom-scrollbar">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] ${
                  isUser ? 'ml-auto' : 'mr-auto'
                }`}
              >
                {/* Bubble */}
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#B83B26] text-white rounded-tr-xs'
                      : 'bg-white text-[#2C2E2B] border border-[#E5DEC8] shadow-2xs rounded-tl-xs font-serif'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1 text-[11px] opacity-80">
                    <span className="font-semibold font-sans">
                      {isUser ? 'Bạn' : 'Tri Kỷ Việt Ngữ'}
                    </span>
                    {!isUser && (
                      <button
                        onClick={() => speakVietnamese(msg.content, 1.0)}
                        className="p-1 hover:text-[#B83B26] cursor-pointer"
                        title="Nghe giọng đọc"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div>{msg.content}</div>
                </div>

                {/* AI Linguistic Feedback box on user's preceding phrasing */}
                {msg.feedback && (
                  <div className="mt-2 p-3 rounded-xl bg-[#FAF5ED] border border-[#EAE0D0] text-xs text-[#4F4638] space-y-1.5 w-full">
                    <div className="font-bold text-[#8C5819] flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5" />
                      Góp ý trau chuốt câu bạn vừa nói:
                    </div>

                    {msg.feedback.betterWayToSay && msg.feedback.betterWayToSay !== 'Cách diễn đạt đã rất tự nhiên' && (
                      <div>
                        <span className="font-semibold text-emerald-800">Gợi ý cách nói mượt hơn: </span>
                        <span className="italic font-serif">"{msg.feedback.betterWayToSay}"</span>
                      </div>
                    )}

                    {msg.feedback.commentOnToneAndDiction && (
                      <div className="text-[#6B5A42]">
                        <strong>Nhận xét:</strong> {msg.feedback.commentOnToneAndDiction}
                      </div>
                    )}

                    {msg.feedback.vocabularyPraise && (
                      <div className="text-emerald-700">
                        <strong>Khen ngợi:</strong> {msg.feedback.vocabularyPraise}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[#8A908B] bg-white p-3 rounded-xl border border-[#EDE5D5] w-fit">
              <div className="w-3 h-3 border-2 border-[#B83B26] border-t-transparent rounded-full animate-spin" />
              <span>Tri Kỷ đang lắng nghe và suy ngẫm...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#EAE3D3] flex items-center gap-2">
          {/* Microphone button */}
          <button
            onClick={handleToggleVoiceInput}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isRecording
                ? 'bg-rose-700 text-white border-rose-700 animate-pulse'
                : 'bg-[#FAF6EF] text-[#69543E] border-[#E0D7C5] hover:bg-[#F2EAE0]'
            }`}
            title="Nói trực tiếp bằng tiếng Việt qua Micro"
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isRecording ? 'Đang lắng nghe giọng bạn...' : 'Nhập tin nhắn tiếng Việt hoặc bấm mic để nói...'}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C5] text-sm text-[#1F2421] focus:outline-hidden focus:border-[#B83B26]"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 px-4 rounded-xl bg-[#B83B26] hover:bg-[#A13320] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Gửi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
