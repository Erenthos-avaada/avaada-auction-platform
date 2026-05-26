"use client";
import { Vendor } from "@/types";
export function VendorTable({ vendors }: { vendors: Vendor[] }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="p-3 text-left">Company</th>
          <th className="p-3 text-left">GST</th>
          <th className="p-3 text-left">Status</th>
          <th className="p-3 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {vendors.map(v => (
          <tr key={v.id} className="border-t">
            <td className="p-3">{v.companyName}</td>
            <td className="p-3">{v.gstNumber || "-"}</td>
            <td className="p-3"><span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">{v.status}</span></td>
            <td className="p-3">
              <button className="text-green-600 hover:underline text-xs mr-2">Approve</button>
              <button className="text-red-600 hover:underline text-xs">Reject</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
