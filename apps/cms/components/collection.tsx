"use client";

import { slugify } from "@sfs/shared";
import { ArrowDown, ArrowUp, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { publishChanges } from "@/lib/actions";
import { supabaseBrowser } from "@/lib/supabase/client";
import { pathFromUrl, removeImages } from "@/lib/upload";
import { cn, fromLocalInput, toLocalInput } from "@/lib/utils";
import { ImageField } from "./image-field";
import { RupiahInput } from "./inputs";
import { useToast } from "./toast";
import { Button, EmptyState, Field, Modal, Toggle } from "./ui";

export type Row = { id: string; sort_order: number; is_active: boolean } & Record<string, unknown>;

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "rupiah" | "toggle" | "select" | "image" | "datetime" | "rating" | "slug";
  options?: { value: string; label: string }[];
  hint?: string;
  placeholder?: string;
  required?: boolean;
  full?: boolean;
  aspect?: string;
  /** Untuk `slug`: field sumber yang dipakai saat slug masih kosong. */
  from?: string;
};

type Props = {
  table: string;
  items: Row[];
  fields: FieldDef[];
  defaults: Record<string, unknown>;
  noun: string;
  folder?: string;
  icon: ReactNode;
  emptyText?: string;
  renderItem: (item: Row) => ReactNode;
  /** Validasi tambahan; kembalikan pesan error bila tidak valid. */
  validate?: (values: Record<string, unknown>) => string | null;
};

