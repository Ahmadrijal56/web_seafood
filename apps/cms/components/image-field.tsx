"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { uploadImage } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { useToast } from "./toast";

/** Satu gambar (banner, kategori, paket, testimoni). Upload langsung ke Storage. */
export function ImageField({
  value,
  onChange,
  folder,
  aspect = "aspect-[4/3]",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  aspect?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const { url } = await uploadImage(file, folder);
      onChange(url);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className={cn("group relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50", aspect)}>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 transition hover:text-brand-600"
        >
          <ImagePlus className="size-8" />
          <span className="text-xs font-semibold">Upload foto</span>
        </button>
      )}
      {value && (
        <div className="absolute inset-x-2 bottom-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow"
          >
            Ganti
          </button>
          <button type="button" onClick={() => onChange(null)} className="rounded-lg bg-white/95 p-1.5 text-rose-600 shadow" aria-label="Hapus foto">
            <Trash2 className="size-4" />
          </button>
        </div>
      )}
      {busy && (
        <div className="absolute inset-0 grid place-items-center bg-white/70">
          <Loader2 className="size-6 animate-spin text-brand-600" />
        </div>
      )}
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
    </div>
  );
}
