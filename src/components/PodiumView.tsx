import React, { useState } from 'react';
import { DivisionRankings } from '../types';
import { Trophy, Medal, Award, Edit2, Check } from 'lucide-react';

interface PodiumViewProps {
  rankings: DivisionRankings;
  isBtcMode: boolean;
  onUpdateRankings: (newRankings: DivisionRankings) => void;
}

export const PodiumView: React.FC<PodiumViewProps> = ({
  rankings,
  isBtcMode,
  onUpdateRankings,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<DivisionRankings>(rankings);

  const handleSave = () => {
    onUpdateRankings(form);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-200" />
          <h3 className="font-extrabold text-sm sm:text-base tracking-wide uppercase">
            XẾP HẠNG CHUNG CUỘC
          </h3>
        </div>
        {isBtcMode && (
          <button
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setForm(rankings);
                setIsEditing(true);
              }
            }}
            className="flex items-center gap-1 text-xs font-bold bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg backdrop-blur-xs transition-all"
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5" /> Lưu hạng
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
              </>
            )}
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {isEditing ? (
          /* Edit Form in BTC Mode */
          <div className="space-y-3 bg-amber-50/50 p-3 rounded-xl border border-amber-200 text-xs">
            <div>
              <label className="font-bold text-amber-900 block mb-1">🥇 Đội Vô Địch:</label>
              <input
                type="text"
                value={form.champion}
                onChange={e => setForm({ ...form, champion: e.target.value })}
                className="w-full p-2 bg-white rounded-lg border border-slate-300 font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">🥈 Đội Hạng Nhì:</label>
              <input
                type="text"
                value={form.runnerUp}
                onChange={e => setForm({ ...form, runnerUp: e.target.value })}
                className="w-full p-2 bg-white rounded-lg border border-slate-300 font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-amber-800 block mb-1">🥉 Đội Hạng Ba (1):</label>
              <input
                type="text"
                value={form.thirdPlace1}
                onChange={e => setForm({ ...form, thirdPlace1: e.target.value })}
                className="w-full p-2 bg-white rounded-lg border border-slate-300 font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-amber-800 block mb-1">🥉 Đội Hạng Ba (2):</label>
              <input
                type="text"
                value={form.thirdPlace2 || ''}
                onChange={e => setForm({ ...form, thirdPlace2: e.target.value })}
                placeholder="Đồng hạng ba..."
                className="w-full p-2 bg-white rounded-lg border border-slate-300 font-bold"
              />
            </div>
          </div>
        ) : (
          /* Podium Visual Display */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-2">
            {/* Runner Up (2nd) */}
            <div className="order-2 sm:order-1 bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl p-4 text-center border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 mx-auto rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-black text-sm mb-2 shadow-inner">
                🥈
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                HẠNG NHÌ
              </div>
              <div className="font-black text-slate-800 text-base sm:text-lg mt-1 truncate">
                {rankings.runnerUp || 'Chưa xác định'}
              </div>
              <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                <Medal className="w-3 h-3 text-slate-400" /> Huy chương Bạc
              </div>
            </div>

            {/* Champion (1st) */}
            <div className="order-1 sm:order-2 bg-gradient-to-b from-amber-50 via-amber-100/60 to-yellow-100 rounded-2xl p-5 text-center border-2 border-amber-400 shadow-md relative sm:-translate-y-2">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-sm">
                QUÁN QUÂN
              </div>
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl mb-2 shadow-md">
                🏆
              </div>
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                ĐỘI VÔ ĐỊCH
              </div>
              <div className="font-black text-amber-950 text-lg sm:text-xl mt-1 truncate">
                {rankings.champion || 'Chưa xác định'}
              </div>
              <div className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-amber-900 bg-amber-200/90 px-3 py-1 rounded-full border border-amber-300 shadow-xs">
                <Trophy className="w-3.5 h-3.5 text-amber-700" /> Cúp Vàng & Cờ Thưởng
              </div>
            </div>

            {/* Third Place (3rd) */}
            <div className="order-3 bg-gradient-to-b from-amber-50/50 to-orange-50/50 rounded-2xl p-4 text-center border border-amber-200/80 shadow-xs relative">
              <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm mb-2 shadow-inner">
                🥉
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                ĐỒNG HẠNG BA
              </div>
              <div className="font-black text-amber-950 text-sm sm:text-base mt-1 truncate">
                {rankings.thirdPlace1 || 'Chưa xác định'}
              </div>
              {rankings.thirdPlace2 && (
                <div className="font-black text-amber-950 text-sm sm:text-base mt-0.5 truncate">
                  & {rankings.thirdPlace2}
                </div>
              )}
              <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-white px-2.5 py-0.5 rounded-full border border-amber-200">
                <Award className="w-3 h-3 text-amber-600" /> Huy chương Đồng
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
