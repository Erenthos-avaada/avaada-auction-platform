export default async function VendorAuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <h1 className="text-2xl font-bold">Auction: {id}</h1>;
}
