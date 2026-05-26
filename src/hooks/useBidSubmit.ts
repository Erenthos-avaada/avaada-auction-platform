import { useState } from "react";

export function useBidSubmit(auctionId: string) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitBid = async (amount: number, note?: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/auctions/${auctionId}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, note }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit bid");
        return false;
      }
      return true;
    } catch {
      setError("Network error. Please try again.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitBid, submitting, error };
}
