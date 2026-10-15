import { GroupTeamStanding, Match } from '../types';

export function calculateGroupStandings(
  group: 'A' | 'B' | 'C' | 'D',
  teams: { [code: string]: string },
  matches: Match[]
): GroupTeamStanding[] {
  // Find all team codes in this group (e.g. A1, A2, A3, A4)
  const groupTeamCodes = Object.keys(teams).filter(code => code.startsWith(group));
  
  // Filter matches for this group
  const groupMatches = matches.filter(
    m => m.round === 'group' && (m.group === group || (m.pairCode && m.pairCode.startsWith(group)))
  );

  const standingsMap: Record<string, GroupTeamStanding> = {};

  groupTeamCodes.forEach(code => {
    standingsMap[code] = {
      teamCode: code,
      teamName: teams[code] || code,
      group,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
    };
  });

  // Calculate from finished matches
  groupMatches.forEach(match => {
    if (match.status !== 'finished' && match.homeScore === null) return;
    if (match.homeScore === null || match.awayScore === null) return;

    // Match teams by name or code
    const homeCode = groupTeamCodes.find(
      c => teams[c] === match.homeTeam || match.homeTeam.includes(c) || match.pairCode?.startsWith(c)
    ) || match.pairCode?.split('-')[0];

    const awayCode = groupTeamCodes.find(
      c => teams[c] === match.awayTeam || match.awayTeam.includes(c) || match.pairCode?.endsWith(c)
    ) || match.pairCode?.split('-')[1];

    if (!homeCode || !awayCode || !standingsMap[homeCode] || !standingsMap[awayCode]) return;

    const hs = match.homeScore;
    const as = match.awayScore;

    // Home team
    standingsMap[homeCode].played += 1;
    standingsMap[homeCode].gf += hs;
    standingsMap[homeCode].ga += as;

    // Away team
    standingsMap[awayCode].played += 1;
    standingsMap[awayCode].gf += as;
    standingsMap[awayCode].ga += hs;

    if (hs > as) {
      standingsMap[homeCode].won += 1;
      standingsMap[homeCode].points += 3;
      standingsMap[awayCode].lost += 1;
    } else if (hs < as) {
      standingsMap[awayCode].won += 1;
      standingsMap[awayCode].points += 3;
      standingsMap[homeCode].lost += 1;
    } else {
      standingsMap[homeCode].drawn += 1;
      standingsMap[homeCode].points += 1;
      standingsMap[awayCode].drawn += 1;
      standingsMap[awayCode].points += 1;
    }
  });

  // Calculate GD
  Object.values(standingsMap).forEach(s => {
    s.gd = s.gf - s.ga;
  });

  // Sort teams: Points -> Head-to-Head -> Goal Difference -> Goals For
  const sorted = Object.values(standingsMap).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    // Check head-to-head between a and b if tied on points
    const directMatch = groupMatches.find(m => {
      const matchPair = m.pairCode || '';
      return (
        (matchPair.includes(a.teamCode) && matchPair.includes(b.teamCode)) ||
        (m.homeTeam === a.teamName && m.awayTeam === b.teamName) ||
        (m.homeTeam === b.teamName && m.awayTeam === a.teamName)
      );
    });

    if (directMatch && directMatch.homeScore !== null && directMatch.awayScore !== null) {
      const isAHome = directMatch.homeTeam === a.teamName || directMatch.pairCode?.startsWith(a.teamCode);
      const scoreA = isAHome ? directMatch.homeScore : directMatch.awayScore;
      const scoreB = isAHome ? directMatch.awayScore : directMatch.homeScore;
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
    }

    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });

  // Assign ranks
  sorted.forEach((item, index) => {
    item.rank = index + 1;
  });

  return sorted;
}

export function getMatchMatrix(
  group: 'A' | 'B' | 'C' | 'D',
  teams: { [code: string]: string },
  matches: Match[]
) {
  const codes = Object.keys(teams).filter(code => code.startsWith(group));
  const matrix: Record<string, Record<string, string>> = {};

  codes.forEach(c1 => {
    matrix[c1] = {};
    codes.forEach(c2 => {
      if (c1 === c2) {
        matrix[c1][c2] = 'X';
      } else {
        const match = matches.find(m => {
          if (m.round !== 'group') return false;
          const pair = m.pairCode || '';
          return (
            (pair === `${c1}-${c2}`) ||
            (m.homeTeam === teams[c1] && m.awayTeam === teams[c2])
          );
        });

        const revMatch = matches.find(m => {
          if (m.round !== 'group') return false;
          const pair = m.pairCode || '';
          return (
            (pair === `${c2}-${c1}`) ||
            (m.homeTeam === teams[c2] && m.awayTeam === teams[c1])
          );
        });

        if (match && match.homeScore !== null && match.awayScore !== null) {
          matrix[c1][c2] = `${match.homeScore} - ${match.awayScore}`;
        } else if (revMatch && revMatch.homeScore !== null && revMatch.awayScore !== null) {
          matrix[c1][c2] = `${revMatch.awayScore} - ${revMatch.homeScore}`;
        } else {
          matrix[c1][c2] = '-';
        }
      }
    });
  });

  return { codes, matrix };
}
