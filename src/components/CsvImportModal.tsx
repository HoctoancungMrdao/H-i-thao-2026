import React, { useState, useEffect } from 'react';
import { DivisionId, DivisionData } from '../types';
import { parseTournamentCsv, fetchGoogleSheetCsv, getGoogleSheetCsvUrl } from '../utils/csvParser';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Link2, RefreshCw, HelpCircle, ExternalLink } from 'lucide-react';

interface CsvImportModalProps {
  currentDivisionId: DivisionId;
  isOpen: boolean;
  onClose: () => void;
  onApplyCsvData: (divisionId: DivisionId, parsedData: Partial<DivisionData>, sheetUrl?: string) => void;
  initialSheetUrl?: string;
}

type ImportTab = 'sheet-link' | 'paste-text' | 'file-upload';

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  currentDivisionId,
  isOpen,
  onClose,
  onApplyCsvData,
  initialSheetUrl = '',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<ImportTab>('sheet-link');
  const [targetDivision, setTargetDivision] = useState<DivisionId>(currentDivisionId);
  const [sheetUrl, setSheetUrl] = useState<string>(initialSheetUrl);
  const [csvContent, setCsvContent] = useState<string>('');
  const [preview, setPreview] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rememberLink, setRememberLink] = useState<boolean>(true);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  useEffect(() => {
    if (initialSheetUrl && !sheetUrl) {
      setSheetUrl(initialSheetUrl);
    }
  }, [initialSheetUrl]);

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
        setErrorMsg('Không tìm thấy dữ liệu trận đấu hoặc đội bóng hợp lệ trong nội dung CSV/bảng tính vừa nhập. Hãy kiểm tra định dạng bảng.');
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
      setErrorMsg('Lỗi khi phân tích dữ liệu: ' + (err.message || String(err)));
      setPreview(null);
    }
  };

  const handleFetchFromSheet = async () => {
    if (!sheetUrl.trim()) {
      setErrorMsg('Vui lòng nhập đường link Google Sheets.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    setPreview(null);

    try {
      const fetchedCsv = await fetchGoogleSheetCsv(sheetUrl);
      setCsvContent(fetchedCsv);
      handleParse(fetchedCsv);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể đọc dữ liệu từ link Google Sheets.');
      setShowGuide(true);
    } finally {
      setIsLoading(false);
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
    const savedUrl = rememberLink && sheetUrl.trim() ? sheetUrl.trim() : undefined;
    onApplyCsvData(targetDivision, preview.parsed, savedUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                Cập Nhật Tỉ Số & Lịch Thi Đấu
              </h3>
              <p className="text-xs text-emerald-100">
                Đồng bộ tự động từ Google Sheets hoặc dán bảng tính CSV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 text-xs font-bold gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('sheet-link')}
            className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'sheet-link'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Link Google Sheets</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste-text')}
            className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'paste-text'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Dán Bảng Tính (Copy/Paste)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('file-upload')}
            className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'file-upload'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tải Tệp .CSV</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Target Division */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              Áp dụng cho nội dung thi đấu:
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

          {/* TAB 1: Google Sheet Link */}
          {activeTab === 'sheet-link' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800">
                    Đường dẫn Google Sheets:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowGuide(!showGuide)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Cách mở quyền xem</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={sheetUrl}
                      onChange={e => setSheetUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                      className="w-full p-2.5 pl-8 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-[11px]"
                    />
                    <Link2 className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchFromSheet}
                    disabled={isLoading || !sheetUrl.trim()}
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>{isLoading ? 'Đang tải...' : 'Đọc Sheet'}</span>
                  </button>
                </div>
              </div>

              {/* Remember link checkbox */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 pt-1">
                <input
                  type="checkbox"
                  checked={rememberLink}
                  onChange={e => setRememberLink(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Lưu đường dẫn này vào Firestore để Ban Tổ Chức đồng bộ nhanh lần sau</span>
              </label>

              {/* Guide Accordion */}
              {showGuide && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1.5 text-[11px]">
                  <p className="font-bold">Để hệ thống đọc được dữ liệu từ Google Sheets:</p>
                  <ol className="list-decimal list-inside space-y-1 pl-1">
                    <li>Mở file Google Sheets trên trình duyệt.</li>
                    <li>Bấm nút <strong>Chia sẻ (Share)</strong> ở góc trên bên phải.</li>
                    <li>Ở mục <em>Quyền truy cập chung</em>, chọn <strong>Bất kỳ ai có đường liên kết đều có thể xem</strong> (Anyone with the link can view).</li>
                    <li>Bấm <strong>Sao chép đường liên kết</strong> và dán vào ô bên trên.</li>
                    <li><em>Mẹo:</em> Bạn cũng có thể vào <strong>Tệp (File) &gt; Chia sẻ &gt; Xuất bản lên web &gt; chọn CSV</strong> để đồng bộ tốc độ cao nhất!</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Copy Paste */}
          {activeTab === 'paste-text' && (
            <div className="space-y-2">
              <label className="font-bold text-slate-800 block">
                Dán các dòng từ bảng tính Google Sheets / Excel:
              </label>
              <textarea
                rows={7}
                value={csvContent}
                onChange={e => {
                  setCsvContent(e.target.value);
                  handleParse(e.target.value);
                }}
                placeholder="Bạn chỉ cần mở Google Sheet, bôi đen các dòng lịch đấu và tỉ số (Ctrl+C), rồi dán trực tiếp (Ctrl+V) vào đây... Hệ thống tự động nhận diện cả dấu Tab và Dấu Phẩy."
                className="w-full p-3 font-mono text-[11px] rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
              />
            </div>
          )}

          {/* TAB 3: File upload */}
          {activeTab === 'file-upload' && (
            <div className="space-y-3">
              <label className="font-bold text-slate-800 block">
                Tải tệp bảng tính .csv từ máy tính:
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-emerald-500 transition-all bg-slate-50">
                <FileText className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-700 mb-1">
                  Kéo thả hoặc chọn tệp .CSV của giải đấu
                </p>
                <p className="text-[11px] text-slate-400 mb-3">
                  (Định dạng CSV UTF-8 từ Excel hoặc Google Sheets)
                </p>
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-white bg-emerald-600 hover:bg-emerald-700 font-bold px-4 py-2 rounded-xl shadow-xs transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Chọn tệp .csv</span>
                  <input
                    type="file"
                    accept=".csv,text/csv,text/plain"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Không thể tải hoặc phân tích:</p>
                <p className="text-[11px]">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Success Preview */}
          {preview && (
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Phân tích dữ liệu thành công! Sẵn sàng cập nhật:</span>
              </div>
              <ul className="text-[11px] text-emerald-800 space-y-0.5 list-disc list-inside">
                <li>Phát hiện <strong>{preview.matchCount} trận đấu</strong> (vòng bảng &amp; vòng knock-out).</li>
                {preview.teamCount > 0 && (
                  <li>Tìm thấy <strong>{preview.teamCount} đội bóng</strong> được cập nhật tên.</li>
                )}
                {preview.hasRankings && (
                  <li>Tìm thấy kết quả xếp hạng: Vô địch <strong>{preview.parsed.rankings.champion}</strong>.</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          <p className="text-[11px] text-slate-400 truncate hidden sm:block">
            Dữ liệu sẽ được lưu tự động lên Firebase Firestore.
          </p>
          <div className="flex items-center gap-2 ml-auto">
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
              <span>Áp dụng vào hệ thống</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
