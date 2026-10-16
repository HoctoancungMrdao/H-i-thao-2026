import React, { useState, useMemo } from 'react';
import { Match, MatchRound } from '../types';
import { MatchCard } from './MatchCard';
import { Search, Filter, CalendarDays, CheckCircle2, Clock } from 'lucide-react';

interface MatchesViewProps {
  matches: Match[];
  isBtcMode: boolean;
  onEditScore: (match: Match) => void;
  onEditDetails?: (match: Match) => void;
  onOpenScheduleManager?: () => void;
}

export const MatchesView: React.FC<MatchesViewProps> = ({
  matches,
  isBtcMode,
  onEditScore,
  onEditDetails,
  onOpenScheduleManager,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRound, setSelectedRound] = useState<'all' | MatchRound>('all');
  const [selectedGroup, setSelectedGroup] = useState<'all' | 'A' | 'B' | 'C' | 'D'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'finished' | 'scheduled'>('all');
  const [viewGrouping, setViewGrouping] = useState<'order' | 'stage'>('order');

  // Check which rounds exist in this division
  const availableRounds = useMemo(() => {
    const rounds = new Set<MatchRound>();
    matches.forEach(m => rounds.add(m.round));
    return Array.from(rounds);
  }, [matches]);

  // Check available groups
  const availableGroups = useMemo(() => {
    const groups = new Set<'A' | 'B' | 'C' | 'D'>();
    matches.forEach(m => {
      if (m.group) groups.add(m.group);
    });
    return Array.from(groups).sort();
  }, [matches]);

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName =
          match.homeTeam.toLowerCase().includes(query) ||
          match.awayTeam.toLowerCase().includes(query) ||
          (match.pairCode && match.pairCode.toLowerCase().includes(query)) ||
          match.roundName.toLowerCase().includes(query);
        if (!matchesName) return false;
      }

      // Round
      if (selectedRound !== 'all' && match.round !== selectedRound) {
        return false;
      }

      // Group
      if (selectedRound === 'group' && selectedGroup !== 'all' && match.group !== selectedGroup) {
        return false;
      }

      // Status
      if (selectedStatus === 'finished' && match.status !== 'finished') return false;
      if (selectedStatus === 'scheduled' && match.status === 'finished') return false;

      return true;
    });
  }, [matches, searchQuery, selectedRound, selectedGroup, selectedStatus]);

  // Group filtered matches by roundName/stage or sequential order
  const groupedSections = useMemo(() => {
    if (viewGrouping === 'order' && selectedRound === 'all' && selectedGroup === 'all') {
      const sorted = [...filteredMatches].sort((a, b) => a.matchNumber - b.matchNumber);
      return [
        {
          title: `SƠ ĐỒ THỨ TỰ CÁC TRẬN ĐẤU (TRẬN 1 - ${sorted.length})`,
          matches: sorted,
        },
      ];
    }

    const sections: { title: string; matches: Match[] }[] = [];
    const map = new Map<string, Match[]>();

    filteredMatches.forEach(m => {
      let title = m.roundName;
      if (m.round === 'group' && m.group) {
        title = `VÒNG BẢNG - BẢNG ${m.group}`;
      } else if (m.round === 'quarter') {
        title = 'VÒNG TỨ KẾT';
      } else if (m.round === 'semi') {
        title = 'VÒNG BÁN KẾT';
      } else if (m.round === 'final') {
        title = 'TRẬN CHUNG KẾT';
      }

      if (!map.has(title)) {
        map.set(title, []);
      }
      map.get(title)!.push(m);
    });

    // Sort each section's matches strictly by matchNumber
    map.forEach((matchList, title) => {
      sections.push({
        title,
        matches: [...matchList].sort((a, b) => a.matchNumber - b.matchNumber)
      });
    });

    return sections;
  }, [filteredMatches, viewGrouping, selectedRound, selectedGroup]);

  return (
    <div className="space-y-3.5">
      {/* Schedule Time Manager Quick Banner (Only for BTC) or Live Info Banner (for Viewers) */}
      {isBtcMode && onOpenScheduleManager ? (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-3 sm:p-3.5 shadow-sm border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
              <Clock className="w-5 h-5 text-slate-950" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-extrabold text-amber-300">
                Tự tay nhập thời gian từng trận đấu
              </p>
              <p className="text-[11px] text-slate-300">
                Chỉnh sửa giờ, ngày, thứ và sân thi đấu hoặc chạm trực tiếp vào &quot;Sửa giờ&quot; ở từng trận
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenScheduleManager}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md shadow-amber-400/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 flex-shrink-0 self-stretch sm:self-auto cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Xếp Lịch / Sửa Giờ ({matches.length} trận)</span>
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 text-xs text-emerald-900">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[11px] sm:text-xs text-emerald-800 truncate">
              Lịch thi đấu & kết quả trực tuyến. Khán giả và học sinh xem trực tiếp không cần đăng nhập.
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenScheduleManager}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline shrink-0 cursor-pointer"
          >
            Đăng nhập BTC
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên đội bóng, số trận (vd: 12A1, Trận 1)..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>

        {/* View Switcher: Thứ tự trận đấu vs Phân bảng */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="text-[11px] font-bold text-slate-500">Chế độ xem:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewGrouping('order')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewGrouping === 'order'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Thứ tự trận đấu (1, 2, 3...)
            </button>
            <button
              onClick={() => setViewGrouping('stage')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewGrouping === 'stage'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Phân theo bảng & vòng
            </button>
          </div>
        </div>

        {/* Round Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar text-xs">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 flex-shrink-0">
            <Filter className="w-3 h-3" /> Vòng:
          </span>
          <button
            onClick={() => setSelectedRound('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 transition-all ${
              selectedRound === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({matches.length})
          </button>
          {availableRounds.includes('group') && (
            <button
              onClick={() => setSelectedRound('group')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 transition-all ${
                selectedRound === 'group'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Vòng bảng
            </button>
          )}
          {availableRounds.includes('quarter') && (
            <button
              onClick={() => setSelectedRound('quarter')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 transition-all ${
                selectedRound === 'quarter'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tứ kết
            </button>
          )}
          {availableRounds.includes('semi') && (
            <button
              onClick={() => setSelectedRound('semi')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 transition-all ${
                selectedRound === 'semi'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Bán kết
            </button>
          )}
          {availableRounds.includes('final') && (
            <button
              onClick={() => setSelectedRound('final')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 transition-all ${
                selectedRound === 'final'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Chung kết
            </button>
          )}
        </div>

        {/* Group Sub-filters if in group stage */}
        {selectedRound === 'group' && availableGroups.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar text-xs border-t border-slate-100 pt-2">
            <span className="text-[11px] font-bold text-slate-400 flex-shrink-0">Bảng:</span>
            <button
              onClick={() => setSelectedGroup('all')}
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] flex-shrink-0 ${
                selectedGroup === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả các bảng
            </button>
            {availableGroups.map(grp => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-2 py-0.5 rounded-md font-semibold text-[11px] flex-shrink-0 ${
                  selectedGroup === grp
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Bảng {grp}
              </button>
            ))}
          </div>
        )}

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-[11px] text-slate-400 font-medium">Trạng thái:</span>
          <button
            onClick={() => setSelectedStatus('all')}
            className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
              selectedStatus === 'all' ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-slate-500'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setSelectedStatus('finished')}
            className={`text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
              selectedStatus === 'finished' ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-slate-500'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" /> Đã xong
          </button>
          <button
            onClick={() => setSelectedStatus('scheduled')}
            className={`text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
              selectedStatus === 'scheduled' ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-slate-500'
            }`}
          >
            <CalendarDays className="w-3 h-3" /> Chưa đấu
          </button>
        </div>
      </div>

      {/* Matches List */}
      {groupedSections.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2">
            <Filter className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">Không tìm thấy trận đấu phù hợp</p>
          <p className="text-xs text-slate-400 mt-1">Vui lòng thử bỏ bộ lọc hoặc từ khóa tìm kiếm</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedRound('all');
              setSelectedGroup('all');
              setSelectedStatus('all');
            }}
            className="mt-3 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
          >
            Xem tất cả trận đấu
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedSections.map(section => (
            <div key={section.title} className="space-y-2.5">
              {/* Section Header */}
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {section.title}
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">
                  {section.matches.length} trận
                </span>
              </div>

              {/* Cards in Section */}
              <div className="grid grid-cols-1 gap-2.5">
                {section.matches.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    isBtcMode={isBtcMode}
                    onEditScore={onEditScore}
                    onEditDetails={onEditDetails}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
