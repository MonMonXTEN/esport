/*
  Warnings:

  - You are about to drop the column `matchNo` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `scoreBlue` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `scoreRed` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `signatureBlue` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `signatureRed` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `signedAt` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `winnerId` on the `match` table. All the data in the column will be lost.
  - You are about to alter the column `round` on the `match` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Enum(EnumId(2))`.
  - You are about to drop the column `bracket` on the `tournament` table. All the data in the column will be lost.
  - You are about to drop the column `currentRound` on the `tournament` table. All the data in the column will be lost.
  - You are about to drop the column `rounds` on the `tournament` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `tournament` table. All the data in the column will be lost.
  - You are about to drop the `tournamentteam` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sequence` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Tournament` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `match` DROP FOREIGN KEY `Match_tournamentId_fkey`;

-- DropForeignKey
ALTER TABLE `match` DROP FOREIGN KEY `Match_winnerId_fkey`;

-- DropForeignKey
ALTER TABLE `tournamentteam` DROP FOREIGN KEY `TournamentTeam_teamId_fkey`;

-- DropForeignKey
ALTER TABLE `tournamentteam` DROP FOREIGN KEY `TournamentTeam_tournamentId_fkey`;

-- DropIndex
DROP INDEX `Match_tournamentId_round_matchNo_key` ON `match`;

-- DropIndex
DROP INDEX `Match_winnerId_fkey` ON `match`;

-- AlterTable
ALTER TABLE `match` DROP COLUMN `matchNo`,
    DROP COLUMN `scoreBlue`,
    DROP COLUMN `scoreRed`,
    DROP COLUMN `signatureBlue`,
    DROP COLUMN `signatureRed`,
    DROP COLUMN `signedAt`,
    DROP COLUMN `winnerId`,
    ADD COLUMN `blueScore` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `parentMatchId` INTEGER NULL,
    ADD COLUMN `redScore` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `refereeId` INTEGER NULL,
    ADD COLUMN `sequence` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `winnerTeamId` INTEGER NULL,
    MODIFY `round` ENUM('R32', 'R16', 'QF', 'SF', 'THIRD_PLACE', 'FINAL') NOT NULL;

-- AlterTable
ALTER TABLE `tournament` DROP COLUMN `bracket`,
    DROP COLUMN `currentRound`,
    DROP COLUMN `rounds`,
    DROP COLUMN `startedAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- DropTable
DROP TABLE `tournamentteam`;

-- CreateTable
CREATE TABLE `Signature` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `matchId` INTEGER NOT NULL,
    `teamId` INTEGER NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Signature_matchId_teamId_key`(`matchId`, `teamId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Match_tournamentId_round_sequence_idx` ON `Match`(`tournamentId`, `round`, `sequence`);

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `Tournament`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_winnerTeamId_fkey` FOREIGN KEY (`winnerTeamId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_parentMatchId_fkey` FOREIGN KEY (`parentMatchId`) REFERENCES `Match`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_refereeId_fkey` FOREIGN KEY (`refereeId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Signature` ADD CONSTRAINT `Signature_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Signature` ADD CONSTRAINT `Signature_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
