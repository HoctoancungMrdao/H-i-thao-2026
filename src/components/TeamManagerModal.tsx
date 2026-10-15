import React, { useState } from 'react';
import { X, Check, RefreshCw } from 'lucide-react';

interface TeamManagerModalProps {
  divisionName: string;
  teams: { [code: string]: string };
  isOpen: boolean;
  onClose: () => void;
  onSaveTeams: (updatedTeams: { [code: string]: string }) => void;
}

export const TeamManagerModal: React.FC<TeamManagerModalProps> = ({
  divisionName,
  teams,
  isOpen,
  onClose,
  onSaveTeams,
}) => {
  if (!isOpen) return null;

  const [teamList, setTeamList] = useState<{ [code: string]: string }>({ ...teams });

  const handleUpdate = (code: string, newName: string) => {
    setTeamList(prev => ({
      ...prev,
      [code]: newName,
    }));
  };

  const handleSave = () => {
    onSaveTeams(teamList);
    onClose();
  };

  const teamCodes = Object.keys(teamList).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="font-black text-base sm:text-lg">
              Đổi Tên Đội Bóng ({divisionName})
            </h3>
            <p className="text-xs text-amber-100">
              Cập nhật tên các lớp / chi đội (ví dụ: Đội A1 thành 12A1, 10B2...)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-2.5 max-h-[60vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {teamCodes.map(code => (
              <div key={code} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="w-9 h-9 rounded-lg bg-emerald-700 text-white font-extrabold flex items-center justify-center text-xs flex-shrink-0">
                  {code}
                </span>
                <input
                  type="text"
                  value={teamList[code] || ''}
                  onChange={e => handleUpdate(code, e.target.value)}
                  placeholder={`Tên cho mã ${code}`}
                  className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>Lưu tên đội</span>
          </button>
        </div>
      </div>
    </div>
  );
};
