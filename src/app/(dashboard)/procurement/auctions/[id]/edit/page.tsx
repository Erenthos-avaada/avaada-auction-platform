export default async function EditAuctionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <h1 className="text-2xl font-bold">Edit Auction: {id}</h1>;
}
