import React, { useState } from 'react';
import { Match, MatchStatus } from '../types';
import { X, Check, Plus, Minus, RotateCcw, Clock, MapPin } from 'lucide-react';

interface ScoreEntryModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMatch: Match) => void;
}

export const ScoreEntryModal: React.FC<ScoreEntryModalProps> = ({
  match,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !match) return null;

  const [homeScore, setHomeScore] = useState<number>(match.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState<number>(match.awayScore ?? 0);
  const [status, setStatus] = useState<MatchStatus>(match.status || 'finished');
  const [hasPenalty, setHasPenalty] = useState<boolean>(match.hasPenalty || false);
  const [homePen, setHomePen] = useState<number>(match.homePen ?? 0);
  const [awayPen, setAwayPen] = useState<number>(match.awayPen ?? 0);
  const [time, setTime] = useState<string>(match.time || '');
  const [pitch, setPitch] = useState<string>(match.pitch || '');
  const [note, setNote] = useState<string>(match.note || '');

  const handleSave = () => {
    let winner = match.winnerTeam;

    if (status === 'finished') {
      if (homeScore > awayScore) {
        winner = match.homeTeam;
      } else if (awayScore > homeScore) {
        winner = match.awayTeam;
      } else if (hasPenalty) {
        if (homePen > awayPen) winner = match.homeTeam;
        else if (awayPen > homePen) winner = match.awayTeam;
      }
    } else if (status === 'scheduled') {
      winner = undefined;
    }

    const updated: Match = {
      ...match,
      time: time.trim(),
      pitch: pitch.trim(),
      homeScore: status === 'scheduled' ? null : homeScore,
      awayScore: status === 'scheduled' ? null : awayScore,
      status,
      hasPenalty: status === 'finished' && hasPenalty,
      homePen: hasPenalty ? homePen : undefined,
      awayPen: hasPenalty ? awayPen : undefined,
      winnerTeam: winner,
      note: note.trim() || undefined,
    };

    onSave(updated);
    onClose();
  };

  const handleClear = () => {
    const cleared: Match = {
      ...match,
      homeScore: null,
      awayScore: null,
      status: 'scheduled',
      hasPenalty: false,
      homePen: undefined,
      awayPen: undefined,
      winnerTeam: undefined,
      note: undefined,
    };
    onSave(cleared);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 bg-white/10 px-2 py-0.5 rounded">
              BAN TỔ CHỨC NHẬP KẾT QUẢ
            </span>
            <h3 className="font-black text-base sm:text-lg mt-0.5">
              {match.roundName} • Trận #{match.matchNumber}
            </h3>
            <p className="text-xs text-emerald-100">{match.time} • {match.pitch}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Match Score Steppers */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              {/* Home Team */}
              <div className="flex flex-col items-center text-center">
                <span className="font-extrabold text-sm text-slate-800 truncate max-w-[120px] mb-2" title={match.homeTeam}>
                  {match.homeTeam}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                    disabled={status === 'scheduled'}
                    className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 active:scale-95 flex items-center justify-center font-bold text-slate-700 transition-all disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={status === 'scheduled' ? '' : homeScore}
                    onChange={e => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                    disabled={status === 'scheduled'}
                    className="w-14 h-12 text-center text-2xl font-black rounded-xl bg-white border-2 border-emerald-500 text-slate-900 focus:outline-none disabled:bg-slate-100 disabled:border-slate-300"
                  />
                  <button
                    onClick={() => setHomeScore(homeScore + 1)}
                    disabled={status === 'scheduled'}
                    className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 flex items-center justify-center font-bold text-white transition-all disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Colon */}
              <div className="font-black text-2xl text-slate-300 px-1 pt-6">:</div>

              {/* Away Team */}
              <div className="flex flex-col items-center text-center">
                <span className="font-extrabold text-sm text-slate-800 truncate max-w-[120px] mb-2" title={match.awayTeam}>
                  {match.awayTeam}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                    disabled={status === 'scheduled'}
                    className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 active:scale-95 flex items-center justify-center font-bold text-slate-700 transition-all disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={status === 'scheduled' ? '' : awayScore}
                    onChange={e => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                    disabled={status === 'scheduled'}
                    className="w-14 h-12 text-center text-2xl font-black rounded-xl bg-white border-2 border-emerald-500 text-slate-900 focus:outline-none disabled:bg-slate-100 disabled:border-slate-300"
                  />
                  <button
                    onClick={() => setAwayScore(awayScore + 1)}
                    disabled={status === 'scheduled'}
                    className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 flex items-center justify-center font-bold text-white transition-all disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Status Radio */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Trạng thái trận đấu:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('finished')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  status === 'finished'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ✓ Đã kết thúc
              </button>
              <button
                type="button"
                onClick={() => setStatus('live')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  status === 'live'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ● Đang đá
              </button>
              <button
                type="button"
                onClick={() => setStatus('scheduled')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  status === 'scheduled'
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Chưa đấu
              </button>
            </div>
          </div>

          {/* Penalty Shootout section (for Knockout or Draws) */}
          {(match.round !== 'group' || homeScore === awayScore) && (
            <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasPenalty}
                  onChange={e => setHasPenalty(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                />
                <span className="text-xs font-bold text-amber-950">
                  Có đá luân lưu 11m (Penalty)
                </span>
              </label>

              {hasPenalty && (
                <div className="grid grid-cols-2 gap-3 pt-1 animate-in fade-in">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1 truncate">
                      Pen {match.homeTeam}:
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={homePen}
                      onChange={e => setHomePen(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2 bg-white rounded-xl border border-amber-300 font-black text-center text-lg"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1 truncate">
                      Pen {match.awayTeam}:
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={awayPen}
                      onChange={e => setAwayPen(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2 bg-white rounded-xl border border-amber-300 font-black text-center text-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Match Time & Pitch Inputs */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Thời gian & Sân thi đấu:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Giờ & ngày:</label>
                <input
                  type="text"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  placeholder="VD: 7h30, Thứ 7, 24/10"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-bold text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Sân thi đấu:</label>
                <input
                  type="text"
                  value={pitch}
                  onChange={e => setPitch(e.target.value)}
                  placeholder="VD: Sân 1, Thanh Nghĩa"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-medium text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Ghi chú thêm (tùy chọn):
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="VD: Cầu thủ ghi bàn, thẻ phạt, luân lưu..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
            title="Đặt lại trận đấu về trạng thái chưa diễn ra"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đặt lại</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-all"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-700/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Lưu kết quả</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
