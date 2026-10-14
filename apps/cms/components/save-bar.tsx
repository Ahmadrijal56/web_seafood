"use client";

import type { ReactNode } from "react";
import { Button } from "./ui";

/** Bar simpan yang selalu terlihat — di mobile berada di atas navigasi bawah. */
export function SaveBar({ saving, dirty, onSave, children, label = "Simpan" }: { saving: boolean; dirty: boolean; onSave: () => void; children?: ReactNode; label?: string }) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(57px+env(safe-area-inset-bottom))] z-20 border-t border-slate-200 bg-white/95 backdrop-blur lg:bottom-0 lg:left-64">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <p className="hidden flex-1 text-xs font-semibold text-slate-400 sm:block">{dirty ? "Ada perubahan yang belum disimpan" : "Semua perubahan tersimpan"}</p>
        <div className="flex flex-1 justify-end gap-2 sm:flex-none">
          {children}
          <Button onClick={onSave} loading={saving} className="min-w-28 flex-1 sm:flex-none">
            {label}
          </Button>
        </div>
      </div>
    </div>
  );
}
