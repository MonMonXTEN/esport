-- AlterTable
ALTER TABLE `match` ADD COLUMN `thirdPlaceMatchId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_thirdPlaceMatchId_fkey` FOREIGN KEY (`thirdPlaceMatchId`) REFERENCES `Match`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
