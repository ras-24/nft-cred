-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('BORROWER', 'LENDER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'ACTIVE', 'REPAID', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BORROW', 'REPAYMENT', 'LIQUIDATION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT NOT NULL,
    "profilePic" TEXT,
    "userType" "UserType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CredentialType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ltv" DOUBLE PRECISION NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL DEFAULT 0.5,

    CONSTRAINT "CredentialType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialTypeId" TEXT NOT NULL,
    "nftTokenId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "verification" "VerificationStatus" NOT NULL,
    "metadata" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nftTokenId" TEXT NOT NULL,
    "loanAmount" DOUBLE PRECISION NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "duration" INTEGER NOT NULL,
    "ltv" DOUBLE PRECISION NOT NULL,
    "status" "LoanStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "txType" "TransactionType" NOT NULL,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegisteredNFT" (
    "id" TEXT NOT NULL,
    "tokenName" TEXT NOT NULL,
    "tickerSymbol" TEXT NOT NULL,
    "tokenImage" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,

    CONSTRAINT "RegisteredNFT_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_wallet_key" ON "User"("wallet");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "CredentialType_name_key" ON "CredentialType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_nftTokenId_key" ON "Credential"("nftTokenId");

-- CreateIndex
CREATE UNIQUE INDEX "Loan_nftTokenId_key" ON "Loan"("nftTokenId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_txHash_key" ON "Transaction"("txHash");

-- CreateIndex
CREATE UNIQUE INDEX "RegisteredNFT_contractAddress_key" ON "RegisteredNFT"("contractAddress");

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_credentialTypeId_fkey" FOREIGN KEY ("credentialTypeId") REFERENCES "CredentialType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_nftTokenId_fkey" FOREIGN KEY ("nftTokenId") REFERENCES "Credential"("nftTokenId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
