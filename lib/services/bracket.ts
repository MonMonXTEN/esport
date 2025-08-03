/* lib/bracket.ts
 * --------------------------------------------------------
 *  • สร้าง Bracket 32-ทีมครบทุกรอบ
 *  • relation winnerAdvance (parentMatchId)   → ผู้ชนะ
 *  • relation loserToThird  (thirdPlaceMatchId) → ผู้แพ้ SF
 * --------------------------------------------------------
 */

import db from "../db";

/* ---------- utils ---------- */
export const shuffle = <T,>(arr: T[]) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const fill32 = (ids: (number | null)[]) => {
  const r = [...ids]
  if (r.length % 2 === 1) r.push(null)
  while (r.length < 32) r.push(null)
  return r
}

/* =======================================================
   seedR32Matches(…)
   – ใช้ครั้งเดียวหลังสร้าง Tournament
   – teamIds คือรายชื่อทีมตามลำดับ (จะ shuffle มาก่อนก็ได้)
   ======================================================= */
export async function seedR32Matches(tournamentId: number, teamIdsRaw: number[]) {
  const teamIds = fill32(teamIdsRaw)

  /* 1) FINAL + THIRD_PLACE */
  const [finalMatch, thirdPlaceMatch] = await db.$transaction([
    db.match.create({
      data: { tournamentId, round: "FINAL", sequence: 0, bestOf: 5, status: "PENDING" },
    }),
    db.match.create({
      data: { tournamentId, round: "THIRD_PLACE", sequence: 0, bestOf: 3, status: "PENDING" },
    }),
  ])

  /* 2) SF (แพ้ → THIRD_PLACE, ชนะ → FINAL) */
  const sfMatches = await db.$transaction(
    Array.from({ length: 2 }, (_, i) =>
      db.match.create({
        data: {
          tournamentId,
          round: "SF",
          sequence: i,
          bestOf: 3,
          parentMatchId: finalMatch.id,          // winner
          thirdPlaceMatchId: thirdPlaceMatch.id, // loser
          status: "PENDING",
        },
      })
    )
  )
  const sfIds = sfMatches.map(m => m.id)

  /* 3) QF -> SF */
  const qfMatches = await db.$transaction(
    Array.from({ length: 4 }, (_, i) =>
      db.match
        .create({
          data: {
            tournamentId,
            round: "QF",
            sequence: i,
            bestOf: 3,
            parentMatchId: sfIds[i >> 1],
            status: "PENDING",
          },
        })
    )
  )
  const qfIds = qfMatches.map(m => m.id)

  /* 4) R16 -> QF */
  const r16Matches = await db.$transaction(
    Array.from({ length: 8 }, (_, i) =>
      db.match
        .create({
          data: {
            tournamentId,
            round: "R16",
            sequence: i,
            bestOf: 3,
            parentMatchId: qfIds[i >> 1],
            status: "PENDING",
          },
        })
    )
  )
  const r16Ids = r16Matches.map(m => m.id)

  /* 5) R32 (ใส่ทีม) -> R16 */
  await db.$transaction(
    Array.from({ length: 16 }, (_, i) =>
      db.match.create({
        data: {
          tournamentId,
          round: "R32",
          sequence: i,
          bestOf: 1,
          blueTeamId: teamIds[i * 2] ?? null,
          redTeamId: teamIds[i * 2 + 1] ?? null,
          parentMatchId: r16Ids[i >> 1],
          status: "PENDING",
        },
      })
    )
  )
}















// import db from "../db";

// /** สร้างแมตช์ทุก รอบ + ใส่ทีมตามลำดับใน R32 */
// export async function seedR32Matches(
//   tournamentId: number,
//   teamIds: number[],
// ) {
//   // --- เตรียมทีมให้ครบ 32 ช่อง ------------------------------
//   const ids: (number | null)[] = [...teamIds]
//   if (ids.length % 2 === 1) ids.push(null) // bye
//   while (ids.length < 32) ids.push(null)  // ทีมไม่ครบ 32

//   // --- FINAL & 3rd  -----------------------------------------
//   const [finalMatch, thirdPlaceMatch] = await db.$transaction([
//     db.match.create({ data: { tournamentId, round: "FINAL", bestOf: 5 } }),
//     db.match.create({ data: { tournamentId, round: "THIRD_PLACE", bestOf: 3 } }),
//   ])

//   // SF
//   await db.$transaction(
//     [0, 1].map((i) =>
//       db.match.create({
//         data: {
//           tournamentId,
//           round: "SF",
//           sequence: i,
//           bestOf: 3,
//           parentMatchId: finalMatch.id,          // ผู้ชนะไป FINAL
//           thirdPlaceMatchId: thirdPlaceMatch.id, // ผู้แพ้ไป THIRD_PLACE
//         },
//       })
//     )
//   )

//   // --- SF ---------------------------------------------------
//   // const sf = await db.$transaction(
//   //   Array.from({ length: 2 }, (_, i) =>
//   //     db.match.create({
//   //       data: {
//   //         tournamentId,
//   //         round: "SF",
//   //         bestOf: 3,
//   //         sequence: i,
//   //         parentMatchId: i === 0 ? finalMatch.id : thirdMatch.id,
//   //       },
//   //     }),
//   //   ),
//   // )
//   // const sfIds = sf.map((m) => m.id);

//   // --- QF ---------------------------------------------------
//   const qf = await db.$transaction(
//     Array.from({ length: 4 }, (_, i) =>
//       db.match.create({
//         data: {
//           tournamentId,
//           round: "QF",
//           bestOf: 3,
//           sequence: i,
//           parentMatchId: sfIds[i >> 1],
//         },
//       }),
//     ),
//   );
//   const qfIds = qf.map((m) => m.id);

//   // --- R16 --------------------------------------------------
//   const r16 = await db.$transaction(
//     Array.from({ length: 8 }, (_, i) =>
//       db.match.create({
//         data: {
//           tournamentId,
//           round: "R16",
//           bestOf: 3,
//           sequence: i,
//           parentMatchId: qfIds[i >> 1],
//         },
//       }),
//     ),
//   );
//   const r16Ids = r16.map((m) => m.id);

//   // --- R32 + ใส่ทีม ---------------------------------------
//   await db.$transaction(
//     Array.from({ length: 16 }, (_, i) =>
//       db.match.create({
//         data: {
//           tournamentId,
//           round: "R32",
//           bestOf: 1,
//           sequence: i,
//           blueTeamId: ids[i * 2] ?? null,
//           redTeamId: ids[i * 2 + 1] ?? null,
//           parentMatchId: r16Ids[i >> 1],
//         },
//       }),
//     ),
//   )
// }