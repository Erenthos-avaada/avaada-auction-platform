export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <h1 className="text-2xl font-bold">Vendor Detail: {id}</h1>;
}
