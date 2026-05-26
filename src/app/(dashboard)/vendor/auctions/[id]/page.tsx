// TODO: Auction detail + place bid form for vendor
export default function VendorAuctionDetailPage({ params }: { params: { id: string } }) {
  return <h1 className="text-2xl font-bold">Auction: {params.id}</h1>;
}
