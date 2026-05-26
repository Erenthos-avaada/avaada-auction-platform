"use client";
import { useState } from "react";
import { useBidSubmit } from "@/hooks/useBidSubmit";
export function BidForm({ auctionId, lowestBid }: { auctionId: string; lowestBid?: number }) {
  const [amount, setAmount] = useState("");
  const { submitBid, submitting, error } = useBidSubmit(auctionId);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitBid(parseFloat(amount));
  };
  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <div>
        <label className="text-sm font-medium text-gray-700">Your Bid (₹)</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
          className="mt-1 block w-48 border rounded-md px-3 py-2" placeholder={lowestBid ? `< ${lowestBid}` : "Enter amount"} />
      </div>
      <button type="submit" disabled={submitting}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50">
        {submitting ? "Submitting..." : "Place Bid"}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}
