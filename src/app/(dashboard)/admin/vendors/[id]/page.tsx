export default function VendorDetailPage({ params }: { params: { id: string } }) {
  return <h1 className="text-2xl font-bold">Vendor Detail: {params.id}</h1>;
}
