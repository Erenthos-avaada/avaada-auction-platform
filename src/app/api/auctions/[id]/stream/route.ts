import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Check auction upfront — don't stream if not active
  const auction = await prisma.auction.findUnique({ where: { id } });
  if (!auction) {
    return new Response("Auction not found", { status: 404 });
  }

  const now = new Date();

  // If auction is already closed/cancelled — return immediately, no stream needed
  if (auction.status === "CLOSED" || auction.status === "CANCELLED") {
    const bids = await prisma.bid.findMany({
      where: { auctionId: id }, orderBy: { amount: "asc" },
      include: { vendor: { select: { companyName: true } } },
    });
    const encoder = new TextEncoder();
    const data    = JSON.stringify({ type: "closed", auction, bids });
    return new Response(`data: ${data}\n\n`, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  // If auction hasn't started yet — send init and close (no point streaming)
  if (now < auction.startTime) {
    const encoder = new TextEncoder();
    const data    = JSON.stringify({ type: "pending", auction, bids: [] });
    return new Response(`data: ${data}\n\n`, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)); }
        catch {}
      };

      // Send initial snapshot
      const [freshAuction, bids] = await Promise.all([
        prisma.auction.findUnique({ where: { id } }),
        prisma.bid.findMany({
          where: { auctionId: id }, orderBy: { amount: "asc" },
          include: { vendor: { select: { companyName: true } } },
        }),
      ]);
      send({ type: "init", auction: freshAuction, bids });

      let lastBidCount = bids.length;
      let lastEndTime  = freshAuction?.endTime?.toISOString();
      let lastStatus   = freshAuction?.status;

      // Poll every 8s — only while auction is ACTIVE and within time window
      const interval = setInterval(async () => {
        try {
          const now = new Date();

          // Stop if past end time
          if (freshAuction && now > new Date(freshAuction.endTime) && lastStatus !== "ACTIVE") {
            send({ type: "closed" });
            clearInterval(interval);
            controller.close();
            return;
          }

          // Cheap query — only fetch bid count first
          const bidCount = await prisma.bid.count({ where: { auctionId: id } });
          const updatedAuction = await prisma.auction.findUnique({ where: { id }, select: { status: true, endTime: true } });

          const newEndTime = updatedAuction?.endTime?.toISOString();
          const newStatus  = updatedAuction?.status;

          // Only fetch full data if something changed
          if (bidCount !== lastBidCount || newEndTime !== lastEndTime || newStatus !== lastStatus) {
            lastBidCount = bidCount;
            lastEndTime  = newEndTime;
            lastStatus   = newStatus;

            const [fullAuction, freshBids] = await Promise.all([
              prisma.auction.findUnique({ where: { id } }),
              prisma.bid.findMany({
                where: { auctionId: id }, orderBy: { amount: "asc" },
                include: { vendor: { select: { companyName: true } } },
              }),
            ]);

            if (newStatus === "CLOSED" || newStatus === "CANCELLED") {
              send({ type: "closed", auction: fullAuction, bids: freshBids });
              clearInterval(interval);
              controller.close();
              return;
            }

            send({ type: "update", auction: fullAuction, bids: freshBids });
          }
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 8000); // 8 second poll — halves DB queries vs 4s

      return () => clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":      "text/event-stream",
      "Cache-Control":     "no-cache, no-transform",
      "Connection":        "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
