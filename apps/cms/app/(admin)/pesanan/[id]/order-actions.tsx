"use client";

import { normalizePhone, ORDER_STATUS_LABELS, waLink, type OrderStatus, type OrderWithItems } from "@sfs/shared";
import { Check, Copy, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { useToast } from "@/components/toast";
import { Button, buttonClass, Card } from "@/components/ui";
import { publishChanges } from "@/lib/actions";
import { REPLY_TEMPLATES, STATUS_FLOW } from "@/lib/orders";
import { supabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<OrderStatus, string> = {
  new: "border-amber-300 bg-amber-50 text-amber-700",
  confirmed: "border-brand-300 bg-brand-50 text-brand-700",
  shipped: "border-violet-300 bg-violet-50 text-violet-700",
  done: "border-emerald-300 bg-emerald-50 text-emerald-700",
  cancelled: "border-slate-300 bg-slate-100 text-slate-600",
};

export function OrderActions({ order, storeName }: { order: OrderWithItems; storeName: string }) {
  const router = useRouter();
  const toast = useToast();
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState<OrderStatus | null>(null);
  const [templateId, setTemplateId] = useState(order.status === "new" ? "confirm" : order.status === "confirmed" ? "shipped" : "done");
  const template = REPLY_TEMPLATES.find((t) => t.id === templateId)!;
  const [message, setMessage] = useState(() => template.build(order, storeName));
  const [copied, setCopied] = useState(false);

  async function changeStatus(next: OrderStatus) {
    if (next === status) return;
    setSaving(next);
    const { error } = await supabaseBrowser().from("orders").update({ status: next }).eq("id", order.id);
    setSaving(null);
    if (error) return toast(error.message, "error");
    setStatus(next);
    toast(`Status diubah ke "${ORDER_STATUS_LABELS[next]}"`);
    router.refresh();
  }

  function pickTemplate(id: string) {
    setTemplateId(id);
    setMessage(REPLY_TEMPLATES.find((t) => t.id === id)!.build(order, storeName));
  }

  async function copy() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function remove() {
    if (!confirm(`Hapus pesanan ${order.order_code}? Data tidak bisa dikembalikan.`)) return;
    const { error } = await supabaseBrowser().from("orders").delete().eq("id", order.id);
    if (error) return toast(error.message, "error");
    await publishChanges(["/pesanan"]);
    toast("Pesanan dihapus");
    router.replace("/pesanan");
  }

  return (
    <div className="space-y-6 lg:sticky lg:top-8">
      <Card title="Status pesanan">
        <div className="grid grid-cols-2 gap-2">
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => changeStatus(s)}
              disabled={saving !== null}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition",
                status === s ? STATUS_STYLE[s] : "border-slate-100 bg-white text-slate-500 hover:border-slate-200",
                s === "cancelled" && "col-span-2",
              )}
            >
              {status === s && <Check className="size-4" />}
              {saving === s ? "Menyimpan…" : ORDER_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Balas via WhatsApp">
        <div className="no-scrollbar -mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1">
          {REPLY_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => pickTemplate(t.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs font-bold",
                t.id === templateId ? "border-wa bg-wa/10 text-emerald-700" : "border-slate-200 text-slate-500",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={10} className="input font-mono text-xs leading-relaxed" />
        <div className="mt-3 flex gap-2">
          <a href={waLink(normalizePhone(order.customer_phone), message)} target="_blank" rel="noreferrer" className={buttonClass("wa", "md", "flex-1")}>
            <WhatsAppIcon className="size-4" /> Kirim ke {order.customer_name.split(" ")[0]}
          </a>
          <Button variant="outline" size="icon" className="size-10" onClick={copy} aria-label="Salin pesan">
            {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">Pesan bisa diedit dulu sebelum dikirim.</p>
      </Card>

      <button type="button" onClick={remove} className="flex w-full items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-rose-600">
        <Trash2 className="size-3.5" /> Hapus pesanan
      </button>
    </div>
  );
}
