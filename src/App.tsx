import React, { useState, useEffect } from 'react';
import { Match } from './types';
import { Header } from './components/Header';
import { DivisionTabs } from './components/DivisionTabs';
import { MatchesView } from './components/MatchesView';
import { ScoreEntryModal } from './components/ScoreEntryModal';
import { EditMatchModal } from './components/EditMatchModal';
import { Calendar, BarChart2, GitFork, Trophy, MapPin, RefreshCw } from 'lucide-react';

const API_URL = "https://script.google.com/macros/s/AKfycbwaevxVit54JZSzYYIkJWzn0-BIKJ-mNSkQbJ4NNXrk5CJt-vgdGOXAc7u4fS0ZIJ--Ug/exec";

const SHEET_NAMES: Record<string, string> = {
  nam: "BĐ Nam",
  nu: "BĐ Nữ",
  khoi89: "BĐ Khối 8-9",
  khoi67: "BĐ Khối 6-7"
};

const DIVISIONS_INFO: Record<string, any> = {
  nam: { name: "BĐ Nam", badge: "Nam", venue: "Sân Bóng Đám Cỏ / Sân Trường" },
  nu: { name: "BĐ Nữ", badge: "Nữ", venue: "Sân Trường" },
  khoi89: { name: "BĐ Khối 8-9", badge: "K8-9", venue: "Sân Trường" },
  khoi67: { name: "BĐ Khối 6-7", badge: "K6-7", venue: "Sân Trường" }
};

export default function App() {
  const [currentDivisionId, setCurrentDivisionId] = useState<string>('nam');
  const [activeTab, setActiveTab] = useState<'matches' | 'standings' | 'bracket' | 'podium'>('matches');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [editingScoreMatch, setEditingScoreMatch] = useState<Match | null>(null);
  const [editingDetailsMatch, setEditingDetailsMatch] = useState<Match | null>(null);

  // Tải dữ liệu từ Google Sheet
  const fetchMatches = (showLoading = true) => {
    if (showLoading) setLoading(true);
    const sheetName = SHEET_NAMES[currentDivisionId] || "BĐ Nam";
    fetch(`${API_URL}?sheet=${encodeURIComponent(sheetName)}`)
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setIsSyncing(false);
        if (Array.isArray(data)) {
          const parsedMatches: Match[] = data.map((item: any, idx: number) => ({
            id: item['STT'] || item['ID'] || item['Trận'] || String(idx + 1),
            homeTeam: item['Đội A'] || item['Team A'] || 'Đội A',
            awayTeam: item['Đội B'] || item['Team B'] || 'Đội B',
            homeScore: item['Tỷ số A'] !== '' && item['Tỷ số A'] !== undefined ? Number(item['Tỷ số A']) : undefined,
            awayScore: item['Tỷ số B'] !== '' && item['Tỷ số B'] !== undefined ? Number(item['Tỷ số B']) : undefined,
            time: item['Thời gian'] || item['Ngày thi đấu'] || '',
            status: item['Trạng thái'] === 'Đã xong' || item['Trạng thái'] === 'finished' ? 'finished' : 'scheduled',
            round: item['Vòng'] || 'Vòng bảng',
          }));
          setMatches(parsedMatches);
        }
      })
      .catch((err) => {
        setLoading(false);
        setIsSyncing(false);
        console.error("Lỗi khi tải dữ liệu từ Google Sheet:", err);
      });
  };

  useEffect(() => {
    fetchMatches(true);
  }, [currentDivisionId]);

  // Cập nhật tỷ số lên Google Sheet
  const handleSaveScore = (updatedMatch: Match) => {
    const sheetName = SHEET_NAMES[currentDivisionId];
    setIsSyncing(true);
    
    // Cập nhật giao diện ngay lập tức
    setMatches((prev) => prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));

    fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheet: sheetName,
        matchId: updatedMatch.id,
        homeScore: updatedMatch.homeScore,
        awayScore: updatedMatch.awayScore,
        status: updatedMatch.status === 'finished' ? 'Đã xong' : 'Chưa thi đấu'
      }),
    }).then(() => {
      setTimeout(() => fetchMatches(false), 1200);
    });
  };

  // Cập nhật thời gian thi đấu lên Google Sheet
  const handleSaveMatchDetails = (updatedMatch: Match) => {
    const sheetName = SHEET_NAMES[currentDivisionId];
    setIsSyncing(true);

    setMatches((prev) => prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));

    fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheet: sheetName,
        matchId: updatedMatch.id,
        time: updatedMatch.time
      }),
    }).then(() => {
      setTimeout(() => fetchMatches(false), 1200);
    });
  };

  const finishedCount = matches.filter((m) => m.status === 'finished').length;
  const totalCount = matches.length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 pb-16">
      {/* Header chính */}
      <Header
        isBtcMode={true}
        onToggleBtcMode={() => {}}
        onResetData={() => {}}
        onOpenTeamManager={() => {}}
        onOpenCsvImport={() => {}}
        onOpenScheduleManager={() => {}}
        currentUser={null}
        onOpenLoginModal={() => {}}
      />

      {/* Tabs chọn 4 nội dung giải đấu */}
      <DivisionTabs
        currentDivisionId={currentDivisionId as any}
        divisions={DIVISIONS_INFO as any}
        onSelectDivision={(id) => setCurrentDivisionId(id)}
        matchesCount={{
          nam: { total: matches.length, finished: finishedCount },
          nu: { total: 0, finished: 0 },
          khoi89: { total: 0, finished: 0 },
          khoi67: { total: 0, finished: 0 }
        }}
      />

      {/* Nội dung chính */}
      <main className="max-w-4xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-4 flex-1 space-y-3.5">
        
        {/* Banner Hero phong cách Thể thao */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm border border-emerald-600/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/15 text-emerald-100 backdrop-blur-xs">
                <span>⚽</span>
                <span>{DIVISIONS_INFO[currentDivisionId]?.name}</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                {DIVISIONS_INFO[currentDivisionId]?.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-emerald-100 font-medium">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-emerald-300" />
                <span>{DIVISIONS_INFO[currentDivisionId]?.venue}</span>
              </div>
            </div>

            {/* Thống kê Tiến độ & Nút Đồng bộ */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => fetchMatches(true)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-emerald-100"
                title="Tải lại dữ liệu từ Google Sheet"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-300' : ''}`} />
              </button>

              <div className="flex items-center gap-2 bg-emerald-950/40 border border-white/10 rounded-2xl p-2.5 sm:p-3 backdrop-blur-md">
                <div className="text-center px-2">
                  <div className="text-xs text-emerald-200 font-medium">Tiến độ</div>
                  <div className="text-base sm:text-lg font-black text-amber-300">
                    {Math.round((finishedCount / (totalCount || 1)) * 100)}%
                  </div>
                </div>
                <div className="w-px h-7 bg-white/20" />
                <div className="text-center px-2">
                  <div className="text-xs text-emerald-200 font-medium">Đã xong</div>
                  <div className="text-base sm:text-lg font-black text-white">
                    {finishedCount}/{totalCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thanh chuyển đổi Chế độ Xem */}
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
                ? 'bg-emerald
