/*
  Warnings:

  - Added the required column `credentialTypeId` to the `RegisteredNFT` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RegisteredNFT" ADD COLUMN     "credentialTypeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RegisteredNFT" ADD CONSTRAINT "RegisteredNFT_credentialTypeId_fkey" FOREIGN KEY ("credentialTypeId") REFERENCES "CredentialType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
