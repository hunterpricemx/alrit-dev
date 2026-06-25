-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "accent" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "icon" TEXT;
