/*
  Warnings:

  - You are about to drop the `rewardConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `last_visit_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `referral_code` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `referred_by_code` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `video_stage` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `visits_count` on the `User` table. All the data in the column will be lost.
  - Added the required column `referralCode` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "rewardConfig";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "RewardConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "values" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "visitsCount" INTEGER NOT NULL DEFAULT 0,
    "completedCycles" INTEGER NOT NULL DEFAULT 0,
    "lastVisitAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referralCode" TEXT NOT NULL,
    "referredByCode" TEXT,
    "videoStage" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "id", "name", "phone", "updatedAt") SELECT "createdAt", "id", "name", "phone", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
