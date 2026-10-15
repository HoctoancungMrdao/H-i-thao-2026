export type DivisionId = 'nam' | 'nu' | 'khoi89' | 'khoi67';

export interface DivisionInfo {
  id: DivisionId;
  name: string;
  shortName: string;
  badge: string;
  venue: string;
  startDate: string;
  description: string;
}

export type MatchStatus = 'scheduled' | 'live' | 'finished';

export type MatchRound = 'group' | 'quarter' | 'semi' | 'third_place' | 'final';

export interface Match {
  id: string;
  matchNumber: number;
  divisionId: DivisionId;
  round: MatchRound;
  roundName: string; // e.g. "Bảng A", "Tứ kết 1", "Bán kết 1", "Chung kết"
  group?: 'A' | 'B' | 'C' | 'D';
  pairCode?: string; // e.g. "A1-A2", "TK1 - TK2", "BK1 - BK2"
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  homePen?: number | null;
  awayPen?: number | null;
  hasPenalty?: boolean;
  time: string; // e.g. "07:30, Thứ 7, 17/10"
  pitch: string; // e.g. "Sân 1", "Sân cỏ nhân tạo Thanh Nghĩa"
  status: MatchStatus;
  winnerTeam?: string;
  note?: string;
}

export interface GroupTeamStanding {
  teamCode: string; // e.g. "A1"
  teamName: string; // e.g. "Đội A1"
  group: 'A' | 'B' | 'C' | 'D';
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number; // goals for (bàn thắng)
  ga: number; // goals against (bàn thua)
  gd: number; // goal difference (hiệu số)
  points: number; // tổng điểm
  headToHeadNote?: string;
  rank?: number;
}

export interface DivisionRankings {
  champion: string;
  runnerUp: string;
  thirdPlace1: string;
  thirdPlace2?: string;
}

export interface DivisionData {
  division: DivisionInfo;
  groups: ('A' | 'B' | 'C' | 'D')[];
  teams: { [code: string]: string }; // e.g. { "A1": "Đội A1", ... }
  matches: Match[];
  rankings: DivisionRankings;
}

export interface TournamentStore {
  divisions: Record<DivisionId, DivisionData>;
}
