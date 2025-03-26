/*
  Warnings:

  - You are about to drop the column `nftTokenId` on the `Credential` table. All the data in the column will be lost.
  - You are about to drop the column `nftTokenId` on the `Loan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contractAddress,tokenId]` on the table `Credential` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contractAddress,tokenId]` on the table `Loan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contractAddress` to the `Credential` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenId` to the `Credential` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contractAddress` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenId` to the `Loan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Loan" DROP CONSTRAINT "Loan_nftTokenId_fkey";

-- DropIndex
DROP INDEX "Credential_nftTokenId_key";

-- DropIndex
DROP INDEX "Loan_nftTokenId_key";

-- AlterTable
ALTER TABLE "Credential" DROP COLUMN "nftTokenId",
ADD COLUMN     "contractAddress" TEXT NOT NULL,
ADD COLUMN     "tokenId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "nftTokenId",
ADD COLUMN     "contractAddress" TEXT NOT NULL,
ADD COLUMN     "tokenId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Credential_contractAddress_tokenId_key" ON "Credential"("contractAddress", "tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "Loan_contractAddress_tokenId_key" ON "Loan"("contractAddress", "tokenId");

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_contractAddress_tokenId_fkey" FOREIGN KEY ("contractAddress", "tokenId") REFERENCES "Credential"("contractAddress", "tokenId") ON DELETE RESTRICT ON UPDATE CASCADE;
