import React from 'react';
import { Match } from '../types';
import { Clock, MapPin, Edit3, Award } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  isBtcMode: boolean;
  onEditScore: (match: Match) => void;
  onEditDetails?: (match: Match) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  isBtcMode,
  onEditScore,
  onEditDetails,
}) => {
  const isFinished = match.status === 'finished' && match.homeScore !== null && match.awayScore !== null;
  const isLive = match.status === 'live';

  const homeWon = isFinished && (
    (match.homeScore! > match.awayScore!) ||
    (match.homeScore! === match.awayScore! && match.hasPenalty && (match.homePen ?? 0) > (match.awayPen ?? 0)) ||
    (match.winnerTeam === match.homeTeam)
  );

  const awayWon = isFinished && (
    (match.awayScore! > match.homeScore!) ||
    (match.awayScore! === match.homeScore! && match.hasPenalty && (match.awayPen ?? 0) > (match.homePen ?? 0)) ||
    (match.winnerTeam === match.awayTeam)
  );

  return (
    <div
      onClick={() => {
        if (isBtcMode) {
          onEditScore(match);
        }
      }}
      className={`bg-white rounded-2xl border transition-all duration-150 overflow-hidden shadow-xs ${
        isBtcMode ? 'cursor-pointer hover:border-amber-400 hover:shadow-md' : ''
      } ${
        isLive
          ? 'border-red-400 ring-2 ring-red-400/20'
          : isFinished
          ? 'border-slate-200/90'
          : 'border-slate-200/80 bg-slate-50/40'
      }`}
    >
      {/* Top Header Bar */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="font-extrabold text-slate-800 bg-slate-200/80 px-2 py-0.5 rounded-md text-[11px]">
            {match.roundName}
          </span>
          {match.pairCode && (
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {match.pairCode}
            </span>
          )}
          <span className="text-slate-400 text-[10px] hidden sm:inline">Trận #{match.matchNumber}</span>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isLive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              ĐANG ĐÁ
            </span>
          ) : isFinished ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200/90 text-slate-700">
              Đã kết thúc
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100/70 text-emerald-800">
              Sắp đấu
            </span>
          )}
        </div>
      </div>

      {/* Main Match Face-off */}
      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
          {/* Home Team */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left min-w-0">
            <div className="flex items-center gap-1.5 w-full justify-center sm:justify-start">
              {homeWon && <Award className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
              <span
                className={`text-sm sm:text-base font-bold leading-tight truncate ${
                  homeWon
                    ? 'text-emerald-700 font-extrabold'
                    : isFinished && !homeWon
                    ? 'text-slate-500'
                    : 'text-slate-900'
                }`}
                title={match.homeTeam}
              >
                {match.homeTeam}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">Đội nhà</span>
          </div>

          {/* Central Score or Time */}
          <div className="flex flex-col items-center justify-center px-2 flex-shrink-0">
            {isFinished ? (
              <div className="flex flex-col items-center">
                <div className="bg-slate-900 text-white font-black text-xl sm:text-2xl px-3.5 py-1 rounded-xl shadow-sm tracking-wider flex items-center gap-1.5">
                  <span className={homeWon ? 'text-amber-400' : 'text-white'}>{match.homeScore}</span>
                  <span className="text-slate-400 text-base font-normal">-</span>
                  <span className={awayWon ? 'text-amber-400' : 'text-white'}>{match.awayScore}</span>
                </div>
                {/* Penalty Shootout score if applicable */}
                {match.hasPenalty && match.homePen !== undefined && match.awayPen !== undefined && (
                  <span className="text-[10px] sm:text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1 border border-amber-200">
                    Pen: {match.homePen} - {match.awayPen}
                  </span>
                )}
              </div>
            ) : isLive ? (
              <div className="flex flex-col items-center">
                <div className="bg-red-600 text-white font-black text-xl sm:text-2xl px-3.5 py-1 rounded-xl shadow-sm tracking-wider flex items-center gap-1.5">
                  <span>{match.homeScore ?? 0}</span>
                  <span className="text-red-200 text-base font-normal">-</span>
                  <span>{match.awayScore ?? 0}</span>
                </div>
              </div>
            ) : (
              <div className="w-16 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center font-bold text-slate-400 text-sm">
                VS
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center sm:items-end text-center sm:text-right min-w-0">
            <div className="flex items-center gap-1.5 w-full justify-center sm:justify-end">
              <span
                className={`text-sm sm:text-base font-bold leading-tight truncate ${
                  awayWon
                    ? 'text-emerald-700 font-extrabold'
                    : isFinished && !awayWon
                    ? 'text-slate-500'
                    : 'text-slate-900'
                }`}
                title={match.awayTeam}
              >
                {match.awayTeam}
              </span>
              {awayWon && <Award className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">Đội khách</span>
          </div>
        </div>

        {/* Note if any (e.g. Penalty winner note) */}
        {match.note && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 text-center text-xs font-semibold text-emerald-800 bg-emerald-50/70 py-1 px-2 rounded-lg">
            {match.note}
          </div>
        )}
      </div>

      {/* Footer Info & BTC Actions */}
      <div className="px-3 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2 truncate">
          {/* Time Badge - Tap to edit time in BTC Mode or info in Viewer Mode */}
          {isBtcMode ? (
            <button
              type="button"
              onClick={(e) => {
                if (onEditDetails) {
                  e.stopPropagation();
                  onEditDetails(match);
                }
              }}
              className="flex items-center gap-1.5 font-bold px-2 py-1 rounded-lg bg-white border border-amber-300 hover:border-amber-400 hover:bg-amber-50/70 text-slate-800 hover:text-amber-900 transition-all text-left shadow-2xs group active:scale-95 cursor-pointer"
              title="Chạm vào đây để tự tay chỉnh sửa thời gian trận đấu này"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">{match.time || 'Chưa xếp giờ'}</span>
              <span className="text-[10px] text-amber-700 bg-amber-100 px-1 py-0.2 rounded font-extrabold">
                Sửa giờ
              </span>
            </button>
          ) : (
            <div
              className="flex items-center gap-1.5 font-semibold px-2 py-1 rounded-lg bg-white border border-slate-200/90 text-slate-700 shadow-2xs"
              title="Thời gian thi đấu"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{match.time || 'Chưa xếp giờ'}</span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1 text-slate-500 truncate text-[11px]">
            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{match.pitch}</span>
          </div>
        </div>

        {/* Action button in BTC Mode vs View Status in Viewer Mode */}
        {isBtcMode ? (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditScore(match);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 active:scale-95 transition-all text-xs shadow-xs cursor-pointer"
              title="Nhập tỉ số trận đấu"
            >
              <Edit3 className="w-3 h-3" />
              <span>Nhập tỉ số</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {isFinished ? (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
                Đã kết thúc
              </span>
            ) : isLive ? (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 animate-pulse">
                Đang đá
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-500 bg-slate-100">
                Chưa diễn ra
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
