/*
  Warnings:

  - A unique constraint covering the columns `[tournamentId,round,matchNo]` on the table `Match` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Match_tournamentId_round_matchNo_key` ON `Match`(`tournamentId`, `round`, `matchNo`);
