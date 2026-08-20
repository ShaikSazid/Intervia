-- CreateEnum
CREATE TYPE "ConversationTurnStatus" AS ENUM ('PENDING', 'ANSWERED', 'EVALUATED');

-- CreateTable
CREATE TABLE "ConversationTurn" (
    "id" TEXT NOT NULL,
    "interviewSessionId" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "evaluation" JSONB,
    "status" "ConversationTurnStatus" NOT NULL,
    "startedAt" TIMESTAMP(3),
    "answeredAt" TIMESTAMP(3),
    "evaluatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationTurn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConversationTurn_interviewSessionId_idx" ON "ConversationTurn"("interviewSessionId");

-- CreateIndex
CREATE INDEX "ConversationTurn_status_idx" ON "ConversationTurn"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationTurn_interviewSessionId_sequenceNumber_key" ON "ConversationTurn"("interviewSessionId", "sequenceNumber");

-- AddForeignKey
ALTER TABLE "ConversationTurn" ADD CONSTRAINT "ConversationTurn_interviewSessionId_fkey" FOREIGN KEY ("interviewSessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
