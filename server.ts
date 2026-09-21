import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy init Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Sửa lỗi chính tả
app.post("/api/check-spelling", async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Vui lòng cung cấp văn bản cần kiểm tra." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Fallback linguistic heuristic detection if API key not available
    const fallbackErrors = [];
    const lower = text.toLowerCase();
    const commonMistakes: Array<{ wrong: string; correct: string; reason: string; rule: string; type: string }> = [
      { wrong: "xai xót", correct: "sai sót", reason: "Nhầm lẫn phụ âm s/x trong từ ghép đẳng lập.", rule: "Phụ âm 's' trong 'sai' (đúng-sai), 'sót' (bỏ sót).", type: "Chính tả s/x" },
      { wrong: "suất xắc", correct: "xuất sắc", reason: "Nhầm lẫn phụ âm s/x.", rule: "Từ Hán Việt 'xuất' (vượt trội), 'sắc' (màu sắc, xuất chúng).", type: "Chính tả s/x" },
      { wrong: "chân thành cám ơn", correct: "chân thành cảm ơn", reason: "Dùng từ chưa chuẩn.", rule: "Từ chuẩn từ điển là 'cảm ơn' (cảm kích ơn huệ).", type: "Từ ngữ chuẩn" },
      { wrong: "giành giật", correct: "tranh giành", reason: "Lỗi dùng từ d/gi/r.", rule: "'Giành' trong giành giật/tranh giành, 'Dành' trong để dành/dành dụm.", type: "Phụ âm d/gi/r" },
      { wrong: "xơ xài", correct: "sơ sài", reason: "Lỗi phụ âm s/x.", rule: "Tính từ miêu tả sự đơn giản, không chu đáo là 'sơ sài'.", type: "Chính tả s/x" },
      { wrong: "chuẩn đoán", correct: "chẩn đoán", reason: "Lỗi dùng từ Hán Việt.", rule: "'Chẩn' trong chẩn bệnh/chẩn đoán (xác định bệnh), không dùng 'chuẩn'.", type: "Từ Hán Việt" },
      { wrong: "tham quan", correct: "tham quan", reason: "Đã đúng", rule: "Chuẩn xác", type: "Từ Hán Việt" },
      { wrong: "thăm quan", correct: "tham quan", reason: "Nhầm 'thăm' với 'tham'.", rule: "Từ Hán Việt: 'tham' (tham gia, dự vào) + 'quan' (xem, ngắm).", type: "Từ Hán Việt" },
      { wrong: "sáng lạng", correct: "xán lạn", reason: "Lỗi phiên âm từ Hán Việt.", rule: "Chính xác là 'xán lạn' (sáng sủa, rực rỡ).", type: "Từ Hán Việt" },
      { wrong: "rút kinh nghiệm", correct: "rút kinh nghiệm", reason: "Đã đúng", rule: "", type: "Chính tả" },
      { wrong: "dấu diếm", correct: "giấu giếm", reason: "Lỗi d/gi.", rule: "'Giấu giếm' mang nghĩa cất đi không cho ai biết; 'dấu' là dấu vết.", type: "Phụ âm d/gi/r" },
      { wrong: "đọc giả", correct: "độc giả", reason: "Nhầm âm Hán Việt.", rule: "'Độc giả' (người đọc sách báo), không dùng 'đọc giả'.", type: "Từ Hán Việt" },
      { wrong: "chính xát", correct: "chính xác", reason: "Lỗi âm cuối c/t.", rule: "Âm cuối là 'c' (chính xác).", type: "Âm cuối c/t" },
      { wrong: "đường xá", correct: "đường sá", reason: "Lỗi phụ âm s/x.", rule: "'Đường sá' viết với 's' (sá là đường đi gian khổ).", type: "Chính tả s/x" },
    ];

    let corrected = text;
    for (const item of commonMistakes) {
      if (lower.includes(item.wrong)) {
        fallbackErrors.push({
          original: item.wrong,
          suggestion: item.correct,
          reason: item.reason,
          rule: item.rule,
          type: item.type,
        });
        const regex = new RegExp(item.wrong, "gi");
        corrected = corrected.replace(regex, item.correct);
      }
    }

    return res.json({
      correctedText: corrected,
      errorCount: fallbackErrors.length,
      errors: fallbackErrors,
      summary: fallbackErrors.length > 0
        ? `Đã phát hiện ${fallbackErrors.length} điểm chính tả cần trau chuốt.`
        : "Văn bản chưa phát hiện lỗi chính tả cơ bản.",
    });
  }

  try {
    const prompt = `Bạn là chuyên gia ngôn ngữ học tiếng Việt hàng đầu của Viện Ngôn ngữ học Việt Nam.
Hãy phân tích và phát hiện tất cả lỗi chính tả trong văn bản dưới đây:
Văn bản: """${text}"""

Phân tích các lỗi:
1. Phụ âm đầu: s/x, tr/ch, d/gi/r, l/n, v/d...
2. Dấu thanh: hỏi (?) và ngã (~), sắc và nặng...
3. Vần & nguyên âm: oa/oe, iu/iêu, uyên/uên, ay/ai, ao/au...
4. Âm cuối: c/t, n/ng...
5. Lỗi dùng từ Hán Việt sai (ví dụ: sáng lạng -> xán lạn, thăm quan -> tham quan, chuẩn đoán -> chẩn đoán, vãng cảnh -> vãn cảnh).
6. Lỗi viết hoa, ngắt từ, dính chữ.

Trả về định dạng JSON thuần túy (không markdown) với cấu trúc:
{
  "correctedText": "đoạn văn hoàn chỉnh đã sửa chuẩn xác toàn bộ lỗi",
  "errorCount": số lượng lỗi phát hiện (số nguyên),
  "summary": "nhận xét tổng quan ngắn gọn về độ chuẩn xác chính tả của văn bản",
  "errors": [
    {
      "original": "từ hoặc cụm từ bị sai trong văn bản",
      "suggestion": "từ sửa đúng",
      "reason": "giải thích ngắn gọn tại sao sai",
      "rule": "quy tắc chính tả hoặc mẹo ghi nhớ để không tái phạm",
      "type": "Phụ âm đầu" | "Dấu thanh" | "Vần/Nguyên âm" | "Âm cuối" | "Từ Hán Việt" | "Khác"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Spelling check error:", err);
    return res.status(500).json({ error: "Lỗi khi xử lý kiểm tra chính tả: " + err.message });
  }
});

// 2. Cải thiện câu văn
app.post("/api/improve-sentences", async (req, res) => {
  const { text, style = "natural" } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Vui lòng cung cấp văn bản cần cải thiện." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      improvedText: text,
      alternatives: [text],
      suggestions: [
        {
          originalSentence: text,
          improvedSentence: text,
          explanation: "Hãy thiết lập GEMINI_API_KEY trong Cài đặt để kích hoạt phân tích văn phong chuyên sâu.",
          improvementType: "flow",
        },
      ],
      literaryTips: ["Sử dụng biện pháp tu từ như so sánh, ẩn dụ để câu văn giàu hình ảnh."],
    });
  }

  try {
    const styleDescriptions: Record<string, string> = {
      natural: "Tự nhiên, trôi chảy, gần gũi, loại bỏ từ thừa và câu lủng củng",
      literary: "Giàu chất văn học, biểu cảm, giàu hình ảnh, nhịp điệu uyển chuyển",
      concise: "Súc tích, ngắn gọn, gãy gọn, loại bỏ lặp từ, cô đọng ý tứ",
      formal: "Trang trọng, chuẩn mực học thuật hoặc công việc, từ ngữ chuẩn xác",
    };

    const prompt = `Bạn là một nhà văn, biên tập viên văn học tiếng Việt kỳ cựu.
Nhiệm vụ: Cải thiện câu văn, phát hiện câu khó hiểu, lặp từ, diễn đạt lủng củng hoặc chưa tự nhiên, và gợi ý cách viết hay hơn NHƯNG TUYỆT ĐỐI GIỮ TRỌN VẸN Ý ĐỊNH CỦA TÁC GIẢ.

Phong cách mong muốn: ${styleDescriptions[style] || styleDescriptions.natural}
Đoạn văn gốc:
"""${text}"""

Trả về JSON thuần túy (không markdown):
{
  "improvedText": "Đoạn văn đã được biên tập lại hoàn chỉnh, mượt mà và hay nhất theo phong cách yêu cầu",
  "alternatives": [
    "Cách viết thay thế 1 (nhẹ nhàng, giàu cảm xúc)",
    "Cách viết thay thế 2 (hiện đại, gãy gọn, giàu sức thuyết phục)"
  ],
  "suggestions": [
    {
      "originalSentence": "câu gốc có vấn đề",
      "improvedSentence": "câu đã được viết lại hay hơn",
      "explanation": "giải thích vì sao câu ban đầu bị lặp từ, tối nghĩa hoặc thiếu tự nhiên và cách viết mới khắc phục như thế nào",
      "improvementType": "lặp từ" | "cấu trúc lủng củng" | "dùng từ chưa đắt" | "nhịp điệu câu"
    }
  ],
  "literaryTips": [
    "Lời khuyên 1 về nghệ thuật diễn đạt",
    "Lời khuyên 2 về cách dùng từ gợi hình, gợi cảm"
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Sentence improvement error:", err);
    return res.status(500).json({ error: "Lỗi cải thiện câu văn: " + err.message });
  }
});

