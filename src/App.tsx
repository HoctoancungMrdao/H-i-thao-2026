import React, { useState, useEffect } from 'react';
import { Match } from '../types';
import { X, Clock, Check, ChevronRight } from 'lucide-react';

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
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    if (match) {
      setTime(match.time || '');
    }
  }, [match]);

  if (!isOpen || !match) return null;

  const handleSaveOnly = () => {
    onSave({
      ...match,
      time: time.trim(),
    });
    onClose();
  };

  const handleSaveAndNext = () => {
    onSave({
      ...match,
      time: time.trim(),
    });
    if (onNavigateMatch) {
      onNavigateMatch('next');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header gọn gàng */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Chỉnh Sửa Giờ Thi Đấu</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Trận #{match.id} • {match.round || 'Vòng bảng'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Khối hiển thị cặp trận đấu */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              CẶP ĐẤU
            </span>
            <div className="flex items-center justify-center gap-3 text-base font-extrabold text-slate-800">
              <span className="text-emerald-700">{match.homeTeam || 'Đội A'}</span>
              <span className="text-xs font-semibold text-slate-400 px-1.5 py-0.5 bg-slate-200/70 rounded">VS</span>
              <span className="text-emerald-700">{match.awayTeam || 'Đội B'}</span>
            </div>
          </div>

          {/* Ô nhập thời gian gọn gàng */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Thời gian thi đấu (Giờ, Thứ, Ngày):
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Ví dụ: 7h30, Thứ 6, 17/10"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Footer gồm các nút bấm thao tác chính */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          {onNavigateMatch ? (
            <button
              onClick={handleSaveAndNext}
              className="px-3.5 py-2 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
            >
              <span>Lưu & Trận sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-slate-600 hover:bg-slate-200 font-semibold text-xs rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveOnly}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
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
