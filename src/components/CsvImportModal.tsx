import React, { useState } from 'react';
import { DivisionId, DivisionData } from '../types';
import { parseTournamentCsv } from '../utils/csvParser';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface CsvImportModalProps {
  currentDivisionId: DivisionId;
  isOpen: boolean;
  onClose: () => void;
  onApplyCsvData: (divisionId: DivisionId, parsedData: Partial<DivisionData>) => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  currentDivisionId,
  isOpen,
  onClose,
  onApplyCsvData,
}) => {
  if (!isOpen) return null;

  const [targetDivision, setTargetDivision] = useState<DivisionId>(currentDivisionId);
  const [csvContent, setCsvContent] = useState<string>('');
  const [preview, setPreview] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleParse = (text: string) => {
    setErrorMsg('');
    if (!text.trim()) {
      setPreview(null);
      return;
    }
    try {
      const parsed = parseTournamentCsv(text, targetDivision);
      const matchCount = parsed.matches?.length || 0;
      const teamCount = parsed.teams ? Object.keys(parsed.teams).length : 0;
      if (matchCount === 0 && teamCount === 0) {
        setErrorMsg('Không tìm thấy dữ liệu trận đấu hoặc đội bóng hợp lệ trong nội dung CSV vừa nhập.');
        setPreview(null);
      } else {
        setPreview({
          parsed,
          matchCount,
          teamCount,
          hasRankings: !!(parsed.rankings?.champion),
        });
      }
    } catch (err: any) {
      setErrorMsg('Lỗi khi đọc CSV: ' + err.message);
      setPreview(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setCsvContent(text);
      handleParse(text);
    };
    reader.readAsText(file);
  };

  const handleApply = () => {
    if (!preview || !preview.parsed) return;
    onApplyCsvData(targetDivision, preview.parsed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                Cập Nhật Dữ Liệu Từ Bảng Tính (CSV)
              </h3>
              <p className="text-xs text-emerald-100">
                Dán nội dung từ Google Sheets / Excel hoặc tải tệp .csv lên
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Division Selector */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              Chọn nội dung thi đấu cần cập nhật:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'nam', label: 'BĐ Nam', icon: '⚽' },
                { id: 'nu', label: 'BĐ Nữ', icon: '🚺' },
                { id: 'khoi89', label: 'Khối 8-9', icon: '⚡' },
                { id: 'khoi67', label: 'Khối 6-7', icon: '🌟' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTargetDivision(item.id as DivisionId);
                    if (csvContent) handleParse(csvContent);
                  }}
                  className={`py-2 px-1 text-center rounded-xl font-bold border transition-all ${
                    targetDivision === item.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>{item.icon}</div>
                  <div className="truncate">{item.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload file or paste text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">
                Dán nội dung CSV hoặc tải tệp:
              </label>
              <label className="cursor-pointer inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <FileText className="w-3.5 h-3.5" />
                <span>Chọn tệp .csv</span>
                <input
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={7}
              value={csvContent}
              onChange={e => {
                setCsvContent(e.target.value);
                handleParse(e.target.value);
              }}
              placeholder="Dán toàn bộ dòng dữ liệu CSV từ Google Sheets hoặc Excel vào đây... (Ví dụ: ,MÔN BÓNG ĐÁ NAM,...)"
              className="w-full p-3 font-mono text-[11px] rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Preview */}
          {preview && (
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Phát hiện dữ liệu bảng tính thành công!</span>
              </div>
              <ul className="text-[11px] text-emerald-800 space-y-0.5 list-disc list-inside">
                <li>Tìm thấy <strong>{preview.matchCount} trận đấu</strong> (vòng bảng, tứ kết, bán kết, chung kết).</li>
                {preview.teamCount > 0 && (
                  <li>Tìm thấy <strong>{preview.teamCount} đội bóng</strong> được cập nhật tên.</li>
                )}
                {preview.hasRankings && (
                  <li>Tìm thấy kết quả xếp hạng chung cuộc: Vô địch <strong>{preview.parsed.rankings.champion}</strong>.</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-all"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={!preview}
            onClick={handleApply}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-700/20 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Áp dụng vào ứng dụng</span>
          </button>
        </div>
      </div>
    </div>
  );
};
