import React, { useState, useMemo } from 'react';
import { Match, MatchRound } from '../types';
import { X, Check, Clock, MapPin, Calendar, Sparkles, Filter, Wand2, Search } from 'lucide-react';

interface ScheduleManagerModalProps {
  divisionName: string;
  matches: Match[];
  isOpen: boolean;
  onClose: () => void;
  onSaveSchedule: (updatedMatches: Match[]) => void;
}

export const ScheduleManagerModal: React.FC<ScheduleManagerModalProps> = ({
  divisionName,
  matches,
  isOpen,
  onClose,
  onSaveSchedule,
}) => {
  if (!isOpen) return null;

  // Local state for all matches in this division
  const [matchList, setMatchList] = useState<Match[]>([...matches]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAutoTool, setShowAutoTool] = useState<boolean>(false);

  // Auto tool parameters
  const [autoStartTime, setAutoStartTime] = useState<string>('07:30');
  const [autoInterval, setAutoInterval] = useState<number>(45);
  const [autoDate, setAutoDate] = useState<string>('Thứ 7, 24/10');
  const [autoPitch, setAutoPitch] = useState<string>('Sân cỏ nhân tạo Thanh Nghĩa (Sân 1)');

  const quickTimes = ['7h00', '7h30', '8h15', '8h30', '9h00', '9h15', '9h45', '10h00', '14h00', '14h30', '15h15', '15h30', '16h15', '17h00'];
  const quickDays = ['Thứ 6, 17/10', 'Thứ 7, 17/10', 'Chủ Nhật, 18/10', 'Thứ 7, 24/10', 'Chủ Nhật, 25/10', 'Thứ 7, 31/10'];
  const quickPitches = [
    'Sân cỏ nhân tạo Thanh Nghĩa (Sân 1)',
    'Sân cỏ nhân tạo Thanh Nghĩa (Sân 2)',
    'Sân cỏ nhân tạo Thanh Nghĩa (Sân 3)',
    'Sân cỏ nhân tạo Thanh Nghĩa (Sân 4)',
  ];

  // Distinct groups & rounds available
  const availableCategories = useMemo(() => {
    const cats: { id: string; label: string }[] = [{ id: 'all', label: 'Tất cả' }];
    const groups = new Set<string>();
    let hasQuarter = false;
    let hasSemi = false;
    let hasFinal = false;

    matchList.forEach(m => {
      if (m.group) groups.add(m.group);
      if (m.round === 'quarter') hasQuarter = true;
      if (m.round === 'semi') hasSemi = true;
      if (m.round === 'final') hasFinal = true;
    });

    Array.from(groups).sort().forEach(g => {
      cats.push({ id: `group_${g}`, label: `Bảng ${g}` });
    });

    if (hasQuarter) cats.push({ id: 'round_quarter', label: 'Tứ kết' });
    if (hasSemi) cats.push({ id: 'round_semi', label: 'Bán kết' });
    if (hasFinal) cats.push({ id: 'round_final', label: 'Chung kết' });

    return cats;
  }, [matchList]);

  // Filtered matches for display
  const displayedMatches = useMemo(() => {
    return matchList.filter(m => {
      if (activeFilter.startsWith('group_')) {
        const grp = activeFilter.replace('group_', '');
        if (m.group !== grp) return false;
      } else if (activeFilter === 'round_quarter' && m.round !== 'quarter') {
        return false;
      } else if (activeFilter === 'round_semi' && m.round !== 'semi') {
        return false;
      } else if (activeFilter === 'round_final' && m.round !== 'final') {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          m.homeTeam.toLowerCase().includes(q) ||
          m.awayTeam.toLowerCase().includes(q) ||
          m.roundName.toLowerCase().includes(q) ||
          `trận ${m.matchNumber}`.includes(q) ||
          (m.pairCode && m.pairCode.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [matchList, activeFilter, searchQuery]);

  const handleUpdateTime = (id: string, newTime: string) => {
    setMatchList(prev =>
      prev.map(m => (m.id === id ? { ...m, time: newTime } : m))
    );
  };

  const handleUpdatePitch = (id: string, newPitch: string) => {
    setMatchList(prev =>
      prev.map(m => (m.id === id ? { ...m, pitch: newPitch } : m))
    );
  };

  // Quick helper to combine hour and day for a match
  const handleSetQuickTime = (id: string, currentFullTime: string, newHour: string) => {
    if (currentFullTime.includes(',')) {
      const parts = currentFullTime.split(',');
      const datePart = parts.slice(1).join(',').trim();
      handleUpdateTime(id, `${newHour}, ${datePart}`);
    } else {
      handleUpdateTime(id, `${newHour}, Thứ 7, 24/10`);
    }
  };

  const handleSetQuickDay = (id: string, currentFullTime: string, newDay: string) => {
    let hour = '7h30';
    if (currentFullTime.includes(',')) {
      hour = currentFullTime.split(',')[0].trim();
    } else if (currentFullTime.trim()) {
      hour = currentFullTime.trim();
    }
    handleUpdateTime(id, `${hour}, ${newDay}`);
  };

  // Batch auto allocate times for displayed matches
  const handleApplyAutoSchedule = () => {
    const [startH, startM] = autoStartTime.split(':').map(Number);
    let totalMinutes = (isNaN(startH) ? 7 : startH) * 60 + (isNaN(startM) ? 30 : startM);

    const idsToUpdate = new Set(displayedMatches.map(m => m.id));

    setMatchList(prev => {
      let currentMin = totalMinutes;
      return prev.map(m => {
        if (!idsToUpdate.has(m.id)) return m;
        const h = Math.floor(currentMin / 60);
        const mPart = currentMin % 60;
        const formattedHour = `${h}h${mPart === 0 ? '00' : mPart < 10 ? '0' + mPart : mPart}`;
        const newTime = `${formattedHour}, ${autoDate}`;
        currentMin += autoInterval;
        return {
          ...m,
          time: newTime,
          pitch: autoPitch,
        };
      });
    });

    setShowAutoTool(false);
  };

  // Batch apply date to displayed matches
  const handleBatchApplyDate = (day: string) => {
    const idsToUpdate = new Set(displayedMatches.map(m => m.id));
    setMatchList(prev =>
      prev.map(m => {
        if (!idsToUpdate.has(m.id)) return m;
        let hour = '7h30';
        if (m.time.includes(',')) {
          hour = m.time.split(',')[0].trim();
        } else if (m.time.trim()) {
          hour = m.time.trim();
        }
        return { ...m, time: `${hour}, ${day}` };
      })
    );
  };

  // Batch apply pitch to displayed matches
  const handleBatchApplyPitch = (pitch: string) => {
    const idsToUpdate = new Set(displayedMatches.map(m => m.id));
    setMatchList(prev =>
      prev.map(m => (idsToUpdate.has(m.id) ? { ...m, pitch } : m))
    );
  };

  const handleSave = () => {
    onSaveSchedule(matchList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-3.5 sm:p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 shadow-inner">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
                <span>Nhập Giờ & Lịch Thi Đấu</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  {divisionName}
                </span>
              </h3>
              <p className="text-xs text-emerald-100/90 font-medium">
                Tự tay chỉnh sửa thời gian và sân đấu cho từng trận đấu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filter Tabs */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2 flex-shrink-0">
          {/* Category filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar text-xs">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 flex-shrink-0">
              <Filter className="w-3 h-3" /> Lọc:
            </span>
            {availableCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveFilter(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-bold flex-shrink-0 transition-all text-xs ${
                  activeFilter === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}

            {/* Auto Schedule Helper Button */}
            <button
              type="button"
              onClick={() => setShowAutoTool(!showAutoTool)}
              className="ml-auto px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 flex-shrink-0 transition-all"
            >
              <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Chia giờ tự động</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên đội hoặc mã trận (VD: 12A1, B2, Trận 1)..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Auto tool expander panel */}
          {showAutoTool && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-xs space-y-2 animate-in fade-in duration-150">
              <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Công cụ chia giờ liên tiếp ({displayedMatches.length} trận đang hiển thị):</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Giờ bắt đầu:</label>
                  <input
                    type="time"
                    value={autoStartTime}
                    onChange={e => setAutoStartTime(e.target.value)}
                    className="w-full px-2 py-1 bg-white rounded-lg border border-slate-300 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Khoảng cách (phút):</label>
                  <select
                    value={autoInterval}
                    onChange={e => setAutoInterval(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-white rounded-lg border border-slate-300 font-bold text-xs"
                  >
                    <option value={30}>30 phút</option>
                    <option value={40}>40 phút</option>
                    <option value={45}>45 phút</option>
                    <option value={50}>50 phút</option>
                    <option value={60}>60 phút</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Ngày thi đấu:</label>
                  <input
                    type="text"
                    value={autoDate}
                    onChange={e => setAutoDate(e.target.value)}
                    className="w-full px-2 py-1 bg-white rounded-lg border border-slate-300 font-bold text-xs"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleApplyAutoSchedule}
                    className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs active:scale-95 transition-all"
                  >
                    Áp dụng ngay
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Batch Quick Days Bar */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 hide-scrollbar text-[11px]">
            <span className="font-semibold text-slate-400 flex-shrink-0">Gán nhanh ngày cho {displayedMatches.length} trận:</span>
            {quickDays.slice(0, 4).map(qd => (
              <button
                key={qd}
                type="button"
                onClick={() => handleBatchApplyDate(qd)}
                className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px] border border-emerald-200 flex-shrink-0 transition-colors"
                title={`Đặt ngày "${qd}" cho tất cả các trận đang xem`}
              >
                + {qd}
              </button>
            ))}
          </div>
        </div>

        {/* Matches List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1 text-xs">
          {displayedMatches.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-medium">
              Không có trận đấu nào khớp với bộ lọc
            </div>
          ) : (
            displayedMatches.map(m => (
              <div
                key={m.id}
                className="bg-white p-3 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all space-y-2.5"
              >
                {/* Match Header Line */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-slate-900 text-white px-2 py-0.5 rounded-md font-black text-[11px]">
                      Trận #{m.matchNumber}
                    </span>
                    <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-200 text-[11px]">
                      {m.roundName}
                    </span>
                    {m.pairCode && (
                      <span className="text-slate-400 font-semibold text-[11px]">
                        ({m.pairCode})
                      </span>
                    )}
                  </div>

                  <div className="font-black text-slate-900 text-xs sm:text-sm text-right truncate">
                    <span className="text-emerald-700">{m.homeTeam}</span>
                    <span className="mx-1.5 text-slate-400 font-normal">vs</span>
                    <span className="text-emerald-700">{m.awayTeam}</span>
                  </div>
                </div>

                {/* Time Input & Quick Buttons */}
                <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 sm:w-44 flex-shrink-0">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Thời gian trận đấu:</span>
                    </label>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={m.time}
                        onChange={e => handleUpdateTime(m.id, e.target.value)}
                        placeholder="VD: 7h30, Thứ 7, 24/10"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Quick Hour Chips */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-0.5 hide-scrollbar text-[11px] pt-1">
                    <span className="text-[10px] font-semibold text-slate-400 flex-shrink-0">Chọn giờ:</span>
                    {quickTimes.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleSetQuickTime(m.id, m.time, t)}
                        className="px-2 py-0.5 rounded-md bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold text-[10px] border border-slate-200 flex-shrink-0 transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Quick Day Chips */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-0.5 hide-scrollbar text-[11px]">
                    <span className="text-[10px] font-semibold text-slate-400 flex-shrink-0">Chọn ngày:</span>
                    {quickDays.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleSetQuickDay(m.id, m.time, d)}
                        className="px-2 py-0.5 rounded-md bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 font-semibold text-[10px] border border-emerald-200 flex-shrink-0 transition-colors"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pitch Input */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 sm:w-44 flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sân thi đấu:</span>
                  </label>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={m.pitch}
                      onChange={e => handleUpdatePitch(m.id, e.target.value)}
                      placeholder="VD: Sân cỏ nhân tạo Thanh Nghĩa (Sân 1)"
                      className="flex-1 px-3 py-1 rounded-xl border border-slate-300 font-medium text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <div className="flex gap-1 flex-shrink-0">
                      {['Sân 1', 'Sân 2', 'Sân 3', 'Sân 4'].map((s, idx) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleUpdatePitch(m.id, quickPitches[idx])}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] border border-slate-200"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 flex-shrink-0">
          <span className="text-xs text-slate-600">
            Hiển thị: <strong>{displayedMatches.length}/{matchList.length} trận</strong>
          </span>
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
              <span>Lưu Lịch Thi Đấu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
