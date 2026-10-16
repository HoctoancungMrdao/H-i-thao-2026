import React from 'react';
import { ShieldCheck, X, FileDown, Link2, Clock } from 'lucide-react';

interface BtcToolbarProps {
  isVisible: boolean;
  onClose: () => void;
  onExport: () => void;
  onOpenCsvImport: () => void;
  onOpenScheduleManager: () => void;
  hasSavedSheetUrl?: boolean;
}

export const BtcToolbar: React.FC<BtcToolbarProps> = ({
  isVisible,
  onClose,
  onExport,
  onOpenCsvImport,
  onOpenScheduleManager,
  hasSavedSheetUrl = false,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-3 inset-x-3 max-w-xl mx-auto z-40 animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-slate-900 text-white rounded-2xl p-3 shadow-2xl border border-amber-400/40 flex items-center justify-between gap-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-amber-300 truncate">
              Chế độ Ban Tổ Chức
            </p>
            <p className="text-[11px] text-slate-300 truncate">
              Nhấn vào trận đấu để nhập tỉ số, sửa giờ hoặc đồng bộ Sheet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onOpenScheduleManager}
            title="Sửa giờ toàn bộ các trận đấu"
            className="p-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sửa Giờ</span>
          </button>
          <button
            onClick={onOpenCsvImport}
            title={hasSavedSheetUrl ? "Đồng bộ tỉ số & giờ từ link Google Sheets" : "Nhập dữ liệu từ Google Sheets hoặc CSV"}
            className="p-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs relative"
          >
            <Link2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Đồng bộ Sheet</span>
            {hasSavedSheetUrl && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            )}
          </button>
          <button
            onClick={onExport}
            title="Tải về bản sao lưu dữ liệu"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sao lưu</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold"
            title="Thoát chế độ BTC"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
