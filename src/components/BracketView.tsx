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

  const hasQuarters = quarters.length > 0;

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
        className={`bg-white rounded-2xl border p-3.5 sm:p-4 shadow-xs transition-all ${
          isBtcMode ? 'cursor-pointer hover:border-amber-400 hover:shadow-md ring-1 hover:ring-amber-300' : ''
        } ${isFinished ? 'border-slate-200' : 'border-slate-300/80 bg-slate-50/50'}`}
      >
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2 pb-1.5 border-b border-slate-100">
          <span className="font-extrabold text-slate-800">{m.roundName}</span>
          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs">
            {m.pairCode || `Trận #${m.matchNumber}`}
          </span>
        </div>

        {/* Home Team */}
        <div className={`flex items-center justify-between py-1.5 text-sm sm:text-base ${homeWon ? 'font-black text-emerald-800' : 'font-extrabold text-slate-800'}`}>
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            {homeWon && <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />}
            <span className="truncate">{m.homeTeam}</span>
          </div>
          <div className="flex items-center gap-1 font-black flex-shrink-0">
            {isFinished ? (
              <span className={`px-2 py-0.5 rounded-lg text-sm sm:text-base ${homeWon ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {m.homeScore}
                {m.hasPenalty && m.homePen !== undefined && (
                  <span className="text-xs font-normal opacity-90 ml-0.5">({m.homePen})</span>
                )}
              </span>
            ) : (
              <span className="text-slate-300 font-bold">-</span>
            )}
          </div>
        </div>

        {/* Away Team */}
        <div className={`flex items-center justify-between py-1.5 text-sm sm:text-base border-t border-slate-100 ${awayWon ? 'font-black text-emerald-800' : 'font-extrabold text-slate-800'}`}>
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            {awayWon && <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />}
            <span className="truncate">{m.awayTeam}</span>
          </div>
          <div className="flex items-center gap-1 font-black flex-shrink-0">
            {isFinished ? (
              <span className={`px-2 py-0.5 rounded-lg text-sm sm:text-base ${awayWon ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {m.awayScore}
                {m.hasPenalty && m.awayPen !== undefined && (
                  <span className="text-xs font-normal opacity-90 ml-0.5">({m.awayPen})</span>
                )}
              </span>
            ) : (
              <span className="text-slate-300 font-bold">-</span>
            )}
          </div>
        </div>

        {isBtcMode && (
          <div className="mt-2 pt-1.5 text-center border-t border-dashed border-slate-200">
            <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
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
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-4 text-white shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-300" /> Sơ đồ Nhánh Đấu Trực Tiếp
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
            Vòng đấu loại knock-out hướng tới ngôi vô địch
          </p>
        </div>
        <span className="text-xs sm:text-sm font-extrabold bg-white/20 px-3 py-1 rounded-xl backdrop-blur-xs">
          Knockout
        </span>
      </div>

      {/* Responsive Horizontal Scroll Bracket Container */}
      <div className="bg-slate-100/90 rounded-2xl p-3 sm:p-5 border border-slate-200 overflow-x-auto">
        {hasQuarters ? (
          /* 3-Column Layout: Tứ kết -> Bán kết -> Chung kết (BĐ Nam) */
          <div className="min-w-[720px] grid grid-cols-3 gap-6 items-center">
            {/* Column 1: Tứ kết */}
            <div className="space-y-4">
              <div className="text-center font-black text-xs sm:text-sm text-slate-700 uppercase tracking-wider pb-1.5 border-b border-slate-300">
                VÒNG TỨ KẾT
              </div>
              <div className="space-y-3">
                {quarters.map(m => renderBracketMatch(m))}
              </div>
            </div>

            {/* Column 2: Bán kết */}
            <div className="space-y-4">
              <div className="text-center font-black text-xs sm:text-sm text-slate-700 uppercase tracking-wider pb-1.5 border-b border-slate-300">
                VÒNG BÁN KẾT
              </div>
              <div className="space-y-8 my-auto">
                {semis.map(m => renderBracketMatch(m))}
              </div>
            </div>

            {/* Column 3: Chung kết & Cup */}
            <div className="space-y-4">
              <div className="text-center font-black text-xs sm:text-sm text-amber-800 uppercase tracking-wider pb-1.5 border-b border-amber-300 flex items-center justify-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" /> TRẬN CHUNG KẾT
              </div>
              <div className="my-auto space-y-3">
                {finals.map(m => renderBracketMatch(m))}

                {/* Champion Trophy card */}
                {finals.some(f => f.status === 'finished' && f.winnerTeam) && (
                  <div className="bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-500 rounded-2xl p-4 text-center text-slate-950 font-black shadow-md border border-amber-400 animate-in fade-in">
                    <div className="text-3xl mb-1">🏆</div>
                    <div className="text-xs tracking-wider uppercase font-black text-amber-950">
                      ĐỘI VÔ ĐỊCH
                    </div>
                    <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                      {finals.find(f => f.status === 'finished')?.winnerTeam}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* 2-Column Layout: Bán kết -> Chung kết (BĐ Nữ, Khối 8-9, Khối 6-7) - NO DUPLICATE FINAL COLUMN */
          <div className="min-w-[520px] max-w-2xl mx-auto grid grid-cols-2 gap-6 items-center">
            {/* Column 1: Bán kết */}
            <div className="space-y-4">
              <div className="text-center font-black text-xs sm:text-sm text-slate-700 uppercase tracking-wider pb-1.5 border-b border-slate-300">
                VÒNG BÁN KẾT
              </div>
              <div className="space-y-4">
                {semis.map(m => renderBracketMatch(m))}
              </div>
            </div>

            {/* Column 2: Chung kết Duy Nhất */}
            <div className="space-y-4">
              <div className="text-center font-black text-xs sm:text-sm text-amber-800 uppercase tracking-wider pb-1.5 border-b border-amber-300 flex items-center justify-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" /> TRẬN CHUNG KẾT
              </div>
              <div className="my-auto space-y-4">
                {finals.map(m => renderBracketMatch(m))}

                {/* Champion Trophy card */}
                {finals.some(f => f.status === 'finished' && f.winnerTeam) && (
                  <div className="bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-500 rounded-2xl p-4 text-center text-slate-950 font-black shadow-md border border-amber-400 animate-in fade-in">
                    <div className="text-3xl mb-1">🏆</div>
                    <div className="text-xs tracking-wider uppercase font-black text-amber-950">
                      ĐỘI VÔ ĐỊCH
                    </div>
                    <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                      {finals.find(f => f.status === 'finished')?.winnerTeam}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
