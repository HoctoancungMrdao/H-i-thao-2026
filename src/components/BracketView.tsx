import React from 'react';
import { Match } from '../types';
import { Trophy, Award } from 'lucide-react';

interface BracketViewProps {
  matches: Match[];
  isBtcMode: boolean;
  onEditScore: (match: Match) => void;
}

export const BracketView: React.FC<BracketViewProps> = ({
  matches,
  isBtcMode,
  onEditScore,
}) => {
  const quarters = matches.filter(m => m.round === 'quarter');
  const semis = matches.filter(m => m.round === 'semi');
  const finals = matches.filter(m => m.round === 'final');

  const renderBracketMatch = (m: Match) => {
    const isFinished = m.status === 'finished' && m.homeScore !== null && m.awayScore !== null;
    const homeWon = isFinished && (
      (m.homeScore! > m.awayScore!) ||
      (m.homeScore! === m.awayScore! && m.hasPenalty && (m.homePen ?? 0) > (m.awayPen ?? 0)) ||
      (m.winnerTeam === m.homeTeam)
    );
    const awayWon = isFinished && (
      (m.awayScore! > m.homeScore!) ||
      (m.awayScore! === m.homeScore! && m.hasPenalty && (m.awayPen ?? 0) > (m.homePen ?? 0)) ||
      (m.winnerTeam === m.awayTeam)
    );

    return (
      <div
        key={m.id}
        onClick={() => {
          if (isBtcMode) onEditScore(m);
        }}
        className={`bg-white rounded-xl border p-2.5 shadow-xs transition-all ${
          isBtcMode ? 'cursor-pointer hover:border-amber-400 hover:shadow-md' : ''
        } ${isFinished ? 'border-slate-200' : 'border-slate-300/80 bg-slate-50/50'}`}
      >
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 pb-1 border-b border-slate-100">
          <span className="font-bold text-slate-700">{m.roundName}</span>
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
            {m.pairCode || `Trận #${m.matchNumber}`}
          </span>
        </div>

        {/* Home Team */}
        <div className={`flex items-center justify-between py-1 text-xs ${homeWon ? 'font-extrabold text-emerald-800' : 'text-slate-700'}`}>
          <div className="flex items-center gap-1 min-w-0 pr-2">
            {homeWon && <Award className="w-3 h-3 text-amber-500 flex-shrink-0" />}
            <span className="truncate">{m.homeTeam}</span>
          </div>
          <div className="flex items-center gap-1 font-black flex-shrink-0">
            {isFinished ? (
              <span className={`px-1.5 py-0.5 rounded ${homeWon ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {m.homeScore}
                {m.hasPenalty && m.homePen !== undefined && (
                  <span className="text-[9px] font-normal opacity-90">({m.homePen})</span>
                )}
              </span>
            ) : (
              <span className="text-slate-300">-</span>
            )}
          </div>
        </div>

        {/* Away Team */}
        <div className={`flex items-center justify-between py-1 text-xs border-t border-slate-100 ${awayWon ? 'font-extrabold text-emerald-800' : 'text-slate-700'}`}>
          <div className="flex items-center gap-1 min-w-0 pr-2">
            {awayWon && <Award className="w-3 h-3 text-amber-500 flex-shrink-0" />}
            <span className="truncate">{m.awayTeam}</span>
          </div>
          <div className="flex items-center gap-1 font-black flex-shrink-0">
            {isFinished ? (
              <span className={`px-1.5 py-0.5 rounded ${awayWon ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {m.awayScore}
                {m.hasPenalty && m.awayPen !== undefined && (
                  <span className="text-[9px] font-normal opacity-90">({m.awayPen})</span>
                )}
              </span>
            ) : (
              <span className="text-slate-300">-</span>
            )}
          </div>
        </div>

        {isBtcMode && (
          <div className="mt-1.5 pt-1 text-center border-t border-dashed border-slate-200">
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              ✏️ Bấm để nhập tỉ số
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-3.5 text-white shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-300" /> Sơ đồ Nhánh Đấu Trực Tiếp
          </h3>
          <p className="text-xs text-emerald-100 mt-0.5">
            Vòng đấu loại knock-out hướng tới ngôi vô địch
          </p>
        </div>
        <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-xs">
          Knockout
        </span>
      </div>

      {/* Responsive Horizontal Scroll Bracket Container */}
      <div className="bg-slate-100/90 rounded-2xl p-3 sm:p-4 border border-slate-200 overflow-x-auto">
        <div className="min-w-[680px] grid grid-cols-3 gap-6 items-center">
          {/* Column 1: Tứ kết (hoặc Bán kết nếu không có tứ kết) */}
          <div className="space-y-4">
            <div className="text-center font-extrabold text-xs text-slate-600 uppercase tracking-wider pb-1 border-b border-slate-300">
              {quarters.length > 0 ? 'VÒNG TỨ KẾT' : 'VÒNG BÁN KẾT'}
            </div>
            {quarters.length > 0 ? (
              <div className="space-y-3">
                {quarters.map(m => renderBracketMatch(m))}
              </div>
            ) : (
              <div className="space-y-3">
                {semis.map(m => renderBracketMatch(m))}
              </div>
            )}
          </div>

          {/* Column 2: Bán kết (hoặc Chung kết) */}
          <div className="space-y-4">
            <div className="text-center font-extrabold text-xs text-slate-600 uppercase tracking-wider pb-1 border-b border-slate-300">
              {quarters.length > 0 ? 'VÒNG BÁN KẾT' : 'TRẬN CHUNG KẾT'}
            </div>
            {quarters.length > 0 ? (
              <div className="space-y-8 my-auto">
                {semis.map(m => renderBracketMatch(m))}
              </div>
            ) : (
              <div className="space-y-3 my-auto">
                {finals.map(m => renderBracketMatch(m))}
              </div>
            )}
          </div>

          {/* Column 3: Chung kết & Cup */}
          <div className="space-y-4">
            <div className="text-center font-extrabold text-xs text-amber-800 uppercase tracking-wider pb-1 border-b border-amber-300 flex items-center justify-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> TRẬN CHUNG KẾT
            </div>
            <div className="my-auto space-y-3">
              {finals.map(m => renderBracketMatch(m))}
              
              {/* Champion Trophy card */}
              {finals.some(f => f.status === 'finished' && f.winnerTeam) && (
                <div className="bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-500 rounded-xl p-3 text-center text-slate-950 font-black shadow-md border border-amber-400 animate-in fade-in">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-[10px] tracking-wider uppercase font-extrabold text-amber-950">
                    ĐỘI VÔ ĐỊCH
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                    {finals.find(f => f.status === 'finished')?.winnerTeam}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
