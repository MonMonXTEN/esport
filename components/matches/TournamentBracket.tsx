import type { FC } from 'react';

// --- Mock Data ---
// ในการใช้งานจริง ข้อมูลนี้จะถูกดึงมาจากฐานข้อมูลผ่าน tRPC
const mockBracketData = {
  rounds: [
    {
      name: 'รอบ 32 ทีม',
      matches: [
        { id: 1, teamA: 'Bacon Time', scoreA: 2, teamB: 'KFC x Talon', scoreB: 1, winner: 'Bacon Time' },
        { id: 2, teamA: 'eArena', scoreA: 0, teamB: 'PSG Esports', scoreB: 2, winner: 'PSG Esports' },
        { id: 3, teamA: 'Valencia CF Esports', scoreA: 2, teamB: 'Buriram United Esports', scoreB: 0, winner: 'Valencia CF Esports' },
        { id: 4, teamA: 'King of Gamers Club', scoreA: 1, teamB: 'EVOS Esports', scoreB: 2, winner: 'EVOS Esports' },
        { id: 5, teamA: 'ทีม A5', scoreA: 2, teamB: 'ทีม B5', scoreB: 0, winner: 'ทีม A5' },
        { id: 6, teamA: 'ทีม A6', scoreA: 1, teamB: 'ทีม B6', scoreB: 2, winner: 'ทีม B6' },
        { id: 7, teamA: 'ทีม A7', scoreA: 2, teamB: 'ทีม B7', scoreB: 1, winner: 'ทีม A7' },
        { id: 8, teamA: 'ทีม A8', scoreA: 0, teamB: 'ทีม B8', scoreB: 2, winner: 'ทีม B8' },
        { id: 9, teamA: 'ทีม A9', scoreA: 2, teamB: 'ทีม B9', scoreB: 0, winner: 'ทีม A9' },
        { id: 10, teamA: 'ทีม A10', scoreA: 2, teamB: 'ทีม B10', scoreB: 1, winner: 'ทีม A10' },
        { id: 11, teamA: 'ทีม A11', scoreA: 0, teamB: 'ทีม B11', scoreB: 2, winner: 'ทีม B11' },
        { id: 12, teamA: 'ทีม A12', scoreA: 1, teamB: 'ทีม B12', scoreB: 2, winner: 'ทีม B12' },
        { id: 13, teamA: 'ทีม A13', scoreA: 2, teamB: 'ทีม B13', scoreB: 0, winner: 'ทีม A13' },
        { id: 14, teamA: 'ทีม A14', scoreA: 2, teamB: 'ทีม B14', scoreB: 1, winner: 'ทีม A14' },
        { id: 15, teamA: 'ทีม A15', scoreA: 0, teamB: 'ทีม B15', scoreB: 2, winner: 'ทีม B15' },
        { id: 16, teamA: 'ทีม A16', scoreA: 1, teamB: 'ทีม B16', scoreB: 2, winner: 'ทีม B16' },
      ],
    },
    {
      name: 'รอบ 16 ทีม',
      matches: [
        { id: 17, teamA: 'Bacon Time', scoreA: 2, teamB: 'PSG Esports', scoreB: 0, winner: 'Bacon Time' },
        { id: 18, teamA: 'Valencia CF Esports', scoreA: 2, teamB: 'EVOS Esports', scoreB: 1, winner: 'Valencia CF Esports' },
        // ... เพิ่มอีก 6 คู่
        { id: 19, teamA: 'ทีม A5', scoreA: 0, teamB: 'ทีม B6', scoreB: 2, winner: 'ทีม B6' },
        { id: 20, teamA: 'ทีม A7', scoreA: 2, teamB: 'ทีม B8', scoreB: 1, winner: 'ทีม A7' },
        { id: 21, teamA: 'ทีม A9', scoreA: 2, teamB: 'ทีม A10', scoreB: 0, winner: 'ทีม A9' },
        { id: 22, teamA: 'ทีม B11', scoreA: 1, teamB: 'ทีม B12', scoreB: 2, winner: 'ทีม B12' },
        { id: 23, teamA: 'ทีม A13', scoreA: 2, teamB: 'ทีม A14', scoreB: 1, winner: 'ทีม A13' },
        { id: 24, teamA: 'ทีม B15', scoreA: 0, teamB: 'ทีม B16', scoreB: 2, winner: 'ทีม B16' },
      ],
    },
    {
      name: 'รอบ 8 ทีม (Quarter-Finals)',
      matches: [
        { id: 25, teamA: 'Bacon Time', scoreA: 3, teamB: 'Valencia CF Esports', scoreB: 2, winner: 'Bacon Time' },
        // ... เพิ่มอีก 3 คู่
        { id: 26, teamA: 'ทีม B6', scoreA: 1, teamB: 'ทีม A7', scoreB: 3, winner: 'ทีม A7' },
        { id: 27, teamA: 'ทีม A9', scoreA: 3, teamB: 'ทีม B12', scoreB: 0, winner: 'ทีม A9' },
        { id: 28, teamA: 'ทีม A13', scoreA: 2, teamB: 'ทีม B16', scoreB: 3, winner: 'ทีม B16' },
      ],
    },
    {
      name: 'รอบรองชนะเลิศ (Semi-Finals)',
      matches: [
        { id: 29, teamA: 'Bacon Time', scoreA: 3, teamB: 'ทีม A7', scoreB: 1, winner: 'Bacon Time' },
        { id: 30, teamA: 'ทีม A9', scoreA: 2, teamB: 'ทีม B16', scoreB: 3, winner: 'ทีม B16' },
      ],
    },
    {
      name: 'รอบชิงชนะเลิศ (Grand Final)',
      matches: [
        { id: 31, teamA: 'Bacon Time', scoreA: 4, teamB: 'ทีม B16', scoreB: 2, winner: 'Bacon Time' },
      ],
    },
  ],
};

