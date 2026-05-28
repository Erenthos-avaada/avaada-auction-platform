import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      // Send initial data
      const auction = await prisma.auction.findUnique({ where: { id } });
      const bids    = await prisma.bid.findMany({
        where: { auctionId: id }, orderBy: { amount: "asc" },
        include: { vendor: { select: { companyName: true } } },
      });
      send({ type: "init", auction, bids });

      // Poll every 4 seconds and emit changes
      let lastBidCount = bids.length;
      let lastEndTime  = auction?.endTime?.toISOString();

      const interval = setInterval(async () => {
        try {
          const [freshAuction, freshBids] = await Promise.all([
            prisma.auction.findUnique({ where: { id } }),
            prisma.bid.findMany({
              where: { auctionId: id }, orderBy: { amount: "asc" },
              include: { vendor: { select: { companyName: true } } },
            }),
          ]);

          const newEndTime = freshAuction?.endTime?.toISOString();
          if (freshBids.length !== lastBidCount || newEndTime !== lastEndTime) {
            lastBidCount = freshBids.length;
            lastEndTime  = newEndTime;
            send({ type: "update", auction: freshAuction, bids: freshBids });
          }

          // Stop streaming if auction is closed
          if (freshAuction?.status === "CLOSED" || freshAuction?.status === "CANCELLED") {
            send({ type: "closed" });
            clearInterval(interval);
            controller.close();
          }
        } catch { clearInterval(interval); controller.close(); }
      }, 4000);

      // Cleanup on disconnect
      return () => clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection":    "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
