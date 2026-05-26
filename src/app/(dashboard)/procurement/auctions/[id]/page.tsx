// TODO: Auction detail with live bid table and close button
export default function AuctionDetailPage({ params }: { params: { id: string } }) {
  return <h1 className="text-2xl font-bold">Auction Detail: {params.id}</h1>;
}