// --- Components ---

// Component สำหรับแสดงผล 1 คู่การแข่งขัน
const Matchup = ({ teamA, scoreA, teamB, scoreB, winner }) => {
  const isWinnerA = winner === teamA;
  const isWinnerB = winner === teamB;

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-lg w-64 min-h-[80px] flex flex-col justify-center">
      <div className={`flex justify-between items-center p-2 ${isWinnerA ? 'font-bold text-white border-b' : 'border-b text-gray-400'} border-gray-600`}> {/*${isWinnerB ? '' : ''}*/}
        <span className="flex items-center">
          {isWinnerA}
          {teamA || 'รอผล'}
        </span>
        <span className={`px-2 py-0.5 rounded ${isWinnerA ? 'bg-green-500 text-white' : 'bg-gray-700'}`}>
          {scoreA ?? '-'}
        </span>
      </div>
      <div className={`flex justify-between items-center p-2 ${isWinnerB ? 'font-bold text-white' : 'text-gray-400'}`}>
        <span className="flex items-center">
          {isWinnerB}
          {teamB || 'รอผล'}
        </span>
        <span className={`px-2 py-0.5 rounded ${isWinnerB ? 'bg-green-500 text-white' : 'bg-gray-700'}`}>
          {scoreB ?? '-'}
        </span>
      </div>
    </div>
  )
}

export default function TournamentBracket() {
  return (
    <div className="bg-gray-900 text-gray-200 p-4 md:p-8 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white tracking-wider">
        ตารางการแข่งขัน RoV Tournament
      </h1>
      
      {/* Container ที่สามารถเลื่อนแนวนอนได้บนจอมือถือ */}
      <div className="overflow-x-auto pb-8">
        <div className="flex items-center space-x-4 md:space-x-8">
          {mockBracketData.rounds.map((round, roundIndex) => (
            <div key={round.name} className="flex flex-col items-center">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">{round.name}</h2>
              <div 
                className="flex flex-col"
                // จัดช่องว่างระหว่างคู่แข่งให้เหมาะสมในแต่ละรอบ
                style={{ 
                  gap: roundIndex === 0 ? '1.25rem' : 
                       roundIndex === 1 ? '7.5rem' : 
                       roundIndex === 2 ? '19.75rem' : 
                       roundIndex === 3 ? '44.25rem' : '0'
                }}
              >
                {round.matches.map((match) => (
                  <Matchup
                    key={match.id}
                    teamA={match.teamA}
                    scoreA={match.scoreA}
                    teamB={match.teamB}
                    scoreB={match.scoreB}
                    winner={match.winner}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}