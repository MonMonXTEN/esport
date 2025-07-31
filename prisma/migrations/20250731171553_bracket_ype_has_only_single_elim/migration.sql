/*
  Warnings:

  - You are about to alter the column `bracket` on the `tournament` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `tournament` MODIFY `bracket` ENUM('SINGLE_ELIM') NOT NULL DEFAULT 'SINGLE_ELIM';
