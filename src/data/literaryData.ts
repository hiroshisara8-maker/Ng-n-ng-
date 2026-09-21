import { TabItem, Badge, LeaderboardUser } from '../types';

export const TOP_TABS: TabItem[] = [
  {
    id: 'spelling',
    label: 'Sửa lỗi chính tả',
    shortDesc: 'Phát hiện & gợi ý sửa chuẩn',
    iconName: 'SpellCheck',
  },
  {
    id: 'improve',
    label: 'Cải thiện câu văn',
    shortDesc: 'Trau chuốt văn phong mượt mà',
    iconName: 'PenTool',
  },
  {
    id: 'writing',
    label: 'Luyện viết văn',
    shortDesc: 'Chủ đề đa cấp độ & nhận xét',
    iconName: 'BookOpen',
  },
  {
    id: 'vocab',
    label: 'Từ vựng tiếng Việt',
    shortDesc: 'Nghĩa từ, Hán Việt, điển tích',
    iconName: 'BookMarked',
  },
  {
    id: 'pronunciation',
    label: 'Luyện đọc – phát âm',
    shortDesc: 'Ngắt nhịp, nhấn giọng truyền cảm',
    iconName: 'Mic',
  },
  {
    id: 'foreign',
    label: 'Tiếng Việt người nước ngoài',
    shortDesc: 'Song ngữ, 6 thanh điệu, giao tiếp',
    iconName: 'Globe',
  },
  {
    id: 'speaking',
    label: 'Luyện nói với AI',
    shortDesc: 'Đối thoại & sửa lỗi trực tiếp',
    iconName: 'MessageSquare',
  },
  {
    id: 'tracker',
    label: 'Theo dõi lỗi thường gặp',
    shortDesc: 'Sổ tay lỗi & bài luyện riêng',
    iconName: 'BookmarkCheck',
  },
  {
    id: 'gamification',
    label: 'Huy hiệu & Xếp hạng',
    shortDesc: 'Thành tựu & Bảng vinh danh',
    iconName: 'Award',
  },
];

export const WRITING_TOPICS = [
  {
    id: 't1',
    level: 'Cơ bản',
    category: 'Miêu tả & Cảm xúc',
    title: 'Một buổi sớm mai thanh bình nơi quê hương em',
    prompt: 'Miêu tả bức tranh sớm mai: giọt sương trên lá, tiếng gà gáy xa xa, làn khói bếp bảng lảng và cảm giác bình yên trong tâm hồn.',
    sampleOpening: 'Mỗi lần về quê nội, điều làm tôi bồi hồi nhất chính là khoảnh khắc đất trời cựa mình thức giấc...',
  },
  {
    id: 't2',
    level: 'Cơ bản',
    category: 'Tự sự & Trải nghiệm',
    title: 'Kỷ niệm khó quên về một lần em nhận được sự giúp đỡ',
    prompt: 'Kể lại một tình huống em gặp khó khăn trên đường hoặc trong học tập và nhận được sự sẻ chia ấm áp từ một người xa lạ.',
    sampleOpening: 'Có những nghĩa cử bình dị thoảng qua như cơn gió thoảng, nhưng hơi ấm của nó thì đọng lại mãi...',
  },
  {
    id: 't3',
    level: 'Trung bình',
    category: 'Nghị luận xã hội',
    title: 'Ý nghĩa của sự tử tế trong kỷ nguyên mạng xã hội',
    prompt: 'Bàn luận về giá trị của lời nói thiện lương, sự đồng cảm giữa thế giới ảo nơi người ta dễ dàng buông lời phán xét vội vã.',
    sampleOpening: 'Giữa một thế giới số ngập tràn những dòng trạng thái lướt nhanh, một lời động viên chân thành đôi khi có thể cứu rỗi cả một ngày giông bão của ai đó...',
  },
  {
    id: 't4',
    level: 'Trung bình',
    category: 'Biểu cảm & Suy ngẫm',
    title: 'Bức thư gửi cho chính mình của mười năm sau',
    prompt: 'Hãy viết thư cho bạn của tương lai: về những ước mơ tuổi trẻ đang ấp ủ, những nỗi sợ đã vượt qua và lời dặn giữ gìn sơ tâm.',
    sampleOpening: 'Chào bạn, người đang đứng ở ngưỡng cửa của mười năm phía trước! Khi viết những dòng này, tôi chỉ là một kẻ đang miệt mài gieo hạt...',
  },
  {
    id: 't5',
    level: 'Nâng cao',
    category: 'Tản văn nghệ thuật',
    title: 'Mùi hương của ký ức: Cơm nguội, rơm rạ và mưa ngâu',
    prompt: 'Sử dụng ngòi bút giàu nhạc điệu và hình ảnh để khơi gợi những phong vị thời gian, sự hoài niệm về những nếp nhà xưa cũ.',
    sampleOpening: 'Ký ức của con người đôi khi không lưu giữ bằng hình ảnh, mà bằng những làn hương vô hình ẩn khuất dưới hiên nhà rêu phong...',
  },
  {
    id: 't6',
    level: 'Nâng cao',
    category: 'Nghị luận văn học',
    title: 'Chất thơ và nhân đạo trong vẻ đẹp tiếng Việt qua ngòi bút Thạch Lam',
    prompt: 'Phân tích cách tiếng Việt được nâng niu thành những giai điệu êm dịu, thấm đượm tình người trong các truyện ngắn lãng mạn.',
    sampleOpening: 'Tiếng Việt trong trang văn Thạch Lam tựa hồ như một khúc dương cầm gảy nhẹ giữa trưa hè tĩnh lặng...',
  },
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'b1',
    name: 'Bút Non Khởi Sắc',
    description: 'Bắt đầu hành trình trau chuốt chữ nghĩa tiếng Việt.',
    icon: 'Feather',
    unlocked: true,
    unlockedAt: 'Hôm nay',
  },
  {
    id: 'b2',
    name: 'Chính Tả Vàng',
    description: 'Kiểm tra và sửa thành công 5 văn bản tiếng Việt chuẩn xác.',
    icon: 'CheckCircle2',
    unlocked: true,
    unlockedAt: 'Hôm qua',
    progress: { current: 5, target: 5 },
  },
  {
    id: 'b3',
    name: 'Cây Bút Mượt Mà',
    description: 'Cải thiện câu văn bằng tính năng gợi ý văn phong 3 lần.',
    icon: 'Sparkles',
    unlocked: false,
    progress: { current: 2, target: 3 },
  },
  {
    id: 'b4',
    name: 'Học Giả Việt Ngữ',
    description: 'Tra cứu và khám phá sâu hơn 10 từ vựng và thành ngữ.',
    icon: 'BookOpenCheck',
    unlocked: false,
    progress: { current: 6, target: 10 },
  },
  {
    id: 'b5',
    name: 'Giọng Đọc Truyền Cảm',
    description: 'Hoàn thành bài luyện đọc diễn cảm và ghi âm chuẩn nhịp.',
    icon: 'Volume2',
    unlocked: false,
    progress: { current: 1, target: 3 },
  },
  {
    id: 'b6',
    name: 'Trạng Nguyên Văn Hiến',
    description: 'Đạt từ 8.5 điểm trở lên trong một bài viết văn tự luận.',
    icon: 'Crown',
    unlocked: false,
    progress: { current: 0, target: 1 },
  },
];

