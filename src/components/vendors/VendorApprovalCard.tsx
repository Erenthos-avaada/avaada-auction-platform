"use client";
import { Vendor } from "@/types";
export function VendorApprovalCard({ vendor }: { vendor: Vendor }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold">{vendor.companyName}</h3>
      <p className="text-sm text-gray-500">GST: {vendor.gstNumber}</p>
      <div className="flex gap-2 mt-3">
        <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Approve</button>
        <button className="bg-red-500 text-white px-3 py-1 rounded text-sm">Reject</button>
      </div>
    </div>
  );
}