// 3. Luyện viết văn
app.post("/api/writing-feedback", async (req, res) => {
  const { topic, level, essay } = req.body;
  if (!essay) {
    return res.status(400).json({ error: "Vui lòng nhập bài viết văn của bạn." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      overallScore: 8.0,
      scores: {
        structure: 8,
        vocabulary: 7.5,
        flow: 8,
        creativity: 8.5,
      },
      generalCritique: "Bài viết có ý tứ tốt, cảm xúc chân thực. Cần chú ý thêm về tính liên kết giữa các đoạn.",
      strengths: ["Cảm xúc tự nhiên, chân thành", "Bố cục rõ ràng có mở thân kết"],
      improvements: ["Cần mở rộng vốn từ tượng hình", "Tránh ngắt câu quá ngắn làm đứt mạch cảm xúc"],
      revisedExemplaryVersion: essay,
      detailedFeedback: [],
    });
  }

  try {
    const prompt = `Bạn là giám khảo và thầy giáo dạy văn giàu kinh nghiệm.
Hãy chấm điểm, đánh giá và đưa ra nhận xét chi tiết cho bài viết văn sau:
Chủ đề: "${topic || "Tự chọn"}"
Cấp độ: "${level || "Trung bình"}"
Bài viết của học viên:
"""${essay}"""

Tiêu chí đánh giá:
1. Bố cục và mạch lập luận (Structure)
2. Vốn từ và độ đắt của từ ngữ (Vocabulary & Diction)
3. Diễn đạt, ngữ pháp và nhịp điệu (Flow & Syntax)
4. Chiều sâu cảm xúc / Tính thuyết phục (Depth & Emotion)

Trả về định dạng JSON:
{
  "overallScore": số điểm tổng quát từ 1.0 đến 10.0 (ví dụ 8.2),
  "scores": {
    "structure": điểm thang 10,
    "vocabulary": điểm thang 10,
    "flow": điểm thang 10,
    "depth": điểm thang 10
  },
  "generalCritique": "Lời nhận xét tổng quát mang tính khích lệ, sâu sắc từ góc nhìn người chấm văn",
  "strengths": ["Điểm sáng 1 của bài viết", "Điểm sáng 2"],
  "improvements": ["Điểm cần khắc phục 1", "Điểm cần nâng cao 2"],
  "sentenceAnalysis": [
    {
      "original": "câu hoặc đoạn trong bài của học viên",
      "praiseOrFix": "nhận xét khen ngợi hoặc chỉ ra cách nâng tầm",
      "suggestedRevision": "phiên bản viết lại mẫu cho câu này"
    }
  ],
  "revisedExemplaryVersion": "Toàn bộ bài viết đã được nâng tầm thành một bài văn mẫu xuất sắc nhưng vẫn giữ nguyên ý tưởng cốt lõi của người viết"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Writing feedback error:", err);
    return res.status(500).json({ error: "Lỗi chấm bài viết văn: " + err.message });
  }
});

// 4. Từ vựng tiếng Việt (Tra nghĩa, Hán Việt, từ đồng nghĩa/trái nghĩa, ví dụ)
app.post("/api/vocab-lookup", async (req, res) => {
  const { word } = req.body;
  if (!word) {
    return res.status(400).json({ error: "Vui lòng nhập từ hoặc ngữ cần tra cứu." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      word,
      partOfSpeech: "Từ vựng tiếng Việt",
      definition: `Giải thích chi tiết cho từ "${word}" (vui lòng kết nối Gemini API để tra cứu kho từ điển phong phú).`,
      origin: "Từ thuần Việt hoặc Hán Việt",
      synonyms: ["từ đồng nghĩa tham khảo"],
      antonyms: ["từ trái nghĩa tham khảo"],
      nuance: "Sắc thái trang nhã",
      examples: [`Ví dụ câu chứa từ ${word}.`],
      literaryQuote: "Trích dẫn văn học minh họa.",
      idioms: [],
    });
  }

  try {
    const prompt = `Bạn là nhà từ điển học tiếng Việt (như học giả Đào Duy Anh, Hoàng Phê).
Hãy phân tích thật sâu sắc, toàn diện từ hoặc cụm từ: "${word}".

Bao gồm:
1. Định nghĩa chuẩn xác (nếu nhiều nghĩa, nêu rõ nghĩa gốc và nghĩa chuyển).
2. Từ loại (Danh từ, Động từ, Tính từ, Thành ngữ, Từ láy...).
3. Nguồn gốc: Phân tích xem là từ thuần Việt, từ Hán Việt (giải nghĩa từng chiết tự Hán Việt), hay từ mượn.
4. Từ đồng nghĩa (kèm sắc thái khác biệt nhỏ giữa chúng).
5. Từ trái nghĩa.
6. Sắc thái biểu cảm (Thơ ca, trang trọng, khẩu ngữ, cổ xưa...).
7. Các câu ví dụ hay, giàu hình ảnh.
8. Trích dẫn trong thơ ca / văn học kinh điển (Nguyễn Du, Xuân Diệu, Nam Cao...) nếu có liên quan.
9. Các thành ngữ, quán ngữ có chứa từ này.

Trả về JSON thuần túy:
{
  "word": "${word}",
  "partOfSpeech": "Từ loại",
  "definition": "Định nghĩa chi tiết, chuẩn xác",
  "etymology": "Nguồn gốc chi tiết (chiết tự Hán Việt nếu có, cấu tạo từ láy nếu là từ láy)",
  "synonyms": [
    { "term": "từ đồng nghĩa", "distinction": "điểm khác biệt về sắc thái" }
  ],
  "antonyms": ["từ trái nghĩa 1", "từ trái nghĩa 2"],
  "nuance": "Sắc thái sử dụng phù hợp trong ngữ cảnh nào",
  "examples": ["Câu ví dụ 1", "Câu ví dụ 2"],
  "literaryQuote": "Trích dẫn văn thơ kinh điển hoặc danh ngôn chứa từ này (nếu có)",
  "relatedIdioms": ["Thành ngữ/tục ngữ 1", "Thành ngữ/tục ngữ 2"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Vocab lookup error:", err);
    return res.status(500).json({ error: "Lỗi tra cứu từ vựng: " + err.message });
  }
});

// 5. Luyện đọc - phát âm
app.post("/api/pronunciation-guide", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Vui lòng cung cấp đoạn văn cần phân tích phát âm." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      markedText: text,
      rhythmGuide: "Đọc thong thả, ngắt nghỉ đúng dấu phẩy và dấu chấm.",
      challengingWords: [],
      toneTips: ["Chú ý phân biệt thanh hỏi và ngã."],
      expressiveAdvice: "Đọc với giọng ấm áp, tự nhiên.",
    });
  }

  try {
    const prompt = `Bạn là chuyên gia luyện giọng, phát thanh viên kì cựu của Đài Tiếng nói Việt Nam.
Hãy phân tích đoạn văn sau để hướng dẫn người dùng luyện đọc diễn cảm, ngắt nhịp và phát âm chuẩn tiếng Việt:
Đoạn văn:
"""${text}"""

Nhiệm vụ:
1. Đánh dấu ngắt nghỉ và nhấn giọng: Dùng ký hiệu "/" cho ngắt nhịp ngắn (dấu phẩy/ngắt ý), "//" cho ngắt nhịp dài (dấu chấm/hết câu), và in hoa hoặc viết hoa từ cần [NHẤN GIỌNG].
2. Liệt kê các từ có phụ âm/thanh điệu dễ phát âm sai (như hỏi vs ngã, s vs x, tr vs ch, âm cuối c/t, n/ng, vần uôn/uông...).
3. Hướng dẫn khẩu hình, cao độ và cảm xúc khi đọc đoạn văn này.

Trả về JSON:
{
  "markedText": "Đoạn văn có đánh dấu / và // cùng từ [NHẤN] để người học đọc theo nhịp",
  "tempoAdvice": "Tốc độ đọc khuyến nghị (ví dụ: Chậm rãi, tha thiết / Hào hùng, dứt khoát)",
  "challengingWords": [
    {
      "word": "từ cần chú ý",
      "phoneticHint": "hướng dẫn phát âm (vị trí lưỡi, cao độ thanh điệu)",
      "commonMistake": "lỗi người đọc hay mắc phải"
    }
  ],
  "toneAndBreathingTips": [
    "Lời khuyên về lấy hơi và điều chỉnh cao độ các thanh điệu",
    "Cách ngân giọng hoặc hạ giọng ở cuối câu"
  ],
  "emotionGuide": "Cảm xúc chủ đạo cần truyền tải khi đọc văn bản này"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Pronunciation guide error:", err);
    return res.status(500).json({ error: "Lỗi phân tích đọc phát âm: " + err.message });
  }
});

// 6. Học tiếng Việt cho người nước ngoài (Bilingual, simple explanations)
app.post("/api/foreign-helper", async (req, res) => {
  const { query, level = "beginner" } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Vui lòng nhập từ hoặc chủ đề cần học." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      topic: query,
      vietnamese: query,
      english: "Translation",
      pinyinTones: "Tone breakdown",
      dialogues: [],
      culturalTip: "Tips for foreign learners",
    });
  }

  try {
    const prompt = `You are a warm, bilingual Vietnamese teacher for international students and expats.
The learner asks about: "${query}" (Target Level: ${level}).

Explain Vietnamese in a friendly, easy-to-understand way with English support:
1. Core phrase/word breakdown with tones (Ngang, Huyền, Sắc, Hỏi, Ngã, Nặng) & IPA/pronunciation imitation.
2. Grammar pattern simplified.
3. Natural everyday dialogues with English translation.
4. Cultural etiquette (pronouns: anh, chị, em, cô, chú, bác).
5. Common funny misunderstandings to avoid.

Return JSON:
{
  "topic": "${query}",
  "explanationEn": "Simple explanation in English",
  "explanationVi": "Lời giải thích đơn giản bằng tiếng Việt",
  "toneBreakdown": [
    {
      "word": "từ",
      "toneName": "Sắc / Huyền / ...",
      "pitchDescription": "e.g., sharp rise, deep fall, wave tone",
      "soundLike": "English sound equivalent"
    }
  ],
  "practicalPhrases": [
    {
      "vietnamese": "Câu tiếng Việt tự nhiên",
      "english": "English translation",
      "context": "When to say this"
    }
  ],
  "shortDialogue": [
    { "speaker": "A", "vi": "...", "en": "..." },
    { "speaker": "B", "vi": "...", "en": "..." }
  ],
  "culturalNote": "Important cultural insight regarding polite Vietnamese communication",
  "pronounTip": "How to address people correctly in this context"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Foreign helper error:", err);
    return res.status(500).json({ error: "Lỗi hỗ trợ học tiếng Việt: " + err.message });
  }
});

