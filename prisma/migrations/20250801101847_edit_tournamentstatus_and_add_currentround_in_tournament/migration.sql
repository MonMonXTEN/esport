/*
  Warnings:

  - The values [PENDING] on the enum `Tournament_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `tournament` ADD COLUMN `currentRound` INTEGER NULL,
    MODIFY `status` ENUM('DRAFT', 'LIVE', 'FINISHED') NOT NULL DEFAULT 'DRAFT';
