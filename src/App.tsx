import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  BarChart2, 
  GitFork, 
  Lock, 
  Unlock, 
  X, 
  Check, 
  LogOut,
  MapPin
} from 'lucide-react';

// 🔑 Mật khẩu Admin (Bạn có thể tự đổi ở đây)
const ADMIN_PASSWORD = "THCSTHPTTTS";

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  time: string;
  status: 'scheduled' | 'live' | 'finished';
  round: string;
  group?: string;
}

export interface TeamStanding {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

const STORAGE_KEY = 'giai_bong_da_data_v2026_bdnam_31tran';

// Dữ liệu khởi tạo chuẩn 31 trận BĐ Nam từ sơ đồ
const INITIAL_DATA: Record<string, { name: string; venue: string; matches: Match[] }> = {
  nam: {
    name: "BĐ Nam",
    venue: "Sân Bóng Đám Cỏ / Sân Trường",
    matches: [
      // --- LƯỢT 1 VÒNG BẢNG (Trận 1 - 8) ---
      { id: '1', homeTeam: '11A3', awayTeam: '10A4', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 1', group: 'Bảng A' },
      { id: '2', homeTeam: '10A5', awayTeam: '11A5', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 2', group: 'Bảng A' },
      { id: '3', homeTeam: '12A4', awayTeam: '12A2', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 3', group: 'Bảng B' },
      { id: '4', homeTeam: '10A6', awayTeam: '12A3', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 4', group: 'Bảng B' },
      { id: '5', homeTeam: '10A2', awayTeam: '10A3', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 5', group: 'Bảng C' },
      { id: '6', homeTeam: '11A1', awayTeam: '10A1', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 6', group: 'Bảng C' },
      { id: '7', homeTeam: '12A1', awayTeam: '11A4', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 7', group: 'Bảng D' },
      { id: '8', homeTeam: '12A5', awayTeam: '10A7', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 8', group: 'Bảng D' },

      // --- LƯỢT 2 VÒNG BẢNG (Trận 9 - 16) ---
      { id: '9', homeTeam: '11A3', awayTeam: '10A5', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 9', group: 'Bảng A' },
      { id: '10', homeTeam: '10A4', awayTeam: '11A5', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 10', group: 'Bảng A' },
      { id: '11', homeTeam: '12A4', awayTeam: '10A6', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 11', group: 'Bảng B' },
      { id: '12', homeTeam: '12A2', awayTeam: '12A3', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 12', group: 'Bảng B' },
      { id: '13', homeTeam: '10A2', awayTeam: '11A1', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 13', group: 'Bảng C' },
      { id: '14', homeTeam: '10A3', awayTeam: '10A1', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 14', group: 'Bảng C' },
      { id: '15', homeTeam: '12A1', awayTeam: '12A5', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 15', group: 'Bảng D' },
      { id: '16', homeTeam: '11A4', awayTeam: '10A7', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 16', group: 'Bảng D' },

      // --- LƯỢT 3 VÒNG BẢNG (Trận 17 - 24) ---
      { id: '17', homeTeam: '11A3', awayTeam: '11A5', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 17', group: 'Bảng A' },
      { id: '18', homeTeam: '10A4', awayTeam: '10A5', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 18', group: 'Bảng A' },
      { id: '19', homeTeam: '12A4', awayTeam: '12A3', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 19', group: 'Bảng B' },
      { id: '20', homeTeam: '12A2', awayTeam: '10A6', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 20', group: 'Bảng B' },
      { id: '21', homeTeam: '10A2', awayTeam: '10A1', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 21', group: 'Bảng C' },
      { id: '22', homeTeam: '10A3', awayTeam: '11A1', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 22', group: 'Bảng C' },
      { id: '23', homeTeam: '12A1', awayTeam: '10A7', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 23', group: 'Bảng D' },
      { id: '24', homeTeam: '11A4', awayTeam: '12A5', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 24', group: 'Bảng D' },

      // --- TỨ KẾT (Trận 25 - 28) ---
      { id: '25', homeTeam: 'Nhất A', awayTeam: 'Nhì C', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 25 (TK1)' },
      { id: '26', homeTeam: 'Nhất D', awayTeam: 'Nhì B', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 26 (TK2)' },
      { id: '27', homeTeam: 'Nhất B', awayTeam: 'Nhì D', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 27 (TK3)' },
      { id: '28', homeTeam: 'Nhất C', awayTeam: 'Nhì A', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 28 (TK4)' },

      // --- BÁN KẾT (Trận 29 - 30) ---
      { id: '29', homeTeam: 'Thắng TK1', awayTeam: 'Thắng TK2', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 29 (BK1)' },
      { id: '30', homeTeam: 'Thắng TK3', awayTeam: 'Thắng TK4', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 30 (BK2)' },

      // --- CHUNG KẾT (Trận 31) ---
      { id: '31', homeTeam: 'Thắng BK1', awayTeam: 'Thắng BK2', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 31 (CK)' }
    ]
  },
  nu: {
    name: "BĐ Nữ",
    venue: "Sân Trường",
    matches: [
      { id: 'NU1', homeTeam: '10A1', awayTeam: '10A2', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 1', group: 'Bảng A' },
      { id: 'NU-CK', homeTeam: 'Nhất Bảng A', awayTeam: 'Nhất Bảng B', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Chung kết' }
    ]
  },
  khoi89: {
    name: "BĐ Khối 8-9",
    venue: "Sân Trường",
    matches: [
      { id: 'K89-1', homeTeam: '9A1', awayTeam: '9A2', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 1', group: 'Khối 9' },
      { id: 'K89-CK', homeTeam: 'Nhất K9', awayTeam: 'Nhất K8', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Chung kết' }
    ]
  },
  khoi67: {
    name: "BĐ Khối 6-7",
    venue: "Sân Trường",
    matches: [
      { id: 'K67-1', homeTeam: '7A1', awayTeam: '7A2', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Trận 1', group: 'Khối 7' },
      { id: 'K67-CK', homeTeam: 'Nhất K7', awayTeam: 'Nhất K6', time: 'Chưa xếp giờ', status: 'scheduled', round: 'Chung kết' }
    ]
  }
};

export default function App() {
  const [currentDiv, setCurrentDiv] = useState<string>('nam');
  const [activeTab, setActiveTab] = useState<'matches' | 'standings' | 'bracket'>('matches');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  const [tournamentData, setTournamentData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DATA;
  });

  const [editingScoreMatch, setEditingScoreMatch] = useState<Match | null>(null);
  const [editingTimeMatch, setEditingTimeMatch] = useState<Match | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tournamentData));
    } catch (e) {
      console.error(e);
    }
  }, [tournamentData]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setLoginModalOpen(false);
      setAdminPassword('');
      setLoginError('');
    } else {
      setLoginError('Mật khẩu Admin không chính xác!');
    }
  };

  const handleSaveScore = (matchId: string, homeScore?: number, awayScore?: number, status?: Match['status']) => {
    setTournamentData((prev: typeof INITIAL_DATA) => {
      const divData = prev[currentDiv];
      const updatedMatches = divData.matches.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            homeScore,
            awayScore,
            status: status || (homeScore !== undefined && awayScore !== undefined ? 'finished' : m.status)
          };
        }
        return m;
      });
      return {
        ...prev,
        [currentDiv]: { ...divData, matches: updatedMatches }
      };
    });
    setEditingScoreMatch(null);
  };

  const handleSaveTime = (matchId: string, newTime: string) => {
    setTournamentData((prev: typeof INITIAL_DATA) => {
      const divData = prev[currentDiv];
      const updatedMatches = divData.matches.map((m) => (m.id === matchId ? { ...m, time: newTime } : m));
      return {
        ...prev,
        [currentDiv]: { ...divData, matches: updatedMatches }
      };
    });
    setEditingTimeMatch(null);
  };

  // Tính Bảng xếp hạng tự động phân theo các Bảng A, B, C, D
  const groupStandings = useMemo(() => {
    const matches: Match[] = tournamentData[currentDiv]?.matches || [];
    const groups: Record<string, Record<string, TeamStanding>> = {};

    matches.forEach((m) => {
      if (m.group && m.status === 'finished' && m.homeScore !== undefined && m.awayScore !== undefined) {
        if (!groups[m.group]) groups[m.group] = {};
        const groupMap = groups[m.group];

        [m.homeTeam, m.awayTeam].forEach((teamName) => {
          if (!groupMap[teamName]) {
            groupMap[teamName] = { team: teamName, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
          }
        });

        const home = groupMap[m.homeTeam];
        const away = groupMap[m.awayTeam];

        if (home && away) {
          home.played += 1;
          away.played += 1;
          home.gf += m.homeScore;
          home.ga += m.awayScore;
          away.gf += m.awayScore;
          away.ga += m.homeScore;

          if (m.homeScore > m.awayScore) {
            home.won += 1;
            home.points += 3;
            away.lost += 1;
          } else if (m.homeScore < m.awayScore) {
            away.won += 1;
            away.points += 3;
            home.lost += 1;
          } else {
            home.drawn += 1;
            home.points += 1;
            away.drawn += 1;
            away.points += 1;
          }

          home.gd = home.gf - home.ga;
          away.gd = away.gf - away.ga;
        }
      }
    });

    const result: Record<string, TeamStanding[]> = {};
    Object.keys(groups).sort().forEach((gName) => {
      result[gName] = Object.values(groups[gName]).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
    });

    return result;
  }, [tournamentData, currentDiv]);

  const currentMatches = tournamentData[currentDiv]?.matches || [];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-16 font-sans">
      <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-black tracking-wide uppercase flex items-center gap-2">
              <span>⚽</span> GIẢI BÓNG ĐÁ HỌC ĐƯỜNG
            </h1>
            <p className="text-xs text-emerald-200">Cập nhật kết quả & Lịch thi đấu trực tiếp</p>
          </div>

          <div>
            {isAdmin ? (
              <div className="flex items-center gap-2 bg-emerald-900/80 px-3 py-1.5 rounded-xl border border-emerald-600 text-xs font-bold text-amber-300">
                <Unlock className="w-3.5 h-3.5" />
                <span>Chế độ Admin</span>
                <button 
                  onClick={() => setIsAdmin(false)}
                  className="ml-1 p-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  title="Đăng xuất Admin"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-colors border border-emerald-500 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Đăng nhập Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 sticky top-[57px] z-10 shadow-xs">
        <div className="max-w-4xl mx-auto px-2 flex gap-1 overflow-x-auto py-2 justify-start sm:justify-center scrollbar-none">
          {Object.keys(INITIAL_DATA).map((key) => {
            const active = currentDiv === key;
            return (
              <button
                key={key}
                onClick={() => setCurrentDiv(key)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {INITIAL_DATA[key].name}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="inline-block px-2.5 py-0.5 bg-white/20 text-emerald-100 text-[11px] font-bold rounded-full mb-1">
              Giải Đấu Chính Thức
            </span>
            <h2 className="text-xl sm:text-2xl font-black">{tournamentData[currentDiv]?.name}</h2>
            <p className="text-xs text-emerald-200 flex items-center gap-1 mt-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <span>{tournamentData[currentDiv]?.venue}</span>
            </p>
          </div>

          <div className="bg-emerald-950/40 border border-white/10 rounded-xl p-3 flex gap-4 text-center self-start sm:self-auto">
            <div>
              <div className="text-[11px] text-emerald-200 font-medium">Tổng số trận</div>
              <div className="text-lg font-black text-amber-300">{currentMatches.length}</div>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <div className="text-[11px] text-emerald-200 font-medium">Đã thi đấu</div>
              <div className="text-lg font-black text-white">
                {currentMatches.filter((m) => m.status === 'finished').length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-3 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-extrabold transition-all ${
              activeTab === 'matches'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Lịch & Tỉ Số</span>
          </button>

          <button
            onClick={() => setActiveTab('standings')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-extrabold transition-all ${
              activeTab === 'standings'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Bảng Điểm</span>
          </button>

          <button
            onClick={() => setActiveTab('bracket')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-extrabold transition-all ${
              activeTab === 'bracket'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <GitFork className="w-4 h-4" />
            <span>Nhánh Đấu</span>
          </button>
        </div>

        {/* 1. TAB LỊCH THI ĐẤU & TỈ SỐ */}
        {activeTab === 'matches' && (
          <div className="space-y-3">
            {currentMatches.map((match) => (
              <div
                key={match.id}
                className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 hover:border-emerald-500 transition-colors flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span className="font-bold text-slate-600">{match.round} {match.group ? `• ${match.group}` : ''}</span>
                  <div className="flex items-center gap-2">
                    <span>{match.time}</span>
                    {isAdmin && (
                      <button
                        onClick={() => setEditingTimeMatch(match)}
                        className="text-emerald-700 hover:underline font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md"
                      >
                        Sửa giờ
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1 text-right font-extrabold text-slate-800 text-sm md:text-base pr-3">
                    {match.homeTeam}
                  </div>

                  <div className="flex flex-col items-center min-w-[90px]">
                    <div className="bg-slate-900 text-white px-3.5 py-1.5 rounded-xl font-black text-base md:text-lg tracking-wider flex items-center gap-1 shadow-inner">
                      <span>{match.homeScore !== undefined ? match.homeScore : '-'}</span>
                      <span className="text-slate-500 text-xs">:</span>
                      <span>{match.awayScore !== undefined ? match.awayScore : '-'}</span>
                    </div>

                    {match.status === 'finished' ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 uppercase">
                        KẾT THÚC
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-1 uppercase">
                        SẮP ĐẤU
                      </span>
                    )}
                  </div>

                  <div className="flex-1 text-left font-extrabold text-slate-800 text-sm md:text-base pl-3">
                    {match.awayTeam}
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setEditingScoreMatch(match)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Cập nhật Tỉ Số</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 2. TAB BẢNG XẾP HẠNG */}
        {activeTab === 'standings' && (
          <div className="space-y-4">
            {Object.keys(groupStandings).length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-sm shadow-xs border border-slate-200">
                Chưa có dữ liệu các trận đấu đã hoàn thành để tính điểm.
              </div>
            ) : (
              Object.keys(groupStandings).map((gName) => (
                <div key={gName} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 font-extrabold text-xs text-emerald-800">
                    BẢNG XẾP HẠNG {gName.toUpperCase()}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs md:text-sm">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold">
                          <th className="py-2.5 px-3">Hạng</th>
                          <th className="py-2.5 px-3">Đội Bóng</th>
                          <th className="py-2.5 px-2 text-center">Tr</th>
                          <th className="py-2.5 px-2 text-center">T</th>
                          <th className="py-2.5 px-2 text-center">H</th>
                          <th className="py-2.5 px-2 text-center">T</th>
                          <th className="py-2.5 px-2 text-center">HS</th>
                          <th className="py-2.5 px-3 text-center font-black text-emerald-700">Điểm</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupStandings[gName].map((st, idx) => (
                          <tr key={st.team} className="border-b border-slate-100 hover:bg-slate-50 font-semibold">
                            <td className="py-3 px-3 font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-3 px-3 font-extrabold text-slate-800">{st.team}</td>
                            <td className="py-3 px-2 text-center">{st.played}</td>
                            <td className="py-3 px-2 text-center text-emerald-600">{st.won}</td>
                            <td className="py-3 px-2 text-center text-slate-400">{st.drawn}</td>
                            <td className="py-3 px-2 text-center text-red-500">{st.lost}</td>
                            <td className="py-3 px-2 text-center font-bold">{st.gd > 0 ? `+${st.gd}` : st.gd}</td>
                            <td className="py-3 px-3 text-center font-black text-emerald-700 text-base">{st.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. TAB NHÁNH ĐẤU KNOCKOUT */}
        {activeTab === 'bracket' && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Sơ đồ thi đấu Knockout (Tứ Kết → Chung Kết)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentMatches.filter((m) => m.round.includes('TK') || m.round.includes('BK') || m.round.includes('CK')).map((m) => (
                <div key={m.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-[11px] font-bold text-emerald-700 uppercase">{m.round}</div>
                  <div className="flex items-center justify-between font-extrabold text-sm">
                    <span>{m.homeTeam}</span>
                    <span className="bg-slate-900 text-white px-2.5 py-1 rounded-lg text-xs">
                      {m.homeScore !== undefined ? `${m.homeScore} - ${m.awayScore}` : 'VS'}
                    </span>
                    <span>{m.awayTeam}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 text-right">{m.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL ĐĂNG NHẬP ADMIN */}
      {loginModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Đăng nhập Ban Tổ Chức</span>
              </h3>
              <button onClick={() => setLoginModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Mật khẩu Quản trị Admin:</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Mật khẩu Admin"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {loginError && <p className="text-xs text-red-500 font-medium">{loginError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLoginModalOpen(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CẬP NHẬT TỶ SỐ */}
      {editingScoreMatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-slate-800">Cập nhật tỉ số trận đấu</h3>
              <button onClick={() => setEditingScoreMatch(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center font-extrabold text-emerald-800 text-sm">
              {editingScoreMatch.homeTeam} VS {editingScoreMatch.awayTeam}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{editingScoreMatch.homeTeam}</label>
                <input
                  type="number"
                  defaultValue={editingScoreMatch.homeScore ?? 0}
                  id="homeScoreInput"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-black text-center text-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{editingScoreMatch.awayTeam}</label>
                <input
                  type="number"
                  defaultValue={editingScoreMatch.awayScore ?? 0}
                  id="awayScoreInput"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-black text-center text-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingScoreMatch(null)}
                className="px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  const h = Number((document.getElementById('homeScoreInput') as HTMLInputElement).value);
                  const a = Number((document.getElementById('awayScoreInput') as HTMLInputElement).value);
                  handleSaveScore(editingScoreMatch.id, h, a, 'finished');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                <span>Lưu Tỉ Số</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SỬA GIỜ THI ĐẤU */}
      {editingTimeMatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-slate-800">Sửa thời gian thi đấu</h3>
              <button onClick={() => setEditingTimeMatch(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Thời gian (Giờ, Thứ, Ngày):</label>
              <input
                type="text"
                defaultValue={editingTimeMatch.time}
                id="matchTimeInput"
                placeholder="7h30, Thứ 6, 17/10"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingTimeMatch(null)}
                className="px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  const val = (document.getElementById('matchTimeInput') as HTMLInputElement).value;
                  handleSaveTime(editingTimeMatch.id, val);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Lưu Giờ Đấu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
