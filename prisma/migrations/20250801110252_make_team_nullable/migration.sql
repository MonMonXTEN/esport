-- DropForeignKey
ALTER TABLE `match` DROP FOREIGN KEY `Match_blueTeamId_fkey`;

-- DropForeignKey
ALTER TABLE `match` DROP FOREIGN KEY `Match_redTeamId_fkey`;

-- DropIndex
DROP INDEX `Match_blueTeamId_fkey` ON `match`;

-- DropIndex
DROP INDEX `Match_redTeamId_fkey` ON `match`;

-- AlterTable
ALTER TABLE `match` MODIFY `blueTeamId` INTEGER NULL,
    MODIFY `redTeamId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_blueTeamId_fkey` FOREIGN KEY (`blueTeamId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_redTeamId_fkey` FOREIGN KEY (`redTeamId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
