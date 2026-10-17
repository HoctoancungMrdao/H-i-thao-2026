import React, { useState, useMemo } from 'react';
import { User } from 'firebase/auth';
import { DivisionId, Match, TournamentStore, MatchStatus, MatchRound } from '../types';
import {
  Trophy,
  Users,
  Settings,
  Clock,
  Save,
  CheckCircle2,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface AdminViewProps {
  store: TournamentStore;
  currentDivisionId: DivisionId;
  currentUser: User | null;
  onSelectDivision: (id: DivisionId) => void;
  onSaveStore: (updatedStore: TournamentStore) => Promise<void> | void;
  onResetData: () => void;
  onExitAdmin: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  store,
  currentDivisionId,
  currentUser,
  onSelectDivision,
  onSaveStore,
  onResetData,
  onExitAdmin,
}) => {
  const [adminTab, setAdminTab] = useState<'info' | 'teams' | 'scores' | 'schedule'>('scores');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // Local copy of tournament store to edit in form
  const [localStore, setLocalStore] = useState<TournamentStore>(store);

  // Sync localStore when remote store changes from outside
  React.useEffect(() => {
    setLocalStore(store);
  }, [store]);

  const currentDiv = localStore.divisions[currentDivisionId];

  // Quick pitches available
  const availablePitches = [
    'Sân cỏ nhân tạo Thanh Nghĩa (Sân 1)',
    'Sân cỏ nhân tạo Thanh Nghĩa (Sân 2)',
    'Sân cỏ nhân tạo Thanh Nghĩa (Sân 3)',
    'Sân cỏ nhân tạo Thanh Nghĩa (Sân 4)',
    'Sân cỏ nhân tạo Khánh Ngọc (Sân 1)',
    'Sân cỏ nhân tạo Khánh Ngọc (Sân 2)',
    'Sân cỏ nhân tạo Mũi Tàu (Sân 1)',
    'Sân cỏ nhân tạo Mũi Tàu (Sân 2)',
  ];

  // Helper to trigger save to Firebase
  const handlePersist = async (storeToSave: TournamentStore, successMsg = 'Đã lưu thay đổi lên Firebase thành công!') => {
    setIsSaving(true);
    setSaveErrorMessage(null);
    setSaveSuccessMessage(null);
    try {
      await onSaveStore(storeToSave);
      setSaveSuccessMessage(successMsg);
      setTimeout(() => {
        setSaveSuccessMessage(null);
      }, 4000);
    } catch (err: any) {
      setSaveErrorMessage(err?.message || 'Lỗi khi lưu lên Firebase. Vui lòng kiểm tra kết nối mạng!');
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // TAB 1: TOURNAMENT & DIVISION INFO HANDLERS
  // ==========================================
  const handleUpdateGeneralInfo = (field: 'title' | 'subtitle', val: string) => {
    setLocalStore(prev => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleUpdateDivisionInfo = (field: string, val: string) => {
    setLocalStore(prev => ({
      ...prev,
      divisions: {
        ...prev.divisions,
        [currentDivisionId]: {
          ...prev.divisions[currentDivisionId],
          division: {
            ...prev.divisions[currentDivisionId].division,
            [field]: val,
          },
        },
      },
    }));
  };

  // ==========================================
  // TAB 2: TEAMS MANAGEMENT HANDLERS
  // ==========================================
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [newTeamGroup, setNewTeamGroup] = useState<'A' | 'B' | 'C' | 'D'>('A');

  const handleUpdateTeamName = (code: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const oldName = currentDiv.teams[code];

    // Update team dictionary
    const updatedTeams = {
      ...currentDiv.teams,
      [code]: trimmed,
    };

    // Automatically update match home/away teams where this team was assigned
    const updatedMatches = currentDiv.matches.map(m => {
      let home = m.homeTeam;
      let away = m.awayTeam;

      if (home === oldName || (m.pairCode && m.pairCode.split('-')[0] === code)) {
        home = trimmed;
      }
      if (away === oldName || (m.pairCode && m.pairCode.split('-')[1] === code)) {
        away = trimmed;
      }

      return {
        ...m,
        homeTeam: home,
        awayTeam: away,
      };
    });

    const updated = {
      ...localStore,
      divisions: {
        ...localStore.divisions,
        [currentDivisionId]: {
          ...currentDiv,
          teams: updatedTeams,
          matches: updatedMatches,
        },
      },
    };

    setLocalStore(updated);
  };

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;

    // Determine new code like A6 or B4
    const existingInGroup = Object.keys(currentDiv.teams).filter(c => c.startsWith(newTeamGroup));
    const nextNum = existingInGroup.length + 1;
    const newCode = `${newTeamGroup}${nextNum}`;

    const updatedTeams = {
      ...currentDiv.teams,
      [newCode]: newTeamName.trim(),
    };

    const updated = {
      ...localStore,
      divisions: {
        ...localStore.divisions,
        [currentDivisionId]: {
          ...currentDiv,
          teams: updatedTeams,
        },
      },
    };

    setLocalStore(updated);
    setNewTeamName('');
    handlePersist(updated, `Đã thêm đội ${newTeamName.trim()} (${newCode}) và lưu lên Firebase!`);
  };

  // ==========================================
  // TAB 3: SCORES UPDATE HANDLERS
  // ==========================================
  const [searchMatchQuery, setSearchMatchQuery] = useState('');
  const [roundFilter, setRoundFilter] = useState<'all' | MatchRound>('all');

  const handleUpdateMatchScore = (
    matchId: string,
    updates: {
      homeScore: number | null;
      awayScore: number | null;
      status: MatchStatus;
      hasPenalty?: boolean;
      homePen?: number | null;
      awayPen?: number | null;
    }
  ) => {
    const updatedMatches = currentDiv.matches.map(m => {
      if (m.id !== matchId) return m;

      let winner: string | undefined = undefined;
      const hs = updates.homeScore;
      const as = updates.awayScore;

      if (updates.status === 'finished' && hs !== null && as !== null) {
        if (hs > as) {
          winner = m.homeTeam;
        } else if (as > hs) {
          winner = m.awayTeam;
        } else if (updates.hasPenalty && updates.homePen != null && updates.awayPen != null) {
          winner = updates.homePen > updates.awayPen ? m.homeTeam : m.awayTeam;
        }
      }

      return {
        ...m,
        ...updates,
        winnerTeam: winner,
      };
    });

    const updated = {
      ...localStore,
      divisions: {
        ...localStore.divisions,
        [currentDivisionId]: {
          ...currentDiv,
          matches: updatedMatches,
        },
      },
    };

    setLocalStore(updated);
  };

  // Filtered matches for Tab 3 & 4
  const filteredMatches = useMemo(() => {
    return currentDiv.matches
      .filter(m => {
        if (roundFilter !== 'all' && m.round !== roundFilter) return false;
        if (searchMatchQuery.trim()) {
          const q = searchMatchQuery.toLowerCase().trim();
          const matchText = `${m.matchNumber} ${m.roundName} ${m.homeTeam} ${m.awayTeam} ${m.pairCode || ''}`.toLowerCase();
          if (!matchText.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => a.matchNumber - b.matchNumber);
  }, [currentDiv.matches, roundFilter, searchMatchQuery]);

  return (
    <div className="space-y-4">
      {/* Top Admin Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-xl border border-indigo-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                ADMIN TRỰC TIẾP
              </span>
              <span className="text-xs text-indigo-200 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Firebase Firestore Connected
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-amber-400" />
              Bảng Quản Trị Giải Đấu
            </h2>
            <p className="text-xs text-slate-300">
              Chỉnh sửa trực tiếp tên giải, danh sách đội, tỷ số và lưu thẳng vào Firebase không cần chạm vào mã nguồn.
            </p>
            {currentUser && (
              <p className="text-[11px] text-amber-300 font-semibold pt-0.5">
                👤 Đang đăng nhập: {currentUser.email}
              </p>
            )}
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => handlePersist(localStore)}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang lưu Firebase...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu Thay Đổi (Firebase)</span>
                </>
              )}
            </button>

            <button
              onClick={onExitAdmin}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 border border-white/15"
            >
              <ExternalLink className="w-4 h-4 text-emerald-300" />
              <span>Xem Giao Diện Khán Giả</span>
            </button>
          </div>
        </div>

        {/* Success or Error Banners */}
        {saveSuccessMessage && (
          <div className="mt-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl p-2.5 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {saveErrorMessage && (
          <div className="mt-3 bg-rose-500/20 border border-rose-400/40 rounded-xl p-2.5 text-xs text-rose-200 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            <span>{saveErrorMessage}</span>
          </div>
        )}
      </div>

      {/* Division Picker Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/90 shadow-xs flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
        <span className="text-xs font-black text-slate-500 pl-2 pr-1 shrink-0">Chọn Môn:</span>
        {(['nam', 'nu', 'khoi89', 'khoi67'] as DivisionId[]).map(id => {
          const divInfo = localStore.divisions[id].division;
          const isActive = currentDivisionId === id;
          return (
            <button
              key={id}
              onClick={() => onSelectDivision(id)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs font-black scale-102'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{divInfo.badge}</span>
              <span>{divInfo.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* Admin Feature Tabs */}
      <div className="bg-slate-100 p-1 rounded-2xl grid grid-cols-4 gap-1 text-xs font-bold">
        <button
          onClick={() => setAdminTab('scores')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
            adminTab === 'scores' ? 'bg-white text-emerald-800 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-emerald-600" />
          <span className="truncate">Cập Nhật Tỷ Số</span>
        </button>

        <button
          onClick={() => setAdminTab('teams')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
            adminTab === 'teams' ? 'bg-white text-emerald-800 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-600" />
          <span className="truncate">Danh Sách Đội</span>
        </button>

        <button
          onClick={() => setAdminTab('schedule')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
            adminTab === 'schedule' ? 'bg-white text-emerald-800 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="truncate">Sửa Giờ & Sân</span>
        </button>

        <button
          onClick={() => setAdminTab('info')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
            adminTab === 'info' ? 'bg-white text-emerald-800 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4 text-amber-600" />
          <span className="truncate">Tên Giải & Môn</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: CẬP NHẬT TỶ SỐ TRỰC TIẾP                      */}
      {/* ======================================================== */}
      {adminTab === 'scores' && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-600" />
                Cập Nhật Tỷ Số Trận Đấu ({currentDiv.division.name})
              </h3>
              <p className="text-xs text-slate-500">
                Nhập số bàn thắng, chọn trạng thái và bấm &quot;Lưu Thay Đổi (Firebase)&quot; để công bố ngay lập tức.
              </p>
            </div>

            <button
              onClick={() => handlePersist(localStore, 'Đã lưu toàn bộ tỷ số lên Firebase!')}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Toàn Bộ Tỷ Số</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchMatchQuery}
                onChange={e => setSearchMatchQuery(e.target.value)}
                placeholder="Tìm trận đấu theo số trận, tên lớp..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Round filter */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs shrink-0">
              {(['all', 'group', 'quarter', 'semi', 'final'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRoundFilter(r)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    roundFilter === r ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r === 'all' ? 'Tất cả' : r === 'group' ? 'Vòng bảng' : r === 'quarter' ? 'Tứ kết' : r === 'semi' ? 'Bán kết' : 'Chung kết'}
                </button>
              ))}
            </div>
          </div>

          {/* Matches List with direct inputs */}
          <div className="space-y-3">
            {filteredMatches.map(m => {
              const isFinished = m.status === 'finished';
              const isLive = m.status === 'live';

              return (
                <div
                  key={m.id}
                  className={`p-3 sm:p-4 rounded-2xl border transition-all ${
                    isFinished ? 'bg-emerald-50/20 border-emerald-200/80' : isLive ? 'bg-rose-50/30 border-rose-300' : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200/60 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded text-[11px]">
                        Trận {m.matchNumber}
                      </span>
                      <span className="font-extrabold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded text-[11px]">
                        {m.roundName}
                      </span>
                      {m.pairCode && (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {m.pairCode}
                        </span>
                      )}
                      <span className="text-slate-400 text-[10px] hidden sm:inline">
                        • {m.time} • {m.pitch}
                      </span>
                    </div>

                    {/* Status Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <select
                        value={m.status}
                        onChange={e => {
                          const newStatus = e.target.value as MatchStatus;
                          handleUpdateMatchScore(m.id, {
                            homeScore: newStatus === 'scheduled' ? null : (m.homeScore ?? 0),
                            awayScore: newStatus === 'scheduled' ? null : (m.awayScore ?? 0),
                            status: newStatus,
                            hasPenalty: m.hasPenalty,
                            homePen: m.homePen,
                            awayPen: m.awayPen,
                          });
                        }}
                        className={`text-xs font-black rounded-lg px-2 py-1 border cursor-pointer focus:outline-none ${
                          m.status === 'finished'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : m.status === 'live'
                            ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        <option value="scheduled">Chưa đấu</option>
                        <option value="live">Đang diễn ra (Live)</option>
                        <option value="finished">Đã kết thúc</option>
                      </select>
                    </div>
                  </div>

                  {/* Main Score Editor Row */}
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 py-1">
                    {/* Home Team */}
                    <div className="flex items-center justify-end gap-2 text-right">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                        {m.homeTeam}
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={m.homeScore === null ? '' : m.homeScore}
                        placeholder="-"
                        onChange={e => {
                          const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                          handleUpdateMatchScore(m.id, {
                            homeScore: val,
                            awayScore: m.awayScore ?? (val !== null ? 0 : null),
                            status: val !== null ? (m.status === 'scheduled' ? 'finished' : m.status) : 'scheduled',
                            hasPenalty: m.hasPenalty,
                            homePen: m.homePen,
                            awayPen: m.awayPen,
                          });
                        }}
                        className="w-12 sm:w-14 h-10 text-center font-black text-base sm:text-lg bg-white border-2 border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none shadow-xs"
                      />
                    </div>

                    <span className="text-slate-400 font-black text-xs sm:text-sm">VS</span>

                    {/* Away Team */}
                    <div className="flex items-center justify-start gap-2 text-left">
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={m.awayScore === null ? '' : m.awayScore}
                        placeholder="-"
                        onChange={e => {
                          const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                          handleUpdateMatchScore(m.id, {
                            homeScore: m.homeScore ?? (val !== null ? 0 : null),
                            awayScore: val,
                            status: val !== null ? (m.status === 'scheduled' ? 'finished' : m.status) : 'scheduled',
                            hasPenalty: m.hasPenalty,
                            homePen: m.homePen,
                            awayPen: m.awayPen,
                          });
                        }}
                        className="w-12 sm:w-14 h-10 text-center font-black text-base sm:text-lg bg-white border-2 border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none shadow-xs"
                      />
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                        {m.awayTeam}
                      </span>
                    </div>
                  </div>

                  {/* Penalty toggle for knockout matches or tied matches */}
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <label className="flex items-center gap-1.5 font-bold text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!m.hasPenalty}
                        onChange={e => {
                          const checked = e.target.checked;
                          handleUpdateMatchScore(m.id, {
                            homeScore: m.homeScore,
                            awayScore: m.awayScore,
                            status: m.status,
                            hasPenalty: checked,
                            homePen: checked ? (m.homePen ?? 0) : undefined,
                            awayPen: checked ? (m.awayPen ?? 0) : undefined,
                          });
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Đá Luân Lưu (Penalty)</span>
                    </label>

                    {m.hasPenalty && (
                      <div className="flex items-center gap-2 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                        <span className="text-[11px] font-bold text-amber-900">Tỷ số Pen:</span>
                        <input
                          type="number"
                          min="0"
                          value={m.homePen ?? 0}
                          onChange={e => {
                            handleUpdateMatchScore(m.id, {
                              homeScore: m.homeScore,
                              awayScore: m.awayScore,
                              status: m.status,
                              hasPenalty: true,
                              homePen: parseInt(e.target.value, 10) || 0,
                              awayPen: m.awayPen ?? 0,
                            });
                          }}
                          className="w-10 h-7 text-center font-bold text-xs bg-white border border-amber-300 rounded"
                        />
                        <span>-</span>
                        <input
                          type="number"
                          min="0"
                          value={m.awayPen ?? 0}
                          onChange={e => {
                            handleUpdateMatchScore(m.id, {
                              homeScore: m.homeScore,
                              awayScore: m.awayScore,
                              status: m.status,
                              hasPenalty: true,
                              homePen: m.homePen ?? 0,
                              awayPen: parseInt(e.target.value, 10) || 0,
                            });
                          }}
                          className="w-10 h-7 text-center font-bold text-xs bg-white border border-amber-300 rounded"
                        />
                      </div>
                    )}

                    {m.winnerTeam && (
                      <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        🏆 Thắng: {m.winnerTeam}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => handlePersist(localStore, 'Đã lưu toàn bộ tỷ số lên Firebase!')}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Toàn Bộ Tỷ Số Lên Firebase</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: DANH SÁCH ĐỘI BÓNG                           */}
      {/* ======================================================== */}
      {adminTab === 'teams' && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Danh Sách Đội Bóng ({currentDiv.division.name})
              </h3>
              <p className="text-xs text-slate-500">
                Chỉnh sửa trực tiếp tên lớp/đội bóng. Tên mới sẽ tự động cập nhật vào toàn bộ lịch thi đấu tương ứng.
              </p>
            </div>

            <button
              onClick={() => handlePersist(localStore, 'Đã lưu danh sách đội bóng lên Firebase!')}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Danh Sách Đội</span>
            </button>
          </div>

          {/* Group Filter Chips */}
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 hide-scrollbar">
            <span className="font-bold text-slate-400">Xem Bảng:</span>
            <button
              onClick={() => setSelectedGroupFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedGroupFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả các bảng
            </button>
            {currentDiv.groups.map(grp => (
              <button
                key={grp}
                onClick={() => setSelectedGroupFilter(grp)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedGroupFilter === grp ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Bảng {grp}
              </button>
            ))}
          </div>

          {/* Groups list */}
          <div className="space-y-4">
            {currentDiv.groups
              .filter(grp => selectedGroupFilter === 'all' || selectedGroupFilter === grp)
              .map(grp => {
                const teamCodes = Object.keys(currentDiv.teams).filter(c => c.startsWith(grp));

                return (
                  <div key={grp} className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-200">
                      <span className="font-black text-xs sm:text-sm text-indigo-950 uppercase">
                        BẢNG {grp} ({teamCodes.length} ĐỘI)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {teamCodes.map(code => (
                        <div
                          key={code}
                          className="bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-2 shadow-2xs"
                        >
                          <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0 border border-indigo-200">
                            {code}
                          </span>
                          <input
                            type="text"
                            defaultValue={currentDiv.teams[code]}
                            onBlur={e => handleUpdateTeamName(code, e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            className="flex-1 text-xs font-bold text-slate-900 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Add Team Box */}
          <div className="bg-indigo-50/70 rounded-2xl p-3 sm:p-4 border border-indigo-200 space-y-2 text-xs">
            <span className="font-bold text-indigo-950 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" />
              Thêm Đội Bóng Mới Vào Bảng
            </span>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <select
                value={newTeamGroup}
                onChange={e => setNewTeamGroup(e.target.value as any)}
                className="w-full sm:w-32 p-2 bg-white rounded-xl border border-indigo-300 font-bold focus:outline-none"
              >
                {currentDiv.groups.map(grp => (
                  <option key={grp} value={grp}>
                    Bảng {grp}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                placeholder="Nhập tên đội bóng mới (vd: Lớp 10A8)..."
                className="flex-1 w-full p-2 bg-white rounded-xl border border-indigo-300 font-bold focus:outline-none"
              />

              <button
                type="button"
                onClick={handleAddTeam}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                Thêm đội
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => handlePersist(localStore, 'Đã lưu danh sách đội bóng lên Firebase!')}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Danh Sách Đội Lên Firebase</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: SỬA GIỜ VÀ SÂN THI ĐẤU                      */}
      {/* ======================================================== */}
      {adminTab === 'schedule' && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Chỉnh Sửa Giờ & Sân Thi Đấu ({currentDiv.division.name})
              </h3>
              <p className="text-xs text-slate-500">
                Sửa trực tiếp ngày giờ và tên sân cho từng trận đấu. Lưu vào Firebase chỉ bằng 1 chạm.
              </p>
            </div>

            <button
              onClick={() => handlePersist(localStore, 'Đã lưu lịch và sân thi đấu lên Firebase!')}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Lịch & Sân</span>
            </button>
          </div>

          {/* Matches Schedule List */}
          <div className="space-y-3">
            {filteredMatches.map(m => (
              <div key={m.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black bg-blue-600 text-white px-2 py-0.5 rounded text-[11px]">
                      Trận {m.matchNumber}
                    </span>
                    <span className="font-bold text-slate-800">{m.roundName}</span>
                    <span className="font-black text-emerald-800">
                      {m.homeTeam} VS {m.awayTeam}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Time input */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-600" /> Giờ & Ngày đấu:
                    </label>
                    <input
                      type="text"
                      value={m.time}
                      onChange={e => {
                        const newTime = e.target.value;
                        setLocalStore(prev => ({
                          ...prev,
                          divisions: {
                            ...prev.divisions,
                            [currentDivisionId]: {
                              ...currentDiv,
                              matches: currentDiv.matches.map(match =>
                                match.id === m.id ? { ...match, time: newTime } : match
                              ),
                            },
                          },
                        }));
                      }}
                      className="w-full p-2 bg-white rounded-xl border border-slate-300 font-bold focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Pitch input */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" /> Sân thi đấu:
                    </label>
                    <input
                      type="text"
                      value={m.pitch}
                      onChange={e => {
                        const newPitch = e.target.value;
                        setLocalStore(prev => ({
                          ...prev,
                          divisions: {
                            ...prev.divisions,
                            [currentDivisionId]: {
                              ...currentDiv,
                              matches: currentDiv.matches.map(match =>
                                match.id === m.id ? { ...match, pitch: newPitch } : match
                              ),
                            },
                          },
                        }));
                      }}
                      className="w-full p-2 bg-white rounded-xl border border-slate-300 font-bold focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => handlePersist(localStore, 'Đã lưu lịch và sân thi đấu lên Firebase!')}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Lịch & Sân Lên Firebase</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: TÊN GIẢI ĐẤU & THÔNG TIN MÔN THI ĐẤU        */}
      {/* ======================================================== */}
      {adminTab === 'info' && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-600" />
                Cài Đặt Tên Giải Đấu & Thông Tin Môn Thi Đấu
              </h3>
              <p className="text-xs text-slate-500">
                Chỉnh sửa tiêu đề giải đấu, tên trường, tên môn thi đấu và địa điểm thi đấu chính.
              </p>
            </div>

            <button
              onClick={() => handlePersist(localStore, 'Đã lưu tên giải đấu & môn thi lên Firebase!')}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Cài Đặt</span>
            </button>
          </div>

          {/* General Tournament Title & Subtitle */}
          <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200 space-y-3">
            <span className="font-black text-xs text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-600" />
              1. Tiêu Đề Chung Toàn Giải
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên giải đấu chính:
                </label>
                <input
                  type="text"
                  value={localStore.title || 'ĐẠI HỘI TDTT 2026-2027'}
                  onChange={e => handleUpdateGeneralInfo('title', e.target.value)}
                  placeholder="VD: ĐẠI HỘI TDTT 2026-2027..."
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên trường / đơn vị tổ chức:
                </label>
                <input
                  type="text"
                  value={localStore.subtitle || 'THCS-THPT TRẦN TRƯỜNG SINH'}
                  onChange={e => handleUpdateGeneralInfo('subtitle', e.target.value)}
                  placeholder="VD: THCS-THPT TRẦN TRƯỜNG SINH..."
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Current Division Info */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <span className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              2. Thông Tin Môn Đang Chọn ({currentDiv.division.name})
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên đầy đủ môn thi đấu:
                </label>
                <input
                  type="text"
                  value={currentDiv.division.name}
                  onChange={e => handleUpdateDivisionInfo('name', e.target.value)}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên viết tắt (hiển thị trên thẻ):
                </label>
                <input
                  type="text"
                  value={currentDiv.division.shortName}
                  onChange={e => handleUpdateDivisionInfo('shortName', e.target.value)}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Địa điểm / Sân thi đấu chính:
                </label>
                <input
                  type="text"
                  value={currentDiv.division.venue}
                  onChange={e => handleUpdateDivisionInfo('venue', e.target.value)}
                  placeholder="VD: Sân cỏ nhân tạo Thanh Nghĩa..."
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Biểu tượng Icon môn:
                </label>
                <input
                  type="text"
                  value={currentDiv.division.badge}
                  onChange={e => handleUpdateDivisionInfo('badge', e.target.value)}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  Mô tả quy mô & thể thức thi đấu:
                </label>
                <textarea
                  rows={2}
                  value={currentDiv.division.description}
                  onChange={e => handleUpdateDivisionInfo('description', e.target.value)}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-medium focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Reset button zone */}
          <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-rose-900">Vùng nguy hiểm: Khôi phục dữ liệu gốc</p>
              <p className="text-[11px] text-rose-700">
                Đặt lại toàn bộ giải đấu về trạng thái ban đầu của Ban Tổ Chức (xóa mọi tỷ số đã nhập).
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Bạn có chắc chắn muốn đặt lại toàn bộ giải đấu về dữ liệu gốc ban đầu?')) {
                  onResetData();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 cursor-pointer"
            >
              Khôi phục dữ liệu gốc
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => handlePersist(localStore, 'Đã lưu tên giải đấu & môn thi lên Firebase!')}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Thông Tin Lên Firebase</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
