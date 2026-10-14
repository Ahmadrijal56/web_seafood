import { supabaseBrowser } from "./supabase/client";

const BUCKET = "media";

/** Perkecil & ubah ke WebP di browser supaya foto HP (3–8 MB) jadi ±150 KB. */
export async function compressImage(file: File, maxSize = 1600, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  if (!blob) throw new Error("Gagal memproses gambar");
  return blob;
}

export async function uploadImage(file: File, folder: string): Promise<{ url: string; path: string }> {
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar");
  const blob = await compressImage(file);
  const path = `${folder}/${crypto.randomUUID()}.webp`;
  const supabase = supabaseBrowser();
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function removeImages(paths: (string | null | undefined)[]) {
  const list = paths.filter((p): p is string => Boolean(p));
  if (list.length) await supabaseBrowser().storage.from(BUCKET).remove(list);
}

/** Ambil path storage dari URL publik (untuk gambar yang hanya disimpan URL-nya). */
export function pathFromUrl(url: string | null | undefined): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = url?.indexOf(marker) ?? -1;
  return url && i >= 0 ? decodeURIComponent(url.slice(i + marker.length)) : null;
}
