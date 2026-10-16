import React, { useState, useEffect } from 'react';
import { Match } from '../types';
import { X, Check, Clock, MapPin, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

interface EditMatchModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMatch: Match) => void;
  onNavigateMatch?: (direction: 'prev' | 'next') => void;
}

export const EditMatchModal: React.FC<EditMatchModalProps> = ({
  match,
  isOpen,
  onClose,
  onSave,
  onNavigateMatch,
}) => {
  if (!isOpen || !match) return null;

  const [time, setTime] = useState(match.time);
  const [pitch, setPitch] = useState(match.pitch);
  const [homeTeam, setHomeTeam] = useState(match.homeTeam);
  const [awayTeam, setAwayTeam] = useState(match.awayTeam);
  const [roundName, setRoundName] = useState(match.roundName);

  useEffect(() => {
    if (match) {
      setTime(match.time);
      setPitch(match.pitch);
      setHomeTeam(match.homeTeam);
      setAwayTeam(match.awayTeam);
      setRoundName(match.roundName);
    }
  }, [match]);

  const handleSaveOnly = () => {
    onSave({
      ...match,
      time: time.trim(),
      pitch: pitch.trim(),
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      roundName: roundName.trim(),
    });
  };

  const handleSaveAndClose = () => {
    handleSaveOnly();
    onClose();
  };

  const handleSaveAndNext = () => {
    handleSaveOnly();
    if (onNavigateMatch) {
      onNavigateMatch('next');
    }
  };

  const quickTimes = ['7h30', '8h15', '8h20', '8h30', '9h00', '9h10', '9h45', '10h00', '14h30', '15h30', '16h00', '17h00'];
  const quickDays = ['Thứ 6, 17/10', 'Thứ 7, 17/10', 'Chủ Nhật, 18/10', 'Thứ 7, 24/10', 'Chủ Nhật, 25/10'];
  const quickPitches = [
    'Sân cỏ nhân tạo Thanh Nghĩa (Sân 1)',
    'Sân cỏ nhân tạo Thanh Nghĩa (Sân 2)',
    'Sân cỏ nhân tạo Thanh Nghĩa (Sân 3)',
    'Sân cỏ nhân tạo Thanh Nghĩa (Sân 4)',
    'Sân cỏ nhân tạo Khánh Ngọc (Sân 1)',
    'Sân cỏ nhân tạo Khánh Ngọc (Sân 2)',
    'Sân cỏ nhân tạo Mũi Tàu (Sân 1)',
    'Sân cỏ nhân tạo Mũi Tàu (Sân 2)',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                Chỉnh Sửa Thời Gian & Sân Đấu
              </h3>
              <p className="text-xs text-slate-300">
                Trận #{match.matchNumber} • {match.roundName} {match.pairCode ? `(${match.pairCode})` : ''}
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

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs">
          {/* Teams Banner */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
            <div className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">
              CẶP ĐẤU HIỆN TẠI
            </div>
            <div className="font-black text-slate-900 text-sm sm:text-base flex items-center justify-center gap-2">
              <span className="text-emerald-700">{homeTeam}</span>
              <span className="text-slate-400 font-semibold text-xs">VS</span>
              <span className="text-emerald-700">{awayTeam}</span>
            </div>
          </div>

          {/* Time Input with Quick Chips */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Thời gian thi đấu (Giờ, Thứ, Ngày):</span>
            </label>
            <input
              type="text"
              value={time}
              onChange={e => setTime(e.target.value)}
              placeholder="VD: 7h30, Thứ 7, 24/10"
              className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />

            {/* Quick Time Chips */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Chọn giờ nhanh:
              </div>
              <div className="flex flex-wrap gap-1">
                {quickTimes.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      // replace hour or prepend
                      if (time.includes(',')) {
                        const parts = time.split(',');
                        setTime(`${t},${parts.slice(1).join(',')}`);
                      } else {
                        setTime(`${t}, Thứ 7, 17/10`);
                      }
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-[11px] transition-colors border border-slate-200"
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 pt-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Chọn ngày nhanh:
              </div>
              <div className="flex flex-wrap gap-1">
                {quickDays.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      const hour = time.split(',')[0]?.trim() || '7h30';
                      setTime(`${hour}, ${d}`);
                    }}
                    className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] transition-colors border border-emerald-200"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pitch Input with Quick Chips */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sân / Địa điểm:</span>
            </label>
            <input
              type="text"
              value={pitch}
              onChange={e => setPitch(e.target.value)}
              placeholder="VD: Sân cỏ nhân tạo Thanh Nghĩa (Sân 1)"
              className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <div className="flex flex-wrap gap-1">
              {['Sân 1', 'Sân 2', 'Sân 3', 'Sân 4'].map((s, idx) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPitch(quickPitches[idx])}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] border border-slate-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          {onNavigateMatch && (
            <button
              type="button"
              onClick={handleSaveAndNext}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-all border border-emerald-300"
              title="Lưu trận này và chuyển sang sửa giờ trận tiếp theo"
            >
              <span>Lưu & Trận sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-all"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-700/20 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Giờ Đấu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
