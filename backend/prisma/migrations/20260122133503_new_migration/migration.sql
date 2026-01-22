-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "storageUrl" TEXT,
ALTER COLUMN "content" DROP NOT NULL;
