import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { DivisionId, Match, TournamentStore, DivisionRankings, DivisionData } from './types';
import { initialTournamentData } from './data/initialData';
import { Header } from './components/Header';
import { DivisionTabs } from './components/DivisionTabs';
import { MatchesView } from './components/MatchesView';
import { StandingsView } from './components/StandingsView';
import { BracketView } from './components/BracketView';
import { PodiumView } from './components/PodiumView';
import { ScoreEntryModal } from './components/ScoreEntryModal';
import { EditMatchModal } from './components/EditMatchModal';
import { TeamManagerModal } from './components/TeamManagerModal';
import { CsvImportModal } from './components/CsvImportModal';
import { ScheduleManagerModal } from './components/ScheduleManagerModal';
import { LoginModal } from './components/LoginModal';
import { BtcToolbar } from './components/BtcToolbar';
import {
  auth,
  testConnection,
  subscribeTournament,
  syncTournamentToFirestore,
  isAuthorizedEmail,
} from './firebase';
import {
  Calendar,
  BarChart2,
  GitFork,
  Trophy,
  MapPin,
} from 'lucide-react';

const STORAGE_KEY = 'bong_da_tournament_data_v16';

// Cập nhật cấu trúc giải đấu nhưng giữ nguyên toàn bộ tỷ số và thời gian đã nhập
function ensureUpToDateTournamentStructure(data: TournamentStore): TournamentStore {
  if (!data || !data.divisions) return initialTournamentData;

  const defaultDivisions = initialTournamentData.divisions;
  const migratedDivisions = { ...data.divisions };

  (Object.keys(defaultDivisions) as DivisionId[]).forEach((divId) => {
    const defaultDiv = defaultDivisions[divId];
    const currentDiv = migratedDivisions[divId];
    if (!currentDiv || !currentDiv.matches) {
      migratedDivisions[divId] = defaultDiv;
      return;
    }

    const existingMatchesMap = new Map<string, Match>();
    currentDiv.matches.forEach((m) => existingMatchesMap.set(m.id, m));

    const updatedMatches = defaultDiv.matches.map((templateMatch) => {
      const existing = existingMatchesMap.get(templateMatch.id);
      if (!existing) return templateMatch;

      return {
        ...templateMatch,
        // Giữ nguyên tỷ số và trạng thái nếu trận đấu đã kết thúc
        homeScore: existing.homeScore ?? templateMatch.homeScore,
        awayScore: existing.awayScore ?? templateMatch.awayScore,
        status: existing.status || templateMatch.status,
        hasPenalty: existing.hasPenalty,
        homePen: existing.homePen,
        awayPen: existing.awayPen,
        winnerTeam: existing.winnerTeam,
        // Ưu tiên thời gian do Admin tùy chỉnh
        time: existing.time || templateMatch.time,
        pitch: existing.pitch || templateMatch.pitch,
        note: existing.note || templateMatch.note,
        pairCode: templateMatch.pairCode,
        homeTeam: (existing.status === 'finished' && existing.homeTeam) ? existing.homeTeam : (existing.homeTeam || templateMatch.homeTeam),
        awayTeam: (existing.status === 'finished' && existing.awayTeam) ? existing.awayTeam : (existing.awayTeam || templateMatch.awayTeam),
      };
    });

    migratedDivisions[divId] = {
      ...currentDiv,
      division: { ...defaultDiv.division, ...currentDiv.division },
      groups: currentDiv.groups || defaultDiv.groups,
      teams: currentDiv.teams || defaultDiv.teams,
      matches: updatedMatches,
    };
  });

  return { divisions: migratedDivisions };
}