// 7. Luyện nói với AI (Hội thoại & Góp ý sửa lỗi)
app.post("/api/speak-chat", async (req, res) => {
  const { message, history = [], topic = "Trò chuyện đời thường" } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Vui lòng nhập tin nhắn hoặc lời nói." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      reply: `Chào bạn! Tôi rất vui được luyện nói tiếng Việt cùng bạn về chủ đề "${topic}". Bạn có thể chia sẻ thêm suy nghĩ của mình không?`,
      feedback: {
        pronunciationTips: ["Hãy chú ý nhấn rõ dấu thanh khi nói."],
        vocabSuggestions: ["Dùng từ 'rất vui' rất tự nhiên!"],
        betterWayToSay: message,
      },
    });
  }

  try {
    const formattedHistory = history.map((h: any) => `${h.role === "user" ? "Người học" : "AI Bạn đồng hành"}: ${h.content}`).join("\n");

    const prompt = `Bạn là "Tri Kỷ Việt Ngữ" - một người bạn đồng hành trò chuyện tiếng Việt thông minh, ấm áp, nhã nhặn và sâu sắc.
Chủ đề trò chuyện: "${topic}".
Lịch sử trò chuyện:
${formattedHistory}

Người học vừa nói: "${message}"

Nhiệm vụ kép:
1. Đáp lại câu nói của người học một cách tự nhiên, duyên dáng, giàu cảm xúc, đặt câu hỏi gợi mở để tiếp tục cuộc đối thoại (khoảng 2-3 câu).
2. Phân tích câu nói của người học:
   - Chỉ ra từ dùng hay hoặc từ cần trau chuốt hơn.
   - Gợi ý cách diễn đạt hay hơn, đậm chất tiếng Việt tự nhiên hơn (nếu có).
   - Nhắc nhở về ngữ điệu hoặc phát âm cho các từ trong câu của người học.

Trả về JSON:
{
  "reply": "Lời đáp lại thân tình, duyên dáng bằng tiếng Việt để tiếp tục câu chuyện",
  "feedback": {
    "isGrammarCorrect": true hoặc false,
    "betterWayToSay": "Cách nói trau chuốt, tự nhiên hơn (nếu câu của người học đã hoàn hảo thì ghi 'Cách diễn đạt đã rất tự nhiên')",
    "commentOnToneAndDiction": "Góp ý nhẹ nhàng về cách chọn từ và cảm xúc biểu đạt",
    "vocabularyPraise": "Lời khen cụ thể cho từ ngữ tốt mà người học đã dùng"
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Speak chat error:", err);
    return res.status(500).json({ error: "Lỗi đàm thoại AI: " + err.message });
  }
});

// 8. Tạo bài luyện tập riêng dựa trên lỗi người dùng thường mắc
app.post("/api/generate-error-exercise", async (req, res) => {
  const { errors } = req.body;
  if (!Array.isArray(errors) || errors.length === 0) {
    return res.status(400).json({ error: "Chưa có danh sách lỗi để tạo bài luyện." });
  }

  const ai = getGeminiClient();
  const errorSummary = errors.slice(0, 10).map((e: any) => `- Lỗi: "${e.original}" -> Sửa: "${e.suggestion}" (${e.type || "Chính tả/Dùng từ"})`).join("\n");

  if (!ai) {
    return res.json({
      title: "Bài luyện củng cố chính tả & ngữ pháp cá nhân hóa",
      questions: errors.slice(0, 4).map((e: any, idx: number) => ({
        id: idx + 1,
        question: `Trong các từ sau, từ nào viết ĐÚNG chính tả?`,
        options: [e.original, e.suggestion, e.original + " x", e.suggestion + " y"],
        correctAnswer: e.suggestion,
        explanation: `Từ đúng là "${e.suggestion}".`,
      })),
    });
  }

  try {
    const prompt = `Dưới đây là danh sách những lỗi tiếng Việt mà người dùng này hay mắc phải nhất:
${errorSummary}

Hãy thiết kế một bài luyện tập tương tác chất lượng cao gồm 4-5 câu hỏi trắc nghiệm và điền từ để giúp người dùng sửa dứt điểm các lỗi này.
Mỗi câu hỏi cần lồng ghép trong ngữ cảnh câu văn thực tế, ý vị, tự nhiên.

Trả về JSON:
{
  "title": "Tên bài luyện tập (ví dụ: Chinh phục lỗi hỏi-ngã & phụ âm s/x)",
  "encouragement": "Lời khuyên nhủ khích lệ tinh thần người học",
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "Nội dung câu hỏi (ví dụ: Điền từ thích hợp vào chỗ trống: 'Sau bao nỗ lực, anh ấy đã đạt thành tích [...]')",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": "đáp án đúng chính xác",
      "explanation": "Giải thích chi tiết quy tắc ngữ pháp hoặc mẹo ghi nhớ sâu sắc"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Generate exercise error:", err);
    return res.status(500).json({ error: "Lỗi tạo bài tập: " + err.message });
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Việt Ngữ Trong Tay server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
