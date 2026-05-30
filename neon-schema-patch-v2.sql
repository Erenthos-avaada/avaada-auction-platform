-- ============================================
-- PATCH v2: Auction Type + Item-Rate support
-- Run this in Neon SQL Editor
-- ============================================

-- Step 1: Add AuctionType enum
CREATE TYPE "AuctionType" AS ENUM ('LUMPSUM', 'ITEM_RATE');

-- Step 2: Add new columns to Auction table
ALTER TABLE "Auction"
  ADD COLUMN "auctionType"     "AuctionType" NOT NULL DEFAULT 'LUMPSUM',
  ADD COLUMN "itemDescription" TEXT;

-- Step 3: Migrate existing data — set itemDescription from category + unit + quantity
UPDATE "Auction"
SET "itemDescription" = category || ' — ' || quantity::text || ' ' || unit
WHERE "itemDescription" IS NULL;

-- Step 4: Drop old columns (category, quantity, unit) — only after verifying data is migrated
ALTER TABLE "Auction"
  DROP COLUMN IF EXISTS category,
  DROP COLUMN IF EXISTS quantity,
  DROP COLUMN IF EXISTS unit;

-- Step 5: Create AuctionItem table for Item-Rate auctions
CREATE TABLE "AuctionItem" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "auctionId" TEXT NOT NULL REFERENCES "Auction"(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity    FLOAT NOT NULL,
  unit        TEXT NOT NULL,
  "sortOrder" INT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Step 6: Add itemId to Bid table (nullable — only used for Item-Rate bids)
ALTER TABLE "Bid"
  ADD COLUMN "itemId" TEXT REFERENCES "AuctionItem"(id);

-- Step 7: Add index for item-rate bid queries
CREATE INDEX idx_bid_auction_item_amount ON "Bid"("auctionId", "itemId", amount);

-- Verify
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
