import React from 'react';
import {
  Award,
  Trophy,
  Flame,
  CheckCircle2,
  Lock,
  Crown,
  Sparkles,
  Feather,
  BookOpenCheck,
  Volume2,
} from 'lucide-react';
import { Badge, LeaderboardUser } from '../types';

interface GamificationViewProps {
  badges: Badge[];
  leaderboard: LeaderboardUser[];
  userPoints: number;
  streakDays: number;
}

const badgeIconMap: Record<string, any> = {
  Feather,
  CheckCircle2,
  Sparkles,
  BookOpenCheck,
  Volume2,
  Crown,
};

export const GamificationView: React.FC<GamificationViewProps> = ({
  badges,
  leaderboard,
  userPoints,
  streakDays,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="bg-gradient-to-r from-[#FAF4EC] via-[#FFF9F3] to-[#F7EFE4] rounded-2xl p-6 border border-[#E7DFCE] shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B83B26]">
              Hệ Thống Vinh Danh & Cấp Bậc
            </span>
            <h2 className="text-2xl font-bold font-serif text-[#1F2421]">
              Khu Vườn Mực Hoa & Bảng Vàng Trạng Nguyên
            </h2>
            <p className="text-xs sm:text-sm text-[#666B67] max-w-xl">
              Mỗi bài sửa chính tả, câu văn trau chuốt hay buổi luyện đọc đều gieo thêm một đóa hoa tri thức vào khu vườn tiếng Việt của bạn.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Streak card */}
            <div className="p-4 rounded-2xl bg-white border border-[#E5DEC8] text-center min-w-[120px] shadow-2xs">
              <div className="flex items-center justify-center gap-1 text-2xl font-black text-[#8B4513]">
                <span>🔥</span>
                <span>{streakDays}</span>
              </div>
              <div className="text-[11px] font-semibold text-[#7A7F7B] mt-0.5">
                Ngày chuyên cần
              </div>
            </div>

            {/* Points card */}
            <div className="p-4 rounded-2xl bg-white border border-[#E5DEC8] text-center min-w-[130px] shadow-2xs">
              <div className="flex items-center justify-center gap-1 text-2xl font-black text-[#B83B26] font-serif">
                <span>🌸</span>
                <span>{userPoints}</span>
              </div>
              <div className="text-[11px] font-semibold text-[#7A7F7B] mt-0.5">
                Điểm Mực Hoa
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Badges (Left) & Leaderboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Badges Section (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#575E59] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#B83B26]" />
              Bộ Sưu Tập Huy Hiệu Văn Học ({badges.filter((b) => b.unlocked).length}/{badges.length}):
            </h3>
            <span className="text-xs text-[#7A7F7B]">Mở khóa khi hoàn thành thử thách</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {badges.map((badge) => {
              const Icon = badgeIconMap[badge.icon] || Award;
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-xl border transition-all shadow-2xs flex items-start gap-3.5 ${
                    badge.unlocked
                      ? 'bg-white border-[#E0D4C0]'
                      : 'bg-[#F7F5EE]/60 border-[#E5DEC8] opacity-60'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                      badge.unlocked
                        ? 'bg-[#FAF0ED] text-[#B83B26] border-[#F0D5CE]'
                        : 'bg-[#EFEAE0] text-[#9A9F9B] border-[#DDD6C8]'
                    }`}
                  >
                    {badge.unlocked ? (
                      <Icon className="w-5 h-5" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-[#1F2421] font-serif">
                        {badge.name}
                      </h4>
                      {badge.unlocked && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF8F1] text-emerald-800">
                          Đã đạt
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#666B67] leading-snug">
                      {badge.description}
                    </p>

                    {badge.progress && !badge.unlocked && (
                      <div className="pt-1.5 space-y-1">
                        <div className="flex justify-between text-[10px] text-[#888]">
                          <span>Tiến độ:</span>
                          <span>{badge.progress.current}/{badge.progress.target}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#EAE4D7] overflow-hidden">
                          <div
                            className="h-full bg-[#B83B26] rounded-full transition-all"
                            style={{
                              width: `${(badge.progress.current / badge.progress.target) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Section (1 Col on lg) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#575E59] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-700" />
              Bảng Vàng Học Giả Tuần Này:
            </h3>
            <span className="text-xs text-[#7A7F7B]">Top học giả</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7DFCE] p-4 shadow-xs space-y-2.5">
            {leaderboard.map((user) => {
              const isTop1 = user.rank === 1;
              const isTop2 = user.rank === 2;
              const isTop3 = user.rank === 3;

              return (
                <div
                  key={user.rank}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    user.isCurrentUser
                      ? 'bg-[#FAF2EF] border-[#D97D68] ring-1 ring-[#D97D68]/30 font-semibold'
                      : 'bg-[#FAF8F5] border-[#EAE2D2] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isTop1
                          ? 'bg-amber-400 text-amber-950 shadow-2xs'
                          : isTop2
                          ? 'bg-slate-300 text-slate-800'
                          : isTop3
                          ? 'bg-amber-700 text-amber-50'
                          : 'text-[#888]'
                      }`}
                    >
                      {user.rank}
                    </span>

                    <span className="text-lg">{user.avatar}</span>

                    <div className="space-y-0.5">
                      <div className="text-xs text-[#1F2421] font-medium leading-tight flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {user.isCurrentUser && (
                          <span className="text-[10px] bg-[#B83B26] text-white px-1.5 rounded-sm">Bạn</span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#7A5022]">
                        {user.badgeTitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-[#B83B26] font-serif">
                      {user.points} 🌸
                    </div>
                    <div className="text-[10px] text-[#888] flex items-center justify-end gap-0.5">
                      <span>🔥 {user.streakDays} ngày</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
