"use client";
import { useState } from "react";
export function FileUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body: form });
    const { url } = await res.json();
    onUpload(url);
    setUploading(false);
  };
  return (
    <div>
      <input type="file" onChange={handleChange} disabled={uploading} className="text-sm" />
      {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
    </div>
  );
}
