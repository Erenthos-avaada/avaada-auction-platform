import { useEffect, useState } from "react";

export function useAuction(auctionId: string) {
  const [auction, setAuction] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auctionId) return;
    const fetchData = async () => {
      const [aRes, bRes] = await Promise.all([
        fetch(`/api/auctions/${auctionId}`),
        fetch(`/api/auctions/${auctionId}/bids`),
      ]);
      setAuction(await aRes.json());
      const { bids } = await bRes.json();
      setBids(bids);
      setLoading(false);
    };
    fetchData();
    // Poll every 10 seconds for live bid updates
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [auctionId]);

  return { auction, bids, loading };
}
