-- ============================================
-- Avaada Reverse Auction Platform - DB Schema
-- Run this in Neon SQL Editor
-- ============================================

-- ENUMS
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PROCUREMENT', 'VENDOR');
CREATE TYPE "VendorStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'BLACKLISTED');
CREATE TYPE "AuctionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'CANCELLED');

-- USER
CREATE TABLE "User" (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name          TEXT,
  email         TEXT UNIQUE NOT NULL,
  password      TEXT NOT NULL,
  role          "Role" NOT NULL DEFAULT 'VENDOR',
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- VENDOR
CREATE TABLE "Vendor" (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"        TEXT UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "companyName"   TEXT NOT NULL,
  "gstNumber"     TEXT,
  "panNumber"     TEXT,
  "bankName"      TEXT,
  "bankAccount"   TEXT,
  "bankIfsc"      TEXT,
  categories      TEXT[] DEFAULT '{}',
  status          "VendorStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- AUCTION
CREATE TABLE "Auction" (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title             TEXT NOT NULL,
  description       TEXT,
  category          TEXT NOT NULL,
  quantity          FLOAT NOT NULL,
  unit              TEXT NOT NULL,
  "deliveryTerms"   TEXT,
  "startTime"       TIMESTAMP NOT NULL,
  "endTime"         TIMESTAMP NOT NULL,
  "autoExtendMins"  INT NOT NULL DEFAULT 10,
  "minDecrement"    FLOAT NOT NULL DEFAULT 0,
  status            "AuctionStatus" NOT NULL DEFAULT 'DRAFT',
  "createdById"     TEXT NOT NULL REFERENCES "User"(id),
  "createdAt"       TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- BID
CREATE TABLE "Bid" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "auctionId" TEXT NOT NULL REFERENCES "Auction"(id) ON DELETE CASCADE,
  "vendorId"  TEXT NOT NULL REFERENCES "Vendor"(id),
  amount      FLOAT NOT NULL,
  note        TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_bid_auction_amount ON "Bid"("auctionId", amount);

-- AUCTION DOCUMENT
CREATE TABLE "AuctionDocument" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "auctionId" TEXT NOT NULL REFERENCES "Auction"(id) ON DELETE CASCADE,
  "fileName"  TEXT NOT NULL,
  "fileUrl"   TEXT NOT NULL,
  "fileSize"  INT,
  "uploadedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- AUCTION INVITE
CREATE TABLE "AuctionInvite" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "auctionId" TEXT NOT NULL REFERENCES "Auction"(id) ON DELETE CASCADE,
  "vendorId"  TEXT NOT NULL REFERENCES "Vendor"(id),
  "sentAt"    TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("auctionId", "vendorId")
);

-- NOTIFICATION
CREATE TABLE "Notification" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  link        TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- VERIFY (run this after to confirm all tables exist)
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
