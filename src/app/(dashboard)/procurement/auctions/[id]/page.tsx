export default async function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <h1 className="text-2xl font-bold">Auction Detail: {id}</h1>;
}
