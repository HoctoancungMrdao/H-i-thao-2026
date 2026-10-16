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
                className={`flex flex-col items-center justify-center py-2.5 px-1 sm:py-3 sm:px-2 rounded-xl transition-all relative text-center select-none ${
                  isActive
                    ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-700/25 scale-[1.02]'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold border border-slate-200/90'
                }`}
              >
                <div className="flex items-center gap-1 text-xs sm:text-base">
                  <span className="text-base sm:text-lg leading-none">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </div>
                {count && (
                  <span
                    className={`text-[11px] sm:text-xs mt-0.5 font-bold leading-none ${
                      isActive ? 'text-emerald-100' : 'text-slate-500'
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
