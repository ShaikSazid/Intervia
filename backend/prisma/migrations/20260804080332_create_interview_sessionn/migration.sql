/*
  Warnings:

  - You are about to drop the column `configuration` on the `InterviewSession` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `InterviewSession` table. All the data in the column will be lost.
  - Added the required column `interviewConfiguration` to the `InterviewSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionProgress` to the `InterviewSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InterviewSession" DROP COLUMN "configuration",
DROP COLUMN "progress",
ADD COLUMN     "interviewConfiguration" JSONB NOT NULL,
ADD COLUMN     "sessionProgress" JSONB NOT NULL;

-- CreateIndex
CREATE INDEX "InterviewSession_resumeId_idx" ON "InterviewSession"("resumeId");

-- CreateIndex
CREATE INDEX "InterviewSession_candidateProfileId_idx" ON "InterviewSession"("candidateProfileId");

-- CreateIndex
CREATE INDEX "InterviewSession_status_idx" ON "InterviewSession"("status");
