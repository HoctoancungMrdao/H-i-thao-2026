import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  BarChart2, 
  GitFork, 
  Lock, 
  Unlock, 
  X, 
  LogOut,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';

// ---------------------------------------------------------------------------
// 1. CẤU HÌNH FIREBASE REALTIME DATABASE (ĐÃ TÍCH HỢP MÃ CỦA ANH/CHỊ)
// ---------------------------------------------------------------------------
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyANwlcNVkVDj8Z5Z7A8jfGZirrWOdpUjuk",
  authDomain: "hoithao2026-2027.firebaseapp.com",
  databaseURL: "https://hoithao2026-2027-default-rtdb.firebaseio.com",
  projectId: "hoithao2026-2027",
  storageBucket: "hoithao2026-2027.firebasestorage.app",
  messagingSenderId: "771493632",
  appId: "1:771493632:web:687e1cb3cd88dbe081ede5",
  measurementId: "G-3SLJLVL9ZY"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ---------------------------------------------------------------------------
// 2. CẤU HÌNH TÀI KHOẢN & DỮ LIỆU BAN ĐẦU
// ---------------------------------------------------------------------------
const ACCOUNTS: Record<string, { pass: string; name: string; allowedDivs: string[] }> = {
  "Admin": { 
    pass: "Khuon@247", 
    name: "Ban Tổ Chức (Toàn quyền)", 
    allowedDivs: ["nam", "nu", "khoi89", "khoi67"] 
  },
  "Phanhieu1": { 
    pass: "Thoai2026", 
    name: "Quản Lý BĐ Khối 6-7", 
    allowedDivs: ["khoi67"] 
  },
  "Phanhieu2": { 
    pass: "Lam2026", 
    name: "Quản Lý BĐ Khối 8-9", 
    allowedDivs: ["khoi89"] 
  }
};

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
  codePair?: string;
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

