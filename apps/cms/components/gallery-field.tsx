"use client";

import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { uploadImage } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { useToast } from "./toast";

export type GalleryImage = { url: string; path: string | null };

/** Banyak foto dengan urutan; foto pertama = foto utama di katalog. */
export function GalleryField({ images, onChange, folder }: { images: GalleryImage[]; onChange: (images: GalleryImage[]) => void; folder: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);
  const toast = useToast();

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setUploading(list.length);
    const added: GalleryImage[] = [];
    for (const file of list) {
      try {
        added.push(await uploadImage(file, folder));
      } catch (e) {
        toast(`${file.name}: ${(e as Error).message}`, "error");
      }
      setUploading((n) => n - 1);
    }
    onChange([...images, ...added]);
    if (input.current) input.current.value = "";
  }

  function move(index: number, delta: number) {
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onFiles(e.dataTransfer.files);
      }}
      className={cn("rounded-2xl transition", dragging && "bg-brand-50 ring-2 ring-brand-300 ring-offset-4")}
    >
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((img, i) => (
          <li key={img.url} className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="size-full object-cover" />
            {i === 0 && <span className="absolute left-2 top-2 rounded-md bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Utama</span>}
            <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between gap-1">
              <div className="flex gap-1">
                <IconBtn label="Geser kiri" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ChevronLeft className="size-4" />
                </IconBtn>
                <IconBtn label="Geser kanan" disabled={i === images.length - 1} onClick={() => move(i, 1)}>
                  <ChevronRight className="size-4" />
                </IconBtn>
              </div>
              <IconBtn label="Hapus foto" danger onClick={() => onChange(images.filter((_, j) => j !== i))}>
                <Trash2 className="size-4" />
              </IconBtn>
            </div>
          </li>
        ))}
        {Array.from({ length: uploading }).map((_, i) => (
          <li key={`up-${i}`} className="grid aspect-square place-items-center rounded-2xl bg-slate-100">
            <Loader2 className="size-6 animate-spin text-brand-600" />
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 transition hover:border-brand-300 hover:text-brand-600"
          >
            <ImagePlus className="size-7" />
            <span className="text-xs font-bold">Tambah foto</span>
          </button>
        </li>
      </ul>
      <p className="mt-2 text-xs text-slate-400">Foto otomatis dikompres ke WebP. Bisa pilih beberapa sekaligus dari galeri/kamera HP, atau seret foto ke sini.</p>
      <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
    </div>
  );
}

function IconBtn({ children, label, onClick, disabled, danger }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn("grid size-7 place-items-center rounded-lg bg-white/95 shadow disabled:opacity-30", danger ? "text-rose-600" : "text-slate-700")}
    >
      {children}
    </button>
  );
}
