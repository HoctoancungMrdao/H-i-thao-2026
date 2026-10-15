import React from 'react';
import { DivisionId, DivisionInfo } from '../types';

interface DivisionTabsProps {
  currentDivisionId: DivisionId;
  divisions: Record<DivisionId, DivisionInfo>;
  onSelectDivision: (id: DivisionId) => void;
  matchesCount: Record<DivisionId, { total: number; finished: number }>;
}

export const DivisionTabs: React.FC<DivisionTabsProps> = ({
  currentDivisionId,
  divisions,
  onSelectDivision,
  matchesCount,
}) => {
  const tabs: { id: DivisionId; label: string; icon: string; highlight?: string }[] = [
    { id: 'nam', label: 'BĐ Nam', icon: '⚽' },
    { id: 'nu', label: 'BĐ Nữ', icon: '🚺' },
    { id: 'khoi89', label: 'BĐ Khối 8-9', icon: '⚡' },
    { id: 'khoi67', label: 'BĐ Khối 6-7', icon: '🌟' },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-[57px] sm:top-[61px] z-30 shadow-xs">
      <div className="max-w-4xl mx-auto px-2 py-1.5 sm:px-4">
        <div className="grid grid-cols-4 gap-1 sm:gap-2">
          {tabs.map(tab => {
            const isActive = currentDivisionId === tab.id;
            const count = matchesCount[tab.id];

            return (
              <button
                key={tab.id}
                onClick={() => onSelectDivision(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all relative text-center select-none ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-700/20 scale-[1.02]'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 font-semibold border border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-1 text-xs sm:text-sm">
                  <span className="text-sm sm:text-base leading-none">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </div>
                {count && (
                  <span
                    className={`text-[10px] mt-0.5 font-medium leading-none ${
                      isActive ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {count.finished}/{count.total} trận
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
