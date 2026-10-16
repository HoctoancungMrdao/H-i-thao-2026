import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { loginWithGoogle, logoutUser, isAuthorizedEmail } from '../firebase';
import { X, LogIn, LogOut, ShieldCheck, AlertCircle, CheckCircle2, ShieldAlert, Eye, Lock } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess?: (user: User) => void;
  onLogoutSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogoutSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAuthorized = currentUser ? isAuthorizedEmail(currentUser.email) : false;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const user = await loginWithGoogle();
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
      onClose();
    } catch (error: any) {
      console.error('Firebase Auth Error:', error);
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      const code = error?.code || '';
      const message = error?.message || '';

      if (code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain') || (host && host.includes('vercel.app'))) {
        setErrorMessage(
          `Tên miền "${host}" chưa được thêm vào Danh sách tên miền được phép trong Firebase Authentication.\n` +
          `👉 Cách xử lý: Mở Firebase Console -> Vào mục "Authentication" -> Chọn tab "Settings" -> Kéo xuống "Authorized domains" -> Bấm "Add domain" và nhập "${host}" (hoặc "vercel.app").`
        );
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorMessage('Cửa sổ đăng nhập Google đã bị đóng trước khi hoàn tất.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMessage('Trình duyệt đã chặn cửa sổ đăng nhập. Vui lòng cho phép mở popup trên trình duyệt.');
      } else {
        setErrorMessage(
          `Không thể đăng nhập (${code || 'Lỗi kết nối'}). Nếu chạy trên Vercel, vui lòng kiểm tra việc thêm tên miền "${host}" vào Authorized Domains trong Firebase Console.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logoutUser();
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    setLoading(true);
    try {
      await logoutUser();
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
      // Re-trigger login popup
      const user = await loginWithGoogle();
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
      onClose();
    } catch (error: any) {
      console.error(error);
      if (error?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage('Không thể chuyển tài khoản. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 flex items-center justify-between text-white ${
          currentUser 
            ? (isAuthorized ? 'bg-gradient-to-r from-emerald-800 to-teal-800' : 'bg-gradient-to-r from-slate-800 to-amber-900')
            : 'bg-gradient-to-r from-emerald-800 to-teal-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              {currentUser ? (
                isAuthorized ? (
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-amber-300" />
                )
              ) : (
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {currentUser 
                  ? (isAuthorized ? 'Ban Tổ Chức Giải Đấu' : 'Tài Khoản Đăng Nhập')
                  : 'Đăng Nhập Ban Tổ Chức'}
              </h3>
              <p className="text-xs text-emerald-100">
                {currentUser 
                  ? (isAuthorized ? 'Xác thực tài khoản có quyền chỉnh sửa' : 'Quyền hạn: Khán giả (Chỉ xem)')
                  : 'Phân quyền nhập tỉ số & quản trị giải'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {currentUser ? (
            /* Logged in state */
            <div className="space-y-4">
              {/* User Identity Card */}
              <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                isAuthorized 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className={`w-12 h-12 rounded-full border-2 shadow-sm object-cover ${
                      isAuthorized ? 'border-emerald-500' : 'border-slate-400'
                    }`}
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full text-white font-bold flex items-center justify-center text-lg ${
                    isAuthorized ? 'bg-emerald-600' : 'bg-slate-600'
                  }`}>
                    {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-800 text-sm truncate">
                      {currentUser.displayName || 'Tài khoản Google'}
                    </span>
                    {isAuthorized ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shrink-0">
                        BAN TỔ CHỨC
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                        CHỈ CÓ QUYỀN XEM
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 truncate font-mono mt-0.5">{currentUser.email}</p>
                </div>
              </div>

              {/* Status & Permission Details */}
              {isAuthorized ? (
                /* Authorized Organizer */
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Quyền hạn: Có toàn quyền chỉnh sửa (BTC)</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed pl-6">
                    Tài khoản của bạn đã được cấp quyền Ban Tổ Chức. Bạn có thể cập nhật kết quả trận đấu, chỉnh sửa giờ thi đấu từng trận, thay đổi tên đội bóng và quản lý toàn bộ dữ liệu. Mọi thay đổi đều được lưu và đồng bộ trực tuyến theo thời gian thực.
                  </p>
                </div>
              ) : (
                /* Non-authorized Logged-in User */
                <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Tài khoản không thuộc Ban Tổ Chức</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Tài khoản <strong>{currentUser.email}</strong> chưa được cấp quyền chỉnh sửa. Bạn đang ở chế độ <strong>XEM</strong> giải đấu. Nếu bạn thuộc Ban Tổ Chức, vui lòng bấm &quot;Đổi tài khoản BTC&quot; để đăng nhập đúng email được cấp quyền.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                {isAuthorized ? (
                  <>
                    <button
                      onClick={onClose}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm"
                    >
                      Tiếp tục quản trị
                    </button>
                    <button
                      onClick={handleSignOut}
                      disabled={loading}
                      className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSwitchAccount}
                      disabled={loading}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Đổi tài khoản BTC</span>
                    </button>
                    <button
                      onClick={handleSignOut}
                      disabled={loading}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Not logged in state */
            <div className="space-y-4">
              <div className="text-center space-y-1.5 py-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Đăng Nhập Ban Tổ Chức</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Đăng nhập tài khoản Google của Ban Tổ Chức để cập nhật kết quả, chỉnh sửa thời gian và quản trị giải đấu.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loading ? 'Đang xác thực...' : 'Đăng nhập bằng tài khoản Google'}</span>
              </button>

              {/* Roles Explanation */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>Khán giả / Học sinh / Phụ huynh:</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                  Chỉ có quyền <strong>XEM</strong>: theo dõi tỉ số trực tiếp theo thời gian thực, lịch đấu, bảng điểm xếp hạng. Không có quyền sửa đổi dữ liệu.
                </p>

                <div className="flex items-center gap-2 text-slate-700 font-bold pt-1">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>Ban Tổ Chức (Đã đăng nhập):</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                  Toàn quyền <strong>CHỈNH SỬA</strong>: nhập điểm số, cài đặt giờ thi đấu, đổi tên đội bóng và cập nhật dữ liệu giải đấu.
                </p>
              </div>

              <div className="text-center pt-1">
                <button
                  onClick={onClose}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                >
                  Tôi là khán giả, quay lại xem giải đấu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
