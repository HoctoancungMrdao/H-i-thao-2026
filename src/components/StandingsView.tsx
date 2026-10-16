import React, { useState } from 'react';
import { Match, GroupTeamStanding } from '../types';
import { calculateGroupStandings, getMatchMatrix } from '../utils/standings';
import { Award, ChevronRight, Grid, Table as TableIcon } from 'lucide-react';

interface StandingsViewProps {
  groups: ('A' | 'B' | 'C' | 'D')[];
  teams: { [code: string]: string };
  matches: Match[];
  isBtcMode: boolean;
  onEditScore: (match: Match) => void;
}

export const StandingsView: React.FC<StandingsViewProps> = ({
  groups,
  teams,
  matches,
  isBtcMode,
  onEditScore,
}) => {
  const [activeGroup, setActiveGroup] = useState<'all' | 'A' | 'B' | 'C' | 'D'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const displayGroups = activeGroup === 'all' ? groups : [activeGroup];

  return (
    <div className="space-y-4">
      {/* Group Switcher & View Switcher */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-2">
        {/* Group Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveGroup('all')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex-shrink-0 ${
              activeGroup === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả bảng
          </button>
          {groups.map(grp => (
            <button
              key={grp}
              onClick={() => setActiveGroup(grp)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex-shrink-0 ${
                activeGroup === grp
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Bảng {grp}
            </button>
          ))}
        </div>

        {/* View Mode Toggle (Table vs Matrix) */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'table'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bảng điểm</span>
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'matrix'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ma trận chéo</span>
            <span className="sm:hidden">Ma trận</span>
          </button>
        </div>
      </div>

      {/* Guide Note */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-3 py-2 text-xs text-emerald-900 flex items-center justify-between">
        <span className="font-medium">
          🌟 <strong>Top 2 đội đứng đầu mỗi bảng</strong> giành quyền vào vòng Tứ kết / Bán kết.
        </span>
        <span className="text-[11px] text-emerald-700 font-semibold hidden sm:inline">
          Thắng: 3đ • Hòa: 1đ • Thua: 0đ
        </span>
      </div>

      {/* Groups Content */}
      <div className="space-y-5">
        {displayGroups.map(grp => {
          const standings = calculateGroupStandings(grp, teams, matches);
          const { codes, matrix } = getMatchMatrix(grp, teams, matches);

          return (
            <div
              key={grp}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
            >
              {/* Group Title Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <h3 className="font-extrabold text-sm sm:text-base tracking-wide uppercase">
                    BẢNG {grp}
                  </h3>
                </div>
                <span className="text-[11px] text-slate-300 font-medium">
                  {standings.filter(s => s.played > 0).length > 0 ? 'Đang cập nhật' : 'Chưa thi đấu'}
                </span>
              </div>

              {viewMode === 'table' ? (
                /* Regular Standings Table */
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3 text-center w-8">#</th>
                        <th className="py-2.5 px-3">Đội bóng</th>
                        <th className="py-2.5 px-2 text-center" title="Số trận đã đấu">Trận</th>
                        <th className="py-2.5 px-2 text-center" title="Thắng">T</th>
                        <th className="py-2.5 px-2 text-center" title="Hòa">H</th>
                        <th className="py-2.5 px-2 text-center" title="Thua">B</th>
                        <th className="py-2.5 px-2 text-center hidden sm:table-cell" title="Bàn thắng - Bàn thua">BT-BB</th>
                        <th className="py-2.5 px-2 text-center" title="Hiệu số">HS</th>
                        <th className="py-2.5 px-3 text-center font-extrabold text-slate-800" title="Điểm số">ĐIỂM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {standings.map((team, idx) => {
                        const qualifies = idx < 2; // Top 2 qualify
                        const isExpanded = selectedTeam === team.teamCode;

                        return (
                          <React.Fragment key={team.teamCode}>
                            <tr
                              onClick={() => setSelectedTeam(isExpanded ? null : team.teamCode)}
                              className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                                qualifies ? 'bg-emerald-50/30 font-semibold' : ''
                              }`}
                            >
                              {/* Rank */}
                              <td className="py-3 px-3 text-center">
                                <span
                                  className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-black ${
                                    idx === 0
                                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                                      : idx === 1
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {team.rank}
                                </span>
                              </td>

                              {/* Team Name */}
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="font-extrabold text-slate-900 truncate">
                                    {team.teamName}
                                  </span>
                                </div>
                              </td>

                              {/* Played */}
                              <td className="py-3 px-2 text-center text-slate-600 font-medium">
                                {team.played}
                              </td>

                              {/* W - D - L */}
                              <td className="py-3 px-2 text-center text-slate-700 font-semibold">
                                {team.won}
                              </td>
                              <td className="py-3 px-2 text-center text-slate-500">
                                {team.drawn}
                              </td>
                              <td className="py-3 px-2 text-center text-slate-400">
                                {team.lost}
                              </td>

                              {/* BT - BB */}
                              <td className="py-3 px-2 text-center text-slate-500 hidden sm:table-cell">
                                {team.gf} - {team.ga}
                              </td>

                              {/* GD (Hiệu số) */}
                              <td
                                className={`py-3 px-2 text-center font-bold ${
                                  team.gd > 0
                                    ? 'text-emerald-600'
                                    : team.gd < 0
                                    ? 'text-rose-500'
                                    : 'text-slate-400'
                                }`}
                              >
                                {team.gd > 0 ? `+${team.gd}` : team.gd}
                              </td>

                              {/* Points */}
                              <td className="py-3 px-3 text-center">
                                <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-900 text-white font-black text-sm">
                                  {team.points}
                                </span>
                              </td>
                            </tr>

                            {/* Expanded Details on tap */}
                            {isExpanded && (
                              <tr className="bg-slate-50/90 text-slate-600">
                                <td colSpan={9} className="py-2.5 px-4 text-xs">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                      <p className="font-semibold text-slate-800">
                                        Chi tiết {team.teamName}:
                                      </p>
                                      <p className="text-[11px] text-slate-500">
                                        Ghi {team.gf} bàn, thủng lưới {team.ga} bàn • Tỉ số đối đầu ưu tiên khi bằng điểm.
                                      </p>
                                    </div>
                                    {isBtcMode && (
                                      <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                                        Chế độ BTC: Kết quả tính tự động từ lịch thi đấu
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Cross Matrix (Ma trận kết quả chéo như file CSV) */
                <div className="p-3 overflow-x-auto">
                  <p className="text-[11px] text-slate-500 mb-2 font-medium">
                    Bảng ma trận tỉ số đối đầu trực tiếp giữa các cặp đấu (Hàng ngang gặp Cột dọc):
                  </p>
                  <table className="w-full text-center text-xs border border-slate-200">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold">
                        <th className="p-2 border border-slate-200 text-left">Đội bóng</th>
                        {codes.map((c) => (
                          <th key={c} className="p-2 border border-slate-200 font-extrabold text-emerald-800 text-[11px] max-w-[85px] truncate">
                            {teams[c] || c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {codes.map((rCode) => (
                        <tr key={rCode} className="hover:bg-slate-50">
                          <td className="p-2 border border-slate-200 font-bold text-left truncate max-w-[130px] bg-slate-50 text-slate-900">
                            {teams[rCode]}
                          </td>
                          {codes.map(cCode => {
                            const val = matrix[rCode]?.[cCode] || '-';
                            const isSelf = rCode === cCode;
                            return (
                              <td
                                key={cCode}
                                className={`p-2 border border-slate-200 font-bold ${
                                  isSelf
                                    ? 'bg-slate-300 text-slate-600'
                                    : val !== '-'
                                    ? 'bg-emerald-50 text-emerald-900'
                                    : 'text-slate-300'
                                }`}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