export const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: 'Lê Hoàng Hải Yến', avatar: '🌸', badgeTitle: 'Bậc Thầy Điển Tích', points: 2840, streakDays: 24 },
  { rank: 2, name: 'Nguyễn Văn Minh Triết', avatar: '📜', badgeTitle: 'Cây Bút Trạng Nguyên', points: 2610, streakDays: 19 },
  { rank: 3, name: 'Trần Thảo Ly', avatar: '✒️', badgeTitle: 'Giọng Đọc Vàng', points: 2430, streakDays: 15 },
  { rank: 4, name: 'Bạn (Người học kiên trì)', avatar: '🌱', badgeTitle: 'Bút Non Khởi Sắc', points: 1980, streakDays: 7, isCurrentUser: true },
  { rank: 5, name: 'Alexandre Morel (Pháp)', avatar: '🌏', badgeTitle: 'Người Bạn Việt Ngữ', points: 1720, streakDays: 12 },
  { rank: 6, name: 'Vũ Đăng Khoa', avatar: '🍁', badgeTitle: 'Học Giả Cần Mẫn', points: 1590, streakDays: 9 },
  { rank: 7, name: 'Sarah Jenkins (Mỹ)', avatar: '🌟', badgeTitle: 'Yêu Tiếng Việt', points: 1450, streakDays: 11 },
];

export const SAMPLE_SPELL_TEXT = `Hôm qua đoàn chúng tôi đi thăm quan một di tích lịch sử rất sáng lạng và suất xắc. Tuy nhiên công tác chuẩn đoán thời tiết bị xai xót, khiến kế hoạch có phần xơ xài. Đọc giả theo dõi chuyến đi chân thành cám ơn ban tổ chức vì đã không quản đường xá xa xôi, chuẩn bị chu đáo không hề giấu diếm khó khăn.`;

export const SAMPLE_IMPROVE_TEXT = `Em nghĩ là việc đọc sách rất là tốt cho chúng ta. Nó giúp chúng ta có thêm nhiều kiến thức bổ ích. Nó cũng làm cho tâm hồn chúng ta thấy vui vẻ hơn mỗi khi chúng ta bị căng thẳng và mệt mỏi trong cuộc sống hằng ngày. Cho nên chúng ta cần phải đọc sách nhiều hơn nữa.`;

export const SAMPLE_PRONUNCIATION_TEXT = `Việt Nam đất nước ta ơi, mênh mông biển lúa đâu trời đẹp hơn. Cánh cò bay lả rập rờn, mây mờ che đỉnh Trường Sơn sớm chiều. Người đi trong nắng ấm thu vàng, nghe tiếng lòng rộn rã bước chân quê hương.`;

export const FOREIGN_STARTER_PHRASES = [
  { vi: 'Xin chào, rất vui được gặp bạn!', en: 'Hello, very nice to meet you!', tone: 'Ngang - Huyền, Sắc - Ngang - Nặng - Nặng' },
  { vi: 'Cho tôi một ly cà phê sữa đá, ít ngọt nhé!', en: 'Please give me an iced milk coffee, less sweet!', tone: 'Ngang - Ngang - Nặng - Ngang - Huyền - Ngã - Sắc, Sắc - Nặng - Sắc' },
  { vi: 'Món này ngon quá, bao nhiêu tiền ạ?', en: 'This dish is so delicious, how much is it?', tone: 'Sắc - Huyền - Ngang - Sắc, Ngang - Nhiêu - Huyền - Nặng' },
  { vi: 'Cảm ơn bạn rất nhiều!', en: 'Thank you very much!', tone: 'Hỏi - Ngang - Nặng - Sắc - Huyền' },
];