export default function App() {
  // Trạng thái đăng nhập của Admin
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Khởi tạo dữ liệu từ LocalStorage để không bị mất khi F5
  const [store, setStore] = useState<TournamentStore>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.divisions) {
          return ensureUpToDateTournamentStructure(parsed);
        }
      }
    } catch (e) {
      console.warn('Lỗi khi tải dữ liệu từ localStorage:', e);
    }
    return initialTournamentData;
  });

  // Tab nội dung giải đấu hiện tại
  const [currentDivisionId, setCurrentDivisionId] = useState<DivisionId>('nam');

  // Sub tab: matches, standings, bracket, podium
  const [activeTab, setActiveTab] = useState<'matches' | 'standings' | 'bracket' | 'podium'>('matches');

  // Chế độ Ban Tổ Chức / Admin
  const [isBtcMode, setIsBtcMode] = useState<boolean>(false);

  // Kiểm tra xem Email có nằm trong danh sách Admin được phép sửa hay không
  const isUserAuthorized = useMemo(() => {
    return currentUser ? isAuthorizedEmail(currentUser.email) : false;
  }, [currentUser]);

  // Chỉ cho phép chỉnh sửa nếu đã đăng nhập tài khoản Admin và bật chế độ Admin
  const canEdit = isBtcMode && isUserAuthorized;

  // Trạng thái các Modal
  const [editingScoreMatch, setEditingScoreMatch] = useState<Match | null>(null);
  const [editingDetailsMatch, setEditingDetailsMatch] = useState<Match | null>(null);
  const [isTeamManagerOpen, setIsTeamManagerOpen] = useState<boolean>(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState<boolean>(false);
  const [isScheduleManagerOpen, setIsScheduleManagerOpen] = useState<boolean>(false);

  // Cờ tránh vòng lặp đồng bộ dữ liệu giữa Firestore và LocalState
  const isRemoteSyncRef = useRef<boolean>(false);

  // Lắng nghe trạng thái đăng nhập
  useEffect(() => {
    testConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
      if (user && isAuthorizedEmail(user.email)) {
        setIsBtcMode(true);
      } else {
        setIsBtcMode(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Lắng nghe dữ liệu thời gian thực từ Firestore
  useEffect(() => {
    const unsubscribeDoc = subscribeTournament((remoteData) => {
      if (remoteData && remoteData.divisions) {
        isRemoteSyncRef.current = true;
        const upgraded = ensureUpToDateTournamentStructure(remoteData);
        setStore(upgraded);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(upgraded));
        } catch {
          // ignore
        }
      }
    });

    return () => {
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  // Tự động lưu dữ liệu vào localStorage mỗi khi store thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // ignore
    }
  }, [store]);

  // Hàm yêu cầu quyền Admin: Bật modal đăng nhập nếu người dùng chưa đăng nhập Admin
  const requireBtcLogin = (action: () => void) => {
    if (currentUser && isAuthorizedEmail(currentUser.email)) {
      action();
    } else {
      setIsLoginModalOpen(true);
    }
  };

  // Hàm lưu dữ liệu vào State, LocalStorage và đồng bộ lên Cloud Firebase
  const persistAndSync = (newStore: TournamentStore) => {
    setStore(newStore);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStore));
    } catch {
      // ignore
    }
    if (currentUser && isAuthorizedEmail(currentUser.email)) {
      syncTournamentToFirestore(newStore, currentUser).catch((err) => {
        console.warn('Lỗi khi đồng bộ dữ liệu lên Firestore:', err);
      });
    }
  };

  const currentData = store.divisions[currentDivisionId];

  // Tổng hợp số lượng trận đấu cho các Tab
  const matchesCountSummary = useMemo(() => {
    const summary: Record<DivisionId, { total: number; finished: number }> = {
      nam: { total: 0, finished: 0 },
      nu: { total: 0, finished: 0 },
      khoi89: { total: 0, finished: 0 },
      khoi67: { total: 0, finished: 0 },
    };

    (Object.keys(store.divisions) as DivisionId[]).forEach((id) => {
      const d = store.divisions[id];
      if (d && d.matches) {
        summary[id] = {
          total: d.matches.length,
          finished: d.matches.filter((m) => m.status === 'finished').length,
        };
      }
    });

    return summary;
  }, [store]);

  const divisionsInfo = useMemo(() => {
    const map: Record<DivisionId, any> = {
      nam: store.divisions.nam.division,
      nu: store.divisions.nu.division,
      khoi89: store.divisions.khoi89.division,
      khoi67: store.divisions.khoi67.division,
    };
    return map;
  }, [store]);

  // Xử lý Lưu Tỷ Số (Chỉ Admin mới thực thi)
  const handleSaveScore = (updatedMatch: Match) => {
    if (!isUserAuthorized) {
      setIsLoginModalOpen(true);
      return;
    }

    const division = store.divisions[currentDivisionId];
    const updatedMatches = division.matches.map((m) =>
      m.id === updatedMatch.id ? updatedMatch : m
    );

    let updatedRankings = { ...division.rankings };
    if (updatedMatch.round === 'final' && updatedMatch.status === 'finished' && updatedMatch.winnerTeam) {
      const champ = updatedMatch.winnerTeam;
      const runner = champ === updatedMatch.homeTeam ? updatedMatch.awayTeam : updatedMatch.homeTeam;
      updatedRankings = {
        ...updatedRankings,
        champion: champ,
        runnerUp: runner,
      };
    }

    const newStore: TournamentStore = {
      ...store,
      divisions: {
        ...store.divisions,
        [currentDivisionId]: {
          ...division,
          matches: updatedMatches,
          rankings: updatedRankings,
        },
      },
    };

    persistAndSync(newStore);
  };

  // Xử lý Lưu Thời gian & Chi tiết Trận đấu (Chỉ Admin)
  const handleSaveMatchDetails = (updatedMatch: Match) => {
    if (!isUserAuthorized) {
      setIsLoginModalOpen(true);
      return;
    }

    const division = store.divisions[currentDivisionId];
    const updatedMatches = division.matches.map((m) =>
      m.id === updatedMatch.id ? updatedMatch : m
    );

    const newStore: TournamentStore = {
      ...store,
      divisions: {
        ...store.divisions,
        [currentDivisionId]: {
          ...division,
          matches: updatedMatches,
        },
      },
    };

    persistAndSync(newStore);
  };

  // Xử lý Lưu Lịch Thi Đấu Hàng Loạt (Chỉ Admin)
  const handleSaveSchedule = (updatedMatches: Match[]) => {
    if (!isUserAuthorized) {
      setIsLoginModalOpen(true);
      return;
    }

    const division = store.divisions[currentDivisionId];
    const newStore: TournamentStore = {
      ...store,
      divisions: {
        ...store.divisions,
        [currentDivisionId]: {
          ...division,
          matches: updatedMatches,
        },
      },
    };

    persistAndSync(newStore);
  };

  const handleNavigateMatch = (direction: 'prev' | 'next') => {
    if (!editingDetailsMatch) return;
    const matches = currentData.matches;
    const currentIndex = matches.findIndex((m) => m.id === editingDetailsMatch.id);
    if (currentIndex === -1) return;
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < matches.length) {
      setEditingDetailsMatch(matches[nextIndex]);
    }
  };

  const handleSaveTeams = (updatedTeams: { [code: string]: string }) => {
    if (!isUserAuthorized) {
      setIsLoginModalOpen(true);
      return;
    }

    const division = store.divisions[currentDivisionId];

    const updatedMatches = division.matches.map((m) => {
      let home = m.homeTeam;
      let away = m.awayTeam;

      Object.entries(updatedTeams).forEach(([code, newName]) => {
        const oldName = division.teams[code];
        if (home === oldName || (m.pairCode && m.pairCode.startsWith(code))) {
          home = newName;
        }
        if (away === oldName || (m.pairCode && m.pairCode.endsWith(code))) {
          away = newName;
        }
      });

      return {
        ...m,
        homeTeam: home,
        awayTeam: away,
      };
    });

    const newStore: TournamentStore = {
      ...store,
      divisions: {
        ...store.divisions,
        [currentDivisionId]: {
          ...division,
          teams: updatedTeams,
          matches: updatedMatches,
        },
      },
    };

    persistAndSync(newStore);
  };

  const handleUpdateRankings = (newRankings: DivisionRankings) => {
    if (!isUserAuthorized) {
      setIsLoginModalOpen(true);
      return;
    }

    const newStore: TournamentStore = {
      ...store,
      divisions: {
        ...store.divisions,
        [currentDivisionId]: {
          ...store.divisions[currentDivisionId],
          rankings: newRankings,
        },
      },
    };

    persistAndSync(newStore);
  };

  const handleApplyCsvData = (divisionId: DivisionId, parsedData: Partial<DivisionData>) => {
    if (!isUserAuthorized) {
      setIsLoginModalOpen(true);
      return;
    }

    const current = store.divisions[divisionId];
    const merged: DivisionData = {
      ...current,
      division: parsedData.division ? { ...current.division, ...parsedData.division } : current.division,
      teams: parsedData.teams ? { ...current.teams, ...parsedData.teams } : current.teams,
      matches: parsedData.matches && parsedData.matches.length > 0 ? parsedData.matches : current.matches,
      rankings: parsedData.rankings && (parsedData.rankings.champion || parsedData.rankings.runnerUp)
        ? parsedData.rankings
        : current.rankings,
    };

    const newStore: TournamentStore = {
      ...store,
      divisions: {
        ...store.divisions,
        [divisionId]: merged,
      },
    };

    persistAndSync(newStore);
    setCurrentDivisionId(divisionId);
  };

  const handleResetData = () => {
    if (!isUserAuthorized) {
      setIsLoginModalOpen(true);
      return;
    }

    persistAndSync(initialTournamentData);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(store, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `giai_bong_da_${currentDivisionId}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const currentFinishedMatches = currentData.matches.filter((m) => m.status === 'finished').length;
  const currentTotalMatches = currentData.matches.length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 pb-16">
      {/* Thanh Header */}
      <Header
        isBtcMode={canEdit}
        onToggleBtcMode={() => {
          if (!isUserAuthorized) {
            setIsLoginModalOpen(true);
          } else {
            setIsBtcMode((prev) => !prev);
          }
        }}
        onResetData={handleResetData}
        onOpenTeamManager={() => requireBtcLogin(() => setIsTeamManagerOpen(true))}
        onOpenCsvImport={() => requireBtcLogin(() => setIsCsvImportOpen(true))}
        onOpenScheduleManager={() => requireBtcLogin(() => setIsScheduleManagerOpen(true))}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Tabs chọn nội dung giải đấu */}
      <DivisionTabs
        currentDivisionId={currentDivisionId}
        divisions={divisionsInfo}
        onSelectDivision={(id) => {
          setCurrentDivisionId(id);
        }}
        matchesCount={matchesCountSummary}
      />

      {/* Nội dung chính */}
      <main className="max-w-4xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-4 flex-1 space-y-3.5">
        {/* Banner thông tin giải đấu */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm border border-emerald-600/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/15 text-emerald-100 backdrop-blur-xs">
                <span>{currentData.division.badge}</span>
                <span>{currentData.division.name}</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                {currentData.division.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-emerald-100 font-medium">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-emerald-300" />
                <span>{currentData.division.venue}</span>
              </div>
            </div>

            {/* Thống kê tiến độ */}
            <div className="flex items-center gap-2 bg-emerald-950/40 border border-white/10 rounded-2xl p-2.5 sm:p-3 backdrop-blur-md self-start sm:self-auto">
              <div className="text-center px-2">
                <div className="text-xs text-emerald-200 font-medium">Tiến độ</div>
                <div className="text-base sm:text-lg font-black text-amber-300">
                  {Math.round((currentFinishedMatches / (currentTotalMatches || 1)) * 100)}%
                </div>
              </div>
              <div className="w-px h-7 bg-white/20" />
              <div className="text-center px-2">
                <div className="text-xs text-emerald-200 font-medium">Đã xong</div>
                <div className="text-base sm:text-lg font-black text-white">
                  {currentFinishedMatches}/{currentTotalMatches}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chuyển đổi các chế độ xem */}
        <div className="bg-white rounded-2xl p-1 border border-slate-200/90 shadow-xs grid grid-cols-4 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl transition-all font-bold ${
              activeTab === 'matches'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="truncate">Lịch & Tỉ Số</span>
          </button>

          <button
            onClick={() => setActiveTab('standings')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl transition-all font-bold ${
              activeTab === 'standings'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span className="truncate">Bảng Điểm</span>
          </button>

          <button
            onClick={() => setActiveTab('bracket')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl transition-all font-bold ${
              activeTab === 'bracket'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <GitFork className="w-4 h-4" />
            <span className="truncate">Nhánh Đấu</span>
          </button>

          <button
            onClick={() => setActiveTab('podium')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl transition-all font-bold ${
              activeTab === 'podium'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span className="truncate">Chung Cuộc</span>
          </button>
        </div>

        {/* Tab 1: Danh sách trận đấu */}
        {activeTab === 'matches' && (
          <MatchesView
            matches={currentData.matches}
            isBtcMode={canEdit}
            onEditScore={(match) => {
              requireBtcLogin(() => setEditingScoreMatch(match));
            }}
            onEditDetails={(match) => {
              requireBtcLogin(() => setEditingDetailsMatch(match));
            }}
            onOpenScheduleManager={() => {
              requireBtcLogin(() => setIsScheduleManagerOpen(true));
            }}
          />
        )}

        {/* Tab 2: Bảng xếp hạng */}
        {activeTab === 'standings' && (
          <StandingsView
            groups={currentData.groups}
            teams={currentData.teams}
            matches={currentData.matches}
            isBtcMode={canEdit}
            onEditScore={(match) => {
              requireBtcLogin(() => setEditingScoreMatch(match));
            }}
          />
        )}

        {/* Tab 3: Sơ đồ nhánh đấu */}
        {activeTab === 'bracket' && (
          <BracketView
            matches={currentData.matches}
            isBtcMode={canEdit}
            onEditScore={(match) => {
              requireBtcLogin(() => setEditingScoreMatch(match));
            }}
          />
        )}

        {/* Tab 4: Đội vô địch / Chung cuộc */}
        {activeTab === 'podium' && (
          <PodiumView
            rankings={currentData.rankings}
            isBtcMode={canEdit}
            onUpdateRankings={(rankings) => {
              requireBtcLogin(() => handleUpdateRankings(rankings));
            }}
          />
        )}
      </main>

      {/* Thanh công cụ nổi dành cho Admin */}
      <BtcToolbar
        isVisible={canEdit}
        onClose={() => setIsBtcMode(false)}
        onExport={handleExportData}
        onOpenCsvImport={() => requireBtcLogin(() => setIsCsvImportOpen(true))}
        onOpenScheduleManager={() => requireBtcLogin(() => setIsScheduleManagerOpen(true))}
      />

      {/* Modal Đăng Nhập */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (isAuthorizedEmail(user.email)) {
            setIsBtcMode(true);
          } else {
            setIsBtcMode(false);
          }
        }}
        onLogoutSuccess={() => {
          setCurrentUser(null);
          setIsBtcMode(false);
        }}
      />

      {/* Modal Nhập Tỷ Số */}
      <ScoreEntryModal
        match={editingScoreMatch}
        isOpen={!!editingScoreMatch}
        onClose={() => setEditingScoreMatch(null)}
        onSave={handleSaveScore}
      />

      {/* Modal Sửa Thời Gian & Chi Tiết Trận Đấu */}
      <EditMatchModal
        match={editingDetailsMatch}
        isOpen={!!editingDetailsMatch}
        onClose={() => setEditingDetailsMatch(null)}
        onSave={handleSaveMatchDetails}
        onNavigateMatch={handleNavigateMatch}
      />

      {/* Modal Quản Lý Lịch Đấu Hàng Loạt */}
      <ScheduleManagerModal
        divisionName={currentData.division.shortName}
        matches={currentData.matches}
        isOpen={isScheduleManagerOpen}
        onClose={() => setIsScheduleManagerOpen(false)}
        onSaveSchedule={handleSaveSchedule}
      />

      {/* Modal Quản Lý Đội */}
      <TeamManagerModal
        divisionName={currentData.division.shortName}
        teams={currentData.teams}
        isOpen={isTeamManagerOpen}
        onClose={() => setIsTeamManagerOpen(false)}
        onSaveTeams={handleSaveTeams}
      />

      {/* Modal Nhập Dữ Liệu CSV */}
      <CsvImportModal
        currentDivisionId={currentDivisionId}
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onApplyCsvData={handleApplyCsvData}
      />
    </div>
  );
}
