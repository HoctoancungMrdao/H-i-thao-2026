import React from 'react';
import { User } from 'firebase/auth';
import { Trophy, Shield, Eye, Settings, Share2, RotateCcw, Upload, Clock, LogIn, UserCheck } from 'lucide-react';
import { isAuthorizedEmail } from '../firebase';

interface HeaderProps {
  isBtcMode: boolean;
  onToggleBtcMode: () => void;
  onResetData: () => void;
  onOpenTeamManager: () => void;
  onOpenCsvImport: () => void;
  onOpenScheduleManager: () => void;
  currentUser: User | null;
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isBtcMode,
  onToggleBtcMode,
  onResetData,
  onOpenTeamManager,
  onOpenCsvImport,
  onOpenScheduleManager,
  currentUser,
  onOpenLoginModal,
}) => {
  const [copied, setCopied] = React.useState(false);
  const isAuthorized = currentUser ? isAuthorizedEmail(currentUser.email) : false;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Giải Bóng Đá - Lịch Thi Đấu & Kết Quả',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner flex-shrink-0">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight leading-tight truncate">
                ĐẠI HỘI TDTT 2026-2027
              </h1>
              <p className="text-[11px] sm:text-xs text-emerald-100/90 truncate flex items-center gap-1.5 font-medium">
                <span className="font-bold">THCS-THPT TRẦN TRƯỜNG SINH</span>
                <span>•</span>
                <span className="truncate">Sân Thanh Nghĩa</span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Share button */}
            <button
              onClick={handleShare}
              title="Chia sẻ liên kết"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white border border-white/15"
            >
              <Share2 className="w-4 h-4" />
              {copied && (
                <span className="absolute top-12 right-4 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow z-50">
                  Đã chép link!
                </span>
              )}
            </button>

            {/* CSV / Sheet Import Button (Only for Authorized BTC) */}
            {isAuthorized && isBtcMode && (
              <button
                onClick={onOpenCsvImport}
                title="Đồng bộ từ Google Sheets hoặc tải tệp CSV"
                className="p-2 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-100 border border-emerald-400/30 active:scale-95 transition-all text-xs font-semibold flex items-center gap-1"
              >
                <Upload className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Đồng Bộ Sheet</span>
              </button>
            )}

            {/* Schedule Time Manager (Authorized BTC) */}
            {isAuthorized && isBtcMode && (
              <button
                onClick={onOpenScheduleManager}
                title="Tự tay sửa giờ toàn bộ các trận đấu"
                className="p-2 rounded-lg bg-blue-500/30 hover:bg-blue-500/40 text-blue-200 border border-blue-400/30 active:scale-95 transition-all text-xs font-semibold flex items-center gap-1"
              >
                <Clock className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Sửa Giờ</span>
              </button>
            )}

            {/* Team Manager (Authorized BTC) */}
            {isAuthorized && isBtcMode && (
              <button
                onClick={onOpenTeamManager}
                title="Đổi tên đội bóng"
                className="p-2 rounded-lg bg-amber-500/30 hover:bg-amber-500/40 text-amber-200 border border-amber-300/30 active:scale-95 transition-all text-xs font-semibold flex items-center gap-1"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Tên đội</span>
              </button>
            )}

            {/* Reset to unplayed default (Authorized BTC) */}
            {isAuthorized && isBtcMode && (
              <button
                onClick={() => {
                  if (confirm('Đặt lại tất cả các trận đấu về trạng thái CHƯA DIỄN RA (0 - 0)?')) {
                    onResetData();
                  }
                }}
                title="Đặt lại toàn bộ về Chưa Diễn Ra"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Login / User Status Button */}
            {currentUser ? (
              isAuthorized ? (
                <button
                  onClick={onOpenLoginModal}
                  title={`Ban Tổ Chức: ${currentUser.email} (Có quyền chỉnh sửa)`}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 border bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300/50 hover:bg-amber-300"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt=""
                      className="w-4 h-4 rounded-full border border-slate-900 object-cover"
                    />
                  ) : (
                    <Shield className="w-3.5 h-3.5 text-slate-950 fill-amber-300" />
                  )}
                  <span className="max-w-[80px] sm:max-w-[130px] truncate">
                    BTC: {currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0] || 'Admin'}
                  </span>
                </button>
              ) : (
                <button
                  onClick={onOpenLoginModal}
                  title={`Đã đăng nhập: ${currentUser.email} (Chỉ có quyền XEM, không thuộc BTC)`}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm active:scale-95 border bg-slate-800/80 hover:bg-slate-800 text-amber-200 border-amber-400/40"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-300" />
                  <span className="max-w-[80px] sm:max-w-[110px] truncate">
                    Chỉ xem: {currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0]}
                  </span>
                </button>
              )
            ) : (
              <button
                onClick={onOpenLoginModal}
                title="Đăng nhập dành cho Ban Tổ Chức"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 border bg-white/15 hover:bg-white/25 text-white border-white/20"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-300" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
