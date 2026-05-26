import { put } from "@vercel/blob";

export async function uploadFile(file: File, folder: string = "documents") {
  const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
    access: "public",
  });
  return blob.url;
}
