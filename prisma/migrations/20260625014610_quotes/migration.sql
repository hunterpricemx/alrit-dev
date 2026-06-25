-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "brief" TEXT,
    "projectType" TEXT NOT NULL,
    "extras" JSONB NOT NULL,
    "amount" INTEGER,
    "custom" BOOLEAN NOT NULL DEFAULT false,
    "status" "QuoteStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);
