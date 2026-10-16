import { DivisionData, DivisionId, Match, DivisionRankings } from '../types';

export function parseTournamentCsv(csvText: string, divisionId: DivisionId = 'nam'): Partial<DivisionData> {
  const lines = csvText.split(/\r?\n/).map(l => l.trim());
  if (lines.length === 0) return {};

  const teams: { [code: string]: string } = {};
  const matches: Match[] = [];
  const rankings: DivisionRankings = {
    champion: '',
    runnerUp: '',
    thirdPlace1: '',
    thirdPlace2: ''
  };

  let title = 'MÔN BÓNG ĐÁ';
  let venue = 'Sân cỏ nhân tạo Thanh Nghĩa';

  // Helper to split CSV line safely handling quotes, supporting comma, tab, semicolon
  const parseLine = (line: string): string[] => {
    const delimiter = line.includes('\t') ? '\t' : (line.includes(',') ? ',' : (line.includes(';') ? ';' : ','));
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const parsedLines = lines.map(parseLine);

  // Helper to extract score and teams from columns
  const extractScoreAndTeams = (cols: string[], initialHome: string, initialAway: string) => {
    let homeScore: number | null = null;
    let awayScore: number | null = null;
    let homeTeam = initialHome;
    let awayTeam = initialAway;

    // Pattern 1: Separate columns [homeScore, '-', awayScore]
    const dashIdx = cols.indexOf('-');
    if (dashIdx > 1 && dashIdx < cols.length - 1) {
      const s1 = parseInt(cols[dashIdx - 1], 10);
      const s2 = parseInt(cols[dashIdx + 1], 10);
      if (!isNaN(s1) && !isNaN(s2)) {
        homeScore = s1;
        awayScore = s2;
      }
      if (cols[dashIdx - 2] && !/^\d+$/.test(cols[dashIdx - 2])) homeTeam = cols[dashIdx - 2];
      if (cols[dashIdx + 2] && !/^\d+$/.test(cols[dashIdx + 2])) awayTeam = cols[dashIdx + 2];
    }

    // Pattern 2: Single cell contains score e.g. "2 - 1", "2-1", "0 : 3"
    if (homeScore === null) {
      const scoreCellIdx = cols.findIndex(c => /^(\d+)\s*[-:]\s*(\d+)$/.test(c.trim()));
      if (scoreCellIdx !== -1) {
        const m = cols[scoreCellIdx].trim().match(/^(\d+)\s*[-:]\s*(\d+)$/);
        if (m) {
          homeScore = parseInt(m[1], 10);
          awayScore = parseInt(m[2], 10);
          if (scoreCellIdx > 0 && cols[scoreCellIdx - 1] && !/^\d+$/.test(cols[scoreCellIdx - 1])) {
            homeTeam = cols[scoreCellIdx - 1];
          }
          if (scoreCellIdx < cols.length - 1 && cols[scoreCellIdx + 1] && !/^\d+$/.test(cols[scoreCellIdx + 1])) {
            awayTeam = cols[scoreCellIdx + 1];
          }
        }
      }
    }

    return { homeScore, awayScore, homeTeam, awayTeam };
  };

  // Parse title & venue & rankings
  parsedLines.forEach(cols => {
    for (let c of cols) {
      if (c.toUpperCase().includes('MÔN BÓNG ĐÁ')) {
        title = c;
      }
      if (c.includes('Địa điểm:')) {
        const parts = c.split('Địa điểm:');
        if (parts[1]) venue = parts[1].trim();
      }
      if (c.includes('Đội vô địch:')) {
        rankings.champion = c.replace('Đội vô địch:', '').trim();
      }
      if (c.includes('Đội hạng nhì:')) {
        rankings.runnerUp = c.replace('Đội hạng nhì:', '').trim();
      }
      if (c.includes('Đội hạng ba:')) {
        const third = c.replace('Đội hạng ba:', '').trim();
        if (!rankings.thirdPlace1) rankings.thirdPlace1 = third;
        else if (!rankings.thirdPlace2 && third !== rankings.thirdPlace1) rankings.thirdPlace2 = third;
      }
    }
  });

  // Parse Teams from BẢNG headers
  parsedLines.forEach((cols, rIdx) => {
    const colJoined = cols.join(' ');
    ['BẢNG A', 'BẢNG B', 'BẢNG C', 'BẢNG D'].forEach(grpStr => {
      if (colJoined.includes(grpStr)) {
        const grpChar = grpStr.split(' ')[1] as 'A' | 'B' | 'C' | 'D';
        for (let i = 1; i <= 6; i++) {
          const row = parsedLines[rIdx + i];
          if (!row) break;
          const codeCandidate = row.find(c => new RegExp(`^${grpChar}\\d+$`).test(c));
          if (codeCandidate) {
            const codeIndex = row.indexOf(codeCandidate);
            const teamName = row[codeIndex + 1];
            if (teamName && !teamName.includes('BẢNG')) {
              teams[codeCandidate] = teamName;
            }
          }
        }
      }
    });
  });

  // Parse Group Matches
  let inGroupMatches = false;
  let inKnockout = '';

  parsedLines.forEach((cols, idx) => {
    const raw = cols.join(' ');

    if (raw.includes('LỊCH THI ĐẤU VÒNG BẢNG')) {
      inGroupMatches = true;
      inKnockout = '';
      return;
    }
    if (raw.includes('VÒNG TỨ KẾT:')) {
      inGroupMatches = false;
      inKnockout = 'quarter';
      return;
    }
    if (raw.includes('VÒNG BÁN KẾT:')) {
      inGroupMatches = false;
      inKnockout = 'semi';
      return;
    }
    if (raw.includes('TRẬN CHUNG KẾT:')) {
      inGroupMatches = false;
      inKnockout = 'final';
      return;
    }

    if (inGroupMatches) {
      const matchNumCol = cols.find(c => /^\d+$/.test(c));
      if (matchNumCol) {
        const matchNumber = parseInt(matchNumCol, 10);
        const pairCode = cols.find(c => /^[A-D]\d-[A-D]\d$/.test(c));
        const timeCol = cols.find(c => c.toLowerCase().includes('thứ') || c.toLowerCase().includes('h') || c.includes('/10') || c.includes('/2026'));
        const pitchCol = cols.find(c => c.toLowerCase().includes('sân'));

        if (pairCode) {
          const grp = pairCode[0] as 'A' | 'B' | 'C' | 'D';
          const p1 = pairCode.split('-')[0];
          const p2 = pairCode.split('-')[1];
          const defaultHome = teams[p1] || p1;
          const defaultAway = teams[p2] || p2;

          const { homeScore, awayScore, homeTeam, awayTeam } = extractScoreAndTeams(cols, defaultHome, defaultAway);

          let winner: string | undefined;
          if (homeScore !== null && awayScore !== null) {
            if (homeScore > awayScore) winner = homeTeam;
            else if (awayScore > homeScore) winner = awayTeam;
          }

          matches.push({
            id: `${divisionId}-m${matchNumber}`,
            matchNumber,
            divisionId,
            round: 'group',
            roundName: `Bảng ${grp}`,
            group: grp,
            pairCode,
            homeTeam,
            awayTeam,
            homeScore,
            awayScore,
            time: timeCol || '7h30, Thứ 7, 17/10',
            pitch: pitchCol || venue || 'Sân cỏ nhân tạo Thanh Nghĩa',
            status: homeScore !== null ? 'finished' : 'scheduled',
            winnerTeam: winner,
          });
        }
      }
    }

    // Knockout Matches
    if (inKnockout) {
      const roundTag = cols.find(c => /^(TK[1-4]|BK[1-2]|CK)$/.test(c));
      if (roundTag) {
        const timeCol = cols.find(c => c.toLowerCase().includes('thứ') || c.toLowerCase().includes('h') || c.includes('/10') || c.includes('/2026'));
        const pitchCol = cols.find(c => c.toLowerCase().includes('sân'));
        const { homeScore, awayScore, homeTeam, awayTeam } = extractScoreAndTeams(cols, 'Đội 1', 'Đội 2');

        // Check if next line is penalty shootout ( Luân lưu )
        let hasPenalty = false;
        let homePen: number | undefined;
        let awayPen: number | undefined;

        const nextRow = parsedLines[idx + 1];
        if (nextRow && nextRow.some(c => c.toLowerCase().includes('luân lưu'))) {
          const penDashIdx = nextRow.indexOf('-');
          if (penDashIdx > 0 && penDashIdx < nextRow.length - 1) {
            const p1 = parseInt(nextRow[penDashIdx - 1], 10);
            const p2 = parseInt(nextRow[penDashIdx + 1], 10);
            if (!isNaN(p1) && !isNaN(p2)) {
              hasPenalty = true;
              homePen = p1;
              awayPen = p2;
            }
          }
        }

        let roundName = 'Vòng loại trực tiếp';
        let roundType: 'quarter' | 'semi' | 'final' = 'quarter';
        if (roundTag.startsWith('TK')) {
          roundType = 'quarter';
          roundName = `Tứ kết ${roundTag.replace('TK', '')}`;
        } else if (roundTag.startsWith('BK')) {
          roundType = 'semi';
          roundName = `Bán kết ${roundTag.replace('BK', '')}`;
        } else if (roundTag === 'CK') {
          roundType = 'final';
          roundName = 'Chung kết';
        }

        let winner: string | undefined;
        if (homeScore !== null && awayScore !== null) {
          if (homeScore > awayScore) winner = homeTeam;
          else if (awayScore > homeScore) winner = awayTeam;
          else if (hasPenalty && homePen !== undefined && awayPen !== undefined) {
            winner = homePen > awayPen ? homeTeam : awayTeam;
          }
        }

        matches.push({
          id: `${divisionId}-${roundTag.toLowerCase()}`,
          matchNumber: matches.length + 1,
          divisionId,
          round: roundType,
          roundName,
          pairCode: roundTag,
          homeTeam: homeTeam || 'Đội 1',
          awayTeam: awayTeam || 'Đội 2',
          homeScore,
          awayScore,
          hasPenalty,
          homePen,
          awayPen,
          time: timeCol || '7h30, Thứ 7, 17/10',
          pitch: pitchCol || venue || 'Sân cỏ nhân tạo Thanh Nghĩa',
          status: homeScore !== null ? 'finished' : 'scheduled',
          winnerTeam: winner,
          note: hasPenalty ? `Đá luân lưu: ${homePen} - ${awayPen}` : undefined,
        });
      }
    }
  });

  return {
    division: {
      id: divisionId,
      name: title,
      shortName: divisionId === 'nam' ? 'BĐ Nam' : divisionId === 'nu' ? 'BĐ Nữ' : divisionId === 'khoi89' ? 'BĐ Khối 8-9' : 'BĐ Khối 6-7',
      badge: divisionId === 'nam' ? '⚽' : divisionId === 'nu' ? '🚺' : divisionId === 'khoi89' ? '⚡' : '🌟',
      venue,
      startDate: 'Tháng 10/2026',
      description: 'Cập nhật từ bảng tính CSV mới nhất.',
    },
    teams: Object.keys(teams).length > 0 ? teams : undefined,
    matches: matches.length > 0 ? matches : undefined,
    rankings: (rankings.champion || rankings.runnerUp) ? rankings : undefined,
  };
}

/**
 * Extracts a direct CSV download/export URL from a Google Sheets link.
 */
export function getGoogleSheetCsvUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // If already an export link or published web CSV link
  if (trimmed.includes('export?format=csv') || trimmed.includes('output=csv')) {
    return trimmed;
  }

  // Handle standard Google Sheets links
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) return null;

  const sheetId = match[1];
  const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : '0';

  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

/**
 * Fetches CSV text directly from a Google Sheets URL.
 */
export async function fetchGoogleSheetCsv(url: string): Promise<string> {
  const csvUrl = getGoogleSheetCsvUrl(url) || url.trim();
  const res = await fetch(csvUrl, {
    method: 'GET',
    headers: {
      Accept: 'text/csv,text/plain,*/*'
    }
  });

  if (!res.ok) {
    throw new Error(`Không thể kết nối đến Google Sheets (mã lỗi HTTP ${res.status}). Vui lòng đảm bảo bảng tính được mở quyền xem công khai.`);
  }

  const text = await res.text();
  if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
    throw new Error('Google Sheet đang yêu cầu tài khoản Google đăng nhập riêng tư. Bạn vui lòng: Vào Google Sheet > nhấn Chia sẻ (Share) > chuyển sang "Bất kỳ ai có đường liên kết đều có thể xem", hoặc chọn Tệp > Chia sẻ > Xuất bản lên web dạng CSV.');
  }

  return text;
}