export function CollectionManager({ table, items: initial, fields, defaults, noun, folder = "content", icon, emptyText, renderItem, validate }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isNew = editing && !editing.id;

  async function after(message: string) {
    const result = await publishChanges();
    toast(result.ok ? message : `${message} (${result.message})`, result.ok ? "success" : "error");
    router.refresh();
  }

  function openNew() {
    setErrors({});
    setEditing({ ...defaults, is_active: true, sort_order: (items.at(-1)?.sort_order ?? 0) + 1 });
  }

  function openEdit(item: Row) {
    setErrors({});
    setEditing({ ...item });
  }

  async function save() {
    if (!editing) return;
    const e: Record<string, string> = {};
    for (const f of fields) {
      const v = editing[f.key];
      if (f.required && (v == null || String(v).trim() === "")) e[f.key] = `${f.label} wajib diisi`;
    }
    setErrors(e);
    if (Object.keys(e).length) return;
    const extra = validate?.(editing);
    if (extra) return toast(extra, "error");

    const values: Record<string, unknown> = { is_active: editing.is_active, sort_order: editing.sort_order };
    for (const f of fields) {
      let v = editing[f.key];
      if (typeof v === "string") v = v.trim() === "" ? null : v.trim();
      if (f.type === "slug") v = slugify(String(v ?? editing[f.from ?? "name"] ?? ""));
      if (f.type === "rupiah") v = v == null ? null : Number(v);
      values[f.key] = v;
    }

    setSaving(true);
    const supabase = supabaseBrowser();
    const query = isNew ? supabase.from(table).insert(values).select().single() : supabase.from(table).update(values).eq("id", editing.id as string).select().single();
    const { data, error } = await query;
    setSaving(false);
    if (error) return toast(error.code === "23505" ? "Slug sudah dipakai, gunakan yang lain" : error.message, "error");

    const before = items.find((i) => i.id === editing.id);
    const removed = fields.filter((f) => f.type === "image" && before && before[f.key] && before[f.key] !== values[f.key]).map((f) => pathFromUrl(before![f.key] as string));
    await removeImages(removed);

    setItems((list) => (isNew ? [...list, data as Row] : list.map((i) => (i.id === data.id ? (data as Row) : i))));
    setEditing(null);
    after(isNew ? `${capital(noun)} ditambahkan` : `${capital(noun)} disimpan`);
  }

  async function remove() {
    if (!editing?.id || !confirm(`Hapus ${noun} ini?`)) return;
    const { error } = await supabaseBrowser().from(table).delete().eq("id", editing.id as string);
    if (error) return toast(error.message, "error");
    await removeImages(fields.filter((f) => f.type === "image").map((f) => pathFromUrl(editing[f.key] as string)));
    setItems((list) => list.filter((i) => i.id !== editing.id));
    setEditing(null);
    after(`${capital(noun)} dihapus`);
  }

  async function toggleActive(item: Row, value: boolean) {
    setItems((list) => list.map((i) => (i.id === item.id ? { ...i, is_active: value } : i)));
    const { error } = await supabaseBrowser().from(table).update({ is_active: value }).eq("id", item.id);
    if (error) return toast(error.message, "error");
    after(value ? "Ditampilkan di website" : "Disembunyikan dari website");
  }

  async function move(index: number, delta: number) {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    const reordered = next.map((it, i) => ({ ...it, sort_order: i + 1 }));
    setItems(reordered);
    const supabase = supabaseBrowser();
    const changed = reordered.filter((it) => items.find((o) => o.id === it.id)?.sort_order !== it.sort_order);
    const results = await Promise.all(changed.map((it) => supabase.from(table).update({ sort_order: it.sort_order }).eq("id", it.id)));
    const failed = results.find((r) => r.error);
    if (failed?.error) return toast(failed.error.message, "error");
    after("Urutan diperbarui");
  }

  const set = (key: string, value: unknown) => setEditing((e) => (e ? { ...e, [key]: value } : e));

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus className="size-4" /> Tambah {noun}
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={icon} title={`Belum ada ${noun}`} text={emptyText} />
      ) : (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={item.id} className={cn("card flex items-center gap-3 p-3 sm:p-4", !item.is_active && "opacity-60")}>
              <div className="flex flex-col">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 text-slate-400 hover:text-navy disabled:opacity-20" aria-label="Naikkan">
                  <ArrowUp className="size-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="p-1 text-slate-400 hover:text-navy disabled:opacity-20" aria-label="Turunkan">
                  <ArrowDown className="size-4" />
                </button>
              </div>
              <button type="button" onClick={() => openEdit(item)} className="min-w-0 flex-1 text-left">
                {renderItem(item)}
              </button>
              <div className="flex shrink-0 items-center gap-2">
                <Toggle checked={item.is_active} onChange={(v) => toggleActive(item, v)} />
                <button type="button" onClick={() => openEdit(item)} className="hidden rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-navy sm:block" aria-label="Edit">
                  <Pencil className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={isNew ? `Tambah ${noun}` : `Edit ${noun}`}
        size="lg"
        footer={
          <>
            {!isNew && (
              <Button variant="danger" onClick={remove} className="mr-auto">
                <Trash2 className="size-4" /> Hapus
              </Button>
            )}
            <Button variant="outline" onClick={() => setEditing(null)}>
              Batal
            </Button>
            <Button onClick={save} loading={saving}>
              Simpan
            </Button>
          </>
        }
      >
        {editing && (
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <FieldInput key={f.key} def={f} value={editing[f.key]} values={editing} error={errors[f.key]} onChange={(v) => set(f.key, v)} folder={folder} />
            ))}
            <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
              <Toggle checked={Boolean(editing.is_active)} onChange={(v) => set("is_active", v)} label="Tampilkan di website" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function FieldInput({
  def,
  value,
  values,
  error,
  onChange,
  folder,
}: {
  def: FieldDef;
  value: unknown;
  values: Record<string, unknown>;
  error?: string;
  onChange: (v: unknown) => void;
  folder: string;
}) {
  const full = def.full || def.type === "textarea" || def.type === "image";
  const label = def.required ? `${def.label} *` : def.label;
  const str = value == null ? "" : String(value);

  if (def.type === "toggle") {
    return (
      <div className={cn("rounded-2xl border border-slate-100 p-4", full && "sm:col-span-2")}>
        <Toggle checked={Boolean(value)} onChange={onChange} label={def.label} description={def.hint} />
      </div>
    );
  }

  let input: ReactNode;
  switch (def.type) {
    case "textarea":
      input = <textarea className="input min-h-28" value={str} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "rupiah":
      input = <RupiahInput value={str} placeholder={def.placeholder} onChange={(v) => onChange(v === "" ? null : v)} />;
      break;
    case "select":
      input = (
        <select className="input" value={str} onChange={(e) => onChange(e.target.value)}>
          {def.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "image":
      return (
        <div className="sm:col-span-2">
          <p className="mb-1.5 text-xs font-bold text-slate-600">{label}</p>
          <div className="max-w-md">
            <ImageField value={(value as string) ?? null} onChange={onChange} folder={folder} aspect={def.aspect} />
          </div>
          {def.hint && <p className="mt-1 text-xs text-slate-400">{def.hint}</p>}
        </div>
      );
    case "datetime":
      input = <input type="datetime-local" className="input" value={toLocalInput(value as string | null)} onChange={(e) => onChange(fromLocalInput(e.target.value))} />;
      break;
    case "rating":
      input = (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} bintang`}>
              <Star className={cn("size-7", n <= Number(value) ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
            </button>
          ))}
        </div>
      );
      break;
    case "slug":
      input = (
        <input
          className="input"
          value={str}
          placeholder={slugify(String(values[def.from ?? "name"] ?? "")) || def.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    default:
      input = <input className="input" value={str} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} />;
  }

  return (
    <Field label={label} hint={def.hint} error={error} className={cn(full && "sm:col-span-2")}>
      {input}
    </Field>
  );
}

function capital(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
