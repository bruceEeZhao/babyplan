-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Prop" ADD VALUE 'RATTLE';
ALTER TYPE "Prop" ADD VALUE 'CARD';
ALTER TYPE "Prop" ADD VALUE 'MIRROR';
ALTER TYPE "Prop" ADD VALUE 'BLOCK';
ALTER TYPE "Prop" ADD VALUE 'TOY';
ALTER TYPE "Prop" ADD VALUE 'OIL';
ALTER TYPE "Prop" ADD VALUE 'FRUIT';