const INITIAL_DATA: Record<string, { name: string; matches: Match[] }> = {
  nam: {
    name: "BĐ Nam",
    matches: [
      { id: 'NAM-1', homeTeam: '11A3', awayTeam: '10A4', time: '', status: 'scheduled', round: 'Trận 1', group: 'Bảng A', codePair: 'A1-A2' },
      { id: 'NAM-2', homeTeam: '10A5', awayTeam: '11A5', time: '', status: 'scheduled', round: 'Trận 2', group: 'Bảng A', codePair: 'A3-A4' },
      { id: 'NAM-3', homeTeam: '12A4', awayTeam: '12A2', time: '', status: 'scheduled', round: 'Trận 3', group: 'Bảng B', codePair: 'B1-B2' },
      { id: 'NAM-4', homeTeam: '10A6', awayTeam: '12A3', time: '', status: 'scheduled', round: 'Trận 4', group: 'Bảng B', codePair: 'B3-B4' },
      { id: 'NAM-5', homeTeam: '10A2', awayTeam: '10A3', time: '', status: 'scheduled', round: 'Trận 5', group: 'Bảng C', codePair: 'C1-C2' },
      { id: 'NAM-6', homeTeam: '11A1', awayTeam: '10A1', time: '', status: 'scheduled', round: 'Trận 6', group: 'Bảng C', codePair: 'C3-C4' },
      { id: 'NAM-7', homeTeam: '12A1', awayTeam: '11A4', time: '', status: 'scheduled', round: 'Trận 7', group: 'Bảng D', codePair: 'D1-D2' },
      { id: 'NAM-8', homeTeam: '12A5', awayTeam: '10A7', time: '', status: 'scheduled', round: 'Trận 8', group: 'Bảng D', codePair: 'D3-D4' },
      { id: 'NAM-9', homeTeam: '11A3', awayTeam: '10A5', time: '', status: 'scheduled', round: 'Trận 9', group: 'Bảng A', codePair: 'A1-A3' },
      { id: 'NAM-10', homeTeam: '10A4', awayTeam: '11A5', time: '', status: 'scheduled', round: 'Trận 10', group: 'Bảng A', codePair: 'A2-A4' },
      { id: 'NAM-11', homeTeam: '12A4', awayTeam: '10A6', time: '', status: 'scheduled', round: 'Trận 11', group: 'Bảng B', codePair: 'B1-B3' },
      { id: 'NAM-12', homeTeam: '12A2', awayTeam: '12A3', time: '', status: 'scheduled', round: 'Trận 12', group: 'Bảng B', codePair: 'B2-B4' },
      { id: 'NAM-13', homeTeam: '10A2', awayTeam: '11A1', time: '', status: 'scheduled', round: 'Trận 13', group: 'Bảng C', codePair: 'C1-C3' },
      { id: 'NAM-14', homeTeam: '10A3', awayTeam: '10A1', time: '', status: 'scheduled', round: 'Trận 14', group: 'Bảng C', codePair: 'C2-C4' },
      { id: 'NAM-15', homeTeam: '12A1', awayTeam: '12A5', time: '', status: 'scheduled', round: 'Trận 15', group: 'Bảng D', codePair: 'D1-D3' },
      { id: 'NAM-16', homeTeam: '11A4', awayTeam: '10A7', time: '', status: 'scheduled', round: 'Trận 16', group: 'Bảng D', codePair: 'D2-D4' },
      { id: 'NAM-17', homeTeam: '11A3', awayTeam: '11A5', time: '', status: 'scheduled', round: 'Trận 17', group: 'Bảng A', codePair: 'A1-A4' },
      { id: 'NAM-18', homeTeam: '10A4', awayTeam: '10A5', time: '', status: 'scheduled', round: 'Trận 18', group: 'Bảng A', codePair: 'A2-A3' },
      { id: 'NAM-19', homeTeam: '12A4', awayTeam: '12A3', time: '', status: 'scheduled', round: 'Trận 19', group: 'Bảng B', codePair: 'B1-B4' },
      { id: 'NAM-20', homeTeam: '12A2', awayTeam: '10A6', time: '', status: 'scheduled', round: 'Trận 20', group: 'Bảng B', codePair: 'B2-B3' },
      { id: 'NAM-21', homeTeam: '10A2', awayTeam: '10A1', time: '', status: 'scheduled', round: 'Trận 21', group: 'Bảng C', codePair: 'C1-C4' },
      { id: 'NAM-22', homeTeam: '10A3', awayTeam: '11A1', time: '', status: 'scheduled', round: 'Trận 22', group: 'Bảng C', codePair: 'C2-C3' },
      { id: 'NAM-23', homeTeam: '12A1', awayTeam: '10A7', time: '', status: 'scheduled', round: 'Trận 23', group: 'Bảng D', codePair: 'D1-D4' },
      { id: 'NAM-24', homeTeam: '11A4', awayTeam: '12A5', time: '', status: 'scheduled', round: 'Trận 24', group: 'Bảng D', codePair: 'D2-D3' },
      { id: 'NAM-25', homeTeam: 'Nhất A', awayTeam: 'Nhì C', time: '', status: 'scheduled', round: 'Trận 25 (TK1)', codePair: 'TK1' },
      { id: 'NAM-26', homeTeam: 'Nhất D', awayTeam: 'Nhì B', time: '', status: 'scheduled', round: 'Trận 26 (TK2)', codePair: 'TK2' },
      { id: 'NAM-27', homeTeam: 'Nhất B', awayTeam: 'Nhì D', time: '', status: 'scheduled', round: 'Trận 27 (TK3)', codePair: 'TK3' },
      { id: 'NAM-28', homeTeam: 'Nhất C', awayTeam: 'Nhì A', time: '', status: 'scheduled', round: 'Trận 28 (TK4)', codePair: 'TK4' },
      { id: 'NAM-29', homeTeam: 'TK1', awayTeam: 'TK2', time: '', status: 'scheduled', round: 'Trận 29 (BK1)', codePair: 'BK1' },
      { id: 'NAM-30', homeTeam: 'TK3', awayTeam: 'TK4', time: '', status: 'scheduled', round: 'Trận 30 (BK2)', codePair: 'BK2' },
      { id: 'NAM-31', homeTeam: 'BK1', awayTeam: 'BK2', time: '', status: 'scheduled', round: 'Trận 31 (CK)', codePair: 'CK' }
    ]
  },
  nu: {
    name: "BĐ Nữ",
    matches: [
      { id: 'NU-1', homeTeam: 'Phân hiệu 1', awayTeam: '11A1', time: '', status: 'scheduled', round: 'Trận 1', group: 'Bảng A', codePair: 'A1-A2' },
      { id: 'NU-2', homeTeam: '12A3', awayTeam: '10A1', time: '', status: 'scheduled', round: 'Trận 2', group: 'Bảng B', codePair: 'B1-B2' },
      { id: 'NU-3', homeTeam: '11A5', awayTeam: '10A3', time: '', status: 'scheduled', round: 'Trận 3', group: 'Bảng C', codePair: 'C1-C2' },
      { id: 'NU-4', homeTeam: 'Phân hiệu 1', awayTeam: '12A5', time: '', status: 'scheduled', round: 'Trận 4', group: 'Bảng A', codePair: 'A1-A3' },
      { id: 'NU-5', homeTeam: '12A3', awayTeam: '12A1', time: '', status: 'scheduled', round: 'Trận 5', group: 'Bảng B', codePair: 'B1-B3' },
      { id: 'NU-6', homeTeam: '11A5', awayTeam: 'Phân hiệu 2', time: '', status: 'scheduled', round: 'Trận 6', group: 'Bảng C', codePair: 'C1-C3' },
      { id: 'NU-7', homeTeam: '11A1', awayTeam: '12A5', time: '', status: 'scheduled', round: 'Trận 7', group: 'Bảng A', codePair: 'A2-A3' },
      { id: 'NU-8', homeTeam: '10A1', awayTeam: '12A1', time: '', status: 'scheduled', round: 'Trận 8', group: 'Bảng B', codePair: 'B2-B3' },
      { id: 'NU-9', homeTeam: '10A3', awayTeam: 'Phân hiệu 2', time: '', status: 'scheduled', round: 'Trận 9', group: 'Bảng C', codePair: 'C2-C3' },
      { id: 'NU-10', homeTeam: 'Nhất A', awayTeam: 'Nhì số 1', time: '', status: 'scheduled', round: 'Trận 10 (BK1)', codePair: 'BK1' },
      { id: 'NU-11', homeTeam: 'Nhất B', awayTeam: 'Nhất C', time: '', status: 'scheduled', round: 'Trận 11 (BK2)', codePair: 'BK2' },
      { id: 'NU-12', homeTeam: 'BK1', awayTeam: 'BK2', time: '', status: 'scheduled', round: 'Trận 12 (CK)', codePair: 'CK' }
    ]
  },
  khoi89: {
    name: "BĐ Khối 8-9",
    matches: [
      { id: 'K89-1', homeTeam: 'Lớp 8/2', awayTeam: 'Lớp 9/8', time: '', status: 'scheduled', round: 'Trận 1', group: 'Bảng A', codePair: 'A1-A2' },
      { id: 'K89-2', homeTeam: 'Lớp 8/1', awayTeam: 'Lớp 8/3', time: '', status: 'scheduled', round: 'Trận 2', group: 'Bảng A', codePair: 'A3-A4' },
      { id: 'K89-3', homeTeam: 'Lớp 9/7', awayTeam: 'Lớp 9/1', time: '', status: 'scheduled', round: 'Trận 3', group: 'Bảng B', codePair: 'B1-B2' },
      { id: 'K89-4', homeTeam: 'Lớp 9/3', awayTeam: 'Lớp 9/2', time: '', status: 'scheduled', round: 'Trận 4', group: 'Bảng B', codePair: 'B3-B4' },
      { id: 'K89-5', homeTeam: 'Lớp 9/6', awayTeam: 'Lớp 9/9', time: '', status: 'scheduled', round: 'Trận 5', group: 'Bảng C', codePair: 'C1-C2' },
      { id: 'K89-6', homeTeam: 'Lớp 8/2', awayTeam: 'Lớp 8/1', time: '', status: 'scheduled', round: 'Trận 6', group: 'Bảng A', codePair: 'A1-A3' },
      { id: 'K89-7', homeTeam: 'Lớp 9/8', awayTeam: 'Lớp 8/3', time: '', status: 'scheduled', round: 'Trận 7', group: 'Bảng A', codePair: 'A2-A4' },
      { id: 'K89-8', homeTeam: 'Lớp 9/7', awayTeam: 'Lớp 9/3', time: '', status: 'scheduled', round: 'Trận 8', group: 'Bảng B', codePair: 'B1-B3' },
      { id: 'K89-9', homeTeam: 'Lớp 9/1', awayTeam: 'Lớp 9/2', time: '', status: 'scheduled', round: 'Trận 9', group: 'Bảng B', codePair: 'B2-B4' },
      { id: 'K89-10', homeTeam: 'Lớp 9/6', awayTeam: 'Lớp 9/4', time: '', status: 'scheduled', round: 'Trận 10', group: 'Bảng C', codePair: 'C1-C3' },
      { id: 'K89-11', homeTeam: 'Lớp 8/2', awayTeam: 'Lớp 8/3', time: '', status: 'scheduled', round: 'Trận 11', group: 'Bảng A', codePair: 'A1-A4' },
      { id: 'K89-12', homeTeam: 'Lớp 9/8', awayTeam: 'Lớp 8/1', time: '', status: 'scheduled', round: 'Trận 12', group: 'Bảng A', codePair: 'A2-A3' },
      { id: 'K89-13', homeTeam: 'Lớp 9/7', awayTeam: 'Lớp 9/2', time: '', status: 'scheduled', round: 'Trận 13', group: 'Bảng B', codePair: 'B1-B4' },
      { id: 'K89-14', homeTeam: 'Lớp 9/1', awayTeam: 'Lớp 9/3', time: '', status: 'scheduled', round: 'Trận 14', group: 'Bảng B', codePair: 'B2-B3' },
      { id: 'K89-15', homeTeam: 'Lớp 9/9', awayTeam: 'Lớp 9/4', time: '', status: 'scheduled', round: 'Trận 15', group: 'Bảng C', codePair: 'C2-C3' },
      { id: 'K89-16', homeTeam: 'Nhất A', awayTeam: 'Nhất B', time: '', status: 'scheduled', round: 'Trận 16 (BK1)', codePair: 'BK1' },
      { id: 'K89-17', homeTeam: 'Nhất C', awayTeam: 'Nhì AB', time: '', status: 'scheduled', round: 'Trận 17 (BK2)', codePair: 'BK2' },
      { id: 'K89-18', homeTeam: 'BK1', awayTeam: 'BK2', time: '', status: 'scheduled', round: 'Trận 18 (CK)', codePair: 'CK' }
    ]
  },
  khoi67: {
    name: "BĐ Khối 6-7",
    matches: [
      { id: 'K67-1', homeTeam: 'Lớp 7/6', awayTeam: 'Lớp 7/4', time: '', status: 'scheduled', round: 'Trận 1', group: 'Bảng A', codePair: 'A1-A2' },
      { id: 'K67-2', homeTeam: 'Lớp 7/5', awayTeam: 'Lớp 6/4', time: '', status: 'scheduled', round: 'Trận 2', group: 'Bảng A', codePair: 'A3-A4' },
      { id: 'K67-3', homeTeam: 'Lớp 7/6', awayTeam: 'Lớp 6/5', time: '', status: 'scheduled', round: 'Trận 3', group: 'Bảng A', codePair: 'A1-A5' },
      { id: 'K67-4', homeTeam: 'Lớp 7/4', awayTeam: 'Lớp 7/5', time: '', status: 'scheduled', round: 'Trận 4', group: 'Bảng A', codePair: 'A2-A3' },
      { id: 'K67-5', homeTeam: 'Lớp 6/4', awayTeam: 'Lớp 6/5', time: '', status: 'scheduled', round: 'Trận 5', group: 'Bảng A', codePair: 'A4-A5' },
      { id: 'K67-6', homeTeam: 'Lớp 7/6', awayTeam: 'Lớp 7/5', time: '', status: 'scheduled', round: 'Trận 6', group: 'Bảng A', codePair: 'A1-A3' },
      { id: 'K67-7', homeTeam: 'Lớp 7/4', awayTeam: 'Lớp 6/4', time: '', status: 'scheduled', round: 'Trận 7', group: 'Bảng A', codePair: 'A2-A4' },
      { id: 'K67-8', homeTeam: 'Lớp 7/5', awayTeam: 'Lớp 6/5', time: '', status: 'scheduled', round: 'Trận 8', group: 'Bảng A', codePair: 'A3-A5' },
      { id: 'K67-9', homeTeam: 'Lớp 6/1', awayTeam: 'Lớp 6/2', time: '', status: 'scheduled', round: 'Trận 9', group: 'Bảng B', codePair: 'B1-B2' },
      { id: 'K67-10', homeTeam: 'Lớp 6/3', awayTeam: 'Lớp 7/2', time: '', status: 'scheduled', round: 'Trận 10', group: 'Bảng C', codePair: 'C1-C2' },
      { id: 'K67-11', homeTeam: 'Lớp 6/1', awayTeam: 'Lớp 7/1', time: '', status: 'scheduled', round: 'Trận 11', group: 'Bảng B', codePair: 'B1-B3' },
      { id: 'K67-12', homeTeam: 'Lớp 6/3', awayTeam: 'Lớp 7/3', time: '', status: 'scheduled', round: 'Trận 12', group: 'Bảng C', codePair: 'C1-C3' },
      { id: 'K67-13', homeTeam: 'Lớp 6/2', awayTeam: 'Lớp 7/1', time: '', status: 'scheduled', round: 'Trận 13', group: 'Bảng B', codePair: 'B2-B3' },
      { id: 'K67-14', homeTeam: 'Lớp 7/2', awayTeam: 'Lớp 7/3', time: '', status: 'scheduled', round: 'Trận 14', group: 'Bảng C', codePair: 'C2-C3' },
      { id: 'K67-15', homeTeam: 'Lớp 7/6', awayTeam: 'Lớp 6/4', time: '', status: 'scheduled', round: 'Trận 15', group: 'Bảng A', codePair: 'A1-A4' },
      { id: 'K67-16', homeTeam: 'Lớp 7/4', awayTeam: 'Lớp 6/5', time: '', status: 'scheduled', round: 'Trận 16', group: 'Bảng A', codePair: 'A2-A5' },
      { id: 'K67-17', homeTeam: 'Nhất A', awayTeam: 'Nhất B', time: '', status: 'scheduled', round: 'Trận 17 (BK1)', codePair: 'BK1' },
      { id: 'K67-18', homeTeam: 'Nhì A', awayTeam: 'Nhất C', time: '', status: 'scheduled', round: 'Trận 18 (BK2)', codePair: 'BK2' },
      { id: 'K67-19', homeTeam: 'BK1', awayTeam: 'BK2', time: '', status: 'scheduled', round: 'Trận 19 (CK)', codePair: 'CK' }
    ]
  }
};

