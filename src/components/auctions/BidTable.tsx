"use client";
import { Bid } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
export function BidTable({ bids }: { bids: Bid[] }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="p-3 text-left">Rank</th>
          <th className="p-3 text-left">Amount</th>
          <th className="p-3 text-left">Time</th>
        </tr>
      </thead>
      <tbody>
        {bids.map((bid, i) => (
          <tr key={bid.id} className={i === 0 ? "bg-green-50 font-semibold" : ""}>
            <td className="p-3">#{i + 1}</td>
            <td className="p-3">{formatCurrency(bid.amount)}</td>
            <td className="p-3">{formatDate(bid.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
