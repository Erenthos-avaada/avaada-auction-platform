"use client";
import { Auction } from "@/types";
import { formatDate } from "@/lib/utils";
export function AuctionCard({ auction }: { auction: Auction }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
      <h3 className="font-semibold text-gray-900">{auction.title}</h3>
      <p className="text-sm text-gray-500">{auction.category}</p>
      <p className="text-sm mt-2">Closes: {formatDate(auction.endTime)}</p>
      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">{auction.status}</span>
    </div>
  );
}