// ---------------------------------------------------------------------------
// 3. MAIN COMPONENT (GIAO DIỆN CHÍNH)
// ---------------------------------------------------------------------------
export default function App() {
  const [currentDiv, setCurrentDiv] = useState<string>('nam');
  const [activeTab, setActiveTab] = useState<'matches' | 'standings' | 'bracket'>('matches');
  
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [inputUsername, setInputUsername] = useState<string>('');
  const [inputPassword, setInputPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  const [tournamentData, setTournamentData] = useState(INITIAL_DATA);

  const [editingScoreMatch, setEditingScoreMatch] = useState<Match | null>(null);
  const [editingTimeMatch, setEditingTimeMatch] = useState<Match | null>(null);

  const [tempHomeScore, setTempHomeScore] = useState<string>('');
  const [tempAwayScore, setTempAwayScore] = useState<string>('');
  const [tempMatchStatus, setTempMatchStatus] = useState<Match['status']>('scheduled');
  const [tempTime, setTempTime] = useState<string>('');

  // 🔄 KẾT NỐI REALTIME DATABASE: Đồng bộ liên tục dữ liệu từ Server về Máy người dùng
  useEffect(() => {
    const tournamentRef = ref(db, 'tournamentData');
    const unsubscribe = onValue(tournamentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTournamentData(data);
      } else {
        // Nếu database trống, tự động nạp dữ liệu mặc định ban đầu
        set(ref(db, 'tournamentData'), INITIAL_DATA);
      }
    });

    return () => unsubscribe();
  }, []);

  // Kiểm tra quyền sửa
  const canEditCurrentDiv = useMemo(() => {
    if (!currentUser || !ACCOUNTS[currentUser]) return false;
    return ACCOUNTS[currentUser].allowedDivs.includes(currentDiv);
  }, [currentUser, currentDiv]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const userKey = inputUsername.trim();
    const account = ACCOUNTS[userKey];

    if (account && account.pass === inputPassword) {
      setCurrentUser(userKey);
      setLoginModalOpen(false);
      setInputUsername('');
      setInputPassword('');
      setLoginError('');
    } else {
      setLoginError('Tên tài khoản hoặc Mật khẩu không chính xác!');
    }
  };

  // 💾 LƯU TỶ SỐ TRỰC TIẾP LÊN FIREBASE REALTIME
  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScoreMatch) return;

    const hScore = tempHomeScore !== '' ? parseInt(tempHomeScore, 10) : undefined;
    const aScore = tempAwayScore !== '' ? parseInt(tempAwayScore, 10) : undefined;

    const divData = tournamentData[currentDiv];
    const updatedMatches = divData.matches.map((m) => {
      if (m.id === editingScoreMatch.id) {
        return {
          ...m,
          homeScore: hScore,
          awayScore: aScore,
          status: tempMatchStatus
        };
      }
      return m;
    });

    const newTournamentData = {
      ...tournamentData,
      [currentDiv]: { ...divData, matches: updatedMatches }
    };

    // Đẩy dữ liệu mới lên Firebase Server
    set(ref(db, 'tournamentData'), newTournamentData);
    setEditingScoreMatch(null);
  };

  // 💾 LƯU GIỜ THI ĐẤU TRỰC TIẾP LÊN FIREBASE REALTIME
  const handleSaveTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTimeMatch) return;

    const divData = tournamentData[currentDiv];
    const updatedMatches = divData.matches.map((m) => 
      m.id === editingTimeMatch.id ? { ...m, time: tempTime } : m
    );

    const newTournamentData = {
      ...tournamentData,
      [currentDiv]: { ...divData, matches: updatedMatches }
    };

    // Đẩy dữ liệu mới lên Firebase Server
    set(ref(db, 'tournamentData'), newTournamentData);
    setEditingTimeMatch(null);
  };

  const openScoreModal = (match: Match) => {
    setEditingScoreMatch(match);
    setTempHomeScore(match.homeScore !== undefined ? String(match.homeScore) : '');
    setTempAwayScore(match.awayScore !== undefined ? String(match.awayScore) : '');
    setTempMatchStatus(match.status);
  };

  const openTimeModal = (match: Match) => {
    setEditingTimeMatch(match);
    setTempTime(match.time || '');
  };

  // Tính Bảng xếp hạng tự động
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
      {/* HEADER */}
      <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-3 py-2.5 flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white p-0.5 shadow-md flex-shrink-0 flex items-center justify-center">
              <img 
                src="Logo THCS-THPT Trần Trường Sinh 2026.png" 
                alt="Logo Trường" 
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div>
              <h1 className="text-xs md:text-sm lg:text-base font-black tracking-tight uppercase leading-snug">
                HỘI THAO TRƯỜNG THCS-THPT TRẦN TRƯỜNG SINH NĂM HỌC 2026-2027
              </h1>
              <p className="text-[10px] md:text-xs text-emerald-200">Lịch thi đấu & Kết quả Cập nhật Trực tiếp</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-emerald-900/90 px-2.5 py-1.5 rounded-xl border border-emerald-600 text-xs font-bold text-amber-300">
                <Unlock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{ACCOUNTS[currentUser]?.name || currentUser}</span>
                <span className="sm:hidden">{currentUser}</span>
                <button 
                  onClick={() => setCurrentUser(null)}
                  className="ml-1 p-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-colors border border-emerald-500 shadow-xs"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CHỌN NỘI DUNG */}
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

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        
        {/* TABS CHUYỂN ĐỔI GIAO DIỆN */}
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

        {/* 1. LỊCH THI ĐẤU & TỈ SỐ */}
        {activeTab === 'matches' && (
          <div className="space-y-3">
            {currentMatches.map((match) => (
              <div
                key={match.id}
                className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 hover:border-emerald-500 transition-colors flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 text-slate-700 flex-wrap">
                    <span className="text-emerald-800 font-extrabold">{match.round}</span>
                    {match.group && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600">{match.group}</span>
                      </>
                    )}
                    {match.codePair && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-black border border-slate-200">
                          {match.codePair}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {match.time ? (
                      <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-extrabold">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{match.time}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal italic text-[11px] bg-slate-50 px-2 py-0.5 rounded">
                        Chưa xếp giờ
                      </span>
                    )}

                    {canEditCurrentDiv && (
                      <button
                        onClick={() => openTimeModal(match)}
                        className="text-emerald-700 hover:bg-emerald-100 font-extrabold text-[11px] bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md transition-colors"
                      >
                        {match.time ? 'Sửa giờ' : '+ Thêm giờ'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-1">
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
                    ) : match.status === 'live' ? (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md mt-1 uppercase animate-pulse">
                        TRỰC TIẾP
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

                {canEditCurrentDiv && (
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => openScoreModal(match)}
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

        {/* 2. BẢNG XẾP HẠNG TỰ ĐỘNG */}
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
                          <th className="py-2.5 px-2 text-center">B</th>
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

        {/* 3. NHÁNH ĐẤU KNOCKOUT */}
        {activeTab === 'bracket' && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Sơ đồ thi đấu Knockout</h3>
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
                  <div className="text-[10px] text-slate-400 text-right">{m.time || 'Chưa xếp giờ'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL ĐĂNG NHẬP */}
      {loginModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl relative">
            <button 
              onClick={() => setLoginModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-black text-emerald-800 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" /> Đăng nhập Quản trị
            </h2>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-2.5 rounded-xl mb-4">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 mb-1">Tên tài khoản</label>
                <input 
                  type="text" 
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-600"
                  placeholder="Nhập tên tài khoản..."
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Mật khẩu</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-600 pr-9"
                    placeholder="Nhập mật khẩu..."
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl transition-colors shadow-sm"
              >
                Đăng nhập
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CẬP NHẬT TỶ SỐ */}
      {editingScoreMatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl relative">
            <button 
              onClick={() => setEditingScoreMatch(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-black text-slate-800 mb-4">Cập nhật Tỉ Số</h2>

            <form onSubmit={handleSaveScore} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 truncate">{editingScoreMatch.homeTeam}</label>
                  <input 
                    type="number" 
                    min="0"
                    value={tempHomeScore}
                    onChange={(e) => setTempHomeScore(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-center text-base"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 truncate">{editingScoreMatch.awayTeam}</label>
                  <input 
                    type="number" 
                    min="0"
                    value={tempAwayScore}
                    onChange={(e) => setTempAwayScore(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-center text-base"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Trạng thái trận đấu</label>
                <select 
                  value={tempMatchStatus}
                  onChange={(e) => setTempMatchStatus(e.target.value as Match['status'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  <option value="scheduled">Sắp đấu</option>
                  <option value="live">Đang diễn ra</option>
                  <option value="finished">Kết thúc</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingScoreMatch(null)}
                  className="flex-1 py-2 bg-slate-100 text-slate-600 font-extrabold text-xs rounded-xl hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-emerald-600 text-white font-extrabold text-xs rounded-xl hover:bg-emerald-700 shadow-sm"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CẬP NHẬT THỜI GIAN */}
      {editingTimeMatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl relative">
            <button 
              onClick={() => setEditingTimeMatch(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-black text-slate-800 mb-1">Xếp Giờ Thi Đấu</h2>
            <p className="text-xs text-slate-500 mb-4">{editingTimeMatch.round} - {editingTimeMatch.homeTeam} vs {editingTimeMatch.awayTeam}</p>

            <form onSubmit={handleSaveTime} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Thời gian (VD: 07:30 15/10)</label>
                <input 
                  type="text" 
                  value={tempTime}
                  onChange={(e) => setTempTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                  placeholder="Nhập giờ thi đấu..."
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingTimeMatch(null)}
                  className="flex-1 py-2 bg-slate-100 text-slate-600 font-extrabold text-xs rounded-xl hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-emerald-600 text-white font-extrabold text-xs rounded-xl hover:bg-emerald-700 shadow-sm"
                >
                  Lưu Giờ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
