export default function EditAuctionPage({ params }: { params: { id: string } }) {
  return <h1 className="text-2xl font-bold">Edit Auction: {params.id}</h1>;
}
