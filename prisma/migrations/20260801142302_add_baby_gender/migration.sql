-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "Baby" ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'FEMALE';
