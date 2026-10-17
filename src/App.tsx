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

const ADMIN_PASSWORD = "123";

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

const STORAGE_KEY = 'giai_bong_da_data_v2026_full';

// Dữ liệu khởi tạo chuẩn 31 trận đấu từ ảnh sơ đồ
const INITIAL_DATA: Record<string, { name: string; venue: string; matches: Match[] }> = {
  nam: {
    name: "BĐ Nam",
    venue: "Sân Bóng Đám Cỏ / Sân Trường",
    matches: [
      // VÒNG BẢNG - LƯỢT 1 (Trận 1 đến Trận 8)
      { id: '1', homeTeam: '11A3', awayTeam: '10A4', time: 'Chưa xếp lịch', status: 'scheduled', round: 'Vòng 1', group: 'Bảng A' },
      { id: '2', homeTeam: '1
